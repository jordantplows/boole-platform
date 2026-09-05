import { detect } from '@boole/hardware';
import { resolveModel } from '../aliases.js';
import { pull as doPull, ModelNotFoundError, QuantNotFoundError, DiskFullError, NetworkError, UserCancelledError } from '../download.js';
import { parseArgs, flagStr, flagBool } from '../parse.js';
import { EXIT } from '../exit.js';

const BOOLEANS = new Set(['yes', 'quiet', 'help']);

export default async function pull(args: string[]): Promise<void> {
  const parsed = parseArgs(args, BOOLEANS);
  const quiet = flagBool(parsed, 'quiet', 'q');
  const log = quiet ? () => {} : (s: string) => process.stderr.write(s);

  if (flagBool(parsed, 'help', 'h')) {
    process.stderr.write(`
usage: boole pull <model> [flags]

Download a model to the local cache. Model can be an alias
(e.g. "llama3") or a full specifier (e.g. "TheBloke/Llama-2-7B-GGUF:Q4_K_M").

Flags:
  --model, -m   Model specifier or alias
  --dir         Custom cache directory
  --yes         Skip size confirmation
  --quiet, -q   Suppress stderr output

Exit codes:
  0  success
  1  runtime failure (disk full, network error)
  2  bad usage
  3  model unavailable
`);
    process.exit(0);
  }

  const modelSpec = flagStr(parsed, 'model', 'm') ?? parsed.positional[0];
  if (!modelSpec) {
    process.stderr.write('error: no model specified\nrun "boole pull --help" for usage\n');
    process.exit(EXIT.BAD_USAGE);
  }

  const hw = await detect();
  const cacheDir = flagStr(parsed, 'dir') ?? hw.cache.path;

  let resolved;
  try {
    resolved = resolveModel(modelSpec, hw);
  } catch (e: any) {
    process.stderr.write(`error: ${e.message}\n`);
    process.exit(EXIT.MODEL_UNAVAILABLE);
  }

  if (resolved.alias) {
    log(`${resolved.alias} -> ${resolved.repo}:${resolved.quant}\n`);
    log(`  ${resolved.reason}\n`);
  }

  try {
    const result = await doPull(resolved.repo, resolved.quant, {
      cacheDir,
      yes: flagBool(parsed, 'yes'),
    });

    if (result.cached) {
      log(`already cached: ${result.path}\n`);
    } else {
      log(`saved to ${result.path}\n`);
    }
  } catch (e) {
    if (e instanceof UserCancelledError) process.exit(0);
    if (e instanceof ModelNotFoundError || e instanceof QuantNotFoundError) {
      process.stderr.write(`error: ${e.message}\n`);
      process.exit(EXIT.MODEL_UNAVAILABLE);
    }
    if (e instanceof DiskFullError || e instanceof NetworkError) {
      process.stderr.write(`error: ${e.message}\n`);
      process.exit(EXIT.RUNTIME);
    }
    throw e;
  }
}
