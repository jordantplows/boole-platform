# Roadmap notes

These are real gaps. They are not implemented in this repository.

- WebGPU in the browser demo. The demo forces `n_gpu_layers: 0` and one thread.
- An OpenAI-compatible server. `@boole/cli` 0.7.0 `serve` is local development only, has no authentication, and accepts `POST /generate`. That is not an OpenAI `/v1` API.
- iOS and Android. The published CLI does not support phones.
- More benchmark rows, measured by the person who runs them, with hardware written down. Do not add a speed you did not measure.
