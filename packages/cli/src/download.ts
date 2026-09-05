import { createWriteStream, existsSync, mkdirSync, renameSync, statSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createInterface } from 'node:readline';
import { formatBytes, formatTime } from './format.js';

const GB = 1024 ** 3;
const SIZE_WARNING_THRESHOLD = 2 * GB;

export class ModelNotFoundError extends Error {
  constructor(repo: string) {
    super(`model not found: ${repo}`);
    this.name = 'ModelNotFoundError';
  }
}

export class QuantNotFoundError extends Error {
  available: string[];
  constructor(repo: string, quant: string, available: string[]) {
    super(
      `no file matching "${quant}" in ${repo}\n` +
      `available files:\n${available.map(f => `  ${f}`).join('\n')}`,
    );
    this.name = 'QuantNotFoundError';
    this.available = available;
  }
}

export class DiskFullError extends Error {
  constructor() {
    super('not enough disk space to complete download');
    this.name = 'DiskFullError';
  }
}

export class NetworkError extends Error {
  partial: string;
  constructor(message: string, partial: string) {
    super(`${message}\npartial download saved — rerun the same command to resume`);
    this.name = 'NetworkError';
    this.partial = partial;
  }
}

export class UserCancelledError extends Error {
  constructor() {
    super('download cancelled');
    this.name = 'UserCancelledError';
  }
}

export interface PullResult {
  path: string;
  filename: string;
  cached: boolean;
}

export async function resolveHuggingFaceFile(
  repo: string,
  quant: string,
): Promise<{ url: string; filename: string; size: number }> {
  const apiUrl = `https://huggingface.co/api/models/${repo}`;
  let res: Response;
  try {
    res = await fetch(apiUrl);
  } catch (e: any) {
    throw new NetworkError(e.message || 'failed to reach huggingface.co', '');
  }

  if (res.status === 404) throw new ModelNotFoundError(repo);
  if (!res.ok) throw new Error(`huggingface api error: ${res.status}`);

  const data: any = await res.json();
  const ggufFiles: Array<{ rfilename: string; size?: number }> =
    (data.siblings ?? []).filter((s: any) => s.rfilename.endsWith('.gguf'));

  if (ggufFiles.length === 0) throw new ModelNotFoundError(`${repo} (no .gguf files)`);

  const pattern = quant.toLowerCase();
  const match = ggufFiles.find(f => f.rfilename.toLowerCase().includes(pattern));
  if (!match) {
    throw new QuantNotFoundError(repo, quant, ggufFiles.map(f => f.rfilename));
  }

  const url = `https://huggingface.co/${repo}/resolve/main/${match.rfilename}`;
  let size = match.size ?? 0;

  if (!size) {
    try {
      const head = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      size = parseInt(head.headers.get('content-length') || '0');
    } catch {}
  }

  return { url, filename: match.rfilename, size };
}

export async function pull(
  repo: string,
  quant: string,
  opts: { cacheDir: string; yes?: boolean },
): Promise<PullResult> {
  const { url, filename, size } = await resolveHuggingFaceFile(repo, quant);

  const dir = join(opts.cacheDir, repo.replace('/', '--'));
  mkdirSync(dir, { recursive: true });
  const dest = join(dir, filename);

  if (existsSync(dest)) {
    return { path: dest, filename, cached: true };
  }

  if (size > SIZE_WARNING_THRESHOLD && process.stdin.isTTY && !opts.yes) {
    const confirmed = await confirm(
      `this model is ${formatBytes(size)}. download?`,
    );
    if (!confirmed) throw new UserCancelledError();
  }

  process.stderr.write(`downloading  ${filename}\n`);
  await downloadFile(url, dest, size);

  return { path: dest, filename, cached: false };
}

async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise(resolve => {
    rl.question(`${message} [y/N] `, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

async function downloadFile(url: string, dest: string, expectedSize: number): Promise<void> {
  const partialPath = dest + '.partial';
  let offset = 0;

  try {
    offset = statSync(partialPath).size;
  } catch {}

  if (offset > 0) {
    process.stderr.write(`  resuming from ${formatBytes(offset)}\n`);
  }

  checkDiskSpace(dirname(dest), expectedSize - offset);

  const headers: Record<string, string> = {};
  if (offset > 0) headers['Range'] = `bytes=${offset}-`;

  let res: Response;
  try {
    res = await fetch(url, { headers, redirect: 'follow' });
  } catch (e: any) {
    throw new NetworkError(e.message || 'network request failed', partialPath);
  }

  if (res.status === 416) {
    renameSync(partialPath, dest);
    return;
  }

  if (!res.ok && res.status !== 206) {
    if (res.status === 404) throw new ModelNotFoundError(url);
    throw new NetworkError(`HTTP ${res.status}: ${res.statusText}`, partialPath);
  }

  let total = expectedSize;
  const rangeHeader = res.headers.get('content-range');
  if (rangeHeader) {
    const m = rangeHeader.match(/\/(\d+)/);
    if (m) total = parseInt(m[1]);
  } else if (!total) {
    total = parseInt(res.headers.get('content-length') || '0') + offset;
  }

  const isTTY = process.stderr.isTTY ?? false;
  const bar = new ProgressBar(total, isTTY);
  let downloaded = offset;

  const track = new Transform({
    transform(chunk, _, cb) {
      downloaded += chunk.length;
      bar.update(downloaded);
      cb(null, chunk);
    },
  });

  mkdirSync(dirname(partialPath), { recursive: true });
  const writer = createWriteStream(partialPath, {
    flags: offset > 0 ? 'a' : 'w',
  });
  const source = Readable.fromWeb(res.body as any);

  try {
    await pipeline(source, track, writer);
  } catch (err: any) {
    bar.done();
    if (err.code === 'ENOSPC') throw new DiskFullError();
    throw new NetworkError(err.message || 'download interrupted', partialPath);
  }

  bar.done();
  renameSync(partialPath, dest);
}

function checkDiskSpace(dir: string, needed: number): void {
  try {
    const { statfsSync } = require('node:fs') as typeof import('node:fs');
    const stat = statfsSync(dir);
    const free = stat.bavail * stat.bsize;
    if (free < needed) throw new DiskFullError();
  } catch (e) {
    if (e instanceof DiskFullError) throw e;
  }
}

class ProgressBar {
  private samples: Array<{ time: number; bytes: number }> = [];
  private lastRender = 0;
  private lastPctBucket = -1;

  constructor(
    private total: number,
    private isTTY: boolean,
  ) {}

  update(downloaded: number) {
    const now = Date.now();
    this.samples.push({ time: now, bytes: downloaded });

    const cutoff = now - 3000;
    while (this.samples.length > 1 && this.samples[0].time < cutoff) {
      this.samples.shift();
    }

    if (now - this.lastRender < 100) return;
    this.lastRender = now;

    const rate = this.rate(downloaded);
    const pct = this.total > 0 ? downloaded / this.total : 0;
    const eta = rate > 0 ? (this.total - downloaded) / rate : 0;

    if (this.isTTY) {
      const cols = process.stderr.columns || 80;
      const stats = `  ${formatBytes(downloaded)}/${formatBytes(this.total)}  ${formatBytes(rate)}/s  eta ${formatTime(eta)}`;
      const barWidth = Math.max(10, cols - stats.length - 4);
      const filled = Math.round(barWidth * pct);
      const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
      process.stderr.write(`\r  ${bar}${stats}`);
    } else {
      const bucket = Math.floor(pct * 10);
      if (bucket > this.lastPctBucket) {
        this.lastPctBucket = bucket;
        process.stderr.write(
          `  ${Math.round(pct * 100)}%  ${formatBytes(downloaded)}/${formatBytes(this.total)}\n`,
        );
      }
    }
  }

  private rate(current: number): number {
    if (this.samples.length < 2) return 0;
    const first = this.samples[0];
    const elapsed = (Date.now() - first.time) / 1000;
    return elapsed > 0 ? (current - first.bytes) / elapsed : 0;
  }

  done() {
    if (this.isTTY) process.stderr.write('\n');
  }
}
