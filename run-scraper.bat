@echo off
title Yellowpages.com Scraper
color 0A

echo.
echo ========================================
echo    Yellowpages.com Business Scraper
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installation, restart this batch file.
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

:: Check if Chrome is installed
if not exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    if not exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
        echo WARNING: Google Chrome not found in default location
        echo The scraper may not work properly without Chrome installed.
        echo.
        echo Please install Google Chrome from: https://www.google.com/chrome/
        echo.
        pause
    )
)

echo Starting Yellowpages.com Scraper...
echo.
echo Note: This will open an interactive menu to configure your scraping session.
echo Make sure you have a stable internet connection.
echo.
pause

:: Run the scraper
node main.js

:: Check if the scraper ran successfully
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    Scraping completed successfully!
    echo ========================================
    echo.
    echo Check the project folder for your results.
    echo.
) else (
    echo.
    echo ========================================
    echo    Scraping encountered an error
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo If the problem persists, try:
    echo 1. Checking your internet connection
    echo 2. Verifying Chrome is installed
    echo 3. Running as administrator if needed
    echo.
)

pause 