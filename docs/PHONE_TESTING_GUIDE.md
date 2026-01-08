# How to Test NameIt Game on Your Phone

## Quick Setup (2 Steps!)

### Step 1: Start the Server

**Option A - Using Python (Easiest):**
1. Open terminal in Cursor (Ctrl + `)
2. Make sure you're in the NameIt folder
3. Type this command:
   ```
   python -m http.server 8000
   ```
4. You should see: `Serving HTTP on 0.0.0.0 port 8000 ...`

**Option B - Using Node.js:**
1. Open terminal in Cursor
2. Type:
   ```
   npx http-server -p 8000
   ```

### Step 2: Fix Firewall (IMPORTANT!)

**Before connecting your phone, you need to allow the connection through Windows Firewall:**

1. Right-click `fix-firewall.bat` in your NameIt folder
2. Select "Run as Administrator"
3. Click "Yes" when Windows asks for permission
4. Wait for "SUCCESS!" message

**OR** if you prefer PowerShell:
1. Right-click PowerShell → "Run as Administrator"
2. Navigate to your NameIt folder: `cd C:\Users\pesonviv\.cursor\NameIt`
3. Run: `.\fix-firewall.ps1`

### Step 3: Connect Your Phone

1. **Find your computer's IP address:**
   - Your IP is: **192.168.68.101** (from the last check)
   - To verify, run `ipconfig` in PowerShell and look for "IPv4 Address"

2. **On your phone:**
   - Make sure your phone is on the **same Wi-Fi network** as your computer
   - Open your phone's browser (Chrome recommended)
   - Type in the address bar:
     ```
     http://192.168.68.101:8000
     ```
   - **Important:** Use `http://` NOT `https://` (no 's'!)

3. **The game should load!** 🎉

**If you still get ERR_CONNECTION_TIMED_OUT, see Troubleshooting section below.**

---

## Troubleshooting

### "ERR_CONNECTION_TIMED_OUT" or "Can't connect" error?

**This is usually a Windows Firewall issue. Here's how to fix it:**

**Option 1 - Easy Fix (Recommended):**
1. Right-click `fix-firewall.bat` in your NameIt folder
2. Select "Run as Administrator"
3. Follow the prompts
4. Try connecting from your phone again

**Option 2 - Manual Fix:**
1. Open PowerShell as Administrator (right-click → Run as Administrator)
2. Run this command:
   ```
   netsh advfirewall firewall add rule name="Python HTTP Server" dir=in action=allow protocol=TCP localport=8000
   ```
3. Try connecting from your phone again

**Other things to check:**
- Make sure both devices are on the **same Wi-Fi network**
- Make sure the server is running (check terminal for "Serving HTTP on...")
- Double-check the IP address (run `ipconfig` and look for IPv4 Address)
- Make sure you typed `http://` not `https://` (no 's'!)

### "Page not found" or 404 error?
- Make sure the server is running (you should see it in terminal)
- Double-check the IP address
- Make sure you typed `http://` not `https://`
- Make sure you're in the NameIt folder when starting the server

### Firewall blocking?
Windows might ask you to allow Python/Node through the firewall. Click "Allow" when prompted. If it doesn't ask, use the fix-firewall scripts above.

---

## Quick Reference

**To start server:**
```
python -m http.server 8000
```

**To stop server:**
Press `Ctrl + C` in the terminal

**To find your IP:**
```
ipconfig
```
(Look for IPv4 Address)

---

## Tips

- Keep the terminal open while testing (closing it stops the server)
- The game will work the same on phone as desktop
- Speech recognition might be faster on phone!
- Test the "Hold & Speak" button - touch might feel more natural

Enjoy testing! 🎮📱
