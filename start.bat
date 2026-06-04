
@echo off
echo ========================================
echo AFAR MKOPO FASTA - Starting System...
echo ========================================
echo.

echo Starting Backend Server (port 5000)...
start "AFAR MKOPO Backend" cmd /k "cd /d "%~dp0backend" && node index.js"

timeout /t 2 /nobreak >nul

echo Starting Frontend Server (port 3000)...
start "AFAR MKOPO Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo ========================================
pause
