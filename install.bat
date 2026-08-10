@echo off
title Aura - Mindful Productivity Setup
color 0A
echo ===================================================
echo     Setting up Aura - Mindful Productivity
echo ===================================================
echo.

echo [1/3] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies. Please check node installation.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Building production bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Launching Aura App...
echo Opening http://localhost:4173 in your default browser...
start http://localhost:4173
echo.
echo Press Ctrl+C in this window to stop the server when done.
call npx serve dist -p 4173
pause
