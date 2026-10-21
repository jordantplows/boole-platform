import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { createServer } from 'node:http';
import sharp from 'sharp';
import { sitePages } from './src/guides.ts';
import { homePage } from './src/home.ts';

const DIST = 'dist';
const SITE = 'https://boole.sh';
const PORT = 4321;

const REDIRECTS: Record<string, string> = {
  '/ollama-alternative': '/on-premise/',
  '/ollama-alternative/': '/on-premise/',
  '/compare/ollama-lm-studio-llama-cpp': '/compare/',
  '/compare/ollama-lm-studio-llama-cpp/': '/compare/',
};

if (existsSync(DIST)) rmSync(DIST, { recursive: true });
mkdirSync(DIST, { recursive: true });

const css = readFileSync('src/styles/global.css', 'utf-8');
const html = homePage(css);
const pages = sitePages(css);

writeFileSync(join(DIST, 'index.html'), html);

for (const page of pages) {
  const filePath = join(DIST, page.file);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, page.html);
}

const ogSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#090909"/>
  <text x="88" y="200" font-family="Liberation Sans, DejaVu Sans, sans-serif" font-size="22" letter-spacing="5" fill="#9b9892">BOOLE AI, INC.</text>
  <text x="88" y="320" font-family="Liberation Sans, DejaVu Sans, sans-serif" font-size="54" font-weight="500" fill="#f4f1ea">Repetitive calls,</text>
  <text x="88" y="400" font-family="Liberation Sans, DejaVu Sans, sans-serif" font-size="54" font-weight="500" fill="#f4f1ea">on hardware you own.</text>
</svg>`;

const ogPng = await sharp(Buffer.from(ogSvg)).png().toBuffer();
writeFileSync(join(DIST, 'og.png'), ogPng);

cpSync('public', DIST, { recursive: true });

const robots = `User-agent: *
Allow: /
Disallow: /welcome/

Sitemap: ${SITE}/sitemap.xml
`;

const sitemapLocs = [`${SITE}/`, ...pages.flatMap((page) => (page.loc ? [page.loc] : []))];
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
    const target = REDIRECTS[url];
    if (target) {
      res.writeHead(301, { Location: target });
      res.end();
      return;
    }
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
