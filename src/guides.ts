/**
 * Setup guides and the post-payment welcome page.
 * Commands documented here are the ones the CLI actually runs:
 * @boole/cli 0.7.0: run, pull, serve, list, doctor (--json), models.
 * Requires Node.js 22 or newer. serve is local development only.
 */

import { marketingPages } from './pages.ts';
import { OFFER_DESCRIPTION } from './offer.ts';

const SITE = 'https://boole.sh';
const EMAIL = 'hello@booleinference.com';
const STRIPE = 'https://buy.stripe.com/cNi28rbZN1ml2wkbOydUY03';

export type Guide = {
  slug: string;
  nav: string;
  kicker: string;
  h1: string;
  lede: string;
  seoTitle: string;
  description: string;
  keywords: string;
  requirements: string[];
  notes: string[];
  trouble: Array<{ h: string; p: string }>;
};

export const GUIDES: Guide[] = [
  {
    slug: 'macos-apple-silicon',
    nav: 'macOS Apple Silicon',
    kicker: 'macOS · arm64 · Metal',
    h1: 'Run an LLM locally on a Mac with Apple Silicon',
    lede: 'This is the setup for a Mac with an M-series chip. The prebuilt runtime is Metal. The commands below are the Boole CLI that ships today.',
    seoTitle: 'Run an LLM locally on a Mac (Apple Silicon) — Boole',
    description:
      'Run an LLM locally on a Mac with Apple Silicon and Metal. Install the Boole CLI, then use boole doctor, pull, and run. No measured speed is claimed for this Mac.',
    keywords:
      'run LLM locally on Mac, Apple Silicon, Metal, local AI model Mac, offline LLM macOS, Boole CLI',
    requirements: [
      'A Mac with Apple Silicon (arm64). The prebuilt package is <code>@node-llama-cpp/mac-arm64-metal</code>.',
      'Node.js 22 or newer. Install the macOS package from <a class="inline" href="https://nodejs.org/">nodejs.org</a>, or Homebrew: <code>brew install node@22</code>. Confirm with <code>node -v</code>.',
      'Metal is on by default on Apple Silicon, per the <a class="inline" href="https://node-llama-cpp.withcat.ai/guide/Metal">node-llama-cpp Metal guide</a>. That is the runtime’s documentation, not a Boole measurement.',
    ],
    notes: [
      'There is no separate CUDA or Vulkan package for this Mac. The GPU path is the Metal prebuilt.',
      '<code>boole doctor</code> prints a GPU line. On this machine the backend you want to see is <code>metal</code>, with a device name when the runtime reports one.',
    ],
    trouble: [
      {
        h: 'doctor prints GPU none',
        p: 'The expected prebuilt is <code>@node-llama-cpp/mac-arm64-metal</code>. If that optional package did not install, the runtime falls back to no GPU backend. This page does not claim a tok/s figure for Metal.',
      },
    ],
  },
  {
    slug: 'macos-intel',
    nav: 'macOS Intel',
    kicker: 'macOS · x64 · CPU',
    h1: 'Run a local AI model on an Intel Mac',
    lede: 'Intel Macs use the x64 CPU prebuilt. Metal is off by default on these machines. The same commands apply.',
    seoTitle: 'Run a local AI model on an Intel Mac — Boole',
    description:
      'Run a local AI model on an Intel Mac. The Boole CLI uses the mac-x64 CPU prebuilt. Metal is off by default. Commands: doctor, pull, run, models.',
    keywords:
      'run LLM locally on Mac, Intel Mac, local AI model macOS, offline LLM Mac, CPU inference',
    requirements: [
      'An Intel Mac (x64). The prebuilt package is <code>@node-llama-cpp/mac-x64</code>.',
      'Node.js 22 or newer. Install the macOS package from <a class="inline" href="https://nodejs.org/">nodejs.org</a>, or Homebrew: <code>brew install node@22</code>. Confirm with <code>node -v</code>.',
      'Metal is off by default on Intel Macs. That is stated in the <a class="inline" href="https://node-llama-cpp.withcat.ai/guide/Metal">node-llama-cpp Metal guide</a>. A GPU line of <code>none</code> is the expected CPU path, not a failed install by itself.',
    ],
    notes: [
      'Do not expect a Metal device name from <code>boole doctor</code> on this Mac. The picker still uses free RAM, not a GPU.',
    ],
    trouble: [
      {
        h: 'A model that fits an M-series Mac does not fit here',
        p: 'The alias picker uses free RAM minus a 2 GiB headroom. An Intel Mac with less free memory stops with exit code 3 and names the smallest quant that did not fit. Try <code>phi3</code>, the 3.8B alias, or a smaller explicit quant.',
      },
    ],
  },
  {
    slug: 'windows-x64',
    nav: 'Windows x64',
    kicker: 'Windows · x64 · CUDA, Vulkan, or CPU',
    h1: 'Run a local AI model on Windows',
    lede: 'Windows x64 can use a CUDA prebuilt, a Vulkan prebuilt, or the CPU prebuilt. Pick the package that matches the machine. The CLI does not ship a separate Windows arm64 GPU build on this page.',
    seoTitle: 'Run a local AI model on Windows — Boole',
    description:
      'Run a local AI model on Windows x64 with NVIDIA CUDA, Vulkan, or the CPU. Install the Boole CLI and use boole doctor, pull, and run.',
    keywords:
      'run local AI model on Windows, local LLM Windows, NVIDIA CUDA, Vulkan, offline AI Windows, Boole CLI',
    requirements: [
      '64-bit Windows on x64. Prebuilt packages: <code>@node-llama-cpp/win-x64</code> (CPU), <code>@node-llama-cpp/win-x64-cuda</code>, <code>@node-llama-cpp/win-x64-cuda-ext</code>, and <code>@node-llama-cpp/win-x64-vulkan</code>.',
      'Node.js 22 or newer. Install the Windows package from <a class="inline" href="https://nodejs.org/">nodejs.org</a>, or in PowerShell: <code>winget install OpenJS.NodeJS.LTS</code>. Confirm with <code>node -v</code> that the major version is 22 or higher.',
      'For the CUDA prebuilts, the node-llama-cpp <a class="inline" href="https://node-llama-cpp.withcat.ai/guide/CUDA">CUDA guide</a> documents CUDA Toolkit 12.4+ or 13.1. That is the runtime’s requirement, not a speed Boole has measured on Windows.',
      'Vulkan uses <code>win-x64-vulkan</code>. There is no Windows arm64 GPU package. ARM Windows is a <a class="inline" href="/guides/windows-arm64/">separate guide</a>, and it is CPU only.',
    ],
    notes: [
      '<code>boole doctor</code> prints <code>cuda</code> or <code>vulkan</code> when that backend loads, and <code>none</code> on the CPU build. VRAM is printed only when <code>getVramState</code> returns it. The automatic size pick still uses RAM.',
    ],
    trouble: [
      {
        h: 'CUDA does not load',
        p: 'Confirm the CUDA prebuilt installed, and that the toolkit matches the version the runtime’s CUDA guide documents. The CPU package <code>win-x64</code> is the fallback this release actually ships. This page has no Windows tok/s number.',
      },
    ],
  },
  {
    slug: 'linux-x64',
    nav: 'Linux x64',
    kicker: 'Linux · x64 · CUDA, Vulkan, or CPU',
    h1: 'Offline AI on Linux x64',
    lede: 'Linux x64 is the CUDA, Vulkan, and CPU path. Generation reads a local GGUF. Resolving a model name still contacts Hugging Face before the cache is opened.',
    seoTitle: 'Offline AI on Linux (x64) — Boole',
    description:
      'Offline AI on Linux x64 with CUDA, Vulkan, or the CPU. Install the Boole CLI, then boole doctor, pull, and run. Generation reads a local GGUF file.',
    keywords:
      'offline AI on Linux, run LLM locally Linux, local AI model Linux, CUDA, Vulkan, Boole CLI',
    requirements: [
      'Linux x64. Prebuilt packages: <code>@node-llama-cpp/linux-x64</code>, <code>@node-llama-cpp/linux-x64-cuda</code>, <code>@node-llama-cpp/linux-x64-cuda-ext</code>, and <code>@node-llama-cpp/linux-x64-vulkan</code>.',
      'Node.js 22 or newer. Install a current Linux build from <a class="inline" href="https://nodejs.org/">nodejs.org</a>. A distro package is fine when <code>node -v</code> reports 22 or newer.',
      'The CUDA prebuilts follow the runtime’s <a class="inline" href="https://node-llama-cpp.withcat.ai/guide/CUDA">CUDA guide</a> (CUDA Toolkit 12.4+ or 13.1). Linux Vulkan needs the Vulkan SDK, per the <a class="inline" href="https://node-llama-cpp.withcat.ai/guide/Vulkan">Vulkan guide</a>. Both are that project’s requirements, not Boole benchmarks.',
    ],
    notes: [
      'There is no <code>linux-arm64-cuda</code> or <code>linux-arm64-vulkan</code> package. ARM boards are the <a class="inline" href="/guides/linux-arm64/">Linux arm64 guide</a>, CPU only.',
      'The default cache is <code>$XDG_CACHE_HOME/boole</code> or <code>~/.cache/boole</code>, unless <code>BOOLE_CACHE</code> is set.',
    ],
    trouble: [
      {
        h: 'A cached run still uses the network',
        p: '<code>pull</code> resolves the file name on the Hugging Face API before it checks the local file. A cached <code>boole run</code> still does that lookup. Token generation itself reads the GGUF on disk and does not upload the prompt.',
      },
    ],
  },
  {
    slug: 'linux-arm64',
    nav: 'Linux arm64',
    kicker: 'Linux · arm64 · CPU',
    h1: 'Run a local model on Linux arm64',
    lede: 'This covers 64-bit ARM Linux, including a 64-bit Raspberry Pi-class board. The prebuilt is CPU only. This page does not claim that a specific Pi model works, and it does not quote a tokens-per-second number.',
    seoTitle: 'Run a local model on Linux arm64 and Raspberry Pi — Boole',
    description:
      'Run a local model on 64-bit Linux arm64, including Raspberry Pi-class boards. CPU only. Install the Boole CLI and use doctor, pull, and run.',
    keywords:
      'run LLM on Raspberry Pi, Linux arm64 local AI, offline AI on Linux, local model ARM, Boole CLI',
    requirements: [
      '64-bit ARM Linux (aarch64 / arm64), including Raspberry Pi OS 64-bit. The package is <code>@node-llama-cpp/linux-arm64</code>.',
      'Node.js 22 or newer. Install a current Linux build from <a class="inline" href="https://nodejs.org/">nodejs.org</a>. A distro package is fine when <code>node -v</code> reports 22 or newer.',
      'No CUDA package and no Vulkan package exist for Linux arm64 in node-llama-cpp 3.22.2. <code>boole doctor</code> should report GPU <code>none</code>.',
      '32-bit Raspberry Pi OS is armv7l. That is <code>@node-llama-cpp/linux-armv7l</code>, a different prebuilt, and it is not this guide. riscv64 is <code>@node-llama-cpp/linux-riscv64</code>, also separate.',
    ],
    notes: [
      'Free RAM decides the model. A board with a few gigabytes free will not hold an 8B alias. <code>phi3</code> is the smaller alias shipped today (3.8B, quants Q4_K_M through Q8_0). If even that estimate does not fit, the CLI exits 3 and says so.',
      'Nothing on this page is a measured result for a Raspberry Pi. “Pi-class” means a 64-bit ARM machine in that category, not a tested model number.',
    ],
    trouble: [
      {
        h: 'not enough memory',
        p: 'The verdict needs more than 2 GiB free before it will recommend anything. Below that, doctor exits 1. An alias that still does not fit exits 3 from <code>boole run</code>.',
      },
    ],
  },
  {
    slug: 'windows-arm64',
    nav: 'Windows arm64',
    kicker: 'Windows · arm64 · CPU',
    h1: 'Run a local model on Windows arm64',
    lede: 'Windows on ARM uses a CPU prebuilt. There is no GPU package for win-arm64 in this release.',
    seoTitle: 'Run a local model on Windows arm64 — Boole',
    description:
      'Run a local AI model on Windows arm64. The Boole CLI prebuilt is win-arm64, CPU only. Use boole doctor, pull, and run.',
    keywords:
      'run local AI model on Windows, Windows arm64, Windows on ARM, local LLM, offline AI, Boole CLI',
    requirements: [
      '64-bit Windows on ARM. The package is <code>@node-llama-cpp/win-arm64</code>.',
      'Node.js 22 or newer. Install the Windows package from <a class="inline" href="https://nodejs.org/">nodejs.org</a>, or in PowerShell: <code>winget install OpenJS.NodeJS.LTS</code>. Confirm with <code>node -v</code> that the major version is 22 or higher.',
      'No CUDA or Vulkan prebuilt is published for win-arm64. GPU <code>none</code> in <code>boole doctor</code> is expected. x64 Windows with NVIDIA or Vulkan is the <a class="inline" href="/guides/windows-x64/">Windows x64 guide</a>.',
    ],
    notes: [
      'The cache defaults to <code>%LOCALAPPDATA%\\boole\\cache</code>. Set <code>BOOLE_CACHE</code> to move it.',
    ],
    trouble: [
      {
        h: 'An x64 installer was used on ARM Windows',
        p: 'The arm64 prebuilt is <code>win-arm64</code>. The CUDA and Vulkan packages are x64 only. Installing the wrong arch will not create a GPU backend.',
      },
    ],
  },
  {
    slug: 'browser',
    nav: 'Browser demo',
    kicker: 'Browser · WebAssembly',
    h1: 'Run a model in the browser',
    lede: 'The browser demo is on this page. It is not the CLI. The CLI sections below are how you run a model on the computer itself.',
    seoTitle: 'Run a local model in the browser — Boole',
    description:
      'Run a small local model in the browser with WebAssembly, or install the Boole CLI for Mac, Windows, and Linux. The only measured speed is this page’s demo.',
    keywords:
      'run LLM in the browser, WebAssembly local model, offline AI, run LLM locally on Mac, local AI model Windows',
    requirements: [
      'A current browser with WebAssembly. Press “Run on this device” on this page. Nothing loads until that click.',
      'The demo uses wllama 3.8.1 (MIT) and the file <code>SmolLM2-135M-Instruct-Q4_K_M.gguf</code> from bartowski on Hugging Face (Apache-2.0). Context 1024, 1 thread, 0 GPU layers, batch 128. Generation stops at 64 tokens. Temperature is 0.6.',
      'The first run downloads the weights. After they are in memory, the page counts new network requests during generation.',
      'The CLI on the computer needs Node.js 22 or newer from <a class="inline" href="https://nodejs.org/">nodejs.org</a>. macOS can use <code>brew install node@22</code>. Windows can use <code>winget install OpenJS.NodeJS.LTS</code> when <code>node -v</code> reports 22 or higher. Linux can use a distro package that reports the same.',
    ],
    notes: [
      'The only measured speed Boole publishes: 12.3 tok/s, 64 tokens, about 5187 ms, on a 4-core Xeon CPU, WebAssembly, 1 thread, no GPU layers. That is not a phone, and it is not the 20B at 200 tok/s goal.',
      'The demo does not use <code>boole run</code>. To run on the machine, install the CLI and follow the guide for <a class="inline" href="/guides/macos-apple-silicon/">Apple Silicon</a>, <a class="inline" href="/guides/windows-x64/">Windows</a>, or <a class="inline" href="/guides/linux-x64/">Linux</a>.',
    ],
    trouble: [
      {
        h: 'The button says this browser does not provide WebAssembly',
        p: 'The demo stops there. The command-line runtime is <code>npx @boole/cli</code> on a machine with Node.js 22 or newer, from <a class="inline" href="https://nodejs.org/">nodejs.org</a>.',
      },
    ],
  },
];

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cmd(lines: string): string {
  return `<pre><code>${esc(lines.trim())}</code></pre>`;
}

function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function crumbs(current: string): string {
  return `<p class="crumbs"><a href="/">Boole</a> · <a href="/guides/">Setup guides</a> · ${esc(current)}</p>`;
}

function related(current: string): string {
  const items = GUIDES.filter((g) => g.slug !== current)
    .map((g) => `<li><a href="/guides/${g.slug}/">${esc(g.nav)}</a></li>`)
    .join('');
  return `<h2>Other devices</h2><ul class="guide-links">${items}</ul>`;
}

function cliBody(guide: Guide): string {
  const platformBits = [
    ...guide.requirements.map((p) => `<li>${p}</li>`),
  ].join('');
  const notes = guide.notes.map((p) => `<p>${p}</p>`).join('');
  const trouble = guide.trouble
    .map((t) => `<h3>${esc(t.h)}</h3><p>${t.p}</p>`)
    .join('');

  return `${crumbs(guide.nav)}
      <p class="kicker">${esc(guide.kicker)}</p>
      <h1>${esc(guide.h1)}</h1>
      <p class="lede">${esc(guide.lede)}</p>

      <h2>Requirements</h2>
      <ul>${platformBits}</ul>
      <div class="prose">${notes}</div>

      <h2>Install the Boole CLI</h2>
      <div class="prose">
        <p><code>@boole/cli</code> 0.7.0 needs Node.js 22 or newer. The way to install Node on this machine is in the requirements above. The first command checks the machine. The next two download a small GGUF and run it. npx fetches the published package. This page does not republish it.</p>
      </div>
      ${cmd(`npx @boole/cli doctor\nnpx @boole/cli pull bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M\nnpx @boole/cli run bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M --prompt "Say hello"`)}
      <div class="prose">
        <p>If <code>node-llama-cpp</code> is missing, <code>boole run</code> writes <code>error: node-llama-cpp is not installed</code> and <code>npm install node-llama-cpp</code>, then exits 1.</p>
      </div>

      <h2>Check the machine with boole doctor</h2>
      <div class="prose">
        <p><code>npx @boole/cli doctor</code> prints the operating system, architecture, Node version, RAM total and available, the GPU backend (<code>metal</code>, <code>cuda</code>, <code>vulkan</code>, or <code>none</code>) and a device name when it has one. VRAM is printed only when <code>getVramState</code> returns it. It also prints the binaries and the cache path and size. All of that goes to standard error. <code>npx @boole/cli doctor --json</code> prints the same report as JSON.</p>
        <p>The verdict uses free RAM minus a 2 GiB headroom. It does not use VRAM. When that headroom leaves no room, it prints <code>not enough memory for inference</code> and exits 1.</p>
      </div>
      ${cmd('npx @boole/cli doctor\nnpx @boole/cli doctor --json')}

      <h2>Download a model with boole pull</h2>
      <div class="prose">
        <p>Pass an alias, or <code>repo:quant</code> with a slash in the repo. <code>--dir</code> sets the cache. <code>--yes</code> skips the size question. <code>--quiet</code> suppresses the diagnostics.</p>
        <p>The default cache is <code>~/Library/Caches/boole</code> on macOS, <code>%LOCALAPPDATA%\\boole\\cache</code> on Windows, and <code>$XDG_CACHE_HOME/boole</code> or <code>~/.cache/boole</code> elsewhere. <code>BOOLE_CACHE</code> overrides it.</p>
        <p>A file reported over 2 GB asks <code>[y/N]</code> on a terminal unless you passed <code>--yes</code>. An interrupted download keeps a <code>.partial</code> file and resumes with an HTTP Range request.</p>
        <p>The name is resolved on Hugging Face before the cache is checked. A file that is already on disk still causes that request. Saying no to the size prompt exits 0.</p>
      </div>
      ${cmd(`npx @boole/cli pull bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M`)}

      <h2>Run it with boole run</h2>
      <div class="prose">
        <p>An alias such as <code>llama3</code> picks a quant. A specifier with a slash and a colon, or a local <code>.gguf</code> path, is used as given. The prompt comes from <code>--file</code>, <code>-p</code> / <code>--prompt</code>, a second positional argument, or stdin. The first match wins.</p>
        <p>Flags that change the run: <code>--system</code> / <code>-s</code>, <code>--stream</code>, <code>--temp</code> / <code>-t</code> (default 0.8), <code>--ctx-size</code> (default 2048), <code>--max-tokens</code>, <code>--json</code>, <code>--jsonl</code>, <code>--yes</code>, <code>--quiet</code> / <code>-q</code>. Standard output is the model text. Diagnostics stay on standard error.</p>
        <p>The process calls <code>getLlama({ gpu: 'auto' })</code> and loads the file. The CLI does not set a thread count.</p>
        <p>Exit codes: 0 success, 1 runtime failure, 2 bad usage, 3 model unavailable (unknown name, missing quant, or not enough memory).</p>
      </div>
      ${cmd(`npx @boole/cli run bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M --prompt "Say hello"`)}

      <h2>Pick a model size for your RAM</h2>
      <div class="prose">
        <p>Both <code>doctor</code> and an alias on <code>run</code> estimate a file size. They do not measure it. The formula in the hardware package is parameter count times bits per weight, divided by 8.</p>
        <p>Bits per weight in that table: Q2_K 3.35, Q3_K_M 3.91, Q4_K_M 4.85, Q5_K_M 5.69, Q6_K 6.57, Q8_0 8.50. Usable memory is free RAM minus 2 GiB. The highest quant whose estimate fits is the one chosen. VRAM is displayed when the runtime reports it, and it is not an input to this pick.</p>
        <p><code>doctor</code> walks 1B, 3B, 7B, 8B, 13B, 34B, and 70B and keeps the largest size that fits. Those labels are the estimator’s ladder. They are not aliases, and they are not measured file sizes. For an 8B model at Q4_K_M the same formula comes out near 4.5 GiB. That is the estimate, not a file we weighed.</p>
        <p><code>boole models</code> lists the aliases. <code>llama3</code> is 8B with Q3_K_M through Q8_0, and it has no Q2_K. <code>llama3-70b</code> is 70B with the same quants. <code>phi3</code> is 3.8B (Q4_K_M through Q8_0) when memory is tight. <code>mixtral</code> is 47B with Q2_K through Q5_K_M. <code>llama2</code> and <code>codellama</code> are 7B and do include Q2_K. Do not pass Q2_K for <code>llama3</code>.</p>
      </div>
      ${cmd('npx @boole/cli models')}

      <h2>Serve and list</h2>
      <div class="prose">
        <p><code>npx @boole/cli list</code> prints the models already downloaded. <code>npx @boole/cli serve</code> starts a server for local development only. It has no authentication. It accepts <code>POST /generate</code>. Do not put that server on a public network. A production gateway in front of your providers is separate work, described on <a class="inline" href="/hybrid-routing/">hybrid routing</a>. This development server is not that gateway.</p>
      </div>
      ${cmd('npx @boole/cli list\nnpx @boole/cli serve')}

      <h2>Troubleshooting</h2>
      <div class="prose">
        <h3>node-llama-cpp is not installed</h3>
        <p>The error is exactly <code>error: node-llama-cpp is not installed</code>, then <code>npm install node-llama-cpp</code>. Exit code 1. Node.js 22 or newer is required before that install is useful.</p>
        <h3>Not enough memory</h3>
        <p><code>doctor</code> exits 1 when free RAM is not above the 2 GiB headroom. <code>run</code> exits 3 when the alias’s smallest quant still does not fit, and it prints the estimate beside the memory it computed.</p>
        ${trouble}
      </div>
      ${related(guide.slug)}
      <p class="prose end-note">The Token Cost Audit is a <a class="inline" href="${STRIPE}">$1,800</a> fixed fee. Implementation and managed plans: <a class="inline" href="mailto:${EMAIL}?subject=${encodeURIComponent('Boole: Implementation and managed plans')}">${EMAIL}</a>.</p>`;
}

export function layout(opts: {
  css: string;
  title: string;
  description: string;
  canonical: string;
  robots: string;
  keywords?: string;
  ld?: unknown;
  main: string;
  foot?: string;
}): string {
  const kw = opts.keywords
    ? `\n  <meta name="keywords" content="${esc(opts.keywords)}">`
    : '';
  const ld = opts.ld
    ? `\n  <script type="application/ld+json">${jsonLd(opts.ld)}</script>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(opts.title)}</title>
  <meta name="description" content="${esc(opts.description)}">
  <meta name="robots" content="${opts.robots}">${kw}
  <link rel="canonical" href="${opts.canonical}">
  <meta property="og:site_name" content="Boole">
  <meta property="og:locale" content="en_US">
  <meta property="og:title" content="${esc(opts.title)}">
  <meta property="og:description" content="${esc(opts.description)}">
  <meta property="og:image" content="${SITE}/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Boole. Repetitive LLM calls on hardware you own.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${opts.canonical}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(opts.title)}">
  <meta name="twitter:description" content="${esc(opts.description)}">
  <meta name="twitter:image" content="${SITE}/og.png">
  <meta name="twitter:image:alt" content="Boole. Repetitive LLM calls on hardware you own.">
  <meta name="theme-color" content="#090909">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/instrument-sans.woff2" as="font" type="font/woff2" crossorigin>${ld}
  <style>${opts.css}</style>
</head>
<body>
  <a class="skip" href="#content">Skip to content</a>
  <header class="bar">
    <a class="brand" href="/">boole</a>
    <nav class="nav-links" aria-label="Page">
      <a href="/audit/">Audit</a>
      <a href="/how-it-works/">How it works</a>
      <a href="/pricing/">Pricing</a>
      <a href="/guides/">Guides</a>
    </nav>
  </header>
  <main id="content" tabindex="-1">
    ${opts.main}
  </main>
  <footer>
    <div class="wrap footer-row">
      <span>© 2026 Boole AI, Inc. All rights reserved.</span>
      <a href="/audit/">Audit</a>
      <a href="/how-it-works/">How it works</a>
      <a href="/pricing/">Pricing</a>
      <a href="/calculator/">Calculator</a>
      <a href="/hybrid-routing/">Hybrid routing</a>
      <a href="/on-premise/">On-premise</a>
      <a href="/compare/">Compare</a>
      <a href="/guides/">Setup guides</a>
      <a href="/contact/">Contact</a>
      <a href="https://www.npmjs.com/package/@boole/cli">npm</a>
      <a href="mailto:${EMAIL}">${EMAIL}</a>
    </div>
  </footer>
  ${opts.foot ?? ''}
</body>
</html>`;
}

function guideLd(guide: Guide): unknown {
  const url = `${SITE}/guides/${guide.slug}/`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: guide.h1,
        name: guide.h1,
        description: guide.description,
        url,
        inLanguage: 'en',
        mainEntityOfPage: url,
        author: { '@id': `${SITE}/#organization` },
        publisher: {
          '@type': 'Organization',
          name: 'Boole AI, Inc.',
          url: `${SITE}/`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Boole', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Setup guides', item: `${SITE}/guides/` },
          { '@type': 'ListItem', position: 3, name: guide.nav, item: url },
        ],
      },
    ],
  };
}

export type BuiltPage = { file: string; html: string; loc?: string };

export function sitePages(css: string): BuiltPage[] {
  const welcomeMain = `<section id="vision">
      <div class="wrap">
        <p class="kicker">Token Cost Audit</p>
        <h1>Payment received.</h1>
        <p class="lede">You’ll be onboarded in less than 24 hours — just wait for an email from us at <a class="inline" href="mailto:${EMAIL}">${EMAIL}</a>.</p>
        <div class="prose">
          <p>${OFFER_DESCRIPTION} While you wait, the setup guides cover running a local model yourself.</p>
        </div>
        <h2>Next steps</h2>
        ${guideIndex()}
      </div>
    </section>`;

  const hubLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE}/guides/#page`,
        name: 'Setup guides',
        description:
          'Run a local AI model on a Mac, on Windows, or offline on Linux. One guide per device the Boole CLI actually supports.',
        url: `${SITE}/guides/`,
        isPartOf: { '@id': `${SITE}/#website` },
        publisher: { '@type': 'Organization', name: 'Boole AI, Inc.', url: `${SITE}/` },
      },
      {
        '@type': 'ItemList',
        itemListElement: GUIDES.map((g, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: g.h1,
          url: `${SITE}/guides/${g.slug}/`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Boole', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Setup guides', item: `${SITE}/guides/` },
        ],
      },
    ],
  };

  const hubMain = `<section class="doc">
      <div class="wrap">
        <p class="crumbs"><a href="/">Boole</a> · Setup guides</p>
        <p class="kicker">Run it on your own device</p>
        <h1>Run a local AI model on your device.</h1>
        <p class="lede">Pick the machine in front of you. Each guide uses @boole/cli 0.7.0 on Node.js 22 or newer: doctor, pull, run, models, list, and serve.</p>
        <div class="prose">
          <p>These pages are for people who want to run an LLM locally on a Mac, run a local AI model on Windows, or keep offline AI on Linux. The first command is <code>npx @boole/cli doctor</code>. <code>serve</code> is a local development server with no authentication and a <code>POST /generate</code> route. No guide invents a benchmark. The only measured speed on this site is the <a class="inline" href="/guides/browser/">browser demo</a>.</p>
          <p>Linux armv7l and riscv64 have CPU prebuilts (<code>linux-armv7l</code>, <code>linux-riscv64</code>) and do not have their own page. 32-bit Raspberry Pi OS is the armv7l package, not the <a class="inline" href="/guides/linux-arm64/">arm64 guide</a>.</p>
        </div>
        <h2>Serve a local model behind a gateway</h2>
        <div class="prose">
          <p><code>npx @boole/cli serve</code> is for local development on the machine in front of you. No authentication. <code>POST /generate</code>. Do not expose it on a public network. A gateway that sends repetitive calls to that kind of local model, and leaves hard calls in the cloud, is the <a class="inline" href="/hybrid-routing/">hybrid routing</a> work. It is scoped after a <a class="inline" href="/audit/">Token Cost Audit</a>, not something this development server turns on by itself.</p>
        </div>
        <h2>For a business</h2>
        <ul class="guide-links">
          <li><a href="/audit/">Token Cost Audit</a></li>
          <li><a href="/hybrid-routing/">Hybrid routing</a></li>
          <li><a href="/on-premise/">On-premise, for calls that stay on your hardware</a></li>
          <li><a href="/compare/">OpenRouter, Portkey, Not Diamond, LiteLLM</a></li>
        </ul>
        ${guideIndex()}
      </div>
    </section>`;

  const pages: BuiltPage[] = [
    {
      file: 'welcome/index.html',
      html: layout({
        css,
        title: 'Payment received — Boole',
        description:
          'Payment received. You’ll be onboarded in less than 24 hours — just wait for an email from us at hello@booleinference.com.',
        canonical: `${SITE}/welcome/`,
        robots: 'noindex, nofollow',
        main: welcomeMain,
      }),
    },
    {
      file: 'guides/index.html',
      loc: `${SITE}/guides/`,
      html: layout({
        css,
        title: 'Run a local AI model on your device — Boole',
        description:
          'Setup guides for a local LLM on Mac, Windows, and Linux, plus a browser demo. @boole/cli 0.7.0 on Node.js 22 or newer: doctor, pull, run, models, list, and serve.',
        canonical: `${SITE}/guides/`,
        robots: 'index, follow',
        keywords:
          'run LLM locally on Mac, run local AI model on Windows, offline AI on Linux, local model setup',
        ld: hubLd,
        main: hubMain,
      }),
    },
  ];

  for (const guide of GUIDES) {
    pages.push({
      file: `guides/${guide.slug}/index.html`,
      loc: `${SITE}/guides/${guide.slug}/`,
      html: layout({
        css,
        title: guide.seoTitle,
        description: guide.description,
        canonical: `${SITE}/guides/${guide.slug}/`,
        robots: 'index, follow',
        keywords: guide.keywords,
        ld: guideLd(guide),
        main: `<section class="doc"><div class="wrap">${guide.slug === 'browser' ? browserDemo() : ''}${cliBody(guide)}</div></section>`,
        foot: guide.slug === 'browser' ? browserDemoScript() : undefined,
      }),
    });
  }

  return pages.concat(marketingPages(css));
}

function browserDemo(): string {
  return `<div id="demo">
        <h2>Run a model in this browser</h2>
        <div class="prose">
          <p>Press the button and a small open model loads into WebAssembly on this device. Nothing is typed in for you, and the tokens are the model’s. This is SmolLM2 135M Instruct at Q4_K_M. The first run downloads the weights from Hugging Face. Generation is capped at 64 tokens. After the weights are in memory, generation does not call a server. The published measurement from one run of this setup is 12.3 tok/s, 64 tokens, about 5187 ms, on a 4-core Xeon, one thread, no GPU layers. A 20B model at 200 tok/s is a goal, not this demo.</p>
        </div>
        <div class="bench">
          <div class="bench-top">
            <strong>SmolLM2-135M-Instruct</strong>
            <span>Q4_K_M · llama.cpp via wllama · Apache-2.0 weights</span>
          </div>
          <label for="demo-prompt">Prompt</label>
          <textarea id="demo-prompt" maxlength="500">What does it mean to run a language model on the device?</textarea>
          <button class="btn btn-pay" id="run-demo" type="button">Run on this device</button>
          <p class="bench-meta" id="demo-status">Waiting. Weights are not loaded.</p>
          <div class="bench-meta">
            <span>Decode <strong id="demo-metrics">—</strong></span>
            <span id="demo-net">No generation yet</span>
          </div>
          <label for="demo-output">Output</label>
          <pre id="demo-output" aria-live="polite"></pre>
          <p class="host" id="demo-host">Hardware is reported when you run it.</p>
        </div>
      </div>`;
}

function browserDemoScript(): string {
  return `<script>
  (function () {
    var btn = document.getElementById('run-demo');
    if (!btn) return;
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
  })();
  </script>`;
}

function guideIndex(): string {
  const items = GUIDES.map(
    (g) => `<li><a href="/guides/${g.slug}/"><span class="tag">${esc(g.kicker.split('·')[0].trim())}</span><strong>${esc(g.nav)}</strong><span>${esc(g.h1)}</span></a></li>`,
  ).join('');
  return `<ul class="guide-index">${items}</ul>`;
}

export const SITEMAP_LOCS = [
  `${SITE}/`,
  `${SITE}/guides/`,
  ...GUIDES.map((g) => `${SITE}/guides/${g.slug}/`),
];
