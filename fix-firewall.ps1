# Fix Windows Firewall for NameIt Game Server
# This script allows Python HTTP server through Windows Firewall

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NameIt Firewall Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "WARNING: This script needs administrator privileges!" -ForegroundColor Yellow
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or run this command manually:" -ForegroundColor Yellow
    Write-Host 'netsh advfirewall firewall add rule name="Python HTTP Server" dir=in action=allow protocol=TCP localport=8000' -ForegroundColor Green
    Write-Host ""
    pause
    exit
}

Write-Host "Adding firewall rule for port 8000..." -ForegroundColor Yellow

# Remove existing rule if it exists
netsh advfirewall firewall delete rule name="Python HTTP Server" 2>$null

# Add new rule
netsh advfirewall firewall add rule name="Python HTTP Server" dir=in action=allow protocol=TCP localport=8000

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! Firewall rule added." -ForegroundColor Green
    Write-Host ""
    Write-Host "Your server should now be accessible from your phone!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your IP address: " -NoNewline
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress | Select-Object -First 1
    Write-Host "http://$ip:8000" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Could not add firewall rule." -ForegroundColor Red
    Write-Host "Please run this script as Administrator." -ForegroundColor Yellow
    Write-Host ""
}

pause
