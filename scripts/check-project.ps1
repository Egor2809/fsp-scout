param([switch]$Install)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskOriginalDirectory = Get-Location
$taskOriginalDatabaseUrl = $env:DATABASE_URL
function Invoke-NpmCheck {
    param([string[]]$Arguments)
    & npm @Arguments
    if ($LASTEXITCODE -ne 0) { throw "npm $($Arguments -join ' ') failed ($LASTEXITCODE)" }
}
try {
    Set-Location -LiteralPath (Join-Path $taskRoot 'backend')
    if ($Install) { Invoke-NpmCheck -Arguments @('install', '--ignore-scripts') }
    Invoke-NpmCheck -Arguments @('test')
    Invoke-NpmCheck -Arguments @('run', 'contract:snapshot')
    if (-not (Test-Path -LiteralPath 'node_modules/.bin/prisma.cmd')) {
        throw 'Backend dependencies missing. Run this script with -Install in an environment with registry access.'
    }
    if (-not $env:DATABASE_URL) { $env:DATABASE_URL = 'postgresql://scout:unused@localhost:5432/scout' }
    Invoke-NpmCheck -Arguments @('run', 'prisma:generate')
    Invoke-NpmCheck -Arguments @('exec', '--', 'prisma', 'validate')
    Invoke-NpmCheck -Arguments @('run', 'build')
    Set-Location -LiteralPath (Join-Path $taskRoot 'frontend')
    if ($Install) { Invoke-NpmCheck -Arguments @('ci', '--ignore-scripts') }
    Invoke-NpmCheck -Arguments @('run', 'build')
    Write-Output 'Build checks passed. Database migrations, HTTP, Keycloak, Redis, Piston and PDF checks are still separate.'
} finally {
    $env:DATABASE_URL = $taskOriginalDatabaseUrl
    Set-Location -LiteralPath $taskOriginalDirectory
}
