/**
 * Buyer-intent pages. Competitor facts are taken from those projects' own docs.
 * Boole claims stay inside what release 0.0.1 and the published demo actually do.
 */

import { layout, type BuiltPage } from './guides.ts';

const SITE = 'https://boole.sh';
const EMAIL = 'hello@booleinference.com';
const STRIPE = 'https://buy.stripe.com/cNi28rbZN1ml2wkbOydUY03';
const INQUIRY = `mailto:${EMAIL}?subject=${encodeURIComponent('Boole: Codebase acquisition')}`;

const OLLAMA_FAQ = 'https://github.com/ollama/ollama/blob/main/docs/faq.mdx';
const OLLAMA_OPENAI = 'https://github.com/ollama/ollama/blob/main/docs/api/openai-compatibility.mdx';
const OLLAMA_LICENSE = 'https://github.com/ollama/ollama/blob/main/LICENSE';
const LM_APP = 'https://lmstudio.ai/docs/app';
const LM_SERVER = 'https://lmstudio.ai/docs/developer/core/server';
const LM_OPENAI = 'https://lmstudio.ai/docs/developer/openai-compat';
const LM_TERMS = 'https://lmstudio.ai/app-terms';
const LLAMA_INTRO = 'https://llama.app/docs/introduction';
const LLAMA_SERVE = 'https://llama.app/docs/serve';
const LLAMA_REPO = 'https://github.com/ggml-org/llama.cpp';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

type Faq = { q: string; a: string; html: string };

function faqBlock(items: Faq[]): string {
  return `<div class="faq">${items
    .map((item) => `<details><summary>${esc(item.q)}</summary><p>${item.html}</p></details>`)
    .join('')}</div>`;
}

function faqLd(items: Faq[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

function crumbs(name: string): string {
  return `<p class="crumbs"><a href="/">Boole</a> · ${esc(name)}</p>`;
}

function actions(): string {
  return `<div class="actions actions-hero" style="margin-top:1.5rem">
        <a class="btn btn-pay" href="${STRIPE}">Pay to start</a>
        <a class="btn btn-call" href="${INQUIRY}">Start an inquiry</a>
        <p class="price-inline">$1,800 entry payment for the managed tier. We set it up and run it.</p>
      </div>`;
}

function pageLd(opts: {
  url: string;
  type: string;
  name: string;
  description: string;
  crumbs: Array<{ name: string; item: string }>;
  faq: Faq[];
  extra?: unknown[];
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': opts.type,
        headline: opts.name,
        name: opts.name,
        description: opts.description,
        url: opts.url,
        inLanguage: 'en',
        mainEntityOfPage: opts.url,
        author: { '@type': 'Organization', name: 'Boole AI, Inc.', url: `${SITE}/` },
        publisher: { '@type': 'Organization', name: 'Boole AI, Inc.', url: `${SITE}/` },
      },
      faqLd(opts.faq),
      {
        '@type': 'BreadcrumbList',
        itemListElement: opts.crumbs.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          item: c.item,
        })),
      },
      ...(opts.extra ?? []),
    ],
  };
}

const onPremFaq: Faq[] = [
  {
    q: 'Does a prompt leave the building?',
    a: 'On the published CLI, token generation reads a GGUF file on disk and does not upload the prompt. The same command still asks Hugging Face for the file name before it opens the cache, and it downloads weights that are not cached. The managed tier’s network scope is agreed when you start. This is not a security certification.',
    html: 'On the published CLI, token generation reads a GGUF file on disk and does not upload the prompt. The same command still asks Hugging Face for the file name before it opens the cache, and it downloads weights that are not cached. The managed tier’s network scope is agreed when you start. This is not a security certification.',
  },
  {
    q: 'Is this HIPAA compliant, or legal advice for a firm?',
    a: 'No. Keeping inference on a machine you control can avoid sending a prompt to a third-party API. That is not a HIPAA determination, not a confidentiality opinion, and not legal advice.',
    html: 'No. Keeping inference on a machine you control can avoid sending a prompt to a third-party API. That is not a HIPAA determination, not a confidentiality opinion, and not legal advice.',
  },
  {
    q: 'What does the $1,800 payment buy?',
    a: 'It is the entry payment for the managed tier. Boole AI, Inc. sets Imagine OS up and runs it, with continuous uptime and white-glove onboarding. There is no published uptime percentage. The scope of the service is agreed when you start.',
    html: 'It is the entry payment for the managed tier. Boole AI, Inc. sets Imagine OS up and runs it, with continuous uptime and white-glove onboarding. There is no published uptime percentage. The scope of the service is agreed when you start.',
  },
  {
    q: 'How soon does onboarding start?',
    a: 'After payment, the welcome page says you will be onboarded in less than 24 hours. Wait for an email from hello@booleinference.com.',
    html: 'After payment, the <a class="inline" href="/welcome/">welcome page</a> says you will be onboarded in less than 24 hours. Wait for an email from <a class="inline" href="mailto:hello@booleinference.com">hello@booleinference.com</a>.',
  },
  {
    q: 'Can we buy the codebase instead?',
    a: 'Yes, as an inquiry, not a checkout. Email hello@booleinference.com with the subject “Boole: Codebase acquisition”. Ownership is settled in a written agreement.',
    html: 'Yes, as an inquiry, not a checkout. Email <a class="inline" href="mailto:hello@booleinference.com">hello@booleinference.com</a> with the subject “Boole: Codebase acquisition”. Ownership is settled in a written agreement.',
  },
];

const compareFaq: Faq[] = [
  {
    q: 'Which one is fastest?',
    a: 'Boole has not published a speed comparison against Ollama, LM Studio, or llama.cpp. The only measured number on this site is the browser demo: 12.3 tok/s for SmolLM2-135M Instruct Q4_K_M, 64 tokens, about 5187 ms, on a 4-core Xeon CPU in WebAssembly, one thread, no GPU layers. A 20B model at 200 tok/s is a goal, not a measurement.',
    html: 'Boole has not published a speed comparison against Ollama, LM Studio, or llama.cpp. The only measured number on this site is the browser demo: 12.3 tok/s for SmolLM2-135M Instruct Q4_K_M, 64 tokens, about 5187 ms, on a 4-core Xeon CPU in WebAssembly, one thread, no GPU layers. A 20B model at 200 tok/s is a goal, not a measurement.',
  },
  {
    q: 'Is the Boole CLI a drop-in replacement for Ollama?',
    a: 'No. Ollama’s docs describe a local server on 127.0.0.1 port 11434 and an OpenAI-compatible subset at /v1. Release 0.0.1 of the Boole CLI implements run, pull, doctor, and models. boole serve and boole list print that they are not yet implemented and exit 1.',
    html: 'No. Ollama’s docs describe a local server on 127.0.0.1 port 11434 and an OpenAI-compatible subset at <code>/v1</code>. Release 0.0.1 of the Boole CLI implements <code>run</code>, <code>pull</code>, <code>doctor</code>, and <code>models</code>. <code>boole serve</code> and <code>boole list</code> print that they are not yet implemented and exit 1.',
  },
  {
    q: 'What is Boole actually built on?',
    a: 'The CLI imports node-llama-cpp 3.22.2, which runs llama.cpp and GGUF files. It is a thin command line on that runtime, plus a separate WebAssembly demo. It is not a fork we claim is faster than upstream.',
    html: 'The CLI imports node-llama-cpp 3.22.2, which runs llama.cpp and GGUF files. It is a thin command line on that runtime, plus a separate WebAssembly demo. It is not a fork we claim is faster than upstream.',
  },
];

const altFaq: Faq[] = [
  {
    q: 'Can an OpenAI client call Boole the way it calls Ollama?',
    a: 'Not in this release. Ollama documents a local OpenAI-compatible subset at http://localhost:11434/v1/. The Boole command boole serve is not implemented. If you need that server today, Ollama and llama.cpp document one, and LM Studio documents one too.',
    html: 'Not in this release. Ollama documents a local OpenAI-compatible subset at <code>http://localhost:11434/v1/</code>. The Boole command <code>boole serve</code> is not implemented. If you need that server today, Ollama and llama.cpp document one, and LM Studio documents one too.',
  },
  {
    q: 'Can I run a GGUF file I already downloaded?',
    a: 'Yes. boole run accepts a local path that ends in .gguf, as well as an alias such as llama3 or a repo:quant specifier. pull downloads into the local cache and resumes an interrupted transfer.',
    html: 'Yes. <code>boole run</code> accepts a local path that ends in <code>.gguf</code>, as well as an alias such as <code>llama3</code> or a <code>repo:quant</code> specifier. <code>pull</code> downloads into the local cache and resumes an interrupted transfer.',
  },
  {
    q: 'Who is the managed tier for?',
    a: 'A team that wants Boole AI, Inc. to set the local system up and keep it running. The entry payment is $1,800. Hobbyist setup stays on the free CLI, or on Ollama, LM Studio, or llama.cpp. There is no published uptime percentage.',
    html: 'A team that wants Boole AI, Inc. to set the local system up and keep it running. The entry payment is $1,800. Hobbyist setup stays on the free CLI, or on Ollama, LM Studio, or llama.cpp. There is no published uptime percentage.',
  },
];

function onPremMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('On-premise setup')}
      <p class="kicker">Private local LLM · for a business</p>
      <h1>An on-premise LLM, set up for you.</h1>
      <p class="lede">Boole AI, Inc. sets up a local model on hardware you control and runs it. The entry payment for that managed tier is $1,800. The codebase is a separate inquiry.</p>
      <div class="aside">
        <p><strong>What works today.</strong> Release 0.0.1 is a command line: <code>boole run</code>, <code>pull</code>, <code>doctor</code>, and <code>models</code>. <code>serve</code> and <code>list</code> are not implemented. The only measured speed on this site is the browser demo, 12.3 tok/s on a 4-core Xeon in WebAssembly. Ternary weights and a 20B model at 200 tok/s are goals, not results. There is no published uptime percentage.</p>
      </div>
      <h2>Why a business runs it locally</h2>
      <div class="prose">
        <p>A rented model sends the prompt, and often the files around it, to someone else’s cluster. A local GGUF session reads weights from disk. That is the reason a law office, a clinic, or a small company asks for an on-premise LLM: the work stays on a machine they control.</p>
        <p>The published CLI does not upload the prompt. It does contact Hugging Face to resolve a model file name before it opens the cache, and it downloads weights that are missing. Say that plainly when you scope a deployment. This page is not a promise that a particular network is air-gapped, and it is not a HIPAA or confidentiality opinion.</p>
      </div>
      <h2>What the managed tier includes</h2>
      <div class="prose">
        <p>Pay to start is the fast path. Boole sets Imagine OS up and runs it: continuous uptime and white-glove onboarding. The button goes to Stripe for the $1,800 entry payment. After payment, onboarding email comes from ${EMAIL} in less than 24 hours. The rest of the service is agreed then. We do not publish an uptime percentage, and we do not invent a hardware SKU to go with the price.</p>
      </div>
      <p class="price">$1,800</p>
      <p class="note">Entry payment for the managed tier.</p>
      ${actions()}
      <h2>What you can run yourself</h2>
      <div class="prose">
        <p>The same runtime is installable as <code>npx @boole/cli</code> on Node.js 20 or newer. <code>doctor</code> prints the machine and suggests a size from free RAM minus a 2 GiB headroom. It shows VRAM when the runtime reports it, and it does not use VRAM to pick the size. <code>pull</code> downloads a GGUF. <code>run</code> samples tokens locally. <code>models</code> lists aliases. Device steps live in the <a class="inline" href="/guides/">setup guides</a>.</p>
      </div>
      <h2>Hardware, without invented tiers</h2>
      <div class="prose">
        <p>Support today follows node-llama-cpp 3.22.2 prebuilts: Apple Silicon with Metal, Intel Macs on CPU, Windows and Linux x64 with CUDA, Vulkan, or CPU, Linux arm64 and Windows arm64 on CPU. Phones, NPUs, and other edge devices are a roadmap, not a commitment. A 64-bit Raspberry Pi-class board is the arm64 CPU guide. We do not claim a specific board works, and we do not quote a tokens-per-second number for it.</p>
        <p>The size estimate is a formula, not a measured file. Bits per weight in the hardware package run from 3.35 for Q2_K to 8.50 for Q8_0. An 8B model at Q4_K_M comes out near 4.5 GiB by that formula. <code>phi3</code> (3.8B) is the smaller alias when memory is tight. <code>llama3</code> has no Q2_K.</p>
      </div>
      <h2>The other path</h2>
      <div class="prose">
        <p>Acquiring the codebase is a full inquiry, not a checkout. Write to <a class="inline" href="${INQUIRY}">${EMAIL}</a> with the subject “Boole: Codebase acquisition”. The software is proprietary to Boole AI, Inc.</p>
        <p>If you are choosing a tool rather than a managed setup, read the <a class="inline" href="/compare/ollama-lm-studio-llama-cpp/">comparison</a> and the <a class="inline" href="/ollama-alternative/">Ollama alternative</a> page. Both stay with documented facts.</p>
      </div>
      <h2>Questions</h2>
      ${faqBlock(onPremFaq)}
    </div></section>`;
}

function compareMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Comparison')}
      <p class="kicker">Ollama · LM Studio · llama.cpp · Boole</p>
      <h1>Ollama vs LM Studio vs llama.cpp vs Boole.</h1>
      <p class="lede">Four different ways to run a model on your own machine. This page compares what each project documents. It does not rank them by speed.</p>
      <div class="aside">
        <p><strong>No invented benchmarks.</strong> Boole has not measured Ollama, LM Studio, or llama.cpp against the Boole CLI. The only speed we publish is 12.3 tok/s for the in-browser SmolLM2 135M demo, on a 4-core Xeon, WebAssembly, one thread, no GPU layers. A 20B model at 200 tok/s is a goal.</p>
      </div>
      <h2>The four tools</h2>
      <div class="offers">
        <article class="card">
          <span class="tag">CLI and local server</span>
          <h3>Ollama</h3>
          <p>A local runner with <code>ollama run</code>, <code>ollama pull</code>, and <code>ollama serve</code>. The project is MIT-licensed. Its FAQ says a local server binds 127.0.0.1 port 11434, and that prompts from a local run are not sent to ollama.com. Cloud-hosted models are a separate path in that same FAQ.</p>
        </article>
        <article class="card">
          <span class="tag">Desktop app</span>
          <h3>LM Studio</h3>
          <p>A desktop app for macOS, Windows, and Linux. Its docs say it runs GGUF models through llama.cpp, and MLX on Apple Silicon. A local server starts from the Developer tab or <code>lms server start</code>. The OpenAI-compatible examples use port 1234. The app terms treat the source as the company’s, and license it for personal and internal business use.</p>
        </article>
        <article class="card">
          <span class="tag">The engine</span>
          <h3>llama.cpp</h3>
          <p>The C/C++ project behind a lot of local GGUF inference. MIT-licensed. Current docs at llama.app show <code>llama cli</code> for the terminal and <code>llama serve</code> for an OpenAI-compatible API and web UI on 127.0.0.1 port 9931. The README lists Metal, CUDA, Vulkan, and other backends.</p>
        </article>
        <article class="card">
          <span class="tag">Managed, or a small CLI</span>
          <h3>Boole</h3>
          <p>Boole AI, Inc. sells a managed setup for $1,800 and, separately, a codebase inquiry. The CLI you can run today is earlier-stage: <code>run</code>, <code>pull</code>, <code>doctor</code>, <code>models</code>. It sits on node-llama-cpp. <code>serve</code> is not implemented, so it is not an API server yet.</p>
        </article>
      </div>
      <h2>What each one documents</h2>
      <table class="spec">
        <tbody>
          <tr><th scope="row">Ollama</th><td>MIT license (<a class="inline" href="${OLLAMA_LICENSE}">LICENSE</a>). Local server at 127.0.0.1:11434 (<a class="inline" href="${OLLAMA_FAQ}">FAQ</a>). OpenAI-compatible subset at <code>/v1</code> on that port (<a class="inline" href="${OLLAMA_OPENAI}">docs</a>). Default context in the FAQ is 4096 tokens. Local runs stay local; the FAQ describes a different path for cloud models.</td></tr>
          <tr><th scope="row">LM Studio</th><td>Desktop app for macOS, Windows, and Linux (<a class="inline" href="${LM_APP}">docs</a>). llama.cpp for GGUF, plus MLX on Apple Silicon. Server via the Developer tab or <code>lms server start</code> (<a class="inline" href="${LM_SERVER}">server</a>). Examples use <code>http://localhost:1234/v1</code> (<a class="inline" href="${LM_OPENAI}">OpenAI compatibility</a>). <a class="inline" href="${LM_TERMS}">App terms</a> (23 Aug 2026) license personal and internal business use and restrict redistribution and service-bureau use. Source is not offered as an open-source grant.</td></tr>
          <tr><th scope="row">llama.cpp</th><td>MIT-licensed C/C++ (<a class="inline" href="${LLAMA_REPO}">repository</a>). GGUF. <a class="inline" href="${LLAMA_INTRO}">Introduction</a>: <code>llama cli</code> and <code>llama serve</code>. <a class="inline" href="${LLAMA_SERVE}">Server docs</a>: default listen address 127.0.0.1:9931, OpenAI-compatible <code>/v1</code> routes, Metal and CUDA among the backends in the README. You build or install it yourself.</td></tr>
          <tr><th scope="row">Boole</th><td>Proprietary CLI from Boole AI, Inc., release 0.0.1. Commands that exist: <code>run</code>, <code>pull</code>, <code>doctor</code>, <code>models</code>. <code>serve</code> and <code>list</code> exit 1 with “not yet implemented”. GPU offload follows <code>getLlama({ gpu: 'auto' })</code>. <code>--gpu-layers</code> is parsed and not passed to <code>loadModel</code>. Managed entry payment $1,800. Codebase acquisition is an inquiry to ${EMAIL}.</td></tr>
        </tbody>
      </table>
      <h2>When to use which</h2>
      <div class="prose">
        <p>Use Ollama when you want a local runner that already has a documented server and an OpenAI-compatible subset, and you are comfortable operating it.</p>
        <p>Use LM Studio when you want a desktop app, a chat window, and a local server without building llama.cpp. Read their terms before you redistribute anything or offer it as a service.</p>
        <p>Use llama.cpp when you want the engine itself: the binary, the server, and the backends upstream ships. Boole does not claim to be a faster build of it.</p>
        <p>Use Boole’s managed tier when you want Boole AI, Inc. to set the local system up and run it. Use the Boole CLI when you want the four commands that exist today and the <a class="inline" href="/guides/">device guides</a>. It is the earlier-stage option in this list.</p>
      </div>
      <h2>Questions</h2>
      ${faqBlock(compareFaq)}
      <p class="prose end-note">Related: <a class="inline" href="/on-premise/">on-premise setup</a>, <a class="inline" href="/ollama-alternative/">Ollama alternative</a>, <a class="inline" href="/guides/">setup guides</a>.</p>
      ${actions()}
    </div></section>`;
}

function altMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Ollama alternative')}
      <p class="kicker">Ollama alternative · with setup and support</p>
      <h1>An Ollama alternative with someone to set it up.</h1>
      <p class="lede">Ollama is a capable local runner you operate yourself. Boole is the path where Boole AI, Inc. does the setup and keeps the managed system running. The CLI underneath is not a clone of Ollama.</p>
      <div class="aside">
        <p><strong>What works today.</strong> <code>boole doctor</code>, <code>pull</code>, <code>run</code>, and <code>models</code>. There is no <code>boole serve</code>, so there is no OpenAI-compatible Boole server in this release. The only measured speed we publish is 12.3 tok/s in the browser demo. We have not benchmarked Boole against Ollama.</p>
      </div>
      <h2>DIY, or managed</h2>
      <div class="offers">
        <article class="card">
          <span class="tag">You operate it</span>
          <h3>Ollama</h3>
          <p>Their docs give you <code>ollama run</code>, <code>ollama pull</code>, and <code>ollama serve</code>. The local server binds 127.0.0.1:11434, with an OpenAI-compatible subset at <code>/v1</code>. The software is MIT-licensed. You install it, you pick the model, and you keep the process running.</p>
        </article>
        <article class="card">
          <span class="tag">We operate it</span>
          <h3>Boole managed tier</h3>
          <p>The $1,800 entry payment is for a managed local setup. Boole sets it up and runs it, with continuous uptime and white-glove onboarding. Email follows in less than 24 hours. There is no published uptime percentage. This is the product for a team that does not want to own the operations.</p>
        </article>
      </div>
      <h2>Where the CLI matches, and where it does not</h2>
      <table class="spec">
        <tbody>
          <tr><th scope="row">Run a model</th><td>Ollama documents <code>ollama run</code>. Boole documents <code>boole run</code> for an alias, a <code>repo:quant</code> specifier, or a local <code>.gguf</code> file. Standard output is the model text.</td></tr>
          <tr><th scope="row">Download</th><td>Ollama documents <code>ollama pull</code>. Boole’s <code>pull</code> saves a GGUF in the local cache, asks before a file over 2 GB, and resumes a <code>.partial</code> download. Resolving the name still contacts Hugging Face first.</td></tr>
          <tr><th scope="row">Check the machine</th><td>Boole’s <code>doctor</code> prints OS, RAM, GPU backend, and a RAM-based size verdict with 2 GiB held back. That command is Boole’s, not a port of an Ollama command.</td></tr>
          <tr><th scope="row">Local API</th><td>Ollama documents one, on port 11434. llama.cpp documents <code>llama serve</code> on port 9931. LM Studio’s examples use port 1234. <code>boole serve</code> is not implemented.</td></tr>
        </tbody>
      </table>
      <h2>Moving a model you already have</h2>
      <div class="prose">
        <p>A GGUF file on disk can be passed to <code>boole run ./weights.gguf -p "Hello"</code>. An alias such as <code>llama3</code> or <code>phi3</code> is resolved from free RAM. That is a file-level handoff, not an import of Ollama’s model library, its Modelfile, or its process manager.</p>
        <p>Node.js 20 or newer is required. Per-device steps are in the <a class="inline" href="/guides/">setup guides</a>, including <a class="inline" href="/guides/macos-apple-silicon/">Apple Silicon</a>, <a class="inline" href="/guides/windows-x64/">Windows</a>, and <a class="inline" href="/guides/linux-x64/">Linux</a>.</p>
      </div>
      <h2>Support, not a faster number</h2>
      <div class="prose">
        <p>The reason to pick the managed tier over Ollama is the service: setup and ongoing running of the local system, by Boole AI, Inc. It is not a claim that the CLI is faster, more compatible, or a substitute for Ollama’s server. If you want the engine with no company in the middle, use <a class="inline" href="${LLAMA_REPO}">llama.cpp</a> or <a class="inline" href="${OLLAMA_LICENSE}">Ollama</a>. The <a class="inline" href="/compare/ollama-lm-studio-llama-cpp/">comparison</a> keeps the four options side by side. The <a class="inline" href="/on-premise/">on-premise page</a> is the business offer.</p>
      </div>
      <h2>Questions</h2>
      ${faqBlock(altFaq)}
      ${actions()}
    </div></section>`;
}

function render(opts: {
  file: string;
  urlPath: string;
  title: string;
  description: string;
  keywords: string;
  name: string;
  crumb: string;
  type: string;
  faq: Faq[];
  main: string;
  css: string;
  extra?: unknown[];
}): BuiltPage {
  const url = `${SITE}${opts.urlPath}`;
  return {
    file: opts.file,
    loc: url,
    html: layout({
      css: opts.css,
      title: opts.title,
      description: opts.description,
      canonical: url,
      robots: 'index, follow',
      keywords: opts.keywords,
      ld: pageLd({
        url,
        type: opts.type,
        name: opts.name,
        description: opts.description,
        crumbs: [
          { name: 'Boole', item: `${SITE}/` },
          { name: opts.crumb, item: url },
        ],
        faq: opts.faq,
        extra: opts.extra,
      }),
      main: opts.main,
    }),
  };
}

export function seoPages(css: string): BuiltPage[] {
  return [
    render({
      css,
      file: 'on-premise/index.html',
      urlPath: '/on-premise/',
      title: 'On-premise private LLM setup for a business — Boole',
      description:
        'On-premise LLM setup for a small business. Boole AI, Inc. sets it up and runs it. The managed tier is a $1,800 entry payment. The codebase is an inquiry.',
      keywords:
        'on premise LLM for business, private local LLM, on-prem AI setup, local LLM for a company, white-glove local AI',
      name: 'On-premise private LLM setup',
      crumb: 'On-premise setup',
      type: 'TechArticle',
      faq: onPremFaq,
      main: onPremMain(),
      extra: [
        {
          '@type': 'Service',
          name: 'Managed on-premise Imagine OS',
          serviceType: 'On-premise local model setup and operation',
          provider: { '@type': 'Organization', name: 'Boole AI, Inc.', url: `${SITE}/` },
          areaServed: 'Worldwide',
          offers: {
            '@type': 'Offer',
            price: '1800',
            priceCurrency: 'USD',
            url: STRIPE,
            availability: 'https://schema.org/OnlineOnly',
          },
        },
      ],
    }),
    render({
      css,
      file: 'compare/ollama-lm-studio-llama-cpp/index.html',
      urlPath: '/compare/ollama-lm-studio-llama-cpp/',
      title: 'Ollama vs LM Studio vs llama.cpp vs Boole — Boole',
      description:
        'A factual comparison of Ollama, LM Studio, llama.cpp, and Boole. No invented benchmarks. Boole’s CLI is earlier-stage; the managed tier is a $1,800 setup.',
      keywords:
        'ollama vs lm studio, ollama vs llama.cpp, llama.cpp vs LM Studio, local LLM comparison, Boole',
      name: 'Ollama vs LM Studio vs llama.cpp vs Boole',
      crumb: 'Comparison',
      type: 'TechArticle',
      faq: compareFaq,
      main: compareMain(),
    }),
    render({
      css,
      file: 'ollama-alternative/index.html',
      urlPath: '/ollama-alternative/',
      title: 'An Ollama alternative with setup and support — Boole',
      description:
        'An Ollama alternative when you want setup and support. Boole’s managed tier is a $1,800 entry payment. The CLI is not an OpenAI-compatible server yet.',
      keywords:
        'ollama alternative, ollama alternative with support, managed local LLM, private LLM setup, Boole',
      name: 'An Ollama alternative with setup and support',
      crumb: 'Ollama alternative',
      type: 'TechArticle',
      faq: altFaq,
      main: altMain(),
    }),
  ];
}
