Write-Host "Starting NameIt game server..." -ForegroundColor Green
Write-Host ""
Write-Host "Your game will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To access from your phone:" -ForegroundColor Yellow
Write-Host "1. Find your computer's IP address (run: ipconfig)" -ForegroundColor Yellow
Write-Host "2. On your phone, go to: http://YOUR_IP:8000" -ForegroundColor Yellow
Write-Host "3. Make sure phone and computer are on same Wi-Fi" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""
python -m http.server 8000
