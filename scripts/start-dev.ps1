<#
Start-dev.ps1

PowerShell helper to start a local dev environment for NepaliLove.
- Starts a local Postgres Docker container named `nepali-postgres` (if Docker is available)
- Loads environment variables from `.env` (if present)
- Runs `npm run db:push` to apply migrations
- Runs `npm run dev` to start the app (server + Vite in dev mode)

Usage:
  .\scripts\start-dev.ps1          # start container (if Docker) and app
  .\scripts\start-dev.ps1 --no-docker  # skip Docker, assume DATABASE_URL already set
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Load-DotEnv {
  if (Test-Path .env) {
    Write-Host "Loading .env..."
    Get-Content .env | ForEach-Object {
      $_ = $_.Trim()
      if (-not $_ -or $_.StartsWith('#')) { return }
      if ($_ -match '^\s*([^=]+)=(.*)$') {
         $k = $matches[1].Trim()
         $v = $matches[2].Trim()
         # Remove surrounding quotes
         if ($v.StartsWith('"') -and $v.EndsWith('"')) { $v = $v.Substring(1,$v.Length-2) }
         if ($v.StartsWith("'") -and $v.EndsWith("'")) { $v = $v.Substring(1,$v.Length-2) }
         Write-Host "Setting $k from .env"
         $env:$k = $v
      }
    }
  } else {
    Write-Host ".env not found; make sure to set env vars or create .env based on .env.example"
  }
}

function Ensure-Docker {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Warning "Docker is not installed or not in PATH. Install Docker Desktop or start Postgres separately and set DATABASE_URL env var."
    return $false
  }
  return $true
}

function Ensure-PostgresContainer {
  param($ContainerName = 'nepali-postgres')
  $exists = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" | Select-Object -First 1
  if (-not $exists) {
    Write-Host "Creating Postgres container '$ContainerName'..."
    docker run --name $ContainerName -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nepalilove -p 5432:5432 -d postgres:15
  } else {
    $status = docker inspect -f '{{.State.Status}}' $ContainerName
    if ($status -ne 'running') {
       Write-Host "Starting Postgres container '$ContainerName'..."
       docker start $ContainerName
    } else {
       Write-Host "Postgres container is already running."
    }
  }
  # wait for ready
  Write-Host "Waiting for Postgres to be ready..."
  for ($i=0; $i -lt 60; $i++) {
    $logs = docker logs --tail 50 $ContainerName 2>$null
    if ($logs -match 'database system is ready to accept connections') {
      Write-Host "Postgres ready."
      break
    }
    Start-Sleep -Seconds 2
  }
}

# Main
Load-DotEnv

$useDocker = $true
if ($args -contains '--no-docker') { $useDocker = $false }

if ($useDocker) {
  if (Ensure-Docker) {
    Ensure-PostgresContainer
  } else {
    Write-Warning "Skipping Docker steps. Ensure you have DATABASE_URL configured."
  }
}

if (-not $env:DATABASE_URL) {
  Write-Host "Setting default DATABASE_URL to postgres://postgres:postgres@localhost:5432/nepalilove"
  $env:DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/nepalilove'
}

if (-not $env:SESSION_SECRET) {
  Write-Host "Setting default SESSION_SECRET for development"
  $env:SESSION_SECRET = 'testsecret'
}

Write-Host "Applying migrations: npm run db:push"
npm run db:push

Write-Host "Starting dev server: npm run dev"
npm run dev
