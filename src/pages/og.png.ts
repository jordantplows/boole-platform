import type { APIRoute } from 'astro';
import sharp from 'sharp';

export const GET: APIRoute = async () => {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#161618"/>
    <text x="100" y="260" font-family="monospace" font-size="64" font-weight="700" fill="#e8e6e3">boole</text>
    <text x="100" y="330" font-family="sans-serif" font-size="26" fill="#929290">Local LLM inference for JavaScript</text>
    <text x="100" y="400" font-family="monospace" font-size="20" fill="#e8862f">$ npx @boole/cli</text>
  </svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
