/**
 * The $1,800 done-for-you package. Price and Stripe Payment Link stay fixed.
 * No customer counts beyond the founding offer itself, and no speed claims.
 */

export const OFFER_BLURB =
  '$1,800 done for you. Live setup on up to three devices, a private document assistant, and 30 days of direct support.';

export const OFFER_DESCRIPTION =
  'A $1,800 done-for-you package from Boole AI, Inc. On a 60-minute live setup call we install Boole on up to 3 of your devices, pick and tune the right model for each, and confirm it runs before we hang up. A private document assistant connects your own files (PDFs, notes, docs) so the model answers from them locally, with nothing from those files leaving your machine. Includes 30 days of direct support for fixes, model upgrades, and adding devices. If it is not running on your hardware after setup, the payment is refunded in full. Founding customers: the first 10. This price stays locked for future upgrades.';

const OFFER_ITEMS: Array<{ title: string; text: string }> = [
  {
    title: 'Live setup',
    text: 'A 60-minute call. We install Boole on up to 3 of your devices, pick and tune the right model for each, and confirm it runs before we hang up.',
  },
  {
    title: 'Private document assistant',
    text: 'Connect your own files (PDFs, notes, docs) so the model answers from them locally, with nothing from those files leaving your machine.',
  },
  {
    title: '30 days of direct support',
    text: 'Fixes, model upgrades, and adding devices, for 30 days.',
  },
  {
    title: 'Guarantee',
    text: 'If it is not running on your hardware after setup, you get a full refund.',
  },
  {
    title: 'Founding price',
    text: 'The first 10 customers. This price stays locked for future upgrades.',
  },
];

export function offerChecklistHtml(opts?: { title?: boolean }): string {
  const title = opts?.title === false ? '' : '<h4 class="gets-title">What you get</h4>';
  const items = OFFER_ITEMS.map((item, i) => {
    const n = String(i + 1).padStart(2, '0');
    return `<li><span class="n">${n}</span><span><strong>${item.title}.</strong> ${item.text}</span></li>`;
  }).join('');
  return `${title}<ol class="gets">${items}</ol>`;
}
