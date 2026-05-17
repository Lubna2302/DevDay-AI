# DevDay AI Backend - local run helper (Windows)
# Usage: .\run-dev.ps1          # start app (Postgres must be running)
#        .\run-dev.ps1 -DbOnly  # start Postgres only

param([switch]$DbOnly)

$ErrorActionPreference = "Stop"

$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$mavenBin = "$env:USERPROFILE\dev-tools\apache-maven-3.9.9\bin"

if (-not (Test-Path $javaHome)) {
    Write-Host "Java 17 not found at: $javaHome" -ForegroundColor Red
    Write-Host "Install: winget install -e --id EclipseAdoptium.Temurin.17.JDK"
    exit 1
}

if (-not (Test-Path "$mavenBin\mvn.cmd")) {
    Write-Host "Maven not found at: $mavenBin" -ForegroundColor Red
    Write-Host "Run INSTALL_PREREQUISITES.md or download Maven to dev-tools."
    exit 1
}

$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$mavenBin;" + [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")

Set-Location $PSScriptRoot

Write-Host "Java:" -ForegroundColor Cyan
java -version

if ($DbOnly) {
    Write-Host "`nStarting PostgreSQL (Docker)..." -ForegroundColor Cyan
    docker compose up -d
    docker compose ps
    exit 0
}

Write-Host "`nChecking Docker..." -ForegroundColor Cyan
docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not running. Start Docker Desktop, wait until it says Running, then run:" -ForegroundColor Yellow
    Write-Host "  .\run-dev.ps1 -DbOnly" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting PostgreSQL..." -ForegroundColor Cyan
docker compose up -d

Write-Host "Building project..." -ForegroundColor Cyan
mvn clean package -DskipTests -q

Write-Host "Starting Spring Boot..." -ForegroundColor Cyan
mvn spring-boot:run
