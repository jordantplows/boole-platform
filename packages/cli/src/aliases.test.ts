import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import type { HardwareInfo } from '@boole/hardware';
import { resolveModel, listAliases, loadAliases, type AliasEntry } from './aliases.js';

const GB = 1024 ** 3;

function makeHw(availableGb: number): HardwareInfo {
  return {
    os: 'test',
    arch: 'arm64',
    nodeVersion: 'v22.0.0',
    ram: { total: 32 * GB, available: availableGb * GB },
    gpu: { backend: 'metal', devices: ['Apple M2 Pro'] },
    binaries: 'prebuilt',
    cache: { path: '/tmp/boole-test', sizeBytes: 0 },
  };
}

describe('listAliases', () => {
  it('returns all aliases from the JSON file', () => {
    const aliases = listAliases();
    assert.ok(Object.keys(aliases).length >= 10, 'should have at least 10 aliases');
    assert.ok('llama3' in aliases);
    assert.ok('mistral' in aliases);
    assert.ok('phi3' in aliases);
  });

  it('every alias has required fields', () => {
    const aliases = listAliases();
    for (const [name, entry] of Object.entries(aliases)) {
      assert.ok(entry.repo, `${name} missing repo`);
      assert.ok(entry.description, `${name} missing description`);
      assert.ok(entry.params, `${name} missing params`);
      assert.ok(Array.isArray(entry.quants) && entry.quants.length > 0, `${name} missing quants`);
    }
  });
});

describe('resolveModel — alias resolution', () => {
  it('resolves llama3 to the correct repo', () => {
    const result = resolveModel('llama3', makeHw(16));
    assert.ok(result.repo.includes('Meta-Llama-3'));
    assert.ok(result.repo.includes('GGUF'));
    assert.ok(result.quant.startsWith('Q'));
    assert.equal(result.alias, 'llama3');
  });

  it('picks a quant that fits available memory', () => {
    const tight = resolveModel('llama3', makeHw(6));
    const roomy = resolveModel('llama3', makeHw(20));

    const quantRank: Record<string, number> = {
      Q2_K: 1, Q3_K_M: 2, Q4_K_M: 3, Q5_K_M: 4, Q6_K: 5, Q8_0: 6,
    };

    assert.ok(
      (quantRank[roomy.quant] ?? 0) >= (quantRank[tight.quant] ?? 0),
      `expected ${roomy.quant} >= ${tight.quant} quality`,
    );
  });

  it('throws when not enough memory for any quant', () => {
    assert.throws(
      () => resolveModel('llama3', makeHw(2)),
      /not enough memory/,
    );
  });
});

describe('resolveModel — direct specifiers', () => {
  it('passes through repo:quant specifiers unchanged', () => {
    const result = resolveModel('TheBloke/Llama-2-7B-GGUF:Q4_K_M', makeHw(16));
    assert.equal(result.repo, 'TheBloke/Llama-2-7B-GGUF');
    assert.equal(result.quant, 'Q4_K_M');
    assert.equal(result.alias, undefined);
  });

  it('handles local .gguf file paths', () => {
    const result = resolveModel('./my-model.gguf', makeHw(16));
    assert.equal(result.repo, './my-model.gguf');
    assert.equal(result.quant, '');
  });
});

describe('resolveModel — unknown alias', () => {
  it('throws with helpful message for unknown alias', () => {
    assert.throws(
      () => resolveModel('nonexistent-model', makeHw(16)),
      /unknown model.*nonexistent-model/,
    );
  });

  it('error message lists available aliases', () => {
    try {
      resolveModel('nonexistent-model', makeHw(16));
      assert.fail('should have thrown');
    } catch (e: any) {
      assert.ok(e.message.includes('llama3'), 'should list llama3 as available');
      assert.ok(e.message.includes('mistral'), 'should list mistral as available');
    }
  });
});

describe('resolveModel — quant preference', () => {
  it('prefers Q8_0 when plenty of memory available', () => {
    const result = resolveModel('phi3', makeHw(32));
    assert.equal(result.quant, 'Q8_0');
  });

  it('picks a lower quant with less memory', () => {
    const roomy = resolveModel('llama3', makeHw(20));
    const tight = resolveModel('llama3', makeHw(6));

    const quantRank: Record<string, number> = {
      Q2_K: 1, Q3_K_M: 2, Q4_K_M: 3, Q5_K_M: 4, Q6_K: 5, Q8_0: 6,
    };
    assert.ok(
      (quantRank[roomy.quant] ?? 0) > (quantRank[tight.quant] ?? 0),
      `expected ${roomy.quant} > ${tight.quant} with more memory`,
    );
  });
});
