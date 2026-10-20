#!/bin/sh
# macOS setup check for the published Boole CLI. Does not vendor the CLI.
set -eu
echo "Boole setup (macOS)"
uname -sm
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20 or newer is required. https://nodejs.org/"
  exit 1
fi
major=$(node -p "process.versions.node.split('.')[0]")
echo "Node $(node -v)"
if [ "$major" -lt 20 ]; then
  echo "Node.js 20 or newer is required. node-llama-cpp 3.22.2 documents engines >=20."
  exit 1
fi
echo "Running boole doctor via npx. This contacts the npm registry."
npx --yes @boole/cli doctor
echo
echo "Commands that exist: boole doctor, boole pull, boole run, boole models."
echo "boole serve and boole list are not implemented."
echo "Device notes: https://boole.sh/guides/"
