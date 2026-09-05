import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { HardwareInfo } from '@boole/hardware';
import { pickQuant, parseParamCount, estimateFileSize, HEADROOM } from '@boole/hardware';
import { formatBytes } from './format.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface AliasEntry {
  repo: string;
  description: string;
  params: string;
  quants: string[];
}

export interface ResolvedModel {
  repo: string;
  quant: string;
  reason: string;
  alias?: string;
}

let _aliases: Record<string, AliasEntry> | undefined;

export function loadAliases(): Record<string, AliasEntry> {
  if (!_aliases) {
    _aliases = JSON.parse(readFileSync(join(__dirname, 'data', 'aliases.json'), 'utf-8'));
  }
  return _aliases!;
}

export function listAliases(): Record<string, AliasEntry> {
  return loadAliases();
}

export function resolveModel(specifier: string, hw: HardwareInfo): ResolvedModel {
  if (specifier.includes('/') && specifier.includes(':')) {
    const idx = specifier.lastIndexOf(':');
    return {
      repo: specifier.slice(0, idx),
      quant: specifier.slice(idx + 1),
      reason: 'explicit specifier',
    };
  }

  if (specifier.endsWith('.gguf')) {
    return { repo: specifier, quant: '', reason: 'local file' };
  }

  const aliases = loadAliases();
  const entry = aliases[specifier];
  if (!entry) {
    const available = Object.keys(aliases).join(', ');
    throw new Error(
      `unknown model "${specifier}"\n` +
      `available aliases: ${available}\n` +
      `or use a full <repo>:<quant> specifier`,
    );
  }

  const memAvailable = hw.ram.available - HEADROOM;
  const picked = pickQuant(entry.quants, parseParamCount(entry.params), memAvailable);
  if (!picked) {
    const smallest = entry.quants[0];
    const smallestSize = estimateFileSize(parseParamCount(entry.params), smallest);
    throw new Error(
      `not enough memory to run ${entry.description}\n` +
      `smallest quant ${smallest} needs ~${formatBytes(smallestSize)}, ` +
      `${formatBytes(memAvailable)} available`,
    );
  }

  return {
    repo: entry.repo,
    quant: picked.quant,
    reason: `${formatBytes(hw.ram.available)} available, ` +
      `${picked.quant} (~${formatBytes(picked.sizeEstimate)}) is highest quality that fits`,
    alias: specifier,
  };
}
