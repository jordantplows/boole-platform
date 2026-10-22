/**
 * Homepage. Positioning: hybrid local + cloud token cost.
 * No savings percentage, no testimonials, no customer counts.
 */

import { layout } from './guides.ts';
import { EMAIL, IMPL_MAIL, OFFER_BLURB, OFFER_DESCRIPTION, STRIPE_URL, auditButton, auditChecklistHtml } from './offer.ts';

const SITE = 'https://boole.sh';

const TITLE = 'Move repetitive LLM calls onto hardware you own — Boole';
const DESCRIPTION =
  'Move your repetitive LLM calls onto hardware you own. Keep the hard ones in the cloud. Pricing for the Token Cost Audit is scoped per engagement. Boole publishes no savings percentage.';
const KEYWORDS =
  'LLM cost audit, AI cost optimization consulting, reduce OpenAI API costs service, LLM FinOps consultant, on-prem LLM deployment service, hybrid LLM routing, local LLM vs API cost';

const FAQ = [
  {
    q: 'Do you publish a savings percentage?',
    a: 'No. Boole will not publish a savings percentage until a real customer result exists, and only with their written permission. Published research is cited separately, with the benchmark and the range. Your result depends on your workload.',
  },
  {
    q: 'Will you replace our model provider?',
    a: 'No. The hard calls stay in the cloud, with the provider you already use. Menlo Ventures reported that 11% of teams changed model provider in the year before its mid-2025 update. The audit looks for repetitive calls that can move onto hardware you own, after your own evals pass.',
  },
  {
    q: 'What does the Token Cost Audit include?',
    a: OFFER_DESCRIPTION,
  },
  {
    q: 'What about implementation and a managed plan?',
    a: 'Those are not priced on this site. Email hello@booleinference.com and we will scope them. The audit includes an implementation quote. It does not include the implementation itself.',
  },
  {
    q: 'What speed has Boole measured?',
    a: 'One number: 12.3 tok/s for SmolLM2-135M Instruct Q4_K_M, 64 tokens, about 5187 ms, on a 4-core Xeon CPU in WebAssembly, one thread, no GPU layers. That is the browser demo, not a server. A 20-billion-parameter model at 200 tok/s is a roadmap goal, not a measurement.',
  },
  {
    q: 'Where does a prompt go?',
    a: 'A call that stays in the cloud goes to that provider, as it does today. A call moved to hardware you own is generated from a local GGUF file. The Boole CLI still contacts Hugging Face to resolve a model file name, and it downloads weights that are not cached. This is not a security certification and not a HIPAA determination.',
  },
];

export function homePage(css: string): string {
  const faqHtml = FAQ.map(
    (item) => `<details>
            <summary>${item.q}</summary>
            <p>${item.a}</p>
          </details>`,
  ).join('\n');

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'Boole AI, Inc.',
        legalName: 'Boole AI, Inc.',
        url: `${SITE}/`,
        email: EMAIL,
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
        '@type': 'Service',
        '@id': `${SITE}/#service`,
        name: 'LLM token cost optimization',
        serviceType: 'Token cost audit and hybrid local-cloud routing',
        provider: { '@id': `${SITE}/#organization` },
        areaServed: 'Worldwide',
        description: DESCRIPTION,
        url: `${SITE}/audit/`,
      },
      {
        '@type': 'Product',
        '@id': `${SITE}/#audit-product`,
        name: 'Token Cost Audit',
        description: OFFER_DESCRIPTION,
        brand: { '@type': 'Brand', name: 'Boole' },
        manufacturer: { '@id': `${SITE}/#organization` },
        offers: {
          '@type': 'Offer',
          url: STRIPE_URL,
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
  };

  const main = `<section class="home" id="top">
      <div class="wrap">
        <p class="kicker">Boole AI, Inc. · LLM cost</p>
        <h1>Move your repetitive LLM calls onto hardware you own. Keep the hard ones in the cloud.</h1>
        <p class="lede">Cut your LLM bill without cutting quality. We measure first. Pricing is scoped per engagement. The share of traffic that can move is something we measure for you. It is not a number we publish in advance.</p>
        <div class="actions actions-hero">
          ${auditButton()}
          <a class="text-link" href="/how-it-works/">How it works</a>
          <p class="price-inline">${OFFER_BLURB} No savings percentage until a customer result exists, and only with their permission.</p>
        </div>
      </div>
    </section>

    <section id="spend">
      <div class="wrap">
        <p class="kicker">The bill</p>
        <h2>Most of the spend is already on closed models.</h2>
        <div class="prose">
          <p>Menlo Ventures put enterprise spend on foundation-model APIs at $12.5 billion in 2025, inside $37 billion of enterprise generative-AI spend. In its mid-2025 update the same firm had API spend at $8.4 billion, up from $3.5 billion in November 2024. Provider share of that 2025 spend: Anthropic 40%, OpenAI 27%, Google 21%. Open-source models were 13% of production workloads at mid-year. Sources: <a class="inline" href="https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/">State of Generative AI in the Enterprise, December 2025</a> and the <a class="inline" href="https://menlovc.com/perspective/2025-mid-year-llm-market-update/">mid-year update</a>.</p>
          <p>The FinOps Foundation’s 2026 report says 98% of practitioners now manage AI spend, up from 31% two years earlier, and that AI cost management is the skill teams most want to build. <a class="inline" href="https://data.finops.org/">data.finops.org</a>. The size of the cost-optimization tooling market itself is not a figure we found a credible source for, so it is not quoted here.</p>
        </div>
      </div>
    </section>

    <section id="levers">
      <div class="wrap">
        <p class="kicker">Four levers</p>
        <h2>Caching, batch, compression, and a local tier.</h2>
        <p class="lede">Each lever is real only where the workload fits. The audit says which calls are candidates. It does not apply a market-wide percentage to your bill.</p>
        <div class="offers">
          <article class="card">
            <span class="tag">01</span>
            <h3>Hybrid routing</h3>
            <p>Repetitive calls can run on hardware you own. Hard calls stay with the cloud model you already pay for. Quality is checked on your evals before traffic moves.</p>
            <a class="text-link" href="/hybrid-routing/">Hybrid routing</a>
          </article>
          <article class="card">
            <span class="tag">02</span>
            <h3>Prompt caching</h3>
            <p>Anthropic documents cache reads at 0.1× input. OpenAI’s cache discount is not cited here, because published figures conflict. Structuring a prompt for a cache hit is audit work.</p>
            <a class="text-link" href="/prompt-caching/">Prompt caching</a>
          </article>
          <article class="card">
            <span class="tag">03</span>
            <h3>Batch API</h3>
            <p>Anthropic and OpenAI document a 50% batch discount, and it can stack with caching. Calls that can wait are the candidates. Calls that cannot wait are not.</p>
            <a class="text-link" href="/batch-api/">Batch API</a>
          </article>
          <article class="card">
            <span class="tag">04</span>
            <h3>Prompt compression</h3>
            <p>LLMLingua reports up to 20× compression with about a 1.5-point drop on the datasets it tested. That is Microsoft’s paper, not a Boole result, and it is not every workload.</p>
            <a class="text-link" href="/prompt-compression/">Prompt compression</a>
          </article>
        </div>
      </div>
    </section>

    <section id="audit">
      <div class="wrap">
        <p class="kicker">The audit</p>
        <h2>A token cost audit in days.</h2>
        <p class="note">Pay on Stripe. Implementation is quoted after, and it is not included.</p>
        ${auditChecklistHtml({ title: false })}
        <div class="actions" style="margin-top:1.35rem">
          ${auditButton()}
          <a class="text-link" href="/audit/">Audit details</a>
        </div>
      </div>
    </section>

    <section id="local">
      <div class="wrap">
        <p class="kicker">Why hardware you own</p>
        <h2>A fixed cost, and a boundary around the data.</h2>
        <div class="prose">
          <p>Cloud gateways route among cloud models. They do not put the cheap tier on a machine in your office. An on-prem box has a fixed cost and a low marginal cost per token. The break-even is your volume against that fixed cost. We calculate it in the audit. We do not print a universal saving.</p>
          <p>Sensitive calls can stay on hardware you control. A prompt that never leaves the building is a different path from a prompt sent to a provider API. That is not a HIPAA determination, and it is not a claim that model downloads never touch the network. Weights still come from somewhere the first time.</p>
          <p>The only speed Boole has measured is the browser demo: 12.3 tok/s, SmolLM2-135M Instruct Q4_K_M, 64 tokens, about 5187 ms, 4-core Xeon, WebAssembly, one thread, no GPU layers. A 20B model at 200 tok/s remains a goal. Server throughput is not claimed until it is measured.</p>
        </div>
        <p><a class="text-link" href="/on-premise/">On-premise</a></p>
      </div>
    </section>

    <section id="process">
      <div class="wrap">
        <p class="kicker">Process</p>
        <h2>Audit, then route, then measure.</h2>
        <ol class="flow">
          <li><span class="tag">01</span><h3>Audit</h3><p>Break the bill down. Mark caching, batch, trimming, and local candidates. Test quality on a sample before recommending a move.</p></li>
          <li><span class="tag">02</span><h3>Route</h3><p>Implementation, if you want it, puts a gateway you can self-host in front of your providers and a local model behind the calls that passed. Hard calls stay in the cloud.</p></li>
          <li><span class="tag">03</span><h3>Measure</h3><p>Compare invoices with a baseline you lock. A savings figure is yours, from those invoices. It is not a number this website invents.</p></li>
        </ol>
        <p style="margin-top:1.25rem"><a class="text-link" href="/how-it-works/">The full sequence</a></p>
      </div>
    </section>

    <section id="pricing">
      <div class="wrap">
        <p class="kicker">Pricing</p>
        <h2>Pricing is scoped per engagement.</h2>
        <div class="offers">
          <article class="card tier-fast">
            <span class="tag">Audit</span>
            <h3>Token Cost Audit</h3>
            <p>Scoped per engagement. Stripe. The deliverables are listed above. There is no savings guarantee on this page.</p>
            ${auditButton()}
          </article>
          <article class="card">
            <span class="tag">Not priced here</span>
            <h3>Implementation and managed plans</h3>
            <p>Contact us. We will not print a fee we have not set. The audit’s last deliverable is a quote for the implementation, scoped to what the audit found.</p>
            <a class="btn btn-call" href="${IMPL_MAIL}">Contact us</a>
          </article>
        </div>
        <p style="margin-top:1.25rem"><a class="text-link" href="/pricing/">Pricing</a></p>
      </div>
    </section>

    <section id="research">
      <div class="wrap">
        <p class="kicker">Published research</p>
        <h2>Other people’s benchmarks, with the range.</h2>
        <div class="prose">
          <p>RouteLLM (ICLR 2025) reports up to 3.66× cost savings on MT-Bench at 95% of GPT-4 quality, and only 1.41× on MMLU and 1.49× on GSM8K. The range is the result. <a class="inline" href="https://arxiv.org/html/2406.18665v3">arxiv.org/html/2406.18665v3</a>. It is not a Boole deployment.</p>
          <p>LLMLingua (Microsoft) reports up to 20× prompt compression with about a 1.5-point performance drop on the datasets it tested. <a class="inline" href="https://arxiv.org/abs/2310.05736">arxiv.org/abs/2310.05736</a>. Results depend on the workload. “Up to” is the authors’ best case, not a typical bill.</p>
        </div>
      </div>
    </section>

    <section id="faq">
      <div class="wrap">
        <p class="kicker">Questions</p>
        <h2>Answered up front.</h2>
        <div class="faq">${faqHtml}</div>
      </div>
    </section>

    <section id="start">
      <div class="wrap">
        <p class="kicker">Begin</p>
        <h2>Measure the bill before you move a call.</h2>
        <div class="prose">
          <p>Book the audit on Stripe. Implementation and managed plans: <a class="inline" href="${IMPL_MAIL}">${EMAIL}</a>. A calculator on this site runs your own assumptions and shows the formula. It does not claim a Boole saving.</p>
        </div>
        <div class="actions" style="margin-top:1.5rem">
          ${auditButton()}
          <a class="btn btn-call" href="/calculator/">Savings calculator</a>
        </div>
      </div>
    </section>`;

  return layout({
    css,
    title: TITLE,
    description: DESCRIPTION,
    canonical: `${SITE}/`,
    robots: 'index, follow',
    keywords: KEYWORDS,
    ld,
    main,
  });
}
