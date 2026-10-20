#!/bin/sh
# macOS setup check for the published Boole CLI. Does not vendor the CLI.
set -eu
echo "Boole setup (macOS)"
uname -sm
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22 or newer is required. https://nodejs.org/ or: brew install node@22"
  exit 1
fi
major=$(node -p "process.versions.node.split('.')[0]")
echo "Node $(node -v)"
if [ "$major" -lt 22 ]; then
  echo "Node.js 22 or newer is required. https://nodejs.org/ or: brew install node@22"
  exit 1
fi
echo "Running boole doctor via npx. This contacts the npm registry."
npx --yes @boole/cli doctor
echo
echo "Next:"
echo "  npx @boole/cli pull bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M"
echo "  npx @boole/cli run bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M --prompt \"Say hello\""
echo "npx @boole/cli list prints downloaded models."
echo "npx @boole/cli serve is local development only, with no authentication, and accepts POST /generate."
echo "Device notes: https://boole.sh/guides/"
