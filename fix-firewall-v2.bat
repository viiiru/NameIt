@echo off
setlocal enabledelayedexpansion

echo ========================================
echo NameIt Firewall Configuration v2
echo ========================================
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Right-click this file and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo [1/3] Removing old firewall rules...
netsh advfirewall firewall delete rule name="Python HTTP Server" >nul 2>&1
netsh advfirewall firewall delete rule name="Python HTTP Server Port 8000" >nul 2>&1
echo    Done.

echo.
echo [2/3] Adding new firewall rule for port 8000...
netsh advfirewall firewall add rule name="Python HTTP Server Port 8000" dir=in action=allow protocol=TCP localport=8000 >nul 2>&1
set add_result=%errorLevel%

if !add_result! equ 0 (
    echo    SUCCESS! Rule added.
) else (
    echo    WARNING: Rule might already exist or there was an issue.
)

echo.
echo [3/3] Verifying firewall rule...
netsh advfirewall firewall show rule name="Python HTTP Server Port 8000" >nul 2>&1
if %errorLevel% equ 0 (
    echo    Rule verified and active!
) else (
    echo    ERROR: Rule not found. Trying alternative method...
    echo.
    echo    Attempting to allow Python executable directly...
    for /f "delims=" %%i in ('where python') do set PYTHON_PATH=%%i
    if defined PYTHON_PATH (
        netsh advfirewall firewall add rule name="Python" dir=in action=allow program="!PYTHON_PATH!" enable=yes >nul 2>&1
        echo    Python executable allowed.
    )
)

echo.
echo ========================================
echo Configuration Complete!
echo ========================================
echo.
echo Your IP address:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "ip=%%a"
    set "ip=!ip:~1!"
    echo    http://!ip!:8000
    goto :found_ip
)
:found_ip
echo.
echo Next steps:
echo 1. Make sure your phone is on the SAME Wi-Fi network
echo 2. Make sure the server is running (python -m http.server 8000)
echo 3. Try connecting from your phone using the IP above
echo.
echo If it still doesn't work, try:
echo - Temporarily disable Windows Firewall to test
echo - Check if your router has a firewall blocking connections
echo - Make sure both devices are on the same network (not guest network)
echo.
pause
