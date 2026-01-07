@echo off
echo Starting NameIt game server...
echo.
echo Your game will be available at: http://localhost:8000
echo.
echo To access from your phone:
echo 1. Find your computer's IP address (run: ipconfig)
echo 2. On your phone, go to: http://YOUR_IP:8000
echo 3. Make sure phone and computer are on same Wi-Fi
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
pause
