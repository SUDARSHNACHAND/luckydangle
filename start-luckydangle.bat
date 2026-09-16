@echo off
setlocal enabledelayedexpansion
title Lucky Dangle Launcher
cd /d "%~dp0"

:: 1. Verify Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [Lucky Dangle ERROR] Node.js is not found on your Windows system!
    echo Please install Node.js v18 or higher from https://nodejs.org/ to run Lucky Dangle.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: 2. Auto-setup dependencies if missing
if not exist "%~dp0node_modules\electron" (
    echo [Lucky Dangle INFO] Installing dependencies for first-time launch...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [Lucky Dangle ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b 1
    )
)

:: 3. Auto-compile production assets if missing
if not exist "%~dp0dist\overlay.html" (
    echo [Lucky Dangle INFO] Compiling Lucky Dangle production bundle...
    call npm run build
)

:: 4. Launch Electron cleanly in detached mode
set "ELECTRON_BIN=%~dp0node_modules\electron\dist\electron.exe"
if exist "%ELECTRON_BIN%" (
    start "" "%ELECTRON_BIN%" "%~dp0electron\main.cjs"
) else (
    start "" npx electron "%~dp0electron\main.cjs"
)

exit
