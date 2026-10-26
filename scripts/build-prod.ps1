#
# build-prod.ps1
# ============================================
# Production build script for Wapsell Landing (Windows/PowerShell)
# Optimized for Hetzner VPS deployment
#
# Usage:
#   .\scripts\build-prod.ps1
#   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser (if needed)
#
# Requirements:
#   - Node.js 20+
#   - npm 10+
#   - PowerShell 5.1+
#
# Output:
#   - .next/standalone/ — Self-contained app
#   - .next/static/     — Static assets
#   - public/           — Public files
#   - build-manifest.json — Build metadata
#
# Notes:
#   - Runs linting & type checking
#   - Validates standalone output
#   - Reports build metrics
#   - Suitable for CI/CD pipelines
# ============================================

param(
  [switch]$SkipLint = $false,
  [switch]$SkipTypeCheck = $false,
  [switch]$OnlyBuild = $false
)

$ErrorActionPreference = "Stop"

# ===== COLOR OUTPUT FUNCTIONS =====

function Write-Info {
  param([string]$Message)
  Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Write-Success {
  param([string]$Message)
  Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
  param([string]$Message)
  Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
  param([string]$Message)
  Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Header {
  param([string]$Title)
  Write-Host ""
  Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host "  $Title" -ForegroundColor Cyan
  Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host ""
}

# ===== MAIN BUILD PROCESS =====

Print-Header "WAPSELL PRODUCTION BUILD"

# Step 1: Verify environment
Write-Info "Checking environment..."

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js not found. Please install Node.js 20+."
  exit 1
}

$nodeVersion = node --version
Write-Success "Node.js: $nodeVersion"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm not found."
  exit 1
}

$npmVersion = npm --version
Write-Success "npm: $npmVersion"

# Step 2: Clean previous build (unless -OnlyBuild)
if (-not $OnlyBuild) {
  Write-Info "Cleaning previous build artifacts..."
  if (Test-Path ".next") { Remove-Item -Recurse -Force .next | Out-Null }
  if (Test-Path ".turbo") { Remove-Item -Recurse -Force .turbo | Out-Null }
  Write-Success "Cleaned .next and .turbo directories"

  # Step 3: Install dependencies
  Print-Header "INSTALLING DEPENDENCIES"

  Write-Info "Installing npm dependencies (production mode)..."
  npm ci --omit=dev
  if ($LASTEXITCODE -ne 0) {
    Write-Error "npm ci failed"
    exit 1
  }
  Write-Success "Dependencies installed"

  # Step 4: Type checking
  if (-not $SkipTypeCheck) {
    Print-Header "TYPE CHECKING"

    Write-Info "Running TypeScript type checking..."
    npm run type-check
    if ($LASTEXITCODE -ne 0) {
      Write-Error "Type check failed"
      exit 1
    }
    Write-Success "Type check passed"
  }

  # Step 5: Linting
  if (-not $SkipLint) {
    Print-Header "LINTING"

    Write-Info "Running ESLint..."
    npm run lint
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "Linting produced warnings (non-fatal)"
    } else {
      Write-Success "Linting passed"
    }
  }
}

# Step 6: Build
Print-Header "BUILDING"

Write-Info "Building Next.js application..."
$startTime = Get-Date

npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Error "Build failed"
  exit 1
}

$endTime = Get-Date
$buildTime = [Math]::Round(($endTime - $startTime).TotalSeconds)
Write-Success "Build completed in ${buildTime}s"

# Step 7: Validate standalone output
Print-Header "VALIDATING BUILD"

if (-not (Test-Path ".next/standalone")) {
  Write-Error "Standalone output not found at .next/standalone"
  exit 1
}
Write-Success "Standalone output verified"

if (-not (Test-Path ".next/standalone/server.js")) {
  Write-Error "server.js not found in standalone output"
  exit 1
}
Write-Success "server.js found"

# Step 8: Calculate build sizes
Print-Header "BUILD METRICS"

function Get-DirectorySizeMB {
  param([string]$Path)
  if (Test-Path $Path) {
    $size = (Get-ChildItem -Path $Path -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    return [Math]::Round($size, 1)
  }
  return 0
}

$nextSizeMB = Get-DirectorySizeMB ".next"
$staticSizeMB = Get-DirectorySizeMB ".next/static"
$standaloneSizeMB = Get-DirectorySizeMB ".next/standalone"

Write-Host "Build artifact sizes:"
Write-Host "  .next folder:              ${nextSizeMB}MB"
Write-Host "  .next/static/ (assets):    ${staticSizeMB}MB"
Write-Host "  .next/standalone/ (app):   ${standaloneSizeMB}MB"

# Check if build is within acceptable size
if ($nextSizeMB -gt 500) {
  Write-Warning "Build size exceeds 500 MB: ${nextSizeMB}MB"
} else {
  Write-Success "Build size acceptable: ${nextSizeMB}MB"
}

# Step 9: Verify output structure
Print-Header "OUTPUT VERIFICATION"

Write-Host "Checking required output directories:"

$requiredDirs = @(
  ".next/standalone",
  ".next/static/chunks",
  ".next/static/_next"
)

foreach ($dir in $requiredDirs) {
  if (Test-Path $dir) {
    Write-Host "  ✓ $dir"
  } else {
    Write-Error "Missing directory: $dir"
    exit 1
  }
}

# Step 10: Success summary
Print-Header "BUILD SUCCESSFUL"

Write-Host ""
Write-Host "Build summary:"
Write-Host "  Timestamp:        $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "  Build time:       ${buildTime}s"
Write-Host "  Output size:      ${nextSizeMB}MB"
Write-Host "  Standalone size:  ${standaloneSizeMB}MB"
Write-Host ""
Write-Host "Ready for deployment:"
Write-Host "  1. Upload .next/standalone/ to Hetzner VPS"
Write-Host "  2. Copy public/ directory"
Write-Host "  3. Set NODE_ENV=production"
Write-Host "  4. Run: node .next/standalone/server.js"
Write-Host ""
Write-Success "Production build ready!"

# Create build manifest
$manifest = @{
  buildTime = Get-Date -Format 'o'
  buildDuration = "${buildTime}s"
  nodeVersion = $nodeVersion
  npmVersion = $npmVersion
  nextSize = "${nextSizeMB}MB"
  standaloneSize = "${standaloneSizeMB}MB"
  buildStatus = "success"
} | ConvertTo-Json

$manifest | Out-File -FilePath "build-manifest.json" -Encoding UTF8
Write-Success "Build manifest created: build-manifest.json"
