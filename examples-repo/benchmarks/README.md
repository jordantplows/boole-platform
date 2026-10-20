# Benchmarks

This folder does not claim a leaderboard.

`results.csv` contains one measured row, copied from the public boole.sh browser demo:

- Model file: SmolLM2-135M-Instruct-Q4_K_M.gguf
- 64 tokens, about 5187 ms, 12.3 tok/s
- WebAssembly, wllama 3.8.1, 1 thread, 0 GPU layers
- Machine: 4-core Xeon CPU

That is not a result for Apple Silicon, NVIDIA, a phone, or a 20B model. A 20B model at 200 tok/s is a goal stated by Boole AI, Inc., not a number in this file.

`record-host.mjs` prints your OS, architecture, CPU model, and memory, and a CSV row with the timing columns left empty. Fill those only after you measure them.
