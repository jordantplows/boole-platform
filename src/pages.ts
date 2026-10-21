/**
 * Buyer pages for hybrid local + cloud token cost.
 * Competitor prices are only the figures in the Oct 2026 research notes, with the source URL.
 */

import { layout, type BuiltPage } from './guides.ts';
import {
  AUDIT_PRICE,
  EMAIL,
  IMPL_MAIL,
  OFFER_BLURB,
  OFFER_DESCRIPTION,
  STRIPE_URL,
  auditButton,
  auditChecklistHtml,
} from './offer.ts';

const SITE = 'https://boole.sh';
const CHECKED = 'October 2026';

const MENLO = 'https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/';
const MENLO_MID = 'https://menlovc.com/perspective/2025-mid-year-llm-market-update/';
const ROUTELLM = 'https://arxiv.org/html/2406.18665v3';
const LLMLINGUA = 'https://arxiv.org/abs/2310.05736';
const CACHE_SRC = 'https://coworker.ai/blog/ai-cost-optimization';
const CACHE_AA = 'https://artificialanalysis.ai/models/caching';
const OPENROUTER = 'https://openrouter.ai/pricing';
const PORTKEY = 'https://portkey.ai/pricing';
const NOTDIAMOND = 'https://www.notdiamond.ai/pricing';
const NOTDIAMOND_DOCS = 'https://docs.notdiamond.ai/docs/pricing';

type Faq = { q: string; a: string; html: string };

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function faq(q: string, text: string, html?: string): Faq {
  return { q, a: text, html: html ?? text };
}

function faqBlock(items: Faq[]): string {
  return `<div class="faq">${items
    .map((item) => `<details><summary>${esc(item.q)}</summary><p>${item.html}</p></details>`)
    .join('')}</div>`;
}

function crumbs(name: string): string {
  return `<p class="crumbs"><a href="/">Boole</a> · ${esc(name)}</p>`;
}

function actions(): string {
  return `<div class="actions" style="margin-top:1.5rem">
        ${auditButton()}
        <a class="btn btn-call" href="${IMPL_MAIL}">Contact us</a>
        <p class="price-inline">${OFFER_BLURB}</p>
      </div>`;
}

function pageLd(opts: {
  url: string;
  name: string;
  description: string;
  crumb: string;
  faq: Faq[];
  extra?: unknown[];
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: opts.name,
        name: opts.name,
        description: opts.description,
        url: opts.url,
        inLanguage: 'en',
        mainEntityOfPage: opts.url,
        author: { '@type': 'Organization', name: 'Boole AI, Inc.', url: `${SITE}/` },
        publisher: { '@type': 'Organization', name: 'Boole AI, Inc.', url: `${SITE}/` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: opts.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Boole', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: opts.crumb, item: opts.url },
        ],
      },
      ...(opts.extra ?? []),
    ],
  };
}

function render(opts: {
  css: string;
  file: string;
  urlPath: string;
  title: string;
  description: string;
  keywords: string;
  name: string;
  crumb: string;
  faq: Faq[];
  main: string;
  extra?: unknown[];
  foot?: string;
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
        name: opts.name,
        description: opts.description,
        crumb: opts.crumb,
        faq: opts.faq,
        extra: opts.extra,
      }),
      main: opts.main,
      foot: opts.foot,
    }),
  };
}

const speed =
  'The only speed Boole has measured is 12.3 tok/s for SmolLM2-135M Instruct Q4_K_M, 64 tokens, about 5187 ms, on a 4-core Xeon in WebAssembly, one thread, no GPU layers. A 20B model at 200 tok/s is a roadmap goal, not a measurement. No server throughput is claimed.';

const cacheFacts = `Anthropic’s cache reads are documented at 0.1× the input price. Cache writes are 1.25× for a 5-minute TTL and 2× for a 1-hour TTL. Checked ${CHECKED} via <a class="inline" href="${CACHE_SRC}">coworker.ai</a> and <a class="inline" href="${CACHE_AA}">Artificial Analysis</a>. OpenAI’s cache discount is not given a single number here: older write-ups say 50%, and newer models are described above 90%. Those figures conflict, so they stay off this page.`;

const batchFacts = `A batch API discount of 50% is documented for both Anthropic and OpenAI, and the write-ups say the batch discount can stack with caching. Cache hits inside a batch are best-effort; Anthropic’s range, as reported in that same source, is 30–98%. Checked ${CHECKED} via <a class="inline" href="${CACHE_SRC}">coworker.ai</a> and <a class="inline" href="${CACHE_AA}">Artificial Analysis</a>.`;

function auditMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Token Cost Audit')}
      <p class="kicker">Fixed fee · ${AUDIT_PRICE}</p>
      <h1>A token cost audit before anything moves.</h1>
      <p class="lede">Your repetitive AI calls may not need a frontier model. The hard ones should stay where they are. The audit measures which is which. It does not start from a savings percentage.</p>
      <p class="price">${AUDIT_PRICE}</p>
      <p class="note">Stripe. This fee is the audit. Implementation and managed plans are not included and are not priced on this site.</p>
      <h2>What you get</h2>
      ${auditChecklistHtml({ title: false })}
      <div class="prose">
        <p>${OFFER_DESCRIPTION}</p>
        <p>After payment, the <a class="inline" href="/welcome/">welcome page</a> says you will be onboarded in less than 24 hours. Wait for an email from <a class="inline" href="mailto:${EMAIL}">${EMAIL}</a>.</p>
      </div>
      ${actions()}
      <h2>What this is not</h2>
      <div class="prose">
        <p>It is not a guarantee that the fee comes back, and it is not a promise that a share of traffic will move. Open models trail closed models on hard tasks. Menlo’s mid-2025 update had open-source models at 13% of production workloads, and only 11% of teams had changed provider in the prior year (<a class="inline" href="${MENLO_MID}">source</a>). Quality is checked against your evals before a recommendation to move a call.</p>
        <p>${speed}</p>
      </div>
      <h2>Questions</h2>
      ${faqBlock(auditFaq)}
    </div></section>`;
}

const auditFaq: Faq[] = [
  faq(
    'What does the $1,800 payment buy?',
    OFFER_DESCRIPTION,
  ),
  faq(
    'Is there a savings guarantee?',
    'No. Boole does not publish a savings percentage, and this page does not offer a refund tied to savings. The audit is the work product: the breakdown, the candidate lists, the sample quality check, the break-even, and a quote.',
  ),
  faq(
    'How soon does onboarding start?',
    'After payment, the welcome page says you will be onboarded in less than 24 hours. Wait for an email from hello@booleinference.com.',
    'After payment, the <a class="inline" href="/welcome/">welcome page</a> says you will be onboarded in less than 24 hours. Wait for an email from <a class="inline" href="mailto:hello@booleinference.com">hello@booleinference.com</a>.',
  ),
];

function howMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('How it works')}
      <p class="kicker">Audit, route, measure</p>
      <h1>We measure first.</h1>
      <p class="lede">Cut your LLM bill without cutting quality starts with the bill you already have. Routing comes after a sample of your own traffic passes your evals.</p>
      <h2>1. Audit</h2>
      <div class="prose">
        <p>The ${AUDIT_PRICE} Token Cost Audit breaks spend down by endpoint and model. It lists calls that could use caching, a batch API, or a shorter prompt. It lists calls that could move to a local model, and it tests quality on a sample before that list is a recommendation. It calculates on-prem break-even from your volumes, and it ends with an implementation quote.</p>
      </div>
      <h2>2. Route</h2>
      <div class="prose">
        <p>If you accept the quote, implementation puts a gateway you can self-host in front of the providers you already use, and a local model behind the calls that passed. Hard calls stay in the cloud. The local development server in <code>@boole/cli</code> is not that gateway: <code>npx @boole/cli serve</code> has no authentication and accepts <code>POST /generate</code> for local development only. Do not put it on a public network. A production path is scoped work, and it can sit on an open-source gateway such as LiteLLM rather than a new hosted product.</p>
      </div>
      <h2>3. Measure</h2>
      <div class="prose">
        <p>Invoices compared with a baseline you lock are the measurement. Boole will not publish a savings percentage until a real customer result exists, and only with their written permission. The <a class="inline" href="/calculator/">calculator</a> on this site runs numbers you type and shows the formula. It is not that result.</p>
      </div>
      ${actions()}
      <h2>Questions</h2>
      ${faqBlock(howFaq)}
    </div></section>`;
}

const howFaq: Faq[] = [
  faq(
    'Do you move traffic before an eval?',
    'No. A call is a candidate until quality is checked on a sample of your traffic. Open models are weaker on hard tasks. The hard calls stay in the cloud.',
  ),
  faq(
    'Is boole serve the production gateway?',
    'No. npx @boole/cli serve is a local development server with no authentication. It accepts POST /generate. It is not an OpenAI-compatible public API, and it should not be exposed on a public network.',
    'No. <code>npx @boole/cli serve</code> is a local development server with no authentication. It accepts <code>POST /generate</code>. It is not an OpenAI-compatible public API, and it should not be exposed on a public network.',
  ),
];

function hybridMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Hybrid routing')}
      <p class="kicker">Local tier · cloud for the rest</p>
      <h1>Route the easy calls to hardware you own. Keep the hard ones in the cloud.</h1>
      <p class="lede">Classification, tagging, extraction, and summarization are the kind of repetitive calls an audit looks at. The share of your bill that fits is unknown until it is measured. This page does not guess it.</p>
      <h2>What “hybrid” means here</h2>
      <div class="prose">
        <p>A gateway in your own environment sends a call either to the cloud model you already use or to a model running on hardware you own. Boole’s opening, next to cloud-only routers, is that second hop. Cloud gateways pick among cloud models. They do not publish a tier that runs on your machine.</p>
        <p>Quality has to pass your evals first. Menlo reported open-source models at 13% of production workloads in mid-2025, and provider share of enterprise API spend concentrated on Anthropic, OpenAI, and Google (<a class="inline" href="${MENLO}">December 2025</a>, <a class="inline" href="${MENLO_MID}">mid-2025</a>). Buyers are sticky. The pitch is an added local tier, not a migration.</p>
        <p>${speed} Device setup for the local runtime is in the <a class="inline" href="/guides/">setup guides</a>. <code>@boole/cli</code> 0.7.0 needs Node.js 22 or newer. The first command is <code>npx @boole/cli doctor</code>.</p>
      </div>
      <h2>A published router result, with the range</h2>
      <div class="prose">
        <p>RouteLLM (ICLR 2025) reports up to 3.66× cost savings on MT-Bench at 95% of GPT-4 quality, but only 1.41× on MMLU and 1.49× on GSM8K. <a class="inline" href="${ROUTELLM}">Paper</a>. That is their benchmark, under their conditions. It is not a Boole customer, and it is not a reason to move a call that your eval fails.</p>
      </div>
      <h2>The development server</h2>
      <div class="prose">
        <p><code>npx @boole/cli serve</code> starts a server for local development only. No authentication. <code>POST /generate</code>. <code>npx @boole/cli list</code> prints models already downloaded. Serving a local model behind a gateway you control is implementation work. The development server is not that gateway, and it is not for a public network.</p>
      </div>
      ${actions()}
      <h2>Questions</h2>
      ${faqBlock(hybridFaq)}
    </div></section>`;
}

const hybridFaq: Faq[] = [
  faq(
    'What share of calls should move?',
    'Unknown until an audit. It varies by workload. Boole does not publish a share, and does not use figures such as “the cheap 80%.”',
  ),
  faq(
    'Is RouteLLM’s 3.66× a Boole result?',
    'No. It is the top of the range in the RouteLLM paper, on MT-Bench, at 95% of GPT-4 quality. The same paper reports 1.41× on MMLU and 1.49× on GSM8K. Results depend on the workload.',
  ),
];

function cachingMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Prompt caching')}
      <p class="kicker">Provider discounts · checked ${CHECKED}</p>
      <h1>Prompt caching is a provider feature. Most teams still miss it.</h1>
      <p class="lede">A stable prefix can be read back cheaper than a full prompt. Getting the prefix stable is the work. The discount is the provider’s, and it is not a Boole saving.</p>
      <h2>What is published</h2>
      <div class="prose">
        <p>${cacheFacts}</p>
        <p>Many teams never shape the prompt so the cached prefix actually hits. Finding those calls is part of the audit. It is not a moat, and it is not a percentage of your bill until your traces say so.</p>
      </div>
      <h2>What we will not cite</h2>
      <div class="prose">
        <p>A single OpenAI cache-read discount. The sources disagree, and the research note says to check the provider before citing one. Marketing ranges from other vendors, such as “40–60%” or “60–95%,” are not repeated here as facts about the market or about you.</p>
      </div>
      ${actions()}
      <h2>Questions</h2>
      ${faqBlock(cachingFaq)}
    </div></section>`;
}

const cachingFaq: Faq[] = [
  faq(
    'What Anthropic cache prices can I cite?',
    'As checked in October 2026 from the sources on this page: cache reads at 0.1× input, writes at 1.25× for a 5-minute TTL and 2× for a 1-hour TTL. Confirm on Anthropic’s own pricing page before you budget, because this changes.',
  ),
  faq(
    'Why is OpenAI’s cache discount missing?',
    'Older sources say about 50% off cached input. Newer models are described at 90% off or more. The two accounts conflict, so this site does not pick one.',
  ),
];

function batchMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Batch API')}
      <p class="kicker">Half price, if the call can wait</p>
      <h1>OpenAI’s batch discount is for work that is not interactive.</h1>
      <p class="lede">A 50% batch discount is published for Anthropic and for OpenAI. It applies to calls you can delay. A chat response that has to return now is not a batch candidate.</p>
      <h2>What is published</h2>
      <div class="prose">
        <p>${batchFacts}</p>
        <p>The audit lists endpoints that already tolerate delay: nightly extraction, backfills, eval runs, embedding rebuilds. It does not mark a user-facing reply as a batch job.</p>
      </div>
      ${actions()}
      <h2>Questions</h2>
      ${faqBlock(batchFaq)}
    </div></section>`;
}

const batchFaq: Faq[] = [
  faq(
    'Is the 50% figure a Boole discount?',
    'No. It is the batch discount documented for Anthropic and OpenAI, as checked in October 2026 from the sources on this page. Your bill moves only if those calls can actually wait, and only at the price your provider charges when you run them.',
  ),
  faq(
    'Do cache and batch stack?',
    'The sources checked in October 2026 say the discounts can stack, and that cache hits inside a batch are best-effort, with Anthropic’s reported range at 30–98%. Treat the hit rate as uncertain until you measure yours.',
  ),
];

function compressionMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Prompt compression')}
      <p class="kicker">LLMLingua · not a Boole result</p>
      <h1>Shorter prompts cost less. The quality drop has to be measured.</h1>
      <p class="lede">Trimming a prompt is the fourth lever: drop instructions and context the call does not use. Compression papers are evidence that it can work. They are not evidence about your prompts.</p>
      <h2>The paper, with the condition</h2>
      <div class="prose">
        <p>LLMLingua, from Microsoft, reports up to 20× prompt compression with about a 1.5-point performance drop on the datasets it tested. <a class="inline" href="${LLMLINGUA}">arxiv.org/abs/2310.05736</a>. “Up to” is the best case they published. A 1.5-point drop on their sets is not a promise of the same drop on yours. Results depend on the workload.</p>
        <p>The audit lists trimming candidates from your own logs. Boole has not published a compression result of its own.</p>
      </div>
      ${actions()}
      <h2>Questions</h2>
      ${faqBlock(compressionFaq)}
    </div></section>`;
}

const compressionFaq: Faq[] = [
  faq(
    'Is 20× compression what Boole delivers?',
    'No. It is the top figure in the LLMLingua paper, on the datasets the authors tested, with about a 1.5-point drop on those datasets. Boole has not published its own compression number.',
  ),
];

function onPremMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('On-premise')}
      <p class="kicker">Hardware you own</p>
      <h1>An on-premise model for the calls that should not leave.</h1>
      <p class="lede">Some traffic has a privacy or residency reason to stay in the building: legal, clinical, finance, a government contractor. The rest can stay with the cloud model you already trust. Hybrid routing is that split.</p>
      <h2>Fixed cost, not a published saving</h2>
      <div class="prose">
        <p>A machine you own has a purchase price and a power bill. The marginal cost of another token on it is close to zero. Whether that beats an API depends on how many tokens you would actually move, and on whether those tokens pass an eval. The audit does that arithmetic with your volumes. This page does not print a break-even token count, because a generic one would be invented.</p>
        <p>Keeping a prompt on a machine you control can avoid sending it to a third-party API. That is not a HIPAA determination, not a confidentiality opinion, and not legal advice. The published CLI still contacts Hugging Face to resolve a model file name before it opens the cache, and it downloads weights that are missing.</p>
      </div>
      <h2>What runs on the machine today</h2>
      <div class="prose">
        <p><code>@boole/cli</code> 0.7.0 needs Node.js 22 or newer. Install notes are per device in the <a class="inline" href="/guides/">setup guides</a>. The first commands:</p>
      </div>
      <pre><code>npx @boole/cli doctor
npx @boole/cli pull bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M
npx @boole/cli run bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M --prompt "Say hello"</code></pre>
      <div class="prose">
        <p><code>doctor --json</code> prints the same report as JSON. <code>list</code> prints downloaded models. <code>serve</code> is local development only, with no authentication, and it accepts <code>POST /generate</code>. ${speed}</p>
      </div>
      ${actions()}
      <h2>Questions</h2>
      ${faqBlock(onPremFaq)}
    </div></section>`;
}

const onPremFaq: Faq[] = [
  faq(
    'Does a prompt leave the building?',
    'A call you leave in the cloud goes to that provider. A call you move to hardware you own is read from a local GGUF file. The CLI still asks Hugging Face for a model file name, and it downloads weights that are not cached. This is not a security certification.',
  ),
  faq(
    'Is this HIPAA compliant?',
    'No determination is made here. Keeping inference on a machine you control can avoid sending a prompt to a third-party API. That is not a HIPAA finding and not legal advice.',
  ),
  faq(
    'What speed do you claim for an on-prem server?',
    'None. The only measured Boole speed is 12.3 tok/s in the browser demo described on this page. A 20B model at 200 tok/s is a goal. Server hardware has not been measured for a published tok/s figure.',
  ),
];

function pricingMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Pricing')}
      <p class="kicker">One priced offer</p>
      <h1>The audit is ${AUDIT_PRICE}. Implementation and managed plans: contact us.</h1>
      <p class="lede">Nothing else on this page has a number, because those fees are not set. A blank price would be a placeholder. A range we have not sold would be a guess.</p>
      <article class="card tier-fast">
        <span class="tag">Token Cost Audit</span>
        <p class="price">${AUDIT_PRICE}</p>
        <p>Pay on Stripe. ${OFFER_DESCRIPTION}</p>
        ${auditChecklistHtml({ title: false })}
        <div class="actions" style="margin-top:1.25rem">${auditButton()}</div>
      </article>
      <h2>Implementation and managed plans</h2>
      <div class="prose">
        <p>Contact us at <a class="inline" href="${IMPL_MAIL}">${EMAIL}</a>. Tell us the providers on the bill and whether any traffic has to stay on hardware you own. The audit’s implementation quote is the first priced scope for the work after. A managed plan, if you want one, is part of that conversation. Neither is listed as a monthly price here.</p>
        <p>There is no percentage-of-savings offer on this site. A fee tied to savings needs a locked baseline, invoice access, and a contract. Until that exists, it is not a product on this page.</p>
      </div>
      <h2>Questions</h2>
      ${faqBlock(pricingFaq)}
    </div></section>`;
}

const pricingFaq: Faq[] = [
  faq(
    'Why is implementation not priced?',
    'The scope depends on what the audit finds: which levers apply, whether a local model is in the path, and how many services sit behind the gateway. A single public fee would be a placeholder. Email hello@booleinference.com.',
    'The scope depends on what the audit finds: which levers apply, whether a local model is in the path, and how many services sit behind the gateway. A single public fee would be a placeholder. Email <a class="inline" href="mailto:hello@booleinference.com">hello@booleinference.com</a>.',
  ),
  faq(
    'Do you take a percentage of savings?',
    'Not as a published offer. Boole does not publish a savings percentage at all. A performance fee would need a contract and a baseline taken from your invoices. It is not for sale on this page.',
  ),
];

function compareHub(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Compare')}
      <p class="kicker">Published pricing · checked ${CHECKED}</p>
      <h1>OpenRouter, Portkey, Not Diamond, LiteLLM.</h1>
      <p class="lede">An LLM router comparison using their own pricing pages. No speed ranking. Prices that were not on those pages, including funding rounds reported second-hand, are left out.</p>
      <h2>The four published price lists</h2>
      <div class="offers">
        <article class="card"><h3>OpenRouter</h3><p>5.5% or 8% on credits. BYOK free to $25k a month, then 5%. Cloud-only.</p><a class="text-link" href="/compare/openrouter/">OpenRouter alternative</a></article>
        <article class="card"><h3>Portkey</h3><p>Self-host the gateway at no license fee. Hosted production is $49 a month, then usage.</p><a class="text-link" href="/compare/portkey/">Portkey alternative</a></article>
        <article class="card"><h3>Not Diamond</h3><p>Two of their own pages disagree on the price. Both are shown, and neither is averaged.</p><a class="text-link" href="/compare/not-diamond/">Not Diamond</a></article>
        <article class="card"><h3>LiteLLM</h3><p>The open-source proxy is free. The enterprise license is by quote. A local tier can sit behind it.</p><a class="text-link" href="/compare/litellm/">LiteLLM</a></article>
      </div>
      <div class="prose">
        <p>Boole is not a drop-in for any of them. The priced offer is a ${AUDIT_PRICE} audit. The technical opening is a local model on hardware you own, for repetitive calls, with hard calls left in the cloud. ${speed}</p>
      </div>
      <h2>Questions</h2>
      ${faqBlock(compareFaq)}
    </div></section>`;
}

const compareFaq: Faq[] = [
  faq(
    'Which router is fastest?',
    'Boole has not published a speed comparison against OpenRouter, Portkey, Not Diamond, or LiteLLM. The only Boole speed on this site is the browser demo at 12.3 tok/s, on the conditions stated above.',
  ),
  faq(
    'Why are some products missing?',
    'Martian and Unify do not publish a price in the sources we checked. Helicone’s prices in a secondary comparison were not verified against Helicone’s own page, so they are omitted. Funding amounts for OpenRouter and Portkey appeared only on a secondary page, so they are omitted too.',
  ),
];

function openrouterMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('OpenRouter')}
      <p class="kicker">Checked ${CHECKED}</p>
      <h1>An OpenRouter alternative when part of the traffic should run locally.</h1>
      <p class="lede">OpenRouter is a cloud marketplace and a unified API. Boole does not replace that marketplace. The audit asks which repetitive calls could leave the per-token bill and run on hardware you own.</p>
      <h2>Their published pricing</h2>
      <table class="spec"><tbody>
        <tr><th scope="row">Standard</th><td>5.5% platform fee on credits. <a class="inline" href="${OPENROUTER}">openrouter.ai/pricing</a>. Checked ${CHECKED}.</td></tr>
        <tr><th scope="row">Business</th><td>8% platform fee on credits. Same page, same date.</td></tr>
        <tr><th scope="row">BYOK</th><td>Free up to $25,000 a month of list-price inference, then 5%. Same page, same date.</td></tr>
        <tr><th scope="row">Local or on-prem inference</th><td>Not part of the published product. The fee sits on top of the model bill.</td></tr>
      </tbody></table>
      <h2>Where Boole is different</h2>
      <div class="prose">
        <p>A gateway fee does not move a call onto a machine you own. Boole’s audit looks for that split, then quotes implementation if you want it. There is no claim that Boole is cheaper than OpenRouter’s 5.5% on a like-for-like cloud route. Those are different shapes of spend.</p>
      </div>
      <h2>Questions</h2>
      ${faqBlock(openrouterFaq)}
      ${actions()}
      <p class="prose end-note">Also: <a class="inline" href="/compare/portkey/">Portkey</a>, <a class="inline" href="/compare/not-diamond/">Not Diamond</a>, <a class="inline" href="/compare/litellm/">LiteLLM</a>.</p>
    </div></section>`;
}

const openrouterFaq: Faq[] = [
  faq(
    'Is Boole cheaper than OpenRouter’s 5.5% fee?',
    'Not as a published comparison. OpenRouter’s fee is 5.5% (Standard) or 8% (Business) on credits, checked October 2026 on their pricing page. Boole’s priced offer is a $1,800 audit, not a take-rate on tokens. A local tier changes the shape of the bill. It is not a discount on the same cloud credits.',
  ),
];

function portkeyMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Portkey')}
      <p class="kicker">Checked ${CHECKED}</p>
      <h1>A Portkey alternative when you want the routing designed, and a local tier.</h1>
      <p class="lede">Portkey is an AI gateway: fallbacks, load balancing, caching, observability. The open-source gateway is MIT-licensed. You still design the policy. Their pricing page does not include a local model.</p>
      <h2>Their published pricing</h2>
      <table class="spec"><tbody>
        <tr><th scope="row">Self-host</th><td>No license fee for the open-source gateway. <a class="inline" href="${PORTKEY}">portkey.ai/pricing</a>. Checked ${CHECKED}.</td></tr>
        <tr><th scope="row">Production</th><td>$49 a month for 100,000 logs, then $9 per additional 100,000. Same page, same date.</td></tr>
        <tr><th scope="row">Enterprise</th><td>Custom. The price is not published. Same page, same date.</td></tr>
        <tr><th scope="row">Local models</th><td>Not in the published pricing. The customer designs the routes.</td></tr>
      </tbody></table>
      <div class="prose">
        <p>Boole is a service around the local tier and the audit, not a second observability bill. An implementation can use an open-source gateway, including Portkey’s, instead of competing with it. That is a build choice. It is not a claim that a Boole-hosted Portkey is already running.</p>
      </div>
      <h2>Questions</h2>
      ${faqBlock(portkeyFaq)}
      ${actions()}
      <p class="prose end-note">LiteLLM’s open-source proxy is the other base layer teams already run. <a class="inline" href="/compare/litellm/">LiteLLM</a>.</p>
    </div></section>`;
}

const portkeyFaq: Faq[] = [
  faq(
    'LiteLLM vs Portkey, on price?',
    'Portkey’s hosted production plan is $49 a month for 100,000 logs, then $9 per 100,000, checked October 2026 on portkey.ai/pricing. Self-hosting their gateway has no license fee on that page. LiteLLM’s open-source proxy is free, and the enterprise license is by quote, so the enterprise number is not published. Neither page prices a local on-prem model.',
  ),
];

function notDiamondMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Not Diamond')}
      <p class="kicker">Two pages, two prices · checked ${CHECKED}</p>
      <h1>Not Diamond routes among cloud models. The price pages disagree.</h1>
      <p class="lede">Not Diamond picks a model per prompt. Both of the prices below are theirs. This page does not choose a winner between them and does not invent a third number.</p>
      <h2>What their sites say</h2>
      <table class="spec"><tbody>
        <tr><th scope="row">Marketing price</th><td>$0.05 per 1 million tokens routed. <a class="inline" href="${NOTDIAMOND}">notdiamond.ai/pricing</a>. Checked ${CHECKED}.</td></tr>
        <tr><th scope="row">Docs price</th><td>Free to 100,000 requests, then $100 a month plus $0.001 per request. <a class="inline" href="${NOTDIAMOND_DOCS}">docs.notdiamond.ai/docs/pricing</a>. Checked ${CHECKED}. This conflicts with the row above.</td></tr>
        <tr><th scope="row">Where it runs</th><td>Between cloud models. VPC is described on custom plans, not as a default local tier on hardware you own.</td></tr>
      </tbody></table>
      <div class="prose">
        <p>A learned router among cloud models can be the right tool when every call should stay in the cloud. It is a different offer from moving repetitive calls onto hardware you own. Boole does not publish a cost-per-token for routing, because the priced product is the ${AUDIT_PRICE} audit.</p>
      </div>
      <h2>Questions</h2>
      ${faqBlock(notDiamondFaq)}
      ${actions()}
    </div></section>`;
}

const notDiamondFaq: Faq[] = [
  faq(
    'Which Not Diamond price is current?',
    'Unknown from here. On the October 2026 check, notdiamond.ai/pricing listed $0.05 per 1 million tokens routed, and docs.notdiamond.ai/docs/pricing listed a free tier to 100,000 requests, then $100 a month plus $0.001 per request. Both are linked. Neither is treated as the other.',
  ),
];

function litellmMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('LiteLLM')}
      <p class="kicker">Open-source proxy · checked ${CHECKED}</p>
      <h1>LiteLLM is a base layer. The local tier is the part it does not productize.</h1>
      <p class="lede">LiteLLM, from BerriAI, is an open-source proxy across many providers. Use it if you want to operate the gateway yourself. Boole’s work is the audit, the decision about what stays in the cloud, and a local model on hardware you own.</p>
      <h2>Published pricing</h2>
      <table class="spec"><tbody>
        <tr><th scope="row">Open source</th><td>Free. You run it. Enterprise license is by quote, so that price is not published. Checked ${CHECKED} from the research pass; there is no public enterprise number to cite.</td></tr>
        <tr><th scope="row">Portkey, for contrast</th><td>Self-host free. Hosted production $49 a month for 100,000 logs, then $9 per 100,000. <a class="inline" href="${PORTKEY}">portkey.ai/pricing</a>. Checked ${CHECKED}. This is the sourced “LiteLLM vs Portkey” price pair. It is not a quality ranking.</td></tr>
        <tr><th scope="row">Local on-prem tier</th><td>Not a priced Boole gateway on top of LiteLLM today. An implementation can put a local model behind a LiteLLM proxy you run. That is scoped work, quoted after the audit.</td></tr>
      </tbody></table>
      <div class="prose">
        <p>Self-hosting a gateway is DIY. The ${AUDIT_PRICE} audit is the opposite order of operations: measure the bill, then decide whether a proxy and a local model belong in the path. <a class="inline" href="/guides/">Setup guides</a> cover <code>@boole/cli</code> 0.7.0 on Node.js 22 or newer, including <code>serve</code> for local development only.</p>
      </div>
      <h2>Questions</h2>
      ${faqBlock(litellmFaq)}
      ${actions()}
    </div></section>`;
}

const litellmFaq: Faq[] = [
  faq(
    'Should I rip out LiteLLM?',
    'No recommendation of that kind. LiteLLM’s open-source proxy is free and is a reasonable gateway to build on. Boole does not publish a competing hosted proxy price. The local model and the audit are the offer.',
  ),
];

function calculatorMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Calculator')}
      <p class="kicker">Your inputs · your arithmetic</p>
      <h1>A savings calculator that does not claim a Boole saving.</h1>
      <p class="lede">Enter your spend or your volume, and the discounts you want to assume. The page shows the formula with your numbers substituted. Nothing is uploaded. A blank field is not treated as zero.</p>
      <h2>Formula</h2>
      <div class="prose">
        <p>If you leave monthly spend empty, S is millions of tokens times your price per million. Otherwise S is the monthly spend you type.</p>
      </div>
      <pre class="formula"><code>interactive = S × (1 − cache_share − batch_share − local_share)
cached      = S × cache_share × cache_multiple
batch       = S × batch_share × (1 − batch_discount)
local       = S × local_share × local_multiple
estimate    = interactive + cached + batch + local</code></pre>
      <div class="prose">
        <p>The three shares are slices of the same bill. They have to add up to 100% or less. The remainder stays at today’s interactive price. <code>cache_multiple</code> is the cache-read price as a fraction of today’s price for that slice. Anthropic’s documented cache read is 0.1, checked ${CHECKED}, if you choose to type it. <code>batch_discount</code> is the fraction off. A documented batch discount of 50% is 50 in the percent field, if you choose to type it. <code>local_multiple</code> is what you assume the local slice costs, as a fraction of what you pay the cloud for those calls today. This formula does not include the fixed cost of hardware. The audit does.</p>
      </div>
      <form id="calc-form" class="calc">
        <label>Monthly LLM spend, USD
          <span class="hint">Leave blank only if you fill in volume and price instead.</span>
          <input id="calc-spend" name="spend" inputmode="decimal" autocomplete="off">
        </label>
        <label>Volume, millions of tokens per month
          <span class="hint">Used only when monthly spend is blank.</span>
          <input id="calc-tokens" name="tokens" inputmode="decimal" autocomplete="off">
        </label>
        <label>Your price, USD per million tokens
          <span class="hint">Your assumption. Not a Boole rate card.</span>
          <input id="calc-price" name="price" inputmode="decimal" autocomplete="off">
        </label>
        <label>Share you assume can use prompt caching, percent
          <input id="calc-cache-pct" name="cache_pct" inputmode="decimal" autocomplete="off">
        </label>
        <label>Cache-read price as a multiple of today’s price
          <span class="hint">Anthropic documents 0.1 for cache reads. Type the multiple you want to assume.</span>
          <input id="calc-cache-mult" name="cache_mult" inputmode="decimal" autocomplete="off">
        </label>
        <label>Share you assume can use a batch API, percent
          <input id="calc-batch-pct" name="batch_pct" inputmode="decimal" autocomplete="off">
        </label>
        <label>Batch discount you assume, percent off
          <span class="hint">Anthropic and OpenAI document 50% off. Type the discount you want to assume.</span>
          <input id="calc-batch-off" name="batch_off" inputmode="decimal" autocomplete="off">
        </label>
        <label>Share you assume could move onto hardware you own, percent
          <input id="calc-local-pct" name="local_pct" inputmode="decimal" autocomplete="off">
        </label>
        <label>Local cost as a multiple of today’s cloud price for that slice
          <span class="hint">0 means you assume no remaining cloud bill for that slice. 1 means the same cloud bill. Hardware’s fixed cost is not in this field.</span>
          <input id="calc-local-mult" name="local_mult" inputmode="decimal" autocomplete="off">
        </label>
        <button class="btn btn-pay" type="submit">Run the arithmetic</button>
      </form>
      <div class="calc-out" aria-live="polite">
        <h2>Result</h2>
        <pre id="calc-result">Enter your spend and assumptions. No figure is shown until you do.</pre>
      </div>
      <noscript><p>The arithmetic runs in your browser. With JavaScript off, the formula above is the whole calculator.</p></noscript>
      <h2>Questions</h2>
      ${faqBlock(calcFaq)}
    </div></section>`;
}

const calcFaq: Faq[] = [
  faq(
    'Is the result Boole’s savings claim?',
    'No. It is your inputs run through the formula on this page. Boole publishes no savings percentage. Local hardware’s fixed cost is outside the formula and is part of the audit.',
  ),
];

function contactMain(): string {
  return `<section class="doc"><div class="wrap">
      ${crumbs('Contact')}
      <p class="kicker">Boole AI, Inc.</p>
      <h1>Contact.</h1>
      <p class="lede">Email <a class="inline" href="mailto:${EMAIL}">${EMAIL}</a>. The audit itself is the Stripe button, ${AUDIT_PRICE}, if you already know you want it.</p>
      <div class="prose">
        <p>Implementation and managed plans: <a class="inline" href="${IMPL_MAIL}">write with that subject</a>. Useful context is which providers are on the bill, a rough monthly spend if you want to share it, and whether any calls have to stay on hardware you own. Do not send secrets or production prompts in the first email.</p>
        <p>The software is proprietary to Boole AI, Inc. All rights reserved. A codebase inquiry is a separate written conversation, not a checkout. Use the subject “Boole: Codebase acquisition”.</p>
      </div>
      <div class="actions" style="margin-top:1.5rem">
        ${auditButton()}
        <a class="btn btn-call" href="mailto:${EMAIL}">${EMAIL}</a>
      </div>
      <h2>Questions</h2>
      ${faqBlock(contactFaq)}
    </div></section>`;
}

const contactFaq: Faq[] = [
  faq(
    'Where do I email?',
    'hello@booleinference.com. The Token Cost Audit can also be paid on Stripe from the audit page. Implementation and managed plans start by email.',
  ),
];

export function marketingPages(css: string): BuiltPage[] {
  const auditExtra = [
    {
      '@type': 'Service',
      name: 'Token Cost Audit',
      serviceType: 'LLM token cost audit',
      provider: { '@type': 'Organization', name: 'Boole AI, Inc.', url: `${SITE}/` },
      description: OFFER_DESCRIPTION,
      offers: {
        '@type': 'Offer',
        price: '1800',
        priceCurrency: 'USD',
        url: STRIPE_URL,
        availability: 'https://schema.org/OnlineOnly',
      },
    },
    {
      '@type': 'Product',
      name: 'Token Cost Audit',
      description: OFFER_DESCRIPTION,
      brand: { '@type': 'Brand', name: 'Boole' },
      offers: {
        '@type': 'Offer',
        price: '1800',
        priceCurrency: 'USD',
        url: STRIPE_URL,
        availability: 'https://schema.org/OnlineOnly',
      },
    },
  ];

  return [
    render({ css, file: 'audit/index.html', urlPath: '/audit/', title: 'Token Cost Audit — $1,800 fixed fee — Boole', description: 'A token cost audit for a fixed $1,800 fee. Spend breakdown, caching and batch candidates, local-model candidates tested on a sample, and an on-prem break-even. No savings percentage.', keywords: 'LLM cost audit, AI cost optimization consulting, reduce OpenAI API costs service, LLM FinOps consultant', name: 'Token Cost Audit', crumb: 'Token Cost Audit', faq: auditFaq, main: auditMain(), extra: auditExtra }),
    render({ css, file: 'how-it-works/index.html', urlPath: '/how-it-works/', title: 'How LLM cost optimization works — Boole', description: 'Audit the bill, route repetitive calls onto hardware you own, keep hard calls in the cloud, then measure against invoices. No savings percentage in advance.', keywords: 'how to reduce LLM costs, LLM FinOps consultant, hybrid LLM routing', name: 'How it works', crumb: 'How it works', faq: howFaq, main: howMain() }),
    render({ css, file: 'hybrid-routing/index.html', urlPath: '/hybrid-routing/', title: 'Hybrid LLM routing to hardware you own — Boole', description: 'Route repetitive LLM calls to a model on hardware you own. Keep hard calls in the cloud. RouteLLM’s published range is cited. Boole publishes no savings percentage.', keywords: 'hybrid LLM routing, local LLM vs API cost, self-hosted LLM gateway, on-prem LLM deployment service', name: 'Hybrid routing', crumb: 'Hybrid routing', faq: hybridFaq, main: hybridMain() }),
    render({ css, file: 'prompt-caching/index.html', urlPath: '/prompt-caching/', title: 'Prompt caching for Anthropic and OpenAI — Boole', description: 'Anthropic cache reads at 0.1× input, writes at 1.25× or 2×, checked October 2026. OpenAI’s cache discount is not cited because the figures conflict.', keywords: 'prompt caching Anthropic vs OpenAI, how to reduce LLM costs, LLM cost audit', name: 'Prompt caching', crumb: 'Prompt caching', faq: cachingFaq, main: cachingMain() }),
    render({ css, file: 'batch-api/index.html', urlPath: '/batch-api/', title: 'OpenAI and Anthropic batch API discount — Boole', description: 'Batch API is documented at 50% off for Anthropic and OpenAI, checked October 2026. It applies to calls that can wait. Not a Boole discount.', keywords: 'OpenAI batch API discount, how to reduce LLM costs, Anthropic batch API', name: 'Batch API', crumb: 'Batch API', faq: batchFaq, main: batchMain() }),
    render({ css, file: 'prompt-compression/index.html', urlPath: '/prompt-compression/', title: 'Prompt compression and LLMLingua — Boole', description: 'LLMLingua reports up to 20× prompt compression with about a 1.5-point drop on its tested datasets. That is not a Boole result.', keywords: 'prompt compression LLMLingua, how to reduce LLM costs', name: 'Prompt compression', crumb: 'Prompt compression', faq: compressionFaq, main: compressionMain() }),
    render({ css, file: 'on-premise/index.html', urlPath: '/on-premise/', title: 'On-premise LLM for repetitive calls — Boole', description: 'Run repetitive LLM calls on hardware you own. Keep hard calls in the cloud. Break-even uses your volumes. No HIPAA claim and no published savings percentage.', keywords: 'on-prem LLM deployment service, local LLM vs API cost, self-host Llama break-even, private local LLM', name: 'On-premise LLM', crumb: 'On-premise', faq: onPremFaq, main: onPremMain() }),
    render({ css, file: 'pricing/index.html', urlPath: '/pricing/', title: 'Pricing — Token Cost Audit $1,800 — Boole', description: 'The Token Cost Audit is $1,800. Implementation and managed plans: contact us. No placeholder prices and no percentage-of-savings offer.', keywords: 'LLM cost audit, AI cost optimization consulting, LLM FinOps consultant', name: 'Pricing', crumb: 'Pricing', faq: pricingFaq, main: pricingMain() }),
    render({ css, file: 'compare/index.html', urlPath: '/compare/', title: 'LLM router comparison — OpenRouter, Portkey, Not Diamond, LiteLLM — Boole', description: 'Published pricing for OpenRouter, Portkey, Not Diamond, and LiteLLM, checked October 2026. Unverified prices are left out. No speed ranking.', keywords: 'LLM router comparison, OpenRouter alternative, Portkey alternative, LiteLLM vs Portkey, self-hosted LLM gateway', name: 'LLM router comparison', crumb: 'Compare', faq: compareFaq, main: compareHub() }),
    render({ css, file: 'compare/openrouter/index.html', urlPath: '/compare/openrouter/', title: 'OpenRouter alternative with a local tier — Boole', description: 'OpenRouter charges 5.5% or 8% on credits, checked October 2026. BYOK is free to $25k a month, then 5%. No local inference in that product.', keywords: 'OpenRouter alternative, LLM router comparison, self-hosted LLM gateway', name: 'OpenRouter and Boole', crumb: 'OpenRouter', faq: openrouterFaq, main: openrouterMain() }),
    render({ css, file: 'compare/portkey/index.html', urlPath: '/compare/portkey/', title: 'Portkey alternative — local tier and an audit — Boole', description: 'Portkey self-host is free. Hosted production is $49 a month for 100k logs, then $9 per 100k, checked October 2026. No local model in that price.', keywords: 'Portkey alternative, LiteLLM vs Portkey, self-hosted LLM gateway', name: 'Portkey and Boole', crumb: 'Portkey', faq: portkeyFaq, main: portkeyMain() }),
    render({ css, file: 'compare/not-diamond/index.html', urlPath: '/compare/not-diamond/', title: 'Not Diamond pricing, both published figures — Boole', description: 'Not Diamond lists $0.05 per 1M tokens routed, and an older docs page lists $100 a month plus $0.001 a request. Checked October 2026. The pages conflict.', keywords: 'LLM router comparison, Not Diamond pricing, self-hosted LLM gateway', name: 'Not Diamond and Boole', crumb: 'Not Diamond', faq: notDiamondFaq, main: notDiamondMain() }),
    render({ css, file: 'compare/litellm/index.html', urlPath: '/compare/litellm/', title: 'LiteLLM vs Portkey on published price — Boole', description: 'LiteLLM’s open-source proxy is free and enterprise is by quote. Portkey hosted production is $49 a month, checked October 2026. A local tier is separate.', keywords: 'LiteLLM vs Portkey, self-hosted LLM gateway, LLM router comparison', name: 'LiteLLM and Boole', crumb: 'LiteLLM', faq: litellmFaq, main: litellmMain() }),
    render({ css, file: 'calculator/index.html', urlPath: '/calculator/', title: 'LLM cost calculator from your own assumptions — Boole', description: 'Enter your LLM spend or volume and your own discount assumptions. The formula is shown. No Boole savings percentage.', keywords: 'how to reduce LLM costs, local LLM vs API cost, self-host Llama break-even, LLM cost audit', name: 'LLM cost calculator', crumb: 'Calculator', faq: calcFaq, main: calculatorMain(), foot: '<script src="/calculator.js" defer></script>' }),
    render({ css, file: 'contact/index.html', urlPath: '/contact/', title: 'Contact Boole AI, Inc.', description: 'Email hello@booleinference.com. The Token Cost Audit is a $1,800 Stripe payment. Implementation and managed plans: contact us.', keywords: 'LLM cost audit, LLM FinOps consultant, Boole AI', name: 'Contact', crumb: 'Contact', faq: contactFaq, main: contactMain() }),
  ];
}
