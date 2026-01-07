@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Complete Firewall Fix for NameIt
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

echo [Step 1/5] Removing old firewall rules...
netsh advfirewall firewall delete rule name="Python HTTP Server" >nul 2>&1
netsh advfirewall firewall delete rule name="Python HTTP Server Port 8000" >nul 2>&1
netsh advfirewall firewall delete rule name="Python" >nul 2>&1
echo    Done.

echo.
echo [Step 2/5] Finding Python executable...
for /f "delims=" %%i in ('where python 2^>nul') do set PYTHON_PATH=%%i
if defined PYTHON_PATH (
    echo    Found: !PYTHON_PATH!
) else (
    echo    WARNING: Python not found in PATH
    set PYTHON_PATH=C:\Python*\python.exe
)

echo.
echo [Step 3/5] Adding firewall rule for PORT 8000 (Inbound)...
netsh advfirewall firewall add rule name="NameIt Server Port 8000" dir=in action=allow protocol=TCP localport=8000 profile=private,public enable=yes >nul 2>&1
if %errorLevel% equ 0 (
    echo    SUCCESS: Port 8000 inbound rule added
) else (
    echo    WARNING: Could not add port rule
)

echo.
echo [Step 4/5] Adding firewall rule for PORT 8000 (Outbound)...
netsh advfirewall firewall add rule name="NameIt Server Port 8000 Out" dir=out action=allow protocol=TCP localport=8000 profile=private,public enable=yes >nul 2>&1
if %errorLevel% equ 0 (
    echo    SUCCESS: Port 8000 outbound rule added
) else (
    echo    WARNING: Could not add outbound port rule
)

echo.
echo [Step 5/5] Adding firewall rule for Python executable...
if defined PYTHON_PATH (
    netsh advfirewall firewall add rule name="Python for NameIt" dir=in action=allow program="!PYTHON_PATH!" profile=private,public enable=yes >nul 2>&1
    if !errorLevel! equ 0 (
        echo    SUCCESS: Python executable rule added
    ) else (
        echo    WARNING: Could not add Python executable rule
    )
) else (
    echo    SKIPPED: Python path not found
)

echo.
echo ========================================
echo Verifying firewall rules...
echo ========================================
echo.

netsh advfirewall firewall show rule name="NameIt Server Port 8000" | findstr /i "Enabled Action"
netsh advfirewall firewall show rule name="NameIt Server Port 8000 Out" | findstr /i "Enabled Action"
if defined PYTHON_PATH (
    netsh advfirewall firewall show rule name="Python for NameIt" | findstr /i "Enabled Action"
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
echo Try connecting from your phone now!
echo.
echo If it still doesn't work, try:
echo 1. Restart your computer
echo 2. Check Windows Defender Firewall settings manually
echo 3. Make sure "Private network" profile is active
echo.
pause
