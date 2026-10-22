/**
 * Token Cost Audit. The Stripe link and the public wording stay in this file
 * so the package can change later without a hunt through the pages.
 * No published price, no savings percentage, and no guarantee.
 */

export const STRIPE_URL = 'https://buy.stripe.com/cNi28rbZN1ml2wkbOydUY03';
export const AUDIT_CTA = 'Book a Token Cost Audit';
export const EMAIL = 'hello@booleinference.com';
export const IMPL_MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent('Boole: Implementation and managed plans')}`;

export const OFFER_BLURB =
  'Pricing is scoped per engagement. Implementation and managed plans are a separate conversation.';

export const OFFER_DESCRIPTION =
  'The Token Cost Audit from Boole AI, Inc. includes a spend breakdown by endpoint and model; a list of caching, batch, and trimming candidates; a list of calls that could move to a local model, with quality tested on a sample; an on-prem break-even calculation from your volumes; and an implementation quote. Pricing is scoped per engagement. Boole does not publish a savings percentage. Whether any traffic should move depends on your workload and your own evals.';

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
    title: 'Implementation quote',
    text: 'A scoped quote for the work after the audit. That work is quoted separately and is not included in the audit.',
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
  return `<a class="btn btn-pay" href="${STRIPE_URL}">${AUDIT_CTA}</a>`;
}
