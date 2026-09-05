import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { platform, arch, totalmem, freemem } from 'node:os';
import {
  detect,
  defaultCachePath,
  normalizeBackend,
  normalizeBuildType,
  type GpuProbeResult,
} from './detect.js';
import { recommend, pickQuant, estimateFileSize, parseParamCount } from './recommend.js';

const GB = 1024 ** 3;

describe('detect', () => {
  it('returns correct structure with mock gpu probe', async () => {
    const probe = async (): Promise<GpuProbeResult> => ({
      backend: 'metal',
      devices: ['Apple M2 Pro'],
      vram: { total: 16 * GB, free: 12 * GB },
      buildType: 'prebuilt',
    });

    const hw = await detect({ probeGpu: probe, cachePath: '/tmp/boole-test-nonexistent' });

    assert.equal(hw.gpu.backend, 'metal');
    assert.deepEqual(hw.gpu.devices, ['Apple M2 Pro']);
    assert.equal(hw.gpu.vram!.total, 16 * GB);
    assert.equal(hw.gpu.vram!.free, 12 * GB);
    assert.equal(hw.binaries, 'prebuilt');
    assert.equal(hw.cache.path, '/tmp/boole-test-nonexistent');
    assert.equal(hw.cache.sizeBytes, 0);
    assert.equal(hw.nodeVersion, process.version);
    assert.ok(hw.ram.total > 0);
    assert.ok(hw.ram.available > 0);
  });

  it('handles gpu probe failure gracefully', async () => {
    const probe = async (): Promise<GpuProbeResult> => {
      throw new Error('node-llama-cpp not installed');
    };

    const hw = await detect({ probeGpu: probe, cachePath: '/tmp/boole-test-nonexistent' });

    assert.equal(hw.gpu.backend, 'none');
    assert.deepEqual(hw.gpu.devices, []);
    assert.equal(hw.gpu.vram, undefined);
    assert.equal(hw.binaries, 'unknown');
  });

  it('falls back when gpu probe returns partial data', async () => {
    const probe = async (): Promise<GpuProbeResult> => ({
      backend: 'cuda',
      devices: [],
    });

    const hw = await detect({ probeGpu: probe, cachePath: '/tmp/boole-test-nonexistent' });

    assert.equal(hw.gpu.backend, 'cuda');
    assert.equal(hw.gpu.vram, undefined);
    assert.equal(hw.binaries, 'unknown');
  });
});

describe('normalizeBackend', () => {
  it('normalizes known backends', () => {
    assert.equal(normalizeBackend('metal'), 'metal');
    assert.equal(normalizeBackend('Metal'), 'metal');
    assert.equal(normalizeBackend('CUDA'), 'cuda');
    assert.equal(normalizeBackend('vulkan'), 'vulkan');
  });

  it('returns none for unknown', () => {
    assert.equal(normalizeBackend(''), 'none');
    assert.equal(normalizeBackend('cpu'), 'none');
    assert.equal(normalizeBackend('unknown'), 'none');
  });
});

describe('normalizeBuildType', () => {
  it('normalizes known types', () => {
    assert.equal(normalizeBuildType('prebuilt'), 'prebuilt');
    assert.equal(normalizeBuildType('localBuild'), 'compiled');
    assert.equal(normalizeBuildType('compiled from source'), 'compiled');
  });

  it('returns unknown for missing or unrecognized', () => {
    assert.equal(normalizeBuildType(undefined), 'unknown');
    assert.equal(normalizeBuildType(''), 'unknown');
    assert.equal(normalizeBuildType('something'), 'unknown');
  });
});

describe('defaultCachePath', () => {
  it('respects BOOLE_CACHE env var', () => {
    const orig = process.env.BOOLE_CACHE;
    process.env.BOOLE_CACHE = '/custom/cache';
    try {
      assert.equal(defaultCachePath(), '/custom/cache');
    } finally {
      if (orig === undefined) delete process.env.BOOLE_CACHE;
      else process.env.BOOLE_CACHE = orig;
    }
  });

  it('returns a platform-appropriate path', () => {
    const orig = process.env.BOOLE_CACHE;
    delete process.env.BOOLE_CACHE;
    try {
      const path = defaultCachePath();
      assert.ok(path.includes('boole'), `expected "boole" in path: ${path}`);
    } finally {
      if (orig !== undefined) process.env.BOOLE_CACHE = orig;
    }
  });
});

describe('parseParamCount', () => {
  it('parses integer sizes', () => {
    assert.equal(parseParamCount('7B'), 7e9);
    assert.equal(parseParamCount('70B'), 70e9);
    assert.equal(parseParamCount('1B'), 1e9);
  });

  it('parses fractional sizes', () => {
    assert.equal(parseParamCount('3.8B'), 3.8e9);
  });

  it('returns 0 for unparseable', () => {
    assert.equal(parseParamCount(''), 0);
    assert.equal(parseParamCount('big'), 0);
  });
});

describe('estimateFileSize', () => {
  it('estimates reasonable sizes for 7B Q4_K_M', () => {
    const size = estimateFileSize(7e9, 'Q4_K_M');
    assert.ok(size > 3 * GB, 'should be > 3 GB');
    assert.ok(size < 6 * GB, 'should be < 6 GB');
  });

  it('Q8_0 is larger than Q4_K_M', () => {
    const q4 = estimateFileSize(7e9, 'Q4_K_M');
    const q8 = estimateFileSize(7e9, 'Q8_0');
    assert.ok(q8 > q4);
  });
});

describe('pickQuant', () => {
  const quants = ['Q3_K_M', 'Q4_K_M', 'Q5_K_M', 'Q6_K', 'Q8_0'];
  const params7B = 7e9;

  it('picks highest quality that fits', () => {
    const result = pickQuant(quants, params7B, 20 * GB);
    assert.ok(result);
    assert.equal(result.quant, 'Q8_0');
  });

  it('picks lower quant when memory is tight', () => {
    const result = pickQuant(quants, params7B, 4.5 * GB);
    assert.ok(result);
    assert.equal(result.quant, 'Q4_K_M');
  });

  it('returns null when nothing fits', () => {
    const result = pickQuant(quants, params7B, 1 * GB);
    assert.equal(result, null);
  });
});

describe('recommend', () => {
  it('recommends a model for 16 GB available RAM', () => {
    const rec = recommend({
      os: 'test', arch: 'test', nodeVersion: 'test',
      ram: { total: 32 * GB, available: 16 * GB },
      gpu: { backend: 'none', devices: [] },
      binaries: 'prebuilt',
      cache: { path: '/tmp', sizeBytes: 0 },
    });

    assert.ok(rec.usable);
    assert.ok(rec.params !== '0', `expected a model recommendation, got params=${rec.params}`);
    assert.ok(rec.fileSizeEstimate > 0);
    assert.ok(rec.headroom > 0);
  });

  it('returns usable: false for very low RAM', () => {
    const rec = recommend({
      os: 'test', arch: 'test', nodeVersion: 'test',
      ram: { total: 2 * GB, available: 1 * GB },
      gpu: { backend: 'none', devices: [] },
      binaries: 'prebuilt',
      cache: { path: '/tmp', sizeBytes: 0 },
    });

    assert.equal(rec.usable, false);
  });

  it('recommends larger models with more RAM', () => {
    const small = recommend({
      os: 'test', arch: 'test', nodeVersion: 'test',
      ram: { total: 8 * GB, available: 6 * GB },
      gpu: { backend: 'none', devices: [] },
      binaries: 'prebuilt',
      cache: { path: '/tmp', sizeBytes: 0 },
    });

    const large = recommend({
      os: 'test', arch: 'test', nodeVersion: 'test',
      ram: { total: 64 * GB, available: 48 * GB },
      gpu: { backend: 'none', devices: [] },
      binaries: 'prebuilt',
      cache: { path: '/tmp', sizeBytes: 0 },
    });

    assert.ok(small.usable);
    assert.ok(large.usable);
    assert.ok(
      parseParamCount(large.params) >= parseParamCount(small.params),
      `expected ${large.params} >= ${small.params}`,
    );
  });
});
