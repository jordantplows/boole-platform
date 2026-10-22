/**
 * Commercial terms. The Token Cost Audit is free. The fee is 10% of measured
 * monthly savings on the customer's LLM bill. There is no setup fee, and
 * nothing is owed when measured savings are zero. The booking path is email,
 * not a card checkout.
 * Boole does not publish a savings percentage. The 10% is the fee on savings
 * that were measured, not a prediction.
 */

export const AUDIT_CTA = 'Book a free audit';
export const EMAIL = 'hello@booleinference.com';
export const CONTACT_PATH = '/contact/';
export const IMPL_MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent('Boole: Token Cost Audit')}`;

export const OFFER_BLURB =
  'The Token Cost Audit is free. Boole charges 10% of measured monthly savings. No setup fee. Nothing is owed if there are no savings.';

export const OFFER_DESCRIPTION =
  'The Token Cost Audit is free. It includes a spend breakdown by endpoint and model; a list of caching, batch, and trimming candidates; a list of calls that could move to a local model, with quality tested on a sample; an on-prem break-even from your volumes; and the same look at context windows and RAG pipelines when they are on the bill. Boole then charges 10% of measured monthly savings on the LLM bill: a baseline measured before changes, compared with the bill after. There is no setup fee. Nothing is owed if there are no savings. Boole does not publish a savings percentage. The 10% is the fee on savings that were measured, not a promise that the bill will fall. Whether any traffic should move depends on your workload and your own evals.';

const AUDIT_ITEMS: Array<{ title: string; text: string }> = [
  {
    title: 'Spend breakdown',
    text: 'By endpoint and model, from the usage you share.',
  },
  {
    title: 'Caching, batch, and trimming',
    text: 'A list of calls that are candidates for each lever. The list is the finding. It is not a promised percentage.',
  },
  {
    title: 'Local-model candidates',
    text: 'Calls that could move onto hardware you own, with quality tested on a sample of your traffic before anything is routed.',
  },
  {
    title: 'Break-even',
    text: 'An on-prem comparison using your volumes. Hardware has a fixed cost. We do not publish a generic savings figure.',
  },
  {
    title: 'Context, retrieval, and compression',
    text: 'Context-window and RAG candidates when they are on the bill. Prompt compression is one tool on that list, not the whole engagement.',
  },
];

export function auditChecklistHtml(opts?: { title?: boolean }): string {
  const title = opts?.title === false ? '' : '<p class="gets-title">What the audit delivers</p>';
  const items = AUDIT_ITEMS.map((item, i) => {
    const n = String(i + 1).padStart(2, '0');
    return `<li><span class="n">${n}</span><span><strong>${item.title}.</strong> ${item.text}</span></li>`;
  }).join('');
  return `${title}<ol class="gets">${items}</ol>`;
}

export function auditButton(): string {
  return `<a class="btn btn-pay" href="${CONTACT_PATH}">${AUDIT_CTA}</a>`;
}
