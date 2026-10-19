/**
 * Opt-in on-device demo.
 * Runtime: @wllama/wllama 3.8.1 (llama.cpp, MIT), loaded only after a click.
 * Weights: bartowski/SmolLM2-135M-Instruct-GGUF, file SmolLM2-135M-Instruct-Q4_K_M.gguf
 * (Apache-2.0). Fetched from Hugging Face on first run, then cached by the browser.
 * Generation is local. This is not the 20B / 200 tok/s goal.
 */
const MODEL_URL =
  'https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF/resolve/main/SmolLM2-135M-Instruct-Q4_K_M.gguf';

const MODEL_LABEL = 'SmolLM2-135M-Instruct · Q4_K_M';

let engine = null;

function $(id) {
  return document.getElementById(id);
}

function setStatus(text) {
  const el = $('demo-status');
  if (el) el.textContent = text;
}

function setMetrics(text) {
  const el = $('demo-metrics');
  if (el) el.textContent = text;
}

function formatBytes(n) {
  if (!n || n < 0) return '—';
  const mb = n / (1024 * 1024);
  return mb >= 10 ? mb.toFixed(0) + ' MB' : mb.toFixed(1) + ' MB';
}

function formatSpeed(timings) {
  if (!timings || !timings.predicted_n) return '';
  const perSecond = timings.predicted_ms > 0
    ? (timings.predicted_n / timings.predicted_ms) * 1000
    : 0;
  return (
    perSecond.toFixed(1) +
    ' tok/s decode · ' +
    timings.predicted_n +
    ' tokens · ' +
    Math.round(timings.predicted_ms) +
    ' ms'
  );
}

async function hardwareLine() {
  const cores = navigator.hardwareConcurrency
    ? navigator.hardwareConcurrency + ' logical cores'
    : 'core count unavailable';
  let gpu = 'WebGPU not available in this browser';
  try {
    if (navigator.gpu) {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        gpu = 'WebGPU present, no adapter';
      } else {
        const info = adapter.info || (adapter.requestAdapterInfo ? await adapter.requestAdapterInfo() : null);
        gpu = (info && (info.description || info.vendor || info.architecture)) || 'WebGPU adapter present';
      }
    }
  } catch (err) {
    gpu = 'WebGPU query failed';
  }
  return cores + ' · ' + gpu + ' · this run is WebAssembly, 1 thread, no GPU layers';
}

export async function run() {
  if (typeof WebAssembly !== 'object') {
    setStatus('This browser does not provide WebAssembly. The command-line runtime is npx @boole/cli.');
    return;
  }

  const prompt = ($('demo-prompt').value || '').trim();
  if (!prompt) {
    setStatus('Write a prompt first.');
    return;
  }

  const out = $('demo-output');
  out.textContent = '';
  setMetrics('—');
  $('demo-net').textContent = 'Loading weights';
  $('demo-host').textContent = await hardwareLine();

  const { Wllama, LoggerWithoutDebug } = await import('/runtime/wllama.js');

  if (!engine) {
    setStatus('Downloading ' + MODEL_LABEL + ' from Hugging Face.');
    const wllama = new Wllama(
      { default: new URL('/runtime/wllama.wasm', location.origin).href },
      { logger: LoggerWithoutDebug },
    );
    await wllama.loadModelFromUrl(MODEL_URL, {
      n_ctx: 1024,
      n_threads: 1,
      n_gpu_layers: 0,
      n_batch: 128,
      useCache: true,
      progressCallback: ({ loaded, total }) => {
        const pct = total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
        setStatus(
          'Downloading weights · ' + pct + '% · ' + formatBytes(loaded) + ' of ' + formatBytes(total),
        );
      },
    });
    engine = wllama;
  }

  $('demo-net').textContent = 'Weights in memory';
  setStatus('Generating on this device.');

  const before = performance.getEntriesByType('resource').length;
  const started = performance.now();
  let timings = null;
  let text = '';

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
      if (chunk.timings && chunk.timings.predicted_n > 1) {
        timings = chunk.timings;
        setMetrics(formatSpeed(timings));
      }
    },
  });

  const elapsed = performance.now() - started;
  const after = performance.getEntriesByType('resource').length;
  const extra = after - before;

  if (!text.trim()) {
    out.textContent = '(The model returned no text.)';
  }

  if (timings) {
    setMetrics(formatSpeed(timings));
  } else {
    setMetrics('No decode timing was reported · ' + Math.round(elapsed) + ' ms wall time');
  }

  if (extra === 0) {
    $('demo-net').textContent = 'On device · no new network request during generation';
  } else {
    $('demo-net').textContent = 'Generation finished · ' + extra + ' network request(s) observed during it';
  }

  setStatus('Finished. ' + MODEL_LABEL + '. Not the 20B target.');
}
