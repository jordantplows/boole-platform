# boole

Local LLM inference for JavaScript. Run GGUF models on your own machine
via llama.cpp — no API key, no per-token cost.

```sh
npx @boole/cli
```

## Install

```sh
npm i -g @boole/cli
```

Requires Node.js 20 or newer, which is what node-llama-cpp 3.22.2 documents.
GPU acceleration is automatic on Apple Silicon (Metal). On Windows and Linux
x64 it uses CUDA or Vulkan when that prebuilt binary matches the machine,
and the CPU otherwise.

## Quick start

```sh
boole run llama3 -p "Explain what a boolean is in one sentence."
```

Aliases resolve to a HuggingFace repo and pick the best quantization for your
hardware automatically. Use `boole models` to see all aliases, or pass a full
specifier:

```sh
boole run TheBloke/Llama-2-7B-Chat-GGUF:Q4_K_M "your prompt"
```

## Commands

### run

Run a prompt against a model.

```
boole run <model> [prompt] [flags]
```

Prompt sources (first match wins):
- `--file <path>` — read prompt from a file
- `--prompt <text>`, `-p` — from argument (use `-` for stdin)
- second positional argument
- piped stdin when no prompt flag is given

| Flag | Description |
|---|---|
| `--model, -m` | Model specifier or alias |
| `--prompt, -p` | Prompt text (use `-` to read stdin) |
| `--file` | Read prompt from file path |
| `--system, -s` | System prompt |
| `--stream` | Stream tokens to stdout |
| `--temp, -t` | Sampling temperature (default: 0.8) |
| `--ctx-size` | Context window in tokens (default: 2048) |
| `--gpu-layers` | Layers to offload to GPU (default: all) |
| `--max-tokens` | Maximum tokens to generate |
| `--json` | Emit a single JSON object with completion + metadata |
| `--jsonl` | Stream token events as JSON lines |
| `--yes` | Skip confirmation prompts |
| `--quiet, -q` | Suppress all stderr output |

### pull

Download a model to the local cache.

```
boole pull <model> [flags]
```

| Flag | Description |
|---|---|
| `--model, -m` | Model specifier or alias |
| `--dir` | Custom cache directory |
| `--yes` | Skip size confirmation |

Downloads resume automatically if interrupted — a partial 4 GB download
will not restart from zero.

### doctor

Detect hardware and print system info.

```
boole doctor
```

Prints OS, arch, Node version, RAM, GPU backend (by probing node-llama-cpp),
binary type, and cache size. Ends with a verdict: the largest model and quant
this machine can comfortably run. Exits 0 if usable, 1 if not.

### models

List available model aliases.

```
boole models
```

Aliases are defined in `packages/cli/src/data/aliases.json` — edit the file
to add or update models without a code change.

## Model specifiers

Models are addressed as `<hf-repo>:<quant-pattern>`:

```
TheBloke/Llama-2-7B-GGUF:Q4_K_M
bartowski/Phi-3-mini-4k-instruct-GGUF:Q5_K_S
```

A local `.gguf` file path works anywhere a specifier does:

```sh
boole run ./mistral-7b-q4.gguf "your prompt"
```

When you use an alias like `llama3`, boole resolves it to a repo and picks
the highest-quality quantization that fits in your available RAM. The
resolution is printed to stderr before the run starts.

## Scripting

stdout carries **only** the model's output. Progress bars, resolution notices,
and diagnostics go to stderr. This makes boole composable with standard Unix
tools.

### Summarize a file

```sh
boole run llama3 --file ./report.md --system "Summarize in 3 bullet points" > summary.txt
```

### Git commit-message hook

Save as `.git/hooks/prepare-commit-msg`:

```sh
#!/bin/sh
# Generate a commit message from the staged diff.
# Requires boole and a cached model.

DIFF=$(git diff --cached --stat)
if [ -z "$DIFF" ]; then
  exit 0
fi

MSG=$(git diff --cached | boole run llama3 --prompt - \
  --system "Write a concise git commit message for this diff. One line summary, then a blank line, then bullet points. No backticks." \
  --quiet --max-tokens 200)

echo "$MSG" > "$1"
```

### CI step with no network access

Use `--yes` to skip interactive prompts and pre-pull the model in a setup
step so inference runs offline:

```sh
# In CI setup (has network):
boole pull llama3 --yes

# In the test step (no network needed):
cat src/api.ts | boole run llama3 --prompt - \
  --system "List any security issues in this code. Reply NONE if clean." \
  --quiet --json
```

The `--json` flag emits a single object with `completion`, `model`, `quant`,
token counts, and wall-clock timing — easy to parse in CI scripts.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | Runtime failure (disk full, network error, inference crash) |
| 2 | Bad usage / invalid arguments |
| 3 | Model unavailable (not found, no matching quant, not enough memory) |

## Platform support

Prebuilt binaries shipped by node-llama-cpp 3.22.2 (peer dependency `>=3.0.0`). GPU packages exist only where named.

| Platform | Arch | Prebuilt package | Backend |
|---|---|---|---|
| macOS | Apple Silicon | `@node-llama-cpp/mac-arm64-metal` | Metal |
| macOS | Intel | `@node-llama-cpp/mac-x64` | CPU. Metal is off by default on Intel Macs. |
| Linux | x64 | `linux-x64`, `linux-x64-cuda`, `linux-x64-vulkan` | CPU, CUDA, or Vulkan |
| Windows | x64 | `win-x64`, `win-x64-cuda`, `win-x64-vulkan` | CPU, CUDA, or Vulkan |
| Linux | arm64 | `@node-llama-cpp/linux-arm64` | CPU prebuilt. No CUDA or Vulkan package. |
| Windows | arm64 | `@node-llama-cpp/win-arm64` | CPU prebuilt |
| Linux | armv7l, riscv64 | `linux-armv7l`, `linux-riscv64` | CPU prebuilt |

The browser demonstration is separate: wllama WebAssembly, one thread, no GPU layers. Phones, NPUs, and other edge devices are not supported today.

## Project structure

```
build.ts                          # marketing site build + dev server
src/                              # marketing site source
packages/
  hardware/                       # @boole/hardware — reusable detection module
    src/
      detect.ts                   # OS, RAM, GPU, cache detection
      recommend.ts                # model/quant recommendation logic
      index.ts
      detect.test.ts
  cli/                            # @boole/cli — the CLI tool
    src/
      index.ts                    # entry point, command dispatch
      aliases.ts                  # alias resolution
      download.ts                 # download with progress, resume, errors
      format.ts                   # formatting helpers
      parse.ts                    # argument parser
      exit.ts                     # exit code constants
      data/aliases.json           # curated model alias map
      commands/
        doctor.ts
        models.ts
        run.ts
        pull.ts
      aliases.test.ts
```

## Development

```sh
npm install
npm test                                    # run all tests
npx tsx packages/cli/src/index.ts doctor    # run CLI locally
npx tsx packages/cli/src/index.ts models    # list aliases
```

## License

Proprietary. Copyright (c) 2026 Boole AI, Inc. All rights reserved.

No use, copying, modification, or distribution without a written license or agreement from Boole AI, Inc. Licensing inquiries: hello@booleinference.com.

Earlier public releases were published under the MIT License.

Counsel should review the LICENSE file before it is relied on.
