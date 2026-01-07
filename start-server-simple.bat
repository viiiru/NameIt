@echo off
echo ========================================
echo NameIt Game Server
echo ========================================
echo.
echo Starting server on port 8000...
echo.
echo Your IP address:
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
echo Server is starting...
echo Press Ctrl+C to stop the server
echo.
echo IMPORTANT: Keep this window open!
echo.
python -m http.server 8000
