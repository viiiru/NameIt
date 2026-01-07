# Test connection to NameIt server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NameIt Connection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get IP address
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress | Select-Object -First 1

Write-Host "Your IP address: $ip" -ForegroundColor Green
Write-Host ""

# Check if server is running
Write-Host "Checking if server is running on port 8000..." -ForegroundColor Yellow
$serverRunning = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if ($serverRunning) {
    Write-Host "✓ Server is running on port 8000" -ForegroundColor Green
} else {
    Write-Host "✗ Server is NOT running!" -ForegroundColor Red
    Write-Host "  Start it with: python -m http.server 8000" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

Write-Host ""

# Check firewall rules
Write-Host "Checking firewall rules..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "*Python*" -ErrorAction SilentlyContinue

if ($firewallRule) {
    Write-Host "✓ Firewall rules found:" -ForegroundColor Green
    $firewallRule | ForEach-Object {
        Write-Host "  - $($_.DisplayName)" -ForegroundColor Cyan
    }
} else {
    Write-Host "✗ No Python firewall rules found!" -ForegroundColor Red
    Write-Host "  Run fix-firewall-v2.bat as Administrator" -ForegroundColor Yellow
}

Write-Host ""

# Test local connection
Write-Host "Testing local connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ Server responds locally (good!)" -ForegroundColor Green
} catch {
    Write-Host "✗ Server not responding locally!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Connection URL for your phone:" -ForegroundColor Cyan
Write-Host "http://$ip:8000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Troubleshooting tips:" -ForegroundColor Yellow
Write-Host "1. Make sure phone and computer are on SAME Wi-Fi" -ForegroundColor White
Write-Host "2. Try temporarily disabling Windows Firewall to test" -ForegroundColor White
Write-Host "3. Check if router has AP isolation enabled (disable it)" -ForegroundColor White
Write-Host "4. Try using your computer's browser: http://localhost:8000" -ForegroundColor White
Write-Host ""

pause
