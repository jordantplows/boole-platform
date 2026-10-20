# Windows setup check for the published Boole CLI. Does not vendor the CLI.
$ErrorActionPreference = 'Stop'
Write-Host "Boole setup (Windows)"
Write-Host ("{0} {1}" -f $env:OS, $env:PROCESSOR_ARCHITECTURE)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js 22 or newer is required. https://nodejs.org/ or: winget install OpenJS.NodeJS.LTS"
  exit 1
}
$major = [int](node -p "process.versions.node.split('.')[0]")
Write-Host ("Node " + (node -v))
if ($major -lt 22) {
  Write-Host "Node.js 22 or newer is required. Confirm node -v is 22 or higher. https://nodejs.org/"
  exit 1
}
Write-Host "Running boole doctor via npx. This contacts the npm registry."
npx --yes @boole/cli doctor
Write-Host ""
Write-Host "Next:"
Write-Host '  npx @boole/cli pull bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M'
Write-Host '  npx @boole/cli run bartowski/SmolLM2-135M-Instruct-GGUF:Q4_K_M --prompt "Say hello"'
Write-Host "npx @boole/cli list prints downloaded models."
Write-Host "npx @boole/cli serve is local development only, with no authentication, and accepts POST /generate."
Write-Host "x64 notes: https://boole.sh/guides/windows-x64/"
Write-Host "arm64 notes: https://boole.sh/guides/windows-arm64/"
