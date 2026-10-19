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

const TITLE = 'Imagine OS — software shaped around you';
const DESCRIPTION =
  'Imagine OS runs real models on your device and shapes software around you. Private, instant, offline, and yours. 20B at 200 tok/s is a goal.';
const KEYWORDS =
  'on-device AI, local models, imagination, future of software, Imagine OS, ternary weights, BitNet-style 1.58-bit models, llama.cpp, GGUF';

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
      applicationCategory: 'OperatingSystem',
      operatingSystem: 'macOS, Linux, Windows',
      softwareVersion: '0.0.1',
      url: `${SITE}/`,
      description:
        'Imagine OS is Boole’s direction: software shaped around the person using it, powered by models that run on the device. The current release is a local runtime for GGUF models. A 20-billion-parameter model at 200 tokens per second is a target, not a measured result.',
      keywords: KEYWORDS,
      license: 'https://opensource.org/licenses/MIT',
      installUrl: 'https://www.npmjs.com/package/@boole/cli',
      featureList: [
        'On-device local models',
        'A direction toward software shaped around its user',
        'A local GGUF runtime through llama.cpp',
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
  <meta property="og:image:alt" content="Imagine OS. Software shaped around you, on your device.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${TITLE}">
  <meta name="twitter:description" content="${DESCRIPTION}">
  <meta name="twitter:image" content="${SITE}/og.png">
  <meta name="twitter:image:alt" content="Imagine OS. Software shaped around you, on your device.">
  <meta name="theme-color" content="#100c14">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script type="application/ld+json">${jsonLd}</script>
  <style>${css}</style>
</head>
<body>
  <a class="skip" href="#vision">Skip to content</a>
  <div class="aurora" aria-hidden="true">
    <div class="wash wash-a"><span></span></div>
    <div class="wash wash-b"><span></span></div>
    <div class="wash wash-c"><span></span></div>
  </div>

  <header class="bar">
    <a class="brand" href="#vision">boole <span>Imagine OS</span></a>
    <nav class="actions" aria-label="Contact">
      <a class="btn btn-call" href="${CTA.bookCall}">Book a call</a>
      <a class="btn btn-buy" href="${CTA.buyNow}">Buy now</a>
    </nav>
  </header>

  <main class="story">
    <section class="chapter" id="vision" tabindex="-1">
      <p class="chapter-kicker">Imagine OS</p>
      <h1>The end of finished software.</h1>
      <p class="lede">
        Imagine OS will change how software is built. Instead of fixed apps,
        shipped once and learned forever, the device runs a real model locally
        and shapes its software around the person using it.
      </p>
      <div class="actions actions-hero">
        <a class="btn btn-buy" href="${CTA.buyNow}">Buy now</a>
        <a class="btn btn-call" href="${CTA.bookCall}">Book a call</a>
      </div>
      <ul class="promise">
        <li>Private</li>
        <li>Instant</li>
        <li>Offline</li>
        <li>Yours</li>
      </ul>
    </section>

    <div class="interlude" data-tone="rose" aria-hidden="true"><span></span></div>

    <section class="chapter" id="fixed" tabindex="-1">
      <p class="chapter-kicker">01 — The fixed world</p>
      <h2>Software arrives finished.</h2>
      <div class="prose">
        <p>
          The phone in a pocket, the laptop on a desk, the row of apps waiting
          in a dock: all of it was decided before you opened it. Menus, icons,
          workflows, the shape of a day. You adapt. The software does not.
        </p>
        <p>
          That bargain made computers useful. It also made them the same for
          everyone. A tool can be powerful and still have nothing to do with
          the way you actually think.
        </p>
      </div>
    </section>

    <div class="interlude" data-tone="violet" aria-hidden="true"><span></span></div>

    <section class="chapter" id="imagines" tabindex="-1">
      <p class="chapter-kicker">02 — The picture</p>
      <h2>An operating system that imagines.</h2>
      <div class="prose">
        <p>
          Picture a machine that starts from you. You begin a task, and the
          interface for it is composed in the moment: the controls you need,
          the layout that fits the work, a small piece of software that did
          not exist this morning. The next day it is different, because you were.
        </p>
        <p>
          This is not a theme, and it is not a skin over the same apps. Native
          software stops being a finished object. Imagine OS is that picture.
          It is what Boole is building toward.
        </p>
      </div>
    </section>

    <div class="interlude" data-tone="teal" aria-hidden="true"><span></span></div>

    <section class="chapter" id="device" tabindex="-1">
      <p class="chapter-kicker">03 — On the device</p>
      <h2>The model has to live here.</h2>
      <div class="prose">
        <p>
          An interface that can imagine needs a model close enough to know you,
          and close enough to answer without a datacenter in the loop. Local
          is what makes the rest possible.
        </p>
      </div>
      <div class="qualities">
        <article>
          <h3>Private</h3>
          <p>The work stays on the device. Your habits are not a transcript sent somewhere else to be useful.</p>
        </article>
        <article>
          <h3>Instant</h3>
          <p>There is no queue and no round trip. The model is already where you are.</p>
        </article>
        <article>
          <h3>Offline</h3>
          <p>Once the weights are on the machine, the work does not wait on a network.</p>
        </article>
        <article>
          <h3>Yours</h3>
          <p>No API key and no per-token bill for the run. The runtime is something you hold.</p>
        </article>
      </div>
    </section>

    <div class="interlude" data-tone="amber" aria-hidden="true"><span></span></div>

    <section class="chapter" id="horizon" tabindex="-1">
      <p class="chapter-kicker">04 — The horizon</p>
      <h2>Where it is going.</h2>
      <p class="note">These are goals. Boole has not published a benchmark for them.</p>
      <div class="goals">
        <article>
          <span class="goal-label">Goal</span>
          <h3>Ternary weights</h3>
          <p>BitNet-style 1.58-bit models, so a full network can live on the device rather than in a rented cluster.</p>
        </article>
        <article>
          <span class="goal-label">Goal</span>
          <h3>20 billion parameters, 200 tokens a second</h3>
          <p>A speed target for a model of that size. A number we are aiming at. Not a number we have measured.</p>
        </article>
        <article>
          <span class="goal-label">Goal</span>
          <h3>A shell, unfinished on purpose</h3>
          <p>The default interface is a beginning. The longer work is software that keeps reshaping itself from use, with the model still running locally.</p>
        </article>
      </div>
    </section>

    <section class="chapter" id="builders" tabindex="-1">
      <p class="chapter-kicker">For builders</p>
      <h2>The runtime, today.</h2>
      <div class="prose">
        <p>
          What runs today is a command line, version 0.0.1. It runs GGUF models
          on your machine through llama.cpp. That local runtime is what this
          idea stands on.
        </p>
      </div>
      <p class="install"><code>npx @boole/cli</code></p>
      <ul class="build">
        <li><code>run</code> prompts a local model. An alias such as <code>llama3</code> picks a quantization that fits available memory.</li>
        <li><code>pull</code> downloads weights into a cache. An interrupted download resumes.</li>
        <li><code>doctor</code> reads the machine and suggests a size it can hold.</li>
        <li><code>models</code> lists the aliases.</li>
      </ul>
      <div class="prose">
        <p>
          <code>serve</code> and <code>list</code> are reserved and not implemented.
          If node-llama-cpp is missing, the CLI says so and stops. The
          <a class="inline" href="https://github.com/jordantplows/boole-platform">source</a>
          and the
          <a class="inline" href="https://www.npmjs.com/package/@boole/cli">npm package</a>
          are public. The license is MIT.
        </p>
      </div>
    </section>

    <section class="chapter" id="talk" tabindex="-1">
      <p class="chapter-kicker">Begin</p>
      <h2>If this is the computer you want.</h2>
      <div class="prose">
        <p>
          Buy now and Book a call both open a note to
          <a class="inline" href="mailto:${CTA.email}">${CTA.email}</a>,
          with the subject already filled in.
        </p>
      </div>
      <div class="actions actions-hero">
        <a class="btn btn-buy" href="${CTA.buyNow}">Buy now</a>
        <a class="btn btn-call" href="${CTA.bookCall}">Book a call</a>
      </div>
    </section>
  </main>

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
    var scroll = 0;
    function paint() {
      raf = 0;
      root.style.setProperty('--scroll', scroll.toFixed(4));
    }
    addEventListener('scroll', function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      scroll = max > 0 ? window.scrollY / max : 0;
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
  })();
  </script>
</body>
</html>`;


writeFileSync(join(DIST, 'index.html'), html);

const ogSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#100c14"/>
  <circle cx="180" cy="40" r="260" fill="#ff3b8d"/>
  <circle cx="1100" cy="80" r="300" fill="#7a45ff"/>
  <circle cx="980" cy="640" r="280" fill="#14d6c4"/>
  <circle cx="220" cy="620" r="200" fill="#ffb020"/>
  <text x="96" y="250" font-family="Liberation Serif, DejaVu Serif, serif" font-size="34" fill="#d2cbbf">IMAGINE OS</text>
  <text x="96" y="360" font-family="Liberation Serif, DejaVu Serif, serif" font-size="78" fill="#f6f1e8">The end of</text>
  <text x="96" y="450" font-family="Liberation Serif, DejaVu Serif, serif" font-size="78" fill="#f6f1e8">finished software.</text>
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
