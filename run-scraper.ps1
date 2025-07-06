# Yellowpages.com Scraper - PowerShell Launcher
# This script provides a modern Windows interface for running the scraper

param(
    [switch]$Silent,
    [switch]$Help
)

# Function to display help
function Show-Help {
    Write-Host @"
Yellowpages.com Scraper - PowerShell Launcher

Usage:
    .\run-scraper.ps1              # Run with interactive prompts
    .\run-scraper.ps1 -Silent      # Run without prompts
    .\run-scraper.ps1 -Help        # Show this help

Features:
    - Automatic dependency checking and installation
    - Chrome browser detection
    - Error handling and user feedback
    - Project folder organization
    - Comprehensive logging

Requirements:
    - Node.js (v14 or higher)
    - Google Chrome browser
    - Internet connection

"@ -ForegroundColor Cyan
}

# Show help if requested
if ($Help) {
    Show-Help
    exit 0
}

# Set console title and colors
$Host.UI.RawUI.WindowTitle = "Yellowpages.com Scraper"
$Host.UI.RawUI.ForegroundColor = "Green"

# Display header
Write-Host @"

========================================
    Yellowpages.com Business Scraper
========================================

"@ -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Host "✓ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installation, restart this script." -ForegroundColor Yellow
    if (-not $Silent) {
        Read-Host "Press Enter to exit"
    }
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed"
        }
        Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ ERROR: Failed to install dependencies" -ForegroundColor Red
        if (-not $Silent) {
            Read-Host "Press Enter to exit"
        }
        exit 1
    }
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

# Check if Chrome is installed
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

$chromeFound = $false
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        Write-Host "✓ Google Chrome detected" -ForegroundColor Green
        $chromeFound = $true
        break
    }
}

if (-not $chromeFound) {
    Write-Host "⚠️  WARNING: Google Chrome not found in default locations" -ForegroundColor Yellow
    Write-Host "The scraper may not work properly without Chrome installed." -ForegroundColor Yellow
    Write-Host "Please install Google Chrome from: https://www.google.com/chrome/" -ForegroundColor Yellow
    if (-not $Silent) {
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            exit 0
        }
    }
}

# Display startup information
Write-Host @"

🚀 Starting Yellowpages.com Scraper...

Note: This will open an interactive menu to configure your scraping session.
Make sure you have a stable internet connection.

"@ -ForegroundColor Cyan

if (-not $Silent) {
    Read-Host "Press Enter to continue"
}

# Run the scraper
Write-Host "🔄 Running scraper..." -ForegroundColor Yellow
try {
    node main.js
    $exitCode = $LASTEXITCODE
} catch {
    Write-Host "❌ ERROR: Failed to run scraper" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    $exitCode = 1
}

# Display results
if ($exitCode -eq 0) {
    Write-Host @"

========================================
    Scraping completed successfully!
========================================

Check the project folder for your results.

"@ -ForegroundColor Green
} else {
    Write-Host @"

========================================
    Scraping encountered an error
========================================

Please check the error messages above.
If the problem persists, try:
1. Checking your internet connection
2. Verifying Chrome is installed
3. Running as administrator if needed

"@ -ForegroundColor Red
}

if (-not $Silent) {
    Read-Host "Press Enter to exit"
} 