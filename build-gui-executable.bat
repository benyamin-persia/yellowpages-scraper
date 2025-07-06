@echo off
title Build Yellowpages.com Scraper GUI Executable
color 0B

echo.
echo ========================================
echo   Build GUI Executable
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

:: Check if electron-builder is installed
echo [INFO] Checking electron-builder installation...
npx electron-builder --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing electron-builder...
    npm install electron-builder --save-dev
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install electron-builder
        echo.
        pause
        exit /b 1
    )
)

:: Create dist directory if it doesn't exist
if not exist "dist" (
    echo [INFO] Creating dist directory...
    mkdir dist
)

:: Build the GUI executable
echo [INFO] Building GUI executable...
echo [INFO] This may take several minutes...
echo.

npm run build-gui

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to build GUI executable
    echo [INFO] Please check the error messages above
    echo.
    pause
    exit /b 1
)

:: Check if build was successful
if exist "dist\Yellowpages Scraper Setup.exe" (
    echo.
    echo [SUCCESS] GUI executable built successfully!
    echo [INFO] Executable location: dist\Yellowpages Scraper Setup.exe
    echo [INFO] File size: 
    for %%A in ("dist\Yellowpages Scraper Setup.exe") do echo [INFO] %%~zA bytes
    echo.
    echo [INFO] You can now distribute this executable to users
    echo [INFO] Users can install it by running the setup file
    echo.
) else (
    echo.
    echo [ERROR] Executable not found in dist directory
    echo [INFO] Please check the build output for errors
    echo.
)

echo [INFO] Build process completed
pause 