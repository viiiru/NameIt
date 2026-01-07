@echo off
echo ========================================
echo NameIt Server for Phone Hotspot
echo ========================================
echo.
echo Make sure your computer is connected to your phone's hotspot!
echo.
echo Starting server...
echo.
echo Your IP address on hotspot:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "ip=%%a"
    setlocal enabledelayedexpansion
    set "ip=!ip:~1!"
    echo    http://!ip!:8000
    endlocal
    goto :found
)
:found
echo.
echo ========================================
echo IMPORTANT:
echo ========================================
echo 1. Keep this window open!
echo 2. On your phone, open browser
echo 3. Go to the URL above
echo 4. The game should load!
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
python -m http.server 8000 --bind 0.0.0.0
