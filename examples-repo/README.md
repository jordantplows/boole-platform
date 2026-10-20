# boole-examples

Public examples for [Boole](https://boole.sh), from Boole AI, Inc.

This repository is MIT-licensed. It does not contain the Imagine OS product source. That software is proprietary. The command-line tool used by the setup scripts is the published package [`@boole/cli`](https://www.npmjs.com/package/@boole/cli).

## Browser demo

A small WebAssembly demo using [`@wllama/wllama` 3.8.1](https://www.npmjs.com/package/@wllama/wllama) (MIT). The weights are `SmolLM2-135M-Instruct-Q4_K_M.gguf` from bartowski on Hugging Face (Apache-2.0). Nothing loads until you press the button.

```sh
cd browser
python3 -m http.server 8080
```

Open http://127.0.0.1:8080 . The runtime and the weights are fetched on the first run. Generation is capped at 64 tokens, one thread, no GPU layers.

The only speed Boole has published for this setup is from the demo on boole.sh: **12.3 tok/s**, 64 tokens, about 5187 ms, on a 4-core Xeon CPU. That number is not a promise for your machine. A 20B model at 200 tok/s is a goal, not a result in this repo.

## Setup scripts

The scripts check for Node.js 22 or newer, then run `npx @boole/cli doctor`. They do not vendor the CLI. Install Node from [nodejs.org](https://nodejs.org/). On macOS, `brew install node@22` also works. On Windows, `winget install OpenJS.NodeJS.LTS` is fine when `node -v` reports 22 or higher. On Linux, use a distro package that reports the same.

| Machine | Script |
|---|---|
| macOS | `bash scripts/setup-macos.sh` |
| Linux | `bash scripts/setup-linux.sh` |
| Windows | `powershell -File scripts/setup-windows.ps1` |

`@boole/cli` 0.7.0 provides `run`, `pull`, `serve`, `list`, `doctor` (`--json`), and `models`. The scripts only call `doctor`. After that:

```sh
npx @boole/cli pull bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M
npx @boole/cli run bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M --prompt "Say hello"
```

`npx @boole/cli list` prints models already downloaded. `npx @boole/cli serve` is for local development only. It has no authentication and accepts `POST /generate`. Do not put that server on a public network. It is not an OpenAI-compatible API. Per-device notes are on https://boole.sh/guides/ .

## Benchmarks

`benchmarks/results.csv` has one row: the boole.sh browser measurement, with the hardware written down. `benchmarks/record-host.mjs` prints a blank CSV row for your machine. It does not invent a tokens-per-second number.

## Config

`configs/boole.env.example` shows `BOOLE_CACHE`, the optional cache override.

## Site

- https://boole.sh
- https://boole.sh/on-premise/
- https://boole.sh/compare/ollama-lm-studio-llama-cpp/
- https://boole.sh/ollama-alternative/
- https://boole.sh/guides/

A Hugging Face Space is not published yet. This README will link it when the URL exists.
