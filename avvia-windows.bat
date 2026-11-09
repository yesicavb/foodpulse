@echo off
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Download it from https://nodejs.org ^(LTS version^) and try again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing dependencies ^(first time only^)...
  call npm install
)
echo Starting the app at http://localhost:3000 ...
start "" http://localhost:3000
call npm run dev
pause
