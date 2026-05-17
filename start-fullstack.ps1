# DevDay AI - Full Stack Startup Script
# This script starts both backend and frontend in separate terminals

param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$ResetDb
)

$ErrorActionPreference = "Stop"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  DevDay AI - Full Stack Startup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "[1/5] Checking Docker..." -ForegroundColor Yellow
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and wait until it says 'Running'" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Start PostgreSQL
Write-Host "[2/5] Starting PostgreSQL..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\Backend"

if ($ResetDb) {
    Write-Host "⚠️  Resetting database (deleting all data)..." -ForegroundColor Yellow
    docker compose down -v
    Start-Sleep -Seconds 2
}

docker compose up -d
Start-Sleep -Seconds 3

# Verify PostgreSQL is healthy
$maxRetries = 10
$retryCount = 0
$healthy = $false

while ($retryCount -lt $maxRetries -and -not $healthy) {
    $status = docker compose ps --format json | ConvertFrom-Json
    if ($status.Health -eq "healthy" -or $status.State -eq "running") {
        $healthy = $true
    } else {
        $retryCount++
        Write-Host "Waiting for PostgreSQL to be ready... ($retryCount/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $healthy) {
    Write-Host "❌ PostgreSQL failed to start" -ForegroundColor Red
    docker compose logs
    exit 1
}

Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green
Write-Host ""

# Start Backend
if (-not $SkipBackend) {
    Write-Host "[3/5] Starting Backend..." -ForegroundColor Yellow
    Write-Host "Opening new terminal for backend..." -ForegroundColor Gray
    
    $backendScript = @"
Set-Location '$PSScriptRoot\Backend'
Write-Host '=====================================' -ForegroundColor Cyan
Write-Host '  DevDay AI Backend' -ForegroundColor Cyan
Write-Host '=====================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Starting Spring Boot application...' -ForegroundColor Yellow
Write-Host 'API will be available at: http://localhost:8080/api' -ForegroundColor Green
Write-Host ''
.\run-dev.ps1
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
    Write-Host "✅ Backend terminal opened" -ForegroundColor Green
    Write-Host "   Waiting for backend to start (this may take 30-60 seconds)..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
} else {
    Write-Host "[3/5] Skipping Backend (--SkipBackend flag)" -ForegroundColor Gray
}
Write-Host ""

# Start Frontend
if (-not $SkipFrontend) {
    Write-Host "[4/5] Starting Frontend..." -ForegroundColor Yellow
    Write-Host "Opening new terminal for frontend..." -ForegroundColor Gray
    
    $frontendScript = @"
Set-Location '$PSScriptRoot\frontend'
Write-Host '=====================================' -ForegroundColor Cyan
Write-Host '  DevDay AI Frontend' -ForegroundColor Cyan
Write-Host '=====================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Starting Next.js development server...' -ForegroundColor Yellow
Write-Host 'Frontend will be available at: http://localhost:3000' -ForegroundColor Green
Write-Host ''
npm run dev
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
    Write-Host "✅ Frontend terminal opened" -ForegroundColor Green
    Write-Host "   Waiting for frontend to start..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
} else {
    Write-Host "[4/5] Skipping Frontend (--SkipFrontend flag)" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "[5/5] Startup Complete!" -ForegroundColor Yellow
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  🚀 DevDay AI is Starting Up!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  📊 PostgreSQL:  localhost:5432" -ForegroundColor White
Write-Host "  🔧 Backend API: http://localhost:8080/api" -ForegroundColor White
Write-Host "  🌐 Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Cyan
Write-Host "  Email:    demo@devday.ai" -ForegroundColor White
Write-Host "  Password: demo123" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Wait for backend to fully start (watch backend terminal)" -ForegroundColor White
Write-Host "  2. Wait for frontend to compile (watch frontend terminal)" -ForegroundColor White
Write-Host "  3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "  4. Login with demo credentials" -ForegroundColor White
Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Cyan
Write-Host "  - Backend logs: Backend/logs/devday-ai.log" -ForegroundColor White
Write-Host "  - Reset database: .\start-fullstack.ps1 -ResetDb" -ForegroundColor White
Write-Host "  - Check health: curl http://localhost:8080/api/actuator/health" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each terminal to stop services" -ForegroundColor Yellow
Write-Host ""

# Made with Bob
