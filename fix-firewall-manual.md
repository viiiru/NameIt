# Manual Firewall Fix (If Script Doesn't Work)

If the automated script doesn't work, here's how to manually fix the firewall:

## Method 1: Windows Defender Firewall GUI

1. Press `Windows Key + R`
2. Type: `wf.msc` and press Enter
3. Click **"Inbound Rules"** on the left
4. Click **"New Rule..."** on the right
5. Select **"Port"** → Next
6. Select **"TCP"** and enter port **8000** → Next
7. Select **"Allow the connection"** → Next
8. Check all three: **Domain, Private, Public** → Next
9. Name it: **"NameIt Server Port 8000"** → Finish

10. Click **"Outbound Rules"** on the left
11. Click **"New Rule..."** on the right
12. Repeat steps 5-9 (same settings)
13. Name it: **"NameIt Server Port 8000 Out"** → Finish

## Method 2: PowerShell Commands (Run as Administrator)

Open PowerShell as Administrator and run these commands one by one:

```powershell
# Remove old rules
netsh advfirewall firewall delete rule name="Python HTTP Server"
netsh advfirewall firewall delete rule name="NameIt Server Port 8000"

# Add inbound rule
netsh advfirewall firewall add rule name="NameIt Server Port 8000" dir=in action=allow protocol=TCP localport=8000 profile=private,public enable=yes

# Add outbound rule
netsh advfirewall firewall add rule name="NameIt Server Port 8000 Out" dir=out action=allow protocol=TCP localport=8000 profile=private,public enable=yes

# Verify
netsh advfirewall firewall show rule name="NameIt Server Port 8000"
```

## Method 3: Allow Python Executable Directly

1. Press `Windows Key + R`
2. Type: `wf.msc` and press Enter
3. Click **"Inbound Rules"** → **"New Rule..."**
4. Select **"Program"** → Next
5. Select **"This program path:"**
6. Browse and find Python: Usually `C:\Python*\python.exe` or `C:\Users\YourName\AppData\Local\Programs\Python\python.exe`
7. Select **"Allow the connection"** → Next
8. Check all: **Domain, Private, Public** → Next
9. Name it: **"Python for NameIt"** → Finish

## Method 4: Check Firewall Profile

Make sure your network is set to "Private" (not Public):

1. Press `Windows Key + I` → Settings
2. Go to **Network & Internet** → **Wi-Fi** (or Ethernet)
3. Click on your network connection
4. Under "Network profile type", select **"Private"**
5. Try connecting from phone again

## Verify Rules Are Active

Run this in PowerShell:
```powershell
netsh advfirewall firewall show rule name=all | findstr /i "NameIt Python"
```

You should see your rules listed with "Enabled: Yes"

## Still Not Working?

1. **Check if Windows Defender is blocking:**
   - Open Windows Security
   - Go to Firewall & network protection
   - Click "Allow an app through firewall"
   - Find Python and make sure both "Private" and "Public" are checked

2. **Try a different port:**
   - Stop server (Ctrl+C)
   - Run: `python -m http.server 8080`
   - Add firewall rule for port 8080
   - Try: `http://192.168.68.101:8080`

3. **Check for third-party firewalls:**
   - Some antivirus software has its own firewall
   - Check if you have Norton, McAfee, Kaspersky, etc.
   - Temporarily disable their firewall to test
