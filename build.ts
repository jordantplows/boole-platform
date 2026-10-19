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
  email: 'jordan@bunkerbio.com',
  buyNow: `mailto:jordan@bunkerbio.com?subject=${encodeURIComponent('Boole: Buy now')}`,
  bookCall: `mailto:jordan@bunkerbio.com?subject=${encodeURIComponent('Boole: Book a call')}`,
} as const;

const TITLE = 'Boole — Imagine OS, on-device local AI';
const DESCRIPTION =
  'Local GGUF inference via llama.cpp, on your machine. Imagine OS is the direction: software that adapts to you. 20B at 200 tok/s is a target.';
const KEYWORDS =
  'local AI, on-device LLM, ternary weights, BitNet-style 1.58-bit models, llama.cpp, GGUF, edge inference, Imagine OS';

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
      name: 'Boole',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'macOS, Linux, Windows',
      softwareVersion: '0.0.1',
      url: `${SITE}/`,
      description: DESCRIPTION,
      keywords: KEYWORDS,
      license: 'https://opensource.org/licenses/MIT',
      installUrl: 'https://www.npmjs.com/package/@boole/cli',
      featureList: [
        'Local GGUF inference through llama.cpp',
        'Hardware-aware quantization for model aliases',
        'On-device model cache with resumable downloads',
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
  <meta property="og:image:alt" content="Boole, Imagine OS. Local models on your machine.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${TITLE}">
  <meta name="twitter:description" content="${DESCRIPTION}">
  <meta name="twitter:image" content="${SITE}/og.png">
  <meta name="twitter:image:alt" content="Boole, Imagine OS. Local models on your machine.">
  <meta name="theme-color" content="#0e1016">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script type="application/ld+json">${jsonLd}</script>
  <style>${css}</style>
</head>
<body>
  <a class="skip" href="#product">Skip to content</a>
  <div class="aurora" aria-hidden="true">
    <div class="blob blob-a"><div class="drift"></div></div>
    <div class="blob blob-b"><div class="drift"></div></div>
    <div class="blob blob-c"><div class="drift"></div></div>
    <div class="blob blob-d"><div class="drift"></div></div>
  </div>

  <header class="menubar">
    <a class="brand" href="/">boole <span class="brand-os">Imagine OS</span></a>
    <p class="status" aria-hidden="true">
      <span class="s-default">local model</span>
      <span class="s-today">on this machine</span>
      <span class="s-direction">targets, not benchmarks</span>
      <span class="s-machine">llama.cpp · gguf</span>
    </p>
    <nav class="menu-actions" aria-label="Contact">
      <a class="btn btn-call" href="${CTA.bookCall}">Book a call</a>
      <a class="btn btn-buy" href="${CTA.buyNow}">Buy now</a>
    </nav>
  </header>

  <div class="desktop">
    <main id="product" tabindex="-1">
      <section class="window hero" aria-labelledby="imagine-heading">
        <div class="chrome" aria-hidden="true">
          <span class="lights"><i></i><i></i><i></i></span>
          <span class="chrome-label">Imagine</span>
          <span class="chrome-meta">on device</span>
        </div>
        <div class="window-body">
          <p class="kicker">Local LLM inference for JavaScript</p>
          <h1 id="imagine-heading">Run the model on the device. Let the interface imagine.</h1>
          <p class="lede">
            Boole is a terminal for GGUF models. It runs them on your machine
            through llama.cpp: no API key, and no per-token cloud bill. Imagine OS
            is the direction from here. The interface should evolve around how you
            use the device, with the model staying local.
          </p>
          <div class="cta-row">
            <a class="btn btn-buy" href="${CTA.buyNow}">Buy now</a>
            <a class="btn btn-call" href="${CTA.bookCall}">Book a call</a>
          </div>
          <div class="cmd">
            <code><span class="prompt-char">$</span>npx @boole/cli</code>
            <button class="copy-btn" type="button" data-copy="npx @boole/cli">Copy</button>
          </div>
        </div>
      </section>

      <nav class="dock" aria-label="Sections">
        <a href="#today"><span class="glyph glyph-today" aria-hidden="true"></span>Today</a>
        <a href="#direction"><span class="glyph glyph-direction" aria-hidden="true"></span>Direction</a>
        <a href="#machine"><span class="glyph glyph-machine" aria-hidden="true"></span>Machine</a>
      </nav>

      <section class="window" id="today" tabindex="-1">
        <div class="chrome">
          <span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
          <h2>Today</h2>
          <span class="chrome-meta">0.0.1</span>
        </div>
        <div class="window-body">
          <p class="section-lead">
            Version 0.0.1 is a Node.js command line. Four commands work.
            <code>serve</code> and <code>list</code> are reserved and not implemented yet.
          </p>
          <div class="block">
            <h3><code>run</code></h3>
            <p>
              Prompt a model. Use an alias such as <code>llama3</code>, a full
              specifier like <code>TheBloke/Llama-2-7B-GGUF:Q4_K_M</code>, or a
              local <code>.gguf</code> path. An alias resolves to a Hugging Face
              repo, then Boole picks the highest-quality quantization that fits
              in available memory.
            </p>
          </div>
          <div class="block">
            <h3><code>pull</code></h3>
            <p>
              Download that file into a local cache. An interrupted download
              resumes instead of starting over.
            </p>
          </div>
          <div class="block">
            <h3><code>doctor</code></h3>
            <p>
              Report the OS, memory, and GPU backend, then suggest a model size
              this machine can hold.
            </p>
          </div>
          <div class="block">
            <h3><code>models</code></h3>
            <p>
              List the aliases shipped with the CLI, including llama3, mistral,
              phi3, and qwen2.5.
            </p>
          </div>
          <p class="note">
            The model’s text is the only thing written to stdout. Progress and
            errors stay on stderr. GPU support follows node-llama-cpp: Metal on
            Apple Silicon, CUDA or Vulkan where that runtime provides them, and
            CPU otherwise. If node-llama-cpp is not installed, Boole says so and
            exits. A local server, when it exists, should stay on localhost.
          </p>
        </div>
      </section>

      <section class="window" id="direction" tabindex="-1">
        <div class="chrome">
          <span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
          <h2>Direction</h2>
          <span class="chrome-meta">roadmap</span>
        </div>
        <div class="window-body">
          <p class="callout">Targets, not measured results. Boole has not published a benchmark for these.</p>
          <div class="block">
            <h3>Ternary weights</h3>
            <p>
              BitNet-style 1.58-bit models, so a full network can live on the
              device instead of in a datacenter.
            </p>
          </div>
          <div class="block">
            <h3>20B at 200 tokens per second</h3>
            <p>
              A 20-billion-parameter model with a speed target of 200 tokens per
              second. That figure is a goal. It is not a result we have recorded.
            </p>
          </div>
          <div class="block">
            <h3>Imagine OS</h3>
            <p>
              The interface should change with how you actually use the machine.
              A fixed native shell is the starting point, not the finished
              product. The model still runs locally.
            </p>
          </div>
        </div>
      </section>

      <section class="window" id="machine" tabindex="-1">
        <div class="chrome">
          <span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
          <h2>This machine</h2>
          <span class="chrome-meta">stack</span>
        </div>
        <div class="window-body">
          <p class="section-lead">
            Inference is a process on the computer that asked for it. After the
            weights are cached, that run does not need a network round trip.
          </p>
          <dl class="stack">
            <dt>Language</dt>
            <dd>TypeScript on Node.js 18+</dd>
            <dt>Packages</dt>
            <dd><code>@boole/cli</code> and <code>@boole/hardware</code></dd>
            <dt>Runtime</dt>
            <dd>llama.cpp through node-llama-cpp</dd>
            <dt>Weights</dt>
            <dd>GGUF files from Hugging Face, cached on disk</dd>
            <dt>License</dt>
            <dd>MIT</dd>
          </dl>
          <h3>Where it runs</h3>
          <ul class="platforms">
            <li><span>macOS, Apple Silicon</span><span>Metal</span></li>
            <li><span>macOS, Intel</span><span>CPU</span></li>
            <li><span>Linux, x86_64</span><span>CUDA, Vulkan, or CPU</span></li>
            <li><span>Windows, x86_64</span><span>CUDA, Vulkan, or CPU</span></li>
          </ul>
          <p>
            There is no API key and no per-token invoice for the run itself.
            Install with <code>npx @boole/cli</code> or <code>npm i -g @boole/cli</code>.
            The <a class="inline" href="https://github.com/jordantplows/boole-platform">source</a>
            and the <a class="inline" href="https://www.npmjs.com/package/@boole/cli">npm package</a>
            are public.
          </p>
        </div>
      </section>

      <section class="window" id="session" tabindex="-1" aria-labelledby="session-title">
        <div class="chrome">
          <span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
          <h2 id="session-title">Terminal</h2>
          <span class="chrome-meta">example</span>
        </div>
        <div class="window-body">
          <div class="terminal">
            <pre><span class="prompt-char">$ </span>boole run llama3 -p "Explain what a boolean is in one sentence."
<span class="muted">llama3 -&gt; bartowski/Meta-Llama-3.1-8B-Instruct-GGUF:&lt;quant&gt;
  highest quality quantization that fits available RAM</span>

<span class="out">A boolean holds one of two values — true or false.</span><span class="caret" aria-hidden="true"></span></pre>
          </div>
          <p class="caption">
            Illustrative session, not a timing result. The quantization depends
            on the memory free on that machine. stdout is only the model’s text.
          </p>
        </div>
      </section>

      <section class="window" id="talk" tabindex="-1">
        <div class="chrome">
          <span class="lights" aria-hidden="true"><i></i><i></i><i></i></span>
          <h2>Talk</h2>
          <span class="chrome-meta">${CTA.email}</span>
        </div>
        <div class="window-body">
          <p class="section-lead">
            Buy now and Book a call both open an email to
            <a class="inline" href="mailto:${CTA.email}">${CTA.email}</a>,
            with the subject already filled in.
          </p>
          <div class="cta-row">
            <a class="btn btn-buy" href="${CTA.buyNow}">Buy now</a>
            <a class="btn btn-call" href="${CTA.bookCall}">Book a call</a>
          </div>
        </div>
      </section>
    </main>
  </div>

  <footer>
    <div class="footer-row">
      <span>boole · MIT</span>
      <a href="https://www.npmjs.com/package/@boole/cli">npm</a>
      <a href="https://github.com/jordantplows/boole-platform">Source</a>
      <a href="mailto:${CTA.email}">${CTA.email}</a>
    </div>
  </footer>

  <script>
  (function () {
    var root = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var raf = 0;
    var px = 0.5;
    var py = 0.42;
    var scroll = 0;
    function paint() {
      raf = 0;
      root.style.setProperty('--mx', px.toFixed(4));
      root.style.setProperty('--my', py.toFixed(4));
      root.style.setProperty('--scroll', scroll.toFixed(4));
    }
    function schedule() {
      if (!raf) raf = requestAnimationFrame(paint);
    }
    addEventListener('pointermove', function (e) {
      px = e.clientX / innerWidth;
      py = e.clientY / innerHeight;
      schedule();
    }, { passive: true });
    addEventListener('scroll', function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      scroll = max > 0 ? window.scrollY / max : 0;
      schedule();
    }, { passive: true });
  })();
  </script>
  <script>
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var prev = btn.textContent;
      function done() {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = prev; }, 1600);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          btn.textContent = 'Select it';
          setTimeout(function () { btn.textContent = prev; }, 1600);
        });
      }
    });
  });
  </script>
</body>
</html>`;

writeFileSync(join(DIST, 'index.html'), html);

const ogSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0e1016"/>
  <circle cx="160" cy="80" r="240" fill="#ff2f86"/>
  <circle cx="1080" cy="40" r="280" fill="#7d5cff"/>
  <circle cx="980" cy="620" r="300" fill="#14d6c8"/>
  <circle cx="360" cy="640" r="200" fill="#ffb020" opacity="0.9"/>
  <rect x="72" y="128" width="1056" height="390" rx="28" fill="#f7f4ec"/>
  <circle cx="118" cy="176" r="8" fill="#ff5d73"/>
  <circle cx="146" cy="176" r="8" fill="#ffc14d"/>
  <circle cx="174" cy="176" r="8" fill="#2ad4c8"/>
  <text x="210" y="184" font-family="Inter, DejaVu Sans, sans-serif" font-size="22" font-weight="600" fill="#16171c">IMAGINE OS</text>
  <text x="112" y="300" font-family="Inter, DejaVu Sans, sans-serif" font-size="84" font-weight="600" fill="#16171c">boole</text>
  <text x="116" y="368" font-family="Inter, DejaVu Sans, sans-serif" font-size="30" fill="#3a3f4b">Local models, on your machine.</text>
  <text x="116" y="450" font-family="JetBrains Mono, DejaVu Sans Mono, monospace" font-size="24" fill="#16171c">$ npx @boole/cli</text>
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
