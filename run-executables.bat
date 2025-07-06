@echo off
title Yellowpages Scraper - Executable Launcher
color 0A

echo.
echo ========================================
echo    YELLOWPAGES SCRAPER EXECUTABLES
echo ========================================
echo.
echo Choose which version to run:
echo.
echo [1] GUI Application (Recommended)
echo     - Full graphical interface
echo     - Professional Windows app
echo     - Easy to use
echo.
echo [2] Portable Command-Line Version
echo     - No installation required
echo     - Command-line interface
echo     - Portable and self-contained
echo.
echo [3] Exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto gui
if "%choice%"=="2" goto portable
if "%choice%"=="3" goto exit
echo Invalid choice. Please try again.
pause
goto :eof

:gui
echo.
echo Starting GUI Application...
echo.
if exist "dist\Yellowpages Scraper Setup 1.0.0.exe" (
    echo Found GUI installer. Running...
    start "" "dist\Yellowpages Scraper Setup 1.0.0.exe"
) else (
    echo GUI installer not found in dist folder.
    echo Please run: npm run build-gui
    pause
)
goto :eof

:portable
echo.
echo Starting Portable Version...
echo.
if exist "yellowpages-scraper-portable.exe" (
    echo Found portable executable. Running...
    start "" "yellowpages-scraper-portable.exe"
) else (
    echo Portable executable not found.
    echo Please run: npm run build-portable
    pause
)
goto :eof

:exit
echo.
echo Goodbye!
timeout /t 2 >nul
exit 