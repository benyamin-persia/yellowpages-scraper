# Yellowpages.com Scraper GUI Launcher
# PowerShell Script

param(
    [switch]$Dev
)

# Set console title and color
$Host.UI.RawUI.WindowTitle = "Yellowpages.com Scraper GUI"
$Host.UI.RawUI.ForegroundColor = "Green"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Yellowpages.com Scraper GUI Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check if Node.js is installed
Write-Host "[INFO] Checking Node.js installation..." -ForegroundColor Yellow
if (-not (Test-Command "node")) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "[INFO] Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
Write-Host "[INFO] Checking npm availability..." -ForegroundColor Yellow
if (-not (Test-Command "npm")) {
    Write-Host "[ERROR] npm is not available" -ForegroundColor Red
    Write-Host "[INFO] Please ensure npm is properly installed" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if dependencies are installed
Write-Host "[INFO] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check if Electron is installed
Write-Host "[INFO] Checking Electron installation..." -ForegroundColor Yellow
try {
    $null = npx electron --version 2>$null
} catch {
    Write-Host "[INFO] Installing Electron..." -ForegroundColor Yellow
    npm install electron --save-dev
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install Electron" -ForegroundColor Red
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Launch the GUI application
Write-Host "[INFO] Starting Yellowpages.com Scraper GUI..." -ForegroundColor Yellow
Write-Host "[INFO] Please wait while the application loads..." -ForegroundColor Yellow
Write-Host ""

if ($Dev) {
    npm run gui-dev
} else {
    npm run gui
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Failed to start GUI application" -ForegroundColor Red
    Write-Host "[INFO] Please check the error messages above" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[INFO] GUI application closed" -ForegroundColor Green
Read-Host "Press Enter to exit" 