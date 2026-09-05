import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createServer } from 'node:http';
import sharp from 'sharp';

const DIST = 'dist';
const SITE = 'https://boole.sh';
const PORT = 4321;

if (existsSync(DIST)) rmSync(DIST, { recursive: true });
mkdirSync(DIST, { recursive: true });

const css = readFileSync('src/styles/global.css', 'utf-8');
const frames: Array<{ t: string; c?: string; d: number }> = JSON.parse(
  readFileSync('src/data/terminal-frames.json', 'utf-8'),
);

const staticTerminal = frames
  .map(f => {
    const t = f.t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return f.c ? `<span class="${f.c}">${t}</span>` : t;
  })
  .join('');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>boole — local LLM inference for JavaScript</title>
  <meta name="description" content="Run GGUF models on your own machine via llama.cpp. No API key, no per-token cost. npm install and go.">
  <link rel="canonical" href="${SITE}/">

  <meta property="og:title" content="boole — local LLM inference for JavaScript">
  <meta property="og:description" content="Run GGUF models on your own machine via llama.cpp. No API key, no per-token cost. npm install and go.">
  <meta property="og:image" content="${SITE}/og.png">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="boole — local LLM inference for JavaScript">
  <meta name="twitter:description" content="Run GGUF models on your own machine via llama.cpp. No API key, no per-token cost. npm install and go.">
  <meta name="twitter:image" content="${SITE}/og.png">

  <meta name="theme-color" content="#fbfbf9" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#161618" media="(prefers-color-scheme: dark)">

  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <style>${css}</style>
</head>
<body>

<main class="col">

  <section class="hero">
    <h1 class="wordmark">boole</h1>
    <p class="lead">
      Local LLM inference for JavaScript — run GGUF models on your own machine
      via llama.cpp, no API key or per-token cost required.
    </p>
    <div class="cmd">
      <code><span class="prompt-char">$</span>npx @boole/cli</code>
      <button class="copy-btn" data-copy="npx @boole/cli">copy</button>
    </div>
  </section>

  <section>
    <div class="terminal" id="terminal" aria-label="Terminal session demonstrating boole run with streaming output">
      <pre><code id="terminal-output">${staticTerminal}</code></pre>
    </div>
  </section>

  <section>
    <div class="features">
      <div>
        <h3>Your hardware, your latency</h3>
        <p>
          Inference runs on the machine that called it. No cold start, no
          round-trip to a datacenter, no queue. Metal on Apple Silicon, CUDA and
          Vulkan on Linux and Windows.
        </p>
      </div>
      <div>
        <h3>Any GGUF, any quant</h3>
        <p>
          Point Boole at a HuggingFace repo and a quantization pattern. It
          downloads the file, verifies the hash, and caches it locally. You pick
          the size/quality trade-off.
        </p>
      </div>
      <div>
        <h3>An npm install, not a daemon</h3>
        <p>
          <code>npm i -g @boole/cli</code>. No Docker container, no system
          service, no background process. It links against node-llama-cpp and
          loads the model on demand.
        </p>
      </div>
    </div>
  </section>

  <section>
    <h2>Commands</h2>

    <div class="command">
      <h3>run</h3>
      <p>Run a prompt against a model.</p>
      <table>
        <thead><tr><th>Flag</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>--model, -m</code></td><td>Model specifier or local <code>.gguf</code> path</td></tr>
          <tr><td><code>--stream</code></td><td>Stream tokens to stdout</td></tr>
          <tr><td><code>--system, -s</code></td><td>System prompt</td></tr>
          <tr><td><code>--temp, -t</code></td><td>Sampling temperature (default: 0.8)</td></tr>
          <tr><td><code>--ctx-size</code></td><td>Context window in tokens (default: 2048)</td></tr>
          <tr><td><code>--gpu-layers</code></td><td>Layers to offload to GPU (default: all)</td></tr>
          <tr><td><code>--max-tokens</code></td><td>Maximum tokens to generate</td></tr>
        </tbody>
      </table>
    </div>

    <div class="command">
      <h3>pull</h3>
      <p>Download a model to the local cache.</p>
      <table>
        <thead><tr><th>Flag</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>--model, -m</code></td><td>Model specifier</td></tr>
          <tr><td><code>--dir</code></td><td>Custom cache directory</td></tr>
        </tbody>
      </table>
    </div>

    <div class="command">
      <h3>serve</h3>
      <p>Start an OpenAI-compatible HTTP server.</p>
      <table>
        <thead><tr><th>Flag</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>--model, -m</code></td><td>Model specifier or local <code>.gguf</code> path</td></tr>
          <tr><td><code>--port, -p</code></td><td>Port (default: 8080)</td></tr>
          <tr><td><code>--host</code></td><td>Bind address (default: 127.0.0.1)</td></tr>
        </tbody>
      </table>
      <div class="warning">
        <strong>Warning:</strong> <code>serve</code> binds to 127.0.0.1 by default.
        Setting <code>--host 0.0.0.0</code> exposes the model endpoint to your
        entire network with no authentication. Do not expose it to the public
        internet.
      </div>
    </div>

    <div class="command">
      <h3>list</h3>
      <p>List downloaded models.</p>
      <table>
        <thead><tr><th>Flag</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>--json</code></td><td>Output as JSON</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section>
    <h2>Model specifiers</h2>
    <p>Models are addressed as <code>&lt;hf-repo&gt;:&lt;quant-pattern&gt;</code>.</p>

    <div class="example">
      <code>TheBloke/Llama-2-7B-GGUF:Q4_K_M</code>
      <p>Downloads the Q4_K_M quantization of Llama 2 7B from TheBloke's HuggingFace repo.</p>
    </div>

    <div class="example">
      <code>bartowski/Phi-3-mini-4k-instruct-GGUF:Q5_K_S</code>
      <p>Downloads Phi-3 Mini at Q5_K_S quantization.</p>
    </div>

    <p>A local <code>.gguf</code> file path works anywhere a specifier does:</p>
    <div class="cmd" style="margin-top: 0.5rem">
      <code><span class="prompt-char">$</span>boole run ./mistral-7b-q4.gguf "your prompt"</code>
      <button class="copy-btn" data-copy="boole run ./mistral-7b-q4.gguf &quot;your prompt&quot;">copy</button>
    </div>
  </section>

  <section>
    <h2>Platform support</h2>
    <table>
      <thead>
        <tr><th>Platform</th><th>Arch</th><th>GPU</th><th>Backend</th></tr>
      </thead>
      <tbody>
        <tr><td>macOS</td><td>Apple Silicon</td><td>Yes</td><td>Metal</td></tr>
        <tr><td>macOS</td><td>Intel</td><td>—</td><td>CPU only</td></tr>
        <tr><td>Linux</td><td>x86_64</td><td>NVIDIA</td><td>CUDA</td></tr>
        <tr><td>Linux</td><td>x86_64</td><td>AMD</td><td>Vulkan</td></tr>
        <tr><td>Linux</td><td>x86_64</td><td>—</td><td>CPU only</td></tr>
        <tr><td>Windows</td><td>x86_64</td><td>NVIDIA</td><td>CUDA</td></tr>
        <tr><td>Windows</td><td>x86_64</td><td>AMD</td><td>Vulkan</td></tr>
        <tr><td>Windows</td><td>x86_64</td><td>—</td><td>CPU only</td></tr>
      </tbody>
    </table>
  </section>

</main>

<footer class="col">
  <div class="footer-links">
    <a href="https://www.npmjs.com/package/@boole/cli">npm</a>
    <a href="https://github.com/boole-sh/boole">GitHub</a>
    <span>MIT License</span>
    <a href="mailto:hello@boole.sh">hello@boole.sh</a>
  </div>
</footer>

<script>
(function () {
  var frames = ${JSON.stringify(frames)};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var el = document.getElementById('terminal');
  var output = document.getElementById('terminal-output');

  var observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      output.innerHTML = '';

      var cursor = document.createElement('span');
      cursor.className = 'cursor';
      cursor.textContent = '\\u2588';
      output.appendChild(cursor);

      var i = 0;
      function step() {
        var f = frames[i];
        if (f.c) {
          var span = document.createElement('span');
          span.className = f.c;
          span.textContent = f.t;
          output.insertBefore(span, cursor);
        } else {
          output.insertBefore(document.createTextNode(f.t), cursor);
        }
        i++;
        if (i < frames.length) {
          setTimeout(step, frames[i].d);
        } else {
          cursor.remove();
        }
      }
      setTimeout(step, frames[0].d);
    }
  }, { threshold: 0.3 });

  observer.observe(el);
})();
</script>

<script>
document.querySelectorAll('[data-copy]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(function () {
      var prev = btn.textContent;
      btn.textContent = 'copied';
      setTimeout(function () { btn.textContent = prev; }, 2000);
    });
  });
});
</script>

</body>
</html>`;

writeFileSync(join(DIST, 'index.html'), html);

const ogSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#161618"/>
  <text x="100" y="260" font-family="monospace" font-size="64" font-weight="700" fill="#e8e6e3">boole</text>
  <text x="100" y="330" font-family="sans-serif" font-size="26" fill="#929290">Local LLM inference for JavaScript</text>
  <text x="100" y="400" font-family="monospace" font-size="20" fill="#e8862f">$ npx @boole/cli</text>
</svg>`;

const ogPng = await sharp(Buffer.from(ogSvg)).png().toBuffer();
writeFileSync(join(DIST, 'og.png'), ogPng);

cpSync('public', DIST, { recursive: true });

console.log(`Built to ${DIST}/ (${(html.length / 1024).toFixed(1)}KB html, ${(ogPng.length / 1024).toFixed(1)}KB og.png)`);

if (process.argv.includes('--serve')) {
  const mime: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '': 'text/plain; charset=utf-8',
  };

  createServer((req, res) => {
    let url = req.url?.split('?')[0] || '/';
    if (url.endsWith('/')) url += 'index.html';

    const filePath = join(DIST, url);
    try {
      const data = readFileSync(filePath);
      const ext = extname(filePath);
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  }).listen(PORT, () => {
    console.log(`Serving at http://localhost:${PORT}`);
  });
}
