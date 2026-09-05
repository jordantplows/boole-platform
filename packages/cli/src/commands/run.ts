import { readFileSync, statSync } from 'node:fs';
import { detect } from '@boole/hardware';
import { resolveModel } from '../aliases.js';
import { pull, ModelNotFoundError, QuantNotFoundError, DiskFullError, NetworkError, UserCancelledError } from '../download.js';
import { parseArgs, flagStr, flagBool } from '../parse.js';
import { EXIT } from '../exit.js';

const BOOLEANS = new Set(['stream', 'yes', 'json', 'jsonl', 'quiet', 'help']);

export default async function run(args: string[]): Promise<void> {
  const parsed = parseArgs(args, BOOLEANS);
  const quiet = flagBool(parsed, 'quiet', 'q');
  const log = quiet ? () => {} : (s: string) => process.stderr.write(s);

  if (flagBool(parsed, 'help', 'h')) {
    printHelp();
    process.exit(0);
  }

  const modelSpec = flagStr(parsed, 'model', 'm') ?? parsed.positional[0];
  if (!modelSpec) {
    process.stderr.write('error: no model specified\nrun "boole run --help" for usage\n');
    process.exit(EXIT.BAD_USAGE);
  }

  let promptText = flagStr(parsed, 'prompt', 'p') ?? parsed.positional[1];
  const filePath = flagStr(parsed, 'file');
  const systemPrompt = flagStr(parsed, 'system', 's');

  if (filePath) {
    try {
      promptText = readFileSync(filePath, 'utf-8');
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        process.stderr.write(`error: file not found: ${filePath}\n`);
        process.exit(EXIT.BAD_USAGE);
      }
      throw e;
    }
  }

  if (!promptText || promptText === '-') {
    if (process.stdin.isTTY && !promptText) {
      process.stderr.write('error: no prompt specified\nrun "boole run --help" for usage\n');
      process.exit(EXIT.BAD_USAGE);
    }
    promptText = await readStdin();
  }

  const hw = await detect();
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

  let pullResult;
  try {
    pullResult = await pull(resolved.repo, resolved.quant, {
      cacheDir: hw.cache.path,
      yes: flagBool(parsed, 'yes'),
    });
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

  if (!pullResult.cached) log('\n');

  const wantJson = flagBool(parsed, 'json');
  const wantJsonl = flagBool(parsed, 'jsonl');
  const stream = flagBool(parsed, 'stream') || wantJsonl;
  const temp = parseFloat(flagStr(parsed, 'temp', 't') ?? '0.8');
  const ctxSize = parseInt(flagStr(parsed, 'ctx-size') ?? '2048');
  const gpuLayers = flagStr(parsed, 'gpu-layers') ? parseInt(flagStr(parsed, 'gpu-layers')!) : undefined;
  const maxTokens = flagStr(parsed, 'max-tokens') ? parseInt(flagStr(parsed, 'max-tokens')!) : undefined;

  if (filePath && promptText.length > ctxSize * 4) {
    process.stderr.write(
      `error: file is ~${Math.ceil(promptText.length / 4)} tokens, ` +
      `exceeds context window of ${ctxSize} tokens\n` +
      `use --ctx-size to increase, or truncate the input\n`,
    );
    process.exit(EXIT.BAD_USAGE);
  }

  const startTime = Date.now();
  let response = '';
  let promptTokens = 0;
  let completionTokens = 0;

  try {
    const mod: any = await import('node-llama-cpp');
    const llama = await mod.getLlama({ gpu: 'auto' });
    const model = await llama.loadModel({ modelPath: pullResult.path });
    const ctx = await model.createContext({ contextSize: ctxSize });
    const seq = ctx.getSequence();
    const session = new mod.LlamaChatSession({ contextSequence: seq });

    if (systemPrompt) {
      session.systemPrompt = systemPrompt;
    }

    if (stream && !wantJson) {
      response = await session.prompt(promptText, {
        maxTokens,
        temperature: temp,
        onTextChunk: (text: string) => {
          if (wantJsonl) {
            completionTokens++;
            process.stdout.write(JSON.stringify({ token: text, i: completionTokens }) + '\n');
          } else {
            process.stdout.write(text);
          }
        },
      });
      if (!wantJsonl) process.stdout.write('\n');
    } else {
      response = await session.prompt(promptText, {
        maxTokens,
        temperature: temp,
      });
      if (wantJson) {
        process.stdout.write(JSON.stringify({
          model: `${resolved.repo}:${resolved.quant}`,
          completion: response,
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          wall_ms: Date.now() - startTime,
        }) + '\n');
      } else {
        process.stdout.write(response + '\n');
      }
    }
  } catch (e: any) {
    if (e.code === 'ERR_MODULE_NOT_FOUND' || e.code === 'MODULE_NOT_FOUND') {
      process.stderr.write('error: node-llama-cpp is not installed\n  npm install node-llama-cpp\n');
      process.exit(EXIT.RUNTIME);
    }
    process.stderr.write(`error: ${e.message}\n`);
    process.exit(EXIT.RUNTIME);
  }
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

function printHelp(): void {
  process.stderr.write(`
usage: boole run <model> [prompt] [flags]

Run a prompt against a model. Model can be an alias (e.g. "llama3")
or a full specifier (e.g. "TheBloke/Llama-2-7B-GGUF:Q4_K_M").

Prompt sources (first match wins):
  --file <path>       Read prompt from a file
  --prompt <text>, -p Read from argument (use "-" for stdin)
  <positional>        Second positional argument
  (stdin)             Piped input when no prompt flag given

Flags:
  --model, -m       Model specifier or alias
  --prompt, -p      Prompt text (use "-" to read from stdin)
  --file            Read prompt from file path
  --system, -s      System prompt
  --stream          Stream tokens to stdout
  --temp, -t        Sampling temperature (default: 0.8)
  --ctx-size        Context window in tokens (default: 2048)
  --gpu-layers      Layers to offload to GPU (default: all)
  --max-tokens      Maximum tokens to generate
  --json            Output a single JSON object with completion + metadata
  --jsonl           Stream token events as JSON lines
  --yes             Skip confirmation prompts
  --quiet, -q       Suppress all stderr output

stdout carries only the model's output. All diagnostics go to stderr.

Exit codes:
  0  success
  1  runtime failure
  2  bad usage / invalid arguments
  3  model unavailable (not found, no matching quant, not enough memory)
`);
}
