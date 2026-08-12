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
echo [3/3] Launching Aura Native Desktop App...
call npm run electron:dev
pause

