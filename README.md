# boole.sh

Source for [boole.sh](https://boole.sh), the landing page for [boole](https://github.com/bunkerbio/boole) — local LLM inference for JavaScript.

## Prerequisites

- Node.js 18+
- npm

## Development

```sh
npm install
npm start        # builds and serves at http://localhost:4321
```

## Build

```sh
npm run build
```

Outputs static files to `dist/`.

## How the build works

There is no framework — `build.ts` generates everything in a single pass:

1. Reads `src/styles/global.css` and inlines it into a `<style>` tag
2. Reads `src/data/terminal-frames.json` and renders both a static fallback and an animated replay script
3. Generates `og.png` from an inline SVG via sharp
4. Copies everything in `public/` (favicon, install script, `_headers`) into `dist/`

The result is a single `index.html` with zero external requests for CSS or JS.

## Updating content

| What | Where |
|---|---|
| Page copy, commands, features, platform table | `build.ts` — the HTML template starting at line 25 |
| Terminal animation | `src/data/terminal-frames.json` — array of `{ t: text, c?: cssClass, d: delayMs }` |
| Styles | `src/styles/global.css` |
| Favicon, headers, install script | `public/` |

## Project structure

```
build.ts                  # build script + dev server
src/
  data/terminal-frames.json   # terminal animation sequence
  styles/global.css           # all styles (inlined at build)
public/
  favicon.svg
  install                     # curl-pipe installer for @boole/cli
  _headers                    # CDN headers (e.g. Cloudflare Pages)
dist/                         # build output (gitignored or committed)
```
