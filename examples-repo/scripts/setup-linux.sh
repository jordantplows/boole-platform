#!/bin/sh
# Linux setup check for the published Boole CLI. Does not vendor the CLI.
set -eu
echo "Boole setup (Linux)"
uname -sm
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22 or newer is required. https://nodejs.org/"
  exit 1
fi
major=$(node -p "process.versions.node.split('.')[0]")
echo "Node $(node -v)"
if [ "$major" -lt 22 ]; then
  echo "Node.js 22 or newer is required. https://nodejs.org/ or a distro package that reports 22 or newer."
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
echo "x64 CUDA/Vulkan notes: https://boole.sh/guides/linux-x64/"
echo "arm64 CPU notes, including 64-bit Raspberry Pi-class boards: https://boole.sh/guides/linux-arm64/"
