import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createServer } from 'node:http';
import sharp from 'sharp';

const DIST = 'dist';
const SITE = 'https://boole.sh';
const PORT = 4321;

/**
 * Inquiry destinations. One place to swap later:
 * set buyNow to a Stripe Payment Link and bookCall to a Cal.com URL.
 * Until then both are mailto links with the subject filled in.
 */
const CTA = {
  email: 'hello@booleinference.com',
  buyNow: `mailto:hello@booleinference.com?subject=${encodeURIComponent('Boole: Buy now')}`,
  bookCall: `mailto:hello@booleinference.com?subject=${encodeURIComponent('Boole: Book a call')}`,
} as const;

const TITLE = 'Imagine OS — on-device models for software that adapts';
const DESCRIPTION =
  'Imagine OS runs models on the device and shapes software around you. Local GGUF inference today. A 20B model at 200 tok/s is a goal.';
const KEYWORDS =
  'on-device AI, local models, local inference, imagination, future of software, Imagine OS, ternary weights, BitNet-style 1.58-bit models, llama.cpp, GGUF';

const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Boole',
      url: `${SITE}/`,
      email: CTA.email,
      logo: `${SITE}/favicon.svg`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: `${SITE}/`,
      name: 'Boole',
      description: DESCRIPTION,
      publisher: { '@id': `${SITE}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Imagine OS',
      alternateName: 'Boole',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'macOS, Linux, Windows',
      softwareVersion: '0.0.1',
      url: `${SITE}/`,
      description:
        'Imagine OS is Boole’s direction: software shaped around the person using it, with models that run on the device. Release 0.0.1 is a local GGUF runtime through llama.cpp. A 20-billion-parameter model at 200 tokens per second is a target, not a measured result.',
      keywords: KEYWORDS,
      license: 'https://opensource.org/licenses/MIT',
      installUrl: 'https://www.npmjs.com/package/@boole/cli',
      featureList: [
        'Local GGUF inference through llama.cpp',
        'An in-browser demonstration that runs SmolLM2 135M on the visitor’s device',
        'A direction toward software shaped around its user',
      ],
      author: { '@id': `${SITE}/#organization` },
      publisher: { '@id': `${SITE}/#organization` },
    },
  ],
}).replace(/</g, '\\u003c');

if (existsSync(DIST)) rmSync(DIST, { recursive: true });
mkdirSync(DIST, { recursive: true });

const css = readFileSync('src/styles/global.css', 'utf-8');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${TITLE}</title>
  <meta name="description" content="${DESCRIPTION}">
  <meta name="keywords" content="${KEYWORDS}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE}/">
  <meta property="og:site_name" content="Boole">
  <meta property="og:locale" content="en_US">
  <meta property="og:title" content="${TITLE}">
  <meta property="og:description" content="${DESCRIPTION}">
  <meta property="og:image" content="${SITE}/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Imagine OS. On-device models for software that adapts.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${TITLE}">
  <meta name="twitter:description" content="${DESCRIPTION}">
  <meta name="twitter:image" content="${SITE}/og.png">
  <meta name="twitter:image:alt" content="Imagine OS. On-device models for software that adapts.">
  <meta name="theme-color" content="#0c0d10">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script>document.documentElement.classList.add('js')</script>
  <script type="application/ld+json">${jsonLd}</script>
  <style>${css}</style>
</head>
<body>
  <a class="skip" href="#vision">Skip to content</a>
  <header class="bar">
    <a class="brand" href="#vision">boole <span>Imagine OS</span></a>
    <nav class="actions" aria-label="Contact">
      <a class="btn btn-call" href="${CTA.bookCall}">Book a call</a>
      <a class="btn btn-buy" href="${CTA.buyNow}">Buy now</a>
    </nav>
  </header>

  <main>
    <section id="vision" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Imagine OS · Release 0.0.1</p>
        <h1>The computer should write the software with you.</h1>
        <p class="lede">
          Every app you use was finished before you opened it. Imagine OS is
          the other arrangement: a real model runs on the device, and the
          software takes its shape from the person holding it. Private.
          Immediate. Still yours when the network is gone. The runtime is what
          you can run today. The shell that imagines is what that runtime is for.
        </p>
        <div class="actions actions-hero">
          <a class="btn btn-buy" href="${CTA.buyNow}">Buy now</a>
          <a class="btn btn-call" href="${CTA.bookCall}">Book a call</a>
        </div>
        <dl class="facts">
          <div><dt>Runtime</dt><dd>llama.cpp</dd></div>
          <div><dt>Weights</dt><dd>GGUF, on disk</dd></div>
          <div><dt>Interface</dt><dd>Command line</dd></div>
          <div><dt>License</dt><dd><a class="inline" href="#license">MIT</a></dd></div>
        </dl>
      </div>
    </section>

    <section id="product" tabindex="-1">
      <div class="wrap">
        <p class="kicker">The product</p>
        <h2 class="reveal">Own the machine. Then own the software.</h2>
        <div class="beats reveal-seq">
          <article class="card">
            <span class="tag">01</span>
            <h3>Finished software asks you to adapt.</h3>
            <p>
              Menus, icons, and workflows are decided before the machine is
              opened. You learn the product. It does not learn the way you work.
              The same interface is shipped to everyone.
            </p>
          </article>
          <article class="card">
            <span class="tag">02</span>
            <h3>A rented model asks you to send the work away.</h3>
            <p>
              The useful part of the computer now lives in someone else’s
              cluster. Your prompt, your files, and the shape of your day leave
              the building so a model can answer.
            </p>
          </article>
          <article class="card">
            <span class="tag">03</span>
            <h3>Imagine OS keeps both on the device.</h3>
            <p>
              The model runs where you are, and the software is composed for
              the task in front of you. That is the product. Release 0.0.1 is
              the local runtime it stands on. The shell is the work in front of us.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section id="demo" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Proof</p>
        <h2 class="reveal">Run a model in this browser.</h2>
        <div class="prose reveal">
          <p>
            Press the button and a small open model loads into WebAssembly on
            this device. Nothing is typed in for you, and the tokens are the
            model’s. This is SmolLM2 135M Instruct at Q4_K_M, not the 20-billion-parameter
            target. The first run downloads the weights from Hugging Face.
            Generation is capped at 64 tokens, and after the weights are in
            memory it does not call a server.
          </p>
          <p class="soon">A Hugging Face example is coming soon.</p>
        </div>
        <div class="bench reveal">
          <div class="bench-top">
            <strong>${'SmolLM2-135M-Instruct'}</strong>
            <span>Q4_K_M · llama.cpp via wllama · Apache-2.0 weights</span>
          </div>
          <label for="demo-prompt">Prompt</label>
          <textarea id="demo-prompt" maxlength="500">What does it mean to run a language model on the device?</textarea>
          <button class="btn btn-buy" id="run-demo" type="button">Run on this device</button>
          <p class="bench-meta" id="demo-status">Waiting. Weights are not loaded.</p>
          <div class="bench-meta">
            <span>Decode <strong id="demo-metrics">—</strong></span>
            <span id="demo-net">No generation yet</span>
          </div>
          <label for="demo-output">Output</label>
          <pre id="demo-output" aria-live="polite"></pre>
          <p class="host" id="demo-host">Hardware is reported when you run it.</p>
        </div>
      </div>
    </section>

    <section id="architecture" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Architecture</p>
        <h2 class="reveal">How a local run works.</h2>
        <div class="prose">
          <p>
            <code>boole run</code> takes an alias, such as <code>llama3</code>, or a
            repository and quantization. The alias resolves to a GGUF file that
            fits the memory this machine reports. If that file is not in the
            cache, <code>pull</code> downloads it from Hugging Face and resumes
            if the transfer stops. node-llama-cpp then loads the file, opens a
            context, and samples tokens in-process. Standard output is the
            model text. Diagnostics stay on standard error.
          </p>
        </div>
        <ol class="flow reveal-seq">
          <li>
            <span class="tag">01</span>
            <h3>Session</h3>
            <span>The prompt comes from an argument, a file, or stdin. It is not uploaded by this code.</span>
          </li>
          <li>
            <span class="tag">02</span>
            <h3>Runtime</h3>
            <span>llama.cpp through node-llama-cpp. GPU offload when that build provides it, otherwise the CPU. The default context is 2048 tokens.</span>
          </li>
          <li>
            <span class="tag">03</span>
            <h3>Weights</h3>
            <span>A GGUF file in the local cache. After it is there, generation does not need the network.</span>
          </li>
        </ol>
        <div class="prose" style="margin-top:1.25rem">
          <p>
            The demonstration on this page is the same family of runtime, compiled
            to WebAssembly, with one thread and no GPU layers. It is a proof that
            inference can happen in the browser. It is not the command-line release,
            and it is not Imagine OS imagining an interface.
          </p>
        </div>
      </div>
    </section>

    <section id="privacy" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Privacy and security</p>
        <h2 class="reveal">What stays here, and what does not.</h2>
        <div class="split reveal-seq">
          <article class="card">
            <h3>The command line</h3>
            <p>
              The published source has no analytics call. The only network
              code downloads a model file from Hugging Face during
              <code>pull</code>. A prompt is passed to the local session.
              The CLI does not sign or attest the weights. You are trusting
              the repository the alias, or you, selected.
            </p>
          </article>
          <article class="card">
            <h3>This page</h3>
            <p>
              The runtime and the page are static. The model file is fetched
              only after you press the button, from one public Hugging Face
              URL. During generation the page counts new network requests and
              reports that count. There is no account and no telemetry pixel.
              This is not a security certification.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section id="roadmap" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Research roadmap</p>
        <h2 class="reveal">Where the work is going.</h2>
        <p class="note reveal">These are goals. Boole has not published a measurement for them.</p>
        <ol class="goals reveal-seq">
          <li>
            <span class="tag">Goal</span>
            <h3>Ternary weights</h3>
            <p>BitNet-style 1.58-bit models, so a full network can live on the device instead of in a cluster.</p>
          </li>
          <li>
            <span class="tag">Goal</span>
            <h3>20 billion parameters, 200 tokens a second</h3>
            <p>A speed target for a model of that size. A number we are aiming at. Not a number we have measured. The speed in the demonstration above is whatever this browser just produced on a 135M model.</p>
          </li>
          <li>
            <span class="tag">Goal</span>
            <h3>A shell that keeps shaping software</h3>
            <p>The default interface is a beginning. The longer work is software that changes with use, with the model still running locally.</p>
          </li>
        </ol>
      </div>
    </section>

    <section id="builders" tabindex="-1">
      <div class="wrap">
        <p class="kicker">For builders</p>
        <h2 class="reveal">Release 0.0.1</h2>
        <table class="spec">
          <tbody>
            <tr><th scope="row">Install</th><td><code>npx @boole/cli</code></td></tr>
            <tr><th scope="row">run</th><td>Prompt a local model. An alias such as <code>llama3</code> picks a quantization that fits available memory.</td></tr>
            <tr><th scope="row">pull</th><td>Download weights into the cache. An interrupted download resumes.</td></tr>
            <tr><th scope="row">doctor</th><td>Read the machine and suggest a size it can hold.</td></tr>
            <tr><th scope="row">models</th><td>List the aliases.</td></tr>
            <tr><th scope="row">Not built</th><td><code>serve</code> and <code>list</code> are reserved and not implemented. If node-llama-cpp is missing, the CLI says so and stops.</td></tr>
            <tr><th scope="row">Source</th><td><a class="inline" href="https://github.com/jordantplows/boole-platform">github.com/jordantplows/boole-platform</a> · <a class="inline" href="https://www.npmjs.com/package/@boole/cli">npm</a></td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section id="license" tabindex="-1">
      <div class="wrap reveal">
        <p class="kicker">License</p>
        <h2>MIT. Copyright (c) 2026 Jordan Plows.</h2>
        <div class="prose">
          <p>
            The repository is released under the MIT License, as stated in its
            <a class="inline" href="https://github.com/jordantplows/boole-platform/blob/main/LICENSE">LICENSE</a>
            file. The copyright holder named there is Jordan Plows.
          </p>
          <p>
            That license lets any person use, copy, modify, merge, publish,
            distribute, sublicense, and sell copies of the software and its
            documentation. Copies and substantial portions must keep the
            copyright notice and the permission notice. The software is
            provided as is, without warranty.
          </p>
        </div>
      </div>
    </section>

    <section id="talk" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Begin</p>
        <h2 class="reveal">If the machine should belong to you.</h2>
        <div class="prose">
          <p>
            Buy now and Book a call both open a note to
            <a class="inline" href="mailto:${CTA.email}">${CTA.email}</a>,
            with the subject already filled in.
          </p>
        </div>
        <div class="actions actions-hero" style="margin-top:1.5rem">
          <a class="btn btn-buy" href="${CTA.buyNow}">Buy now</a>
          <a class="btn btn-call" href="${CTA.bookCall}">Book a call</a>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="wrap footer-row">
      <span>boole</span>
      <a href="#license">License</a>
      <a href="https://www.npmjs.com/package/@boole/cli">npm</a>
      <a href="https://github.com/jordantplows/boole-platform">Source</a>
      <a href="mailto:${CTA.email}">${CTA.email}</a>
    </div>
  </footer>

  <script>
  (function () {
    var nodes = document.querySelectorAll('.reveal, .reveal-seq');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      nodes.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.55, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(function (el) { io.observe(el); });
  })();
  </script>
  <script type="module">
  var btn = document.getElementById('run-demo');
  btn.addEventListener('click', function () {
    if (typeof WebAssembly !== 'object') {
      document.getElementById('demo-status').textContent = 'This browser does not provide WebAssembly. The command-line runtime is npx @boole/cli.';
      return;
    }
    btn.disabled = true;
    import('/demo.js').then(function (mod) {
      return mod.run();
    }).catch(function (err) {
      document.getElementById('demo-status').textContent = (err && err.message) ? err.message : 'The demo failed to start.';
    }).then(function () {
      btn.disabled = false;
      btn.textContent = 'Run again';
    });
  });
  </script>
</body>
</html>`;

writeFileSync(join(DIST, 'index.html'), html);

const ogSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0c0d10"/>
  <text x="88" y="210" font-family="Inter, Liberation Sans, DejaVu Sans, sans-serif" font-size="28" letter-spacing="6" fill="#c9c4ba">IMAGINE OS</text>
  <text x="88" y="320" font-family="Inter, Liberation Sans, DejaVu Sans, sans-serif" font-size="72" font-weight="600" fill="#f3f1eb">On-device</text>
  <text x="88" y="410" font-family="Inter, Liberation Sans, DejaVu Sans, sans-serif" font-size="72" font-weight="600" fill="#f3f1eb">inference.</text>
</svg>`;

const ogPng = await sharp(Buffer.from(ogSvg)).png().toBuffer();
writeFileSync(join(DIST, 'og.png'), ogPng);

cpSync('public', DIST, { recursive: true });

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}/</loc>
  </url>
</urlset>
`;

writeFileSync(join(DIST, 'robots.txt'), robots);
writeFileSync(join(DIST, 'sitemap.xml'), sitemap);

console.log(`Built to ${DIST}/ (${(html.length / 1024).toFixed(1)}KB html, ${(ogPng.length / 1024).toFixed(1)}KB og.png)`);

if (process.argv.includes('--serve')) {
  const mime: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.wasm': 'application/wasm',
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
  }).listen(PORT, '0.0.0.0', () => {
    console.log(`Serving at http://localhost:${PORT}`);
  });
}
