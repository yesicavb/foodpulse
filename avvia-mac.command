#!/bin/bash
cd "$(dirname "$0")"
if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js is not installed. Download it from https://nodejs.org (LTS version) and try again."
  read -p "Press Enter to close"
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "Installing dependencies (first time only)..."
  npm install
fi
echo "Starting the app at http://localhost:3000 ..."
(sleep 6 && open http://localhost:3000) &
npm run dev
