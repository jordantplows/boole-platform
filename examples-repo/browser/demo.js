/**
 * Opt-in browser demo.
 * Runtime: @wllama/wllama 3.8.1 (MIT), loaded from jsDelivr after a click.
 * Weights: bartowski/SmolLM2-135M-Instruct-GGUF, Apache-2.0.
 * This file is not the Imagine OS product source.
 */

const WLLAMA = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.8.1/esm/index.js';
const WASM = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.8.1/src/wasm/wllama.wasm';
const MODEL =
  'https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF/resolve/main/SmolLM2-135M-Instruct-Q4_K_M.gguf';

let engine = null;

function setStatus(text) {
  document.getElementById('status').textContent = text;
}

export async function run() {
  if (typeof WebAssembly !== 'object') {
    setStatus('This browser has no WebAssembly. On a computer, use the setup script and npx @boole/cli.');
    return;
  }

  const prompt = document.getElementById('prompt').value.trim();
  if (!prompt) {
    setStatus('Write a prompt first.');
    return;
  }

  const out = document.getElementById('output');
  out.textContent = '';
  setStatus('Loading the runtime.');

  const { Wllama, LoggerWithoutDebug } = await import(WLLAMA);
  if (!engine) {
    const wllama = new Wllama(
      { default: WASM },
      { logger: LoggerWithoutDebug },
    );
    setStatus('Downloading SmolLM2-135M-Instruct Q4_K_M.');
    await wllama.loadModelFromUrl(MODEL, {
      n_ctx: 1024,
      n_threads: 1,
      n_gpu_layers: 0,
      n_batch: 128,
      useCache: true,
      progressCallback: ({ loaded, total }) => {
        const pct = total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
        setStatus('Downloading weights · ' + pct + '%');
      },
    });
    engine = wllama;
  }

  setStatus('Generating in this browser. Cap is 64 tokens.');
  const started = performance.now();
  let text = '';
  let timings = null;

  await engine.createChatCompletion({
    messages: [
      { role: 'system', content: 'Answer in one or two short sentences.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 64,
    temperature: 0.6,
    stream: true,
    onData(chunk) {
      const piece = chunk.choices && chunk.choices[0] && chunk.choices[0].delta
        ? chunk.choices[0].delta.content || ''
        : '';
      if (piece) {
        text += piece;
        out.textContent = text;
      }
      if (chunk.timings && chunk.timings.predicted_n > 1) timings = chunk.timings;
    },
  });

  const elapsed = Math.round(performance.now() - started);
  if (!text.trim()) out.textContent = '(The model returned no text.)';
  if (timings && timings.predicted_ms > 0) {
    const perSecond = (timings.predicted_n / timings.predicted_ms) * 1000;
    setStatus(
      perSecond.toFixed(1) +
        ' tok/s · ' +
        timings.predicted_n +
        ' tokens · ' +
        Math.round(timings.predicted_ms) +
        ' ms. This is your machine, not the published 12.3 tok/s Xeon figure.',
    );
  } else {
    setStatus('Finished in ' + elapsed + ' ms wall time. No decode timing was reported.');
  }
}
