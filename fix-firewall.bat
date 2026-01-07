@echo off
echo ========================================
echo NameIt Firewall Configuration
echo ========================================
echo.
echo This will allow your phone to connect to the game server.
echo.
echo NOTE: This requires Administrator privileges!
echo.
pause

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Right-click this file and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo.
echo Adding firewall rule for port 8000...
echo.

:: Remove existing rule if it exists
netsh advfirewall firewall delete rule name="Python HTTP Server" >nul 2>&1

:: Add new rule
netsh advfirewall firewall add rule name="Python HTTP Server" dir=in action=allow protocol=TCP localport=8000

if %errorLevel% equ 0 (
    echo.
    echo SUCCESS! Firewall rule added.
    echo.
    echo Your server should now be accessible from your phone!
    echo.
    echo Your IP address:
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
        set "ip=%%a"
        setlocal enabledelayedexpansion
        set "ip=!ip:~1!"
        echo http://!ip!:8000
        endlocal
        goto :found
    )
    :found
    echo.
    echo Try connecting from your phone now!
    echo.
) else (
    echo.
    echo ERROR: Could not add firewall rule.
    echo Please make sure you ran this as Administrator.
    echo.
)

pause
