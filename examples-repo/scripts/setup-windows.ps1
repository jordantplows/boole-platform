# Windows setup check for the published Boole CLI. Does not vendor the CLI.
$ErrorActionPreference = 'Stop'
Write-Host "Boole setup (Windows)"
Write-Host ("{0} {1}" -f $env:OS, $env:PROCESSOR_ARCHITECTURE)
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js 20 or newer is required. https://nodejs.org/"
  exit 1
}
$major = [int](node -p "process.versions.node.split('.')[0]")
Write-Host ("Node " + (node -v))
if ($major -lt 20) {
  Write-Host "Node.js 20 or newer is required. node-llama-cpp 3.22.2 documents engines >=20."
  exit 1
}
Write-Host "Running boole doctor via npx. This contacts the npm registry."
npx --yes @boole/cli doctor
Write-Host ""
Write-Host "Commands that exist: boole doctor, boole pull, boole run, boole models."
Write-Host "boole serve and boole list are not implemented."
Write-Host "x64 notes: https://boole.sh/guides/windows-x64/"
Write-Host "arm64 notes: https://boole.sh/guides/windows-arm64/"
