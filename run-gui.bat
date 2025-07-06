@echo off
title Yellowpages.com Scraper GUI
color 0A

echo.
echo ========================================
echo   Yellowpages.com Scraper GUI Launcher
echo ========================================
echo.

:: Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo [INFO] Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if npm is available
echo [INFO] Checking npm availability...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not available
    echo [INFO] Please ensure npm is properly installed
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
echo [INFO] Checking dependencies...
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        echo.
        pause
        exit /b 1
    )
)

:: Check if Electron is installed
echo [INFO] Checking Electron installation...
npx electron --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing Electron...
    npm install electron --save-dev
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Electron
        echo.
        pause
        exit /b 1
    )
)

:: Launch the GUI application
echo [INFO] Starting Yellowpages.com Scraper GUI...
echo [INFO] Please wait while the application loads...
echo.

npm run gui

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start GUI application
    echo [INFO] Please check the error messages above
    echo.
    pause
    exit /b 1
)

echo.
echo [INFO] GUI application closed
pause 