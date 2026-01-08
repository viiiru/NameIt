# NameIt Phone Connection Troubleshooting

## Your Connection Details
- **Your IP Address:** `192.168.68.101`
- **Port:** `8000`
- **Full URL:** `http://192.168.68.101:8000`

---

## Step-by-Step Fix

### Step 1: Verify Server is Running
1. Open terminal in Cursor
2. Make sure you see: `Serving HTTP on 0.0.0.0 port 8000 ...`
3. If not, run: `python -m http.server 8000`

### Step 2: Test on Your Computer First
1. Open your computer's browser (Chrome/Edge)
2. Go to: `http://localhost:8000`
3. **If this doesn't work, the server isn't running properly!**

### Step 3: Check Firewall (Even if script said error)
The firewall rule IS actually active! The script had a bug, but the rule works.

To verify:
1. Open PowerShell as Administrator
2. Run: `netsh advfirewall firewall show rule name="Python HTTP Server"`
3. You should see "Enabled: Yes" and "Action: Allow"

### Step 4: Try Alternative Firewall Fix
If you want to be extra sure, run this in PowerShell (as Administrator):
```powershell
netsh advfirewall firewall delete rule name="Python HTTP Server"
netsh advfirewall firewall add rule name="Python HTTP Server" dir=in action=allow protocol=TCP localport=8000
```

### Step 5: Check Network Connection
**CRITICAL:** Your phone and computer MUST be on the **SAME Wi-Fi network**!

1. On your phone, check Wi-Fi settings
2. On your computer, check Wi-Fi settings
3. They must show the **same network name**

**Common issues:**
- Phone on 5GHz, computer on 2.4GHz (same router, different bands) - **This is OK**
- Phone on "Guest Network", computer on main network - **This WON'T work**
- Phone on mobile data, computer on Wi-Fi - **This WON'T work**

### Step 6: Try Disabling Firewall Temporarily (TEST ONLY)
**WARNING:** Only do this to test! Re-enable it after!

1. Open Windows Security
2. Go to Firewall & network protection
3. Turn off firewall for "Private network" (temporarily)
4. Try connecting from phone
5. **Re-enable firewall after testing!**

If this works, the firewall was the issue. Use the fix-firewall scripts.

### Step 7: Check Router Settings
Some routers have "AP Isolation" or "Client Isolation" that blocks devices from talking to each other.

1. Log into your router (usually `192.168.1.1` or `192.168.0.1`)
2. Look for "AP Isolation" or "Client Isolation"
3. **Disable it** if it's enabled
4. Save settings and try again

### Step 8: Try Different Port
If port 8000 is blocked by your router:

1. Stop the server (Ctrl+C)
2. Start on a different port: `python -m http.server 8080`
3. Update firewall rule for port 8080
4. Try: `http://192.168.68.101:8080`

---

## Quick Diagnostic Commands

**Check if server is running:**
```powershell
netstat -ano | findstr :8000
```
Should show "LISTENING"

**Check your IP:**
```powershell
ipconfig | findstr IPv4
```

**Test local connection:**
Open browser: `http://localhost:8000`

**Check firewall rule:**
```powershell
netsh advfirewall firewall show rule name="Python HTTP Server"
```

---

## Still Not Working?

1. **Try from another device** (tablet, another phone) - if it works, it's your phone's settings
2. **Check phone's browser** - try Chrome, Firefox, or Safari
3. **Check phone's firewall/security apps** - some phones block local network connections
4. **Try mobile hotspot** - create hotspot on phone, connect computer to it, then connect phone to `http://[computer-ip]:8000`

---

## Alternative: Use ngrok (Internet Access Required)

If local network doesn't work, you can use ngrok to create a public URL:

1. Download ngrok from https://ngrok.com
2. Run: `ngrok http 8000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Use that URL on your phone (works from anywhere!)

---

## Need More Help?

Check:
- Windows Firewall logs
- Router logs
- Phone's network settings
- Try connecting from another device first
