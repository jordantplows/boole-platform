import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { createServer } from 'node:http';
import sharp from 'sharp';
import { sitePages } from './src/guides.ts';
import { OFFER_BLURB, OFFER_DESCRIPTION, offerChecklistHtml } from './src/offer.ts';

const DIST = 'dist';
const SITE = 'https://boole.sh';
const PORT = 4321;

/**
 * Managed checkout is the Stripe Payment Link. Codebase acquisition stays an inquiry.
 */
const STRIPE = 'https://buy.stripe.com/cNi28rbZN1ml2wkbOydUY03';
const CTA = {
  email: 'hello@booleinference.com',
  buyNow: STRIPE,
  bookCall: `mailto:hello@booleinference.com?subject=${encodeURIComponent('Boole: Book a call')}`,
  buyCodebase: `mailto:hello@booleinference.com?subject=${encodeURIComponent('Boole: Codebase acquisition')}`,
} as const;

const TITLE = 'Run a local AI model on your own device — Boole';
const DESCRIPTION =
  'Run a local LLM on your Mac, Windows, or Linux machine. The done-for-you package is $1,800: live setup on up to three devices, a private document assistant, and 30 days of support. A 20B model at 200 tok/s is a goal.';
const KEYWORDS =
  'run LLM locally on Mac, run local AI model on Windows, offline AI on Linux, on-device AI, local models, local inference, Imagine OS, GGUF, Apple Silicon Metal, CUDA, Vulkan, WebAssembly, managed on-device AI';

const FAQ = [
  {
    q: 'What is Imagine OS?',
    a: 'Imagine OS is the product Boole AI, Inc. is building: software shaped around the person using it, with the model running on the device. @boole/cli 0.7.0 is the local command line. It needs Node.js 22 or newer. The shell that keeps adapting is the direction of the company.',
  },
  {
    q: 'What runs today, and what is still a roadmap?',
    a: 'Today @boole/cli 0.7.0 runs a local GGUF model with run, pull, doctor, models, list, and serve. doctor also accepts --json. serve is for local development only: no authentication, and it accepts POST /generate. The package needs Node.js 22 or newer. The browser demo runs SmolLM2 135M in WebAssembly. Ternary weights, a 20B model at 200 tok/s, phones, NPUs, and an adapting shell are goals. They are not measured results and not commitments.',
  },
  {
    q: 'Which devices does it support?',
    a: 'The command-line runtime follows node-llama-cpp 3.22.2 prebuilt binaries: macOS Apple Silicon with Metal, macOS Intel on CPU, Windows and Linux x64 with CUDA, Vulkan, or CPU, Linux arm64 and Windows arm64 on CPU, plus Linux armv7l and riscv64 CPU prebuilts. The demo runs in a modern browser with WebAssembly. iOS, Android, NPUs, and other edge devices are a 24-month roadmap, not support today.',
  },
  {
    q: 'Where does my data go?',
    a: 'A prompt is passed to the local session. The CLI has no analytics call. It does contact Hugging Face to resolve a model file name before it opens the cache, and it downloads weights when they are not cached. Token generation reads the local GGUF. The page demo fetches weights only after you press the button, then counts network requests during generation.',
  },
  {
    q: 'What does Pay to start include?',
    a: `${OFFER_DESCRIPTION} The button goes to Stripe. After payment, onboarding email comes from hello@booleinference.com in less than 24 hours.`,
  },
  {
    q: 'How does acquiring the codebase work?',
    a: 'It is a full inquiry, not an instant checkout. Write to hello@booleinference.com with the subject “Boole: Codebase acquisition”. Full ownership of the code and the technology is settled in a written agreement. It is a deliberate process.',
  },
  {
    q: 'What license is the software under?',
    a: 'The software is proprietary to Boole AI, Inc. All rights reserved. Use, copying, modification, and distribution require a written license or agreement. Earlier public releases were published under the MIT License.',
  },
  {
    q: 'How do I contact Boole AI?',
    a: 'Email hello@booleinference.com. Pay to start is a $1,800 Stripe payment for the done-for-you package. A codebase inquiry uses the subject “Boole: Codebase acquisition”.',
  },
];

const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Boole AI, Inc.',
      legalName: 'Boole AI, Inc.',
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
      softwareVersion: '0.7.0',
      url: `${SITE}/`,
      description:
        'Imagine OS is the direction of Boole AI, Inc.: software shaped around the person using it, with models that run on the device. @boole/cli 0.7.0 is a local GGUF runtime through llama.cpp. It needs Node.js 22 or newer. Commands: run, pull, doctor, models, list, and serve. serve is local development only, with no authentication, and accepts POST /generate. A 20-billion-parameter model at 200 tokens per second is a target, not a measured result.',
      keywords: KEYWORDS,
      copyrightHolder: { '@id': `${SITE}/#organization` },
      copyrightNotice: 'Copyright (c) 2026 Boole AI, Inc. All rights reserved.',
      installUrl: 'https://www.npmjs.com/package/@boole/cli',
      featureList: [
        'Local GGUF inference through llama.cpp',
        'An in-browser demonstration that runs SmolLM2 135M on the visitor’s device',
        'A direction toward software shaped around its user',
      ],
      author: { '@id': `${SITE}/#organization` },
      publisher: { '@id': `${SITE}/#organization` },
    },
    {
      '@type': 'Product',
      '@id': `${SITE}/#managed-product`,
      name: 'Imagine OS done-for-you setup',
      description: OFFER_DESCRIPTION,
      brand: { '@type': 'Brand', name: 'Imagine OS' },
      manufacturer: { '@id': `${SITE}/#organization` },
      offers: {
        '@type': 'Offer',
        price: '1800',
        priceCurrency: 'USD',
        url: STRIPE,
        availability: 'https://schema.org/OnlineOnly',
        seller: { '@id': `${SITE}/#organization` },
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE}/#faq`,
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
}).replace(/</g, '\\u003c');

if (existsSync(DIST)) rmSync(DIST, { recursive: true });
mkdirSync(DIST, { recursive: true });

const css = readFileSync('src/styles/global.css', 'utf-8');

// Counsel should review the proprietary notice in LICENSE before it is relied on.
// Jordan should confirm the planned device list (phones, NPUs, edge) before it is treated as a commitment.
const faqHtml = FAQ.map((item) => `<details>
            <summary>${item.q}</summary>
            <p>${item.a}</p>
          </details>`).join('\n');

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
  <meta name="theme-color" content="#090909">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/instrument-sans.woff2" as="font" type="font/woff2" crossorigin>
  <script>document.documentElement.classList.add('js')</script>
  <script type="application/ld+json">${jsonLd}</script>
  <style>${css}</style>
</head>
<body>
  <a class="skip" href="#vision">Skip to content</a>
  <header class="bar">
    <a class="brand" href="#vision">boole <span>Imagine OS</span></a>
    <nav class="nav-links" aria-label="Page">
      <a href="#energy">Energy</a>
      <a href="#devices">Devices</a>
      <a href="#faq">FAQ</a>
    </nav>
  </header>

  <main>
    <section id="vision" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Boole AI, Inc. · Imagine OS</p>
        <h1>The machine should write the software with you.</h1>
        <p class="lede">
          Boole AI builds Imagine OS so the model stays on the device and the
          software takes its shape from the person holding it. One system, on
          the laptop and on the phone. Private. Immediate. Still yours when
          the network is gone. @boole/cli 0.7.0 is the local runtime the company
          ships today. The shell that keeps adapting is the product we are building.
        </p>
        <div class="actions actions-hero">
          <a class="btn btn-pay" href="${CTA.buyNow}">Pay to start</a>
          <a class="text-link" href="#offers">Or inquire about the codebase</a>
          <p class="price-inline">${OFFER_BLURB}</p>
        </div>
        <dl class="facts">
          <div><dt>Runtime</dt><dd>llama.cpp</dd></div>
          <div><dt>Weights</dt><dd>GGUF, on disk</dd></div>
          <div><dt>Interface</dt><dd>Command line</dd></div>
          <div><dt>License</dt><dd><a class="inline" href="#license">Proprietary</a></dd></div>
        </dl>
      </div>
    </section>

    <section id="product" tabindex="-1">
      <div class="wrap">
        <p class="kicker">The company</p>
        <h2 class="reveal">Software finished in a lab is the old arrangement.</h2>
        <div class="beats reveal-seq">
          <article class="card">
            <span class="tag">01</span>
            <h3>You have been adapting to the product.</h3>
            <p>
              Menus, icons, and workflows are decided before the machine is
              opened. The same interface ships to everyone. You learn it.
              It does not learn the way you work.
            </p>
          </article>
          <article class="card">
            <span class="tag">02</span>
            <h3>Then the useful part left the building.</h3>
            <p>
              A rented model asks you to send the work away. Your prompt,
              your files, and the shape of your day leave so a cluster can
              answer. The computer in your hands waits.
            </p>
          </article>
          <article class="card">
            <span class="tag">03</span>
            <h3>Boole AI puts both back on the device.</h3>
            <p>
              Imagine OS runs the model where you are, and composes the
              software for the task in front of you. That is the company.
              @boole/cli 0.7.0 is the runtime underneath it.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section id="showcase" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Same system</p>
        <h2 class="reveal">One model. The laptop and the phone.</h2>
        <p class="prose reveal">
          Imagine OS is the same session on both screens. The illustrated
          layout below is the product direction. The live model is the
          demonstration further down. @boole/cli 0.7.0 runs a model locally.
        </p>
        <div class="devices">
          <figure class="laptop">
            <div class="bezel" aria-hidden="true">
              <div class="screen">
                <div class="os-ui">
                  <p class="os-bar"><span>Imagine OS</span><span>On device</span></p>
                  <p class="os-user">Shape a reading view for this article.</p>
                  <p class="os-reply">A single column, larger type, citations kept beside the paragraph.</p>
                  <p class="os-meta">SmolLM2 135M · same session</p>
                </div>
              </div>
            </div>
            <div class="deck" aria-hidden="true"></div>
            <figcaption>Laptop</figcaption>
          </figure>
          <figure class="phone">
            <div class="bezel" aria-hidden="true">
              <div class="screen">
                <div class="os-ui">
                  <p class="os-bar"><span>Imagine OS</span><span>On device</span></p>
                  <p class="os-user">Shape a reading view for this article.</p>
                  <p class="os-reply">A single column, larger type, citations kept beside the paragraph.</p>
                  <p class="os-meta">SmolLM2 135M · same session</p>
                </div>
              </div>
            </div>
            <figcaption>Phone</figcaption>
          </figure>
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

    <section id="energy" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Energy and performance</p>
        <h2 class="reveal">The model spends the machine’s own power.</h2>
        <p class="prose reveal">
          Boole keeps inference on the device so the work does not travel to a
          cluster. What follows is what @boole/cli 0.7.0 actually does. Anything
          else is a design goal. The only measured speed we have is from the
          browser demo: 12.3 tok/s for SmolLM2-135M Instruct Q4_K_M, 64 tokens,
          on a 4-core Xeon CPU in WebAssembly, one thread, no GPU layers.
        </p>
        <div class="energy reveal-seq">
          <article class="card">
            <span class="tag">Quantization</span>
            <h3>Smaller weights, same file format.</h3>
            <p>
              Aliases resolve to GGUF quants from Q2_K through Q8_0. Bits per
              weight are estimated in the hardware package, from 3.35 for Q2_K
              to 8.50 for Q8_0.
            </p>
          </article>
          <article class="card">
            <span class="tag">Memory</span>
            <h3>Pick the quant that fits.</h3>
            <p>
              <code>boole run</code> reads free RAM, reserves a 2 GB headroom,
              and chooses the highest-quality quant that still fits. If none
              fits, it stops and says so. <code>doctor</code> prints the same verdict.
            </p>
          </article>
          <article class="card">
            <span class="tag">CPU and GPU</span>
            <h3>Offload when the build can.</h3>
            <p>
              The CLI calls <code>getLlama({ gpu: 'auto' })</code>. That runtime
              uses Metal, CUDA, or Vulkan when the prebuilt binary matches the
              machine, and the CPU when it does not.
            </p>
          </article>
          <article class="card">
            <span class="tag">Threads</span>
            <h3>The CLI does not set a thread count.</h3>
            <p>
              The command line does not set a thread count. The browser demo
              does: one WebAssembly thread and zero GPU layers. Choosing threads
              for a resident runtime is a design goal.
            </p>
          </article>
          <article class="card">
            <span class="tag">Serve</span>
            <h3>A local development server.</h3>
            <p>
              <code>npx @boole/cli serve</code> is for local development only.
              It has no authentication. It accepts <code>POST /generate</code>.
              <code>npx @boole/cli list</code> prints models already downloaded.
              A runtime that unloads the model when it is idle is still a design goal.
            </p>
          </article>
          <article class="card">
            <span class="tag">Network</span>
            <h3>Generation reads the local file.</h3>
            <p>
              Token sampling uses the GGUF on disk. The prompt is not uploaded.
              The CLI still asks Hugging Face for the file name before it
              opens the cache, so a cached <code>boole run</code> is not fully
              offline yet. Weights download only when they are missing.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section id="devices" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Devices</p>
        <h2 class="reveal">Supported today, and the next 24 months.</h2>
        <p class="note reveal">Today follows the prebuilt binaries of node-llama-cpp 3.22.2, the runtime this CLI imports, plus the WebAssembly demo. Each supported device links to a <a class="inline" href="/guides/">setup guide</a>. The planned column is a roadmap, not a commitment.</p>
        <div class="matrix">
          <h3 class="matrix-label today-label">Supported today</h3>
          <ul class="matrix-grid">
            <li><span class="tag">macOS</span><strong><a href="/guides/macos-apple-silicon/">Apple Silicon</a></strong><span>Metal. Package mac-arm64-metal. <a class="inline" href="/guides/macos-apple-silicon/">Setup guide</a>.</span></li>
            <li><span class="tag">macOS</span><strong><a href="/guides/macos-intel/">Intel</a></strong><span>CPU. Metal is off by default. Package mac-x64. <a class="inline" href="/guides/macos-intel/">Setup guide</a>.</span></li>
            <li><span class="tag">Windows x64</span><strong><a href="/guides/windows-x64/">CUDA, Vulkan, or CPU</a></strong><span>Packages win-x64, win-x64-cuda, win-x64-vulkan. <a class="inline" href="/guides/windows-x64/">Setup guide</a>.</span></li>
            <li><span class="tag">Linux x64</span><strong><a href="/guides/linux-x64/">CUDA, Vulkan, or CPU</a></strong><span>Packages linux-x64, linux-x64-cuda, linux-x64-vulkan. <a class="inline" href="/guides/linux-x64/">Setup guide</a>.</span></li>
            <li><span class="tag">Linux arm64</span><strong><a href="/guides/linux-arm64/">CPU</a></strong><span>Package linux-arm64. No CUDA or Vulkan package. <a class="inline" href="/guides/linux-arm64/">Setup guide</a>.</span></li>
            <li><span class="tag">Windows arm64</span><strong><a href="/guides/windows-arm64/">CPU</a></strong><span>Package win-arm64. No GPU package. <a class="inline" href="/guides/windows-arm64/">Setup guide</a>.</span></li>
            <li><span class="tag">Linux</span><strong>armv7l and riscv64</strong><span>CPU prebuilts. linux-armv7l and linux-riscv64 are not the <a class="inline" href="/guides/linux-arm64/">arm64 guide</a>.</span></li>
            <li><span class="tag">Browser</span><strong><a href="/guides/browser/">WebAssembly demo</a></strong><span>wllama, one thread, no GPU layers. Not the CLI. <a class="inline" href="/guides/browser/">Setup guide</a>.</span></li>
          </ul>
          <h3 class="matrix-label plan-label">Planned · next 24 months</h3>
          <p class="soon">A roadmap for Boole AI. Jordan should confirm this list. It is not a delivery commitment.</p>
          <ul class="matrix-grid planned">
            <li><span class="tag">Phones</span><strong>iOS</strong><span>Not supported by the CLI today.</span></li>
            <li><span class="tag">Phones</span><strong>Android</strong><span>Not supported by the CLI today.</span></li>
            <li><span class="tag">Accelerators</span><strong>NPUs</strong><span>No NPU path in this release.</span></li>
            <li><span class="tag">Edge</span><strong>Other edge devices</strong><span>Beyond the CPU prebuilts already listed.</span></li>
          </ul>
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
            <span>A GGUF file in the local cache. Generation reads that file. The command still resolves the name on Hugging Face before it checks the cache.</span>
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
              The published source has no analytics call. Network code
              resolves and, when needed, downloads a model file from
              Hugging Face. That lookup runs before the cache check, including
              on <code>boole run</code>. A prompt is passed to the local session.
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
        <h2 class="reveal">@boole/cli 0.7.0</h2>
        <table class="spec">
          <tbody>
            <tr><th scope="row">Node.js</th><td>22 or newer. macOS: the installer at <a class="inline" href="https://nodejs.org/">nodejs.org</a> or <code>brew install node@22</code>. Windows: the installer, or <code>winget install OpenJS.NodeJS.LTS</code> when <code>node -v</code> is 22 or higher. Linux: a build from nodejs.org, or a distro package that reports 22 or newer.</td></tr>
            <tr><th scope="row">First</th><td><code>npx @boole/cli doctor</code>. Add <code>--json</code> for the same report as JSON.</td></tr>
            <tr><th scope="row">pull</th><td><code>npx @boole/cli pull bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M</code></td></tr>
            <tr><th scope="row">run</th><td><code>npx @boole/cli run bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M --prompt "Say hello"</code></td></tr>
            <tr><th scope="row">serve</th><td>Local development only. No authentication. Accepts <code>POST /generate</code>.</td></tr>
            <tr><th scope="row">list</th><td>Prints models already downloaded.</td></tr>
            <tr><th scope="row">models</th><td>Lists the aliases.</td></tr>
            <tr><th scope="row">Guides</th><td>Device setup, from Apple Silicon to the browser demo, is in the <a class="inline" href="/guides/">setup guides</a>.</td></tr>
            <tr><th scope="row">Package</th><td>The command-line runtime is published as <a class="inline" href="https://www.npmjs.com/package/@boole/cli">@boole/cli</a>.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section id="license" tabindex="-1">
      <div class="wrap reveal">
        <p class="kicker">License</p>
        <h2>All rights reserved.</h2>
        <div class="prose">
          <p>
            The software is proprietary to Boole AI, Inc. Copyright (c) 2026.
            Use, copying, modification, and distribution require a written
            license or agreement.
          </p>
          <p>
            Access comes either through the managed product or through a
            codebase acquisition. Licensing inquiries go to
            <a class="inline" href="mailto:${CTA.email}">${CTA.email}</a>.
          </p>
          <p>Earlier public releases were published under the MIT License.</p>
        </div>
      </div>
    </section>

    <section id="offers" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Ways to work with Boole</p>
        <h2 class="reveal">Pay to start. Or acquire the codebase.</h2>
        <div class="offers">
          <article class="card tier-fast">
            <span class="tag">Tier 1 · Done for you</span>
            <h3>Pay to start.</h3>
            <p class="price">$1,800</p>
            <p>
              A done-for-you package for founding customers, the first 10.
              We install Boole on your hardware and leave it running.
            </p>
            ${offerChecklistHtml()}
            <a class="btn btn-pay" href="${CTA.buyNow}">Pay to start</a>
          </article>
          <article class="card tier-slow">
            <span class="tag">Tier 2 · Full inquiry</span>
            <h3>Acquire the full codebase.</h3>
            <p>
              Full ownership of the code and the technology, under a written
              agreement with Boole AI, Inc. This is a deliberate process. It
              begins with an inquiry, not a checkout.
            </p>
            <a class="btn btn-call" href="${CTA.buyCodebase}">Start an inquiry</a>
          </article>
        </div>
      </div>
    </section>

    <section id="faq" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Questions</p>
        <h2 class="reveal">Answered up front.</h2>
        <div class="faq">
          ${faqHtml}
        </div>
      </div>
    </section>

    <section id="talk" tabindex="-1">
      <div class="wrap">
        <p class="kicker">Begin</p>
        <h2 class="reveal">Start with the product. Or ask for the code.</h2>
        <div class="prose">
          <p>
            Pay to start is $1,800 on Stripe. On a 60-minute call we install
            Boole on up to three of your devices, pick a model for each, and
            confirm it runs before we hang up. Your files stay on the machine.
            You have 30 days of direct support. If it is not running after
            setup, the payment is refunded. The first 10 customers keep this
            price for future upgrades. Acquiring the codebase is a separate
            inquiry to
            <a class="inline" href="mailto:${CTA.email}">${CTA.email}</a>
            with the subject “Boole: Codebase acquisition”.
          </p>
        </div>
        <div class="actions actions-hero" style="margin-top:1.5rem">
          <a class="btn btn-pay" href="${CTA.buyNow}">Pay to start</a>
          <a class="btn btn-call" href="${CTA.buyCodebase}">Start an inquiry</a>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="wrap footer-row">
      <span>© 2026 Boole AI, Inc.</span>
      <a href="#license">License</a>
      <a href="#offers">Ways to work with Boole</a>
      <a href="/guides/">Setup guides</a>
      <a href="/on-premise/">On-premise</a>
      <a href="/compare/ollama-lm-studio-llama-cpp/">Compare</a>
      <a href="/ollama-alternative/">Ollama alternative</a>
      <a href="https://www.npmjs.com/package/@boole/cli">npm</a>
      <a href="mailto:${CTA.email}">${CTA.email}</a>
    </div>
  </footer>

  <script>
  (function () {
    var nodes = document.querySelectorAll('.reveal, .reveal-seq, .devices');
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

for (const page of sitePages(css)) {
  const filePath = join(DIST, page.file);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, page.html);
}

const ogSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#090909"/>
  <text x="88" y="210" font-family="Instrument Sans, Liberation Sans, DejaVu Sans, sans-serif" font-size="22" letter-spacing="5" fill="#8f8f8b">IMAGINE OS</text>
  <text x="88" y="320" font-family="Instrument Sans, Liberation Sans, DejaVu Sans, sans-serif" font-size="68" font-weight="500" fill="#f4f1ea">On-device</text>
  <text x="88" y="408" font-family="Instrument Sans, Liberation Sans, DejaVu Sans, sans-serif" font-size="68" font-weight="500" fill="#f4f1ea">inference.</text>
</svg>`;

const ogPng = await sharp(Buffer.from(ogSvg)).png().toBuffer();
writeFileSync(join(DIST, 'og.png'), ogPng);

cpSync('public', DIST, { recursive: true });

const robots = `User-agent: *
Allow: /
Disallow: /welcome/

Sitemap: ${SITE}/sitemap.xml
`;

const sitemapLocs = [`${SITE}/`, ...sitePages(css).flatMap((page) => (page.loc ? [page.loc] : []))];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapLocs.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n')}
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
    '.woff2': 'font/woff2',
    '': 'text/plain; charset=utf-8',
  };

  createServer((req, res) => {
    let url = req.url?.split('?')[0] || '/';
    if (!url.includes('.') && !url.endsWith('/')) {
      const indexPath = join(DIST, url, 'index.html');
      if (existsSync(indexPath)) {
        res.writeHead(302, { Location: `${url}/` });
        res.end();
        return;
      }
    }
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
