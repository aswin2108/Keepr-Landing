@echo off
echo ==========================================
echo   Keepr Project Repair Tool
echo ==========================================
echo.
echo [1/3] Stopping any running node processes...
taskkill /F /IM node.exe >nul 2>&1
echo.
echo [2/3] Installing missing dependencies (three, firebase)...
call npm install three firebase
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Installation failed. Please check your internet connection.
    pause
    exit /b %errorlevel%
)
echo.
echo [3/3] Restarting Development Server...
echo.
echo Your Keepr site is ready!
echo Open http://localhost:3000 in your browser.
echo.
npm run dev
