import { platform, arch, totalmem, freemem, release, homedir } from 'node:os';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface GpuInfo {
  backend: 'metal' | 'cuda' | 'vulkan' | 'none';
  devices: string[];
  vram?: { total: number; free: number };
}

export interface CacheInfo {
  path: string;
  sizeBytes: number;
}

export interface HardwareInfo {
  os: string;
  arch: string;
  nodeVersion: string;
  ram: { total: number; available: number };
  gpu: GpuInfo;
  binaries: 'prebuilt' | 'compiled' | 'unknown';
  cache: CacheInfo;
}

export interface GpuProbeResult {
  backend: string;
  devices: string[];
  vram?: { total: number; free: number };
  buildType?: string;
}

export async function detect(opts?: {
  probeGpu?: () => Promise<GpuProbeResult>;
  cachePath?: string;
}): Promise<HardwareInfo> {
  const probe = opts?.probeGpu ?? probeNodeLlamaCpp;
  let gpuResult: GpuProbeResult;
  try {
    gpuResult = await probe();
  } catch {
    gpuResult = { backend: 'none', devices: [] };
  }
  const cachePath = opts?.cachePath ?? defaultCachePath();

  return {
    os: `${platform()} ${release()}`,
    arch: arch(),
    nodeVersion: process.version,
    ram: { total: totalmem(), available: freemem() },
    gpu: {
      backend: normalizeBackend(gpuResult.backend),
      devices: gpuResult.devices,
      vram: gpuResult.vram,
    },
    binaries: normalizeBuildType(gpuResult.buildType),
    cache: { path: cachePath, sizeBytes: dirSize(cachePath) },
  };
}

export function normalizeBackend(raw: string): GpuInfo['backend'] {
  const s = raw.toLowerCase();
  if (s === 'metal') return 'metal';
  if (s === 'cuda') return 'cuda';
  if (s === 'vulkan') return 'vulkan';
  return 'none';
}

export function normalizeBuildType(raw?: string): HardwareInfo['binaries'] {
  if (!raw) return 'unknown';
  if (/prebuilt/i.test(raw)) return 'prebuilt';
  if (/local|compiled|source/i.test(raw)) return 'compiled';
  return 'unknown';
}

async function probeNodeLlamaCpp(): Promise<GpuProbeResult> {
  try {
    const mod: any = await import('node-llama-cpp');
    const getLlama = mod.getLlama ?? mod.default?.getLlama;
    if (!getLlama) return { backend: 'none', devices: [] };

    const llama = await getLlama({ gpu: 'auto' });

    let backend = 'none';
    if (llama.gpuType) {
      backend = String(llama.gpuType);
    } else if (typeof llama.systemInfo === 'string') {
      const info = llama.systemInfo.toLowerCase();
      if (info.includes('metal')) backend = 'metal';
      else if (info.includes('cuda')) backend = 'cuda';
      else if (info.includes('vulkan')) backend = 'vulkan';
    }

    let devices: string[] = [];
    if (typeof llama.getGpuDeviceNames === 'function') {
      devices = await llama.getGpuDeviceNames();
    }

    let vram: { total: number; free: number } | undefined;
    if (typeof llama.getVramState === 'function') {
      try {
        const state = await llama.getVramState();
        if (state && typeof state.total === 'number') {
          vram = { total: state.total, free: state.free };
        }
      } catch {}
    }

    let buildType: string | undefined;
    if ('buildType' in llama) buildType = String(llama.buildType);

    return { backend, devices, vram, buildType };
  } catch {
    return { backend: 'none', devices: [] };
  }
}

export function defaultCachePath(): string {
  const env = process.env.BOOLE_CACHE;
  if (env) return env;

  switch (platform()) {
    case 'darwin':
      return join(homedir(), 'Library', 'Caches', 'boole');
    case 'win32':
      return join(
        process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'),
        'boole',
        'cache',
      );
    default:
      return join(
        process.env.XDG_CACHE_HOME || join(homedir(), '.cache'),
        'boole',
      );
  }
}

function dirSize(dir: string): number {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += dirSize(full);
    } else {
      try { total += statSync(full).size; } catch {}
    }
  }
  return total;
}
