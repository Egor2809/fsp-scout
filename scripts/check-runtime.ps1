param([int]$TimeoutSeconds = 90)
$ErrorActionPreference = 'Stop'
if ($TimeoutSeconds -lt 1 -or $TimeoutSeconds -gt 600) { throw 'TimeoutSeconds must be between 1 and 600.' }
$taskRoot = Split-Path -Parent $PSScriptRoot
$composeArguments = @('compose', '--env-file', (Join-Path $taskRoot 'infra/.env'), '-f', (Join-Path $taskRoot 'infra/compose.yaml'))
& docker @composeArguments ps --all
if ($LASTEXITCODE -ne 0) { throw 'Docker is unavailable. Run this script in your local PowerShell with Docker Desktop running.' }
$deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
$ready = $false
do {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:8000/api/v1/ready' -TimeoutSec 3
        $ready = $response.StatusCode -eq 200
    } catch { $ready = $false }
    if (-not $ready -and [DateTime]::UtcNow -lt $deadline) { Start-Sleep -Seconds 2 }
} while (-not $ready -and [DateTime]::UtcNow -lt $deadline)
if (-not $ready) { throw 'API readiness failed. Inspect local logs: docker compose --env-file infra/.env -f infra/compose.yaml logs --tail 100 api migrate worker' }
foreach ($service in @('postgres', 'redis', 'keycloak', 'api', 'worker')) {
    $containerId = & docker @composeArguments ps --status running --quiet $service
    if ($LASTEXITCODE -ne 0 -or -not $containerId) { throw "Required service is not running: $service" }
}
$migrationId = & docker @composeArguments ps --all --quiet migrate
if ($LASTEXITCODE -ne 0 -or -not $migrationId) { throw 'Migration container is missing.' }
$migrationState = & docker inspect --format '{{.State.Status}} {{.State.ExitCode}}' $migrationId
if ($LASTEXITCODE -ne 0 -or $migrationState -ne 'exited 0') { throw 'Database migrations did not complete successfully.' }
$realm = Invoke-RestMethod -Uri 'http://localhost:8080/realms/scout/.well-known/openid-configuration' -TimeoutSec 5
if ($realm.issuer -ne 'http://localhost:8080/realms/scout') { throw 'Keycloak scout issuer is unavailable or does not match API configuration.' }
Write-Output 'Runtime checks passed: required containers running, migrations exited 0, API ready (database/Redis), Keycloak scout discovery available.'
Write-Output 'Candidate/employer flows, code execution and PDF output still require end-to-end checks. Frontend is started separately.'
