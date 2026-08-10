#!/usr/bin/env bash

echo "==================================================="
echo "    Setting up Aura - Mindful Productivity"
echo "==================================================="
echo ""

echo "[1/3] Installing dependencies..."
npm install

echo ""
echo "[2/3] Building production bundle..."
npm run build

echo ""
echo "[3/3] Launching Aura App..."
echo "Opening http://localhost:4173 in your default browser..."

if command -v open >/dev/null; then
    open http://localhost:4173
elif command -v xdg-open >/dev/null; then
    xdg-open http://localhost:4173
fi

echo ""
echo "Press Ctrl+C to stop the server when done."
npx serve dist -p 4173
