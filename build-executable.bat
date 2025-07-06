@echo off
title Build Yellowpages Scraper Executable
color 0B

echo.
echo ========================================
echo    Building Yellowpages Scraper EXE
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

:: Install pkg globally if not already installed
echo Checking for pkg...
pkg --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing pkg globally...
    npm install -g pkg
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install pkg
        pause
        exit /b 1
    )
    echo pkg installed successfully!
) else (
    echo pkg is already installed
)

:: Install project dependencies
echo.
echo Installing project dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install project dependencies
    pause
    exit /b 1
)

:: Build the executable
echo.
echo Building executable...
echo This may take a few minutes...
echo.

pkg . --targets node18-win-x64 --output yellowpages-scraper.exe

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    Build completed successfully!
    echo ========================================
    echo.
    echo Executable created: yellowpages-scraper.exe
    echo.
    echo You can now run the scraper by double-clicking:
    echo yellowpages-scraper.exe
    echo.
    echo Note: The executable requires Chrome to be installed.
    echo.
) else (
    echo.
    echo ========================================
    echo    Build failed!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause 