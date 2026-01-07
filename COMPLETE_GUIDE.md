# Complete Guide for NameIt Game - Everything You Need

This is your one-stop guide for everything related to your NameIt game: website setup, GitHub, Netlify, Git, and more.

---

## Table of Contents

1. [Free Website Setup](#1-free-website-setup)
   - Getting a custom domain
   - Connecting to Netlify
   - Automatic updates

2. [GitHub Setup](#2-github-setup)
   - Uploading files to GitHub
   - Starting fresh
   - Handling hidden files

3. [Connecting GitHub to Netlify](#3-connecting-github-to-netlify)
   - Step-by-step connection
   - Build settings
   - Automatic deployment

4. [Git Version Control](#4-git-version-control)
   - Basic Git commands
   - Making commits
   - Undoing changes

5. [Testing on Phone](#5-testing-on-phone)
   - Local server setup
   - Firewall configuration
   - Troubleshooting

6. [Updating Your Game](#6-updating-your-game)
   - How to make changes
   - Deploying updates
   - Best practices

---

## 1. Free Website Setup

Your game can be hosted for free on Netlify. Here's how to set it up:

### Option 1: Free Custom Subdomain (Easiest - 2 minutes)

Netlify gives you a free custom subdomain that's easier to remember:

1. Go to **https://app.netlify.com** and log in
2. Click on your site
3. Click **"Site settings"** (gear icon) in the top menu
4. Click **"Change site name"** in the "General" section
5. Type a name like: `nameit-game` or `play-nameit` or `nameit-vocabulary`
6. Click **"Save"**
7. Your new URL will be: `https://nameit-game.netlify.app`

**That's it!** Your game is now at a much easier URL to remember and share.

### Option 2: Connect Your Own Domain (Free hosting, but requires buying a domain)

If you want a domain like `nameit.com` or `nameit-game.com`:

1. **Buy a Domain** (usually $10-15/year)
   - **Namecheap.com** - Popular and cheap
   - **Google Domains** - Simple interface
   - **GoDaddy** - Well-known option

2. **Connect to Netlify** (Free)
   - In Netlify, go to your site → **"Site settings"** → **"Domain management"**
   - Click **"Add custom domain"**
   - Enter your domain (e.g., `nameit-game.com`)
   - Follow Netlify's instructions to update your domain's DNS settings
   - Wait 5-60 minutes for DNS to update

**Note:** Netlify hosting is **completely free** even with a custom domain. You only pay for the domain name itself.

### Quick Tips

- **Add a favicon**: Create a 32x32 pixel image, save as `favicon.ico` in your project folder
- **Share your game**: Send the URL to friends - works on phones, tablets, and computers
- **No installation needed** - just open in a browser!

---

## 2. GitHub Setup

GitHub is where you store your code online. Here's how to upload your files:

### Method 1: GitHub Web Interface (Easiest - No Git needed!)

**Steps:**

1. **Go to your GitHub repository**
   - Open https://github.com in your browser
   - Log in to your account
   - Click on your repository

2. **Upload files**
   - Click the **"Add file"** button (top right)
   - Select **"Upload files"** from the dropdown

3. **Drag and drop your files**
   - Open File Explorer: `C:\Users\pesonviv\.cursor\NameIt`
   - **Select these important files and folders:**
     - `index.html`
     - `styles.css`
     - `script.js`
     - `images.js`
     - `images/` folder
     - `audio/` folder
     - `audio_startmusic/` folder
     - `audio_endmusic/` folder
     - `image_first picture/` folder

4. **Commit the files**
   - Scroll down to "Commit changes"
   - Type: `Initial upload of NameIt game`
   - Make sure **"Commit directly to the main branch"** is selected
   - Click **"Commit changes"**

**✅ Done!** Your files are now on GitHub.

### Method 2: Git Command Line

If you want to use Git commands:

1. **Open PowerShell** in your project folder:
   ```powershell
   cd C:\Users\pesonviv\.cursor\NameIt
   ```

2. **Initialize Git** (if not already done):
   ```powershell
   git init
   ```

3. **Add your GitHub repository as remote**:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

4. **Add and commit files**:
   ```powershell
   git add .
   git commit -m "Initial upload of NameIt game"
   ```

5. **Push to GitHub**:
   ```powershell
   git branch -M main
   git push -u origin main
   ```

**Note:** You'll need a Personal Access Token instead of your password. See the full guide below for details.

### Method 3: GitHub Desktop

1. Download from: https://desktop.github.com/
2. Sign in with your GitHub account
3. Click **"File"** → **"Add local repository"**
4. Navigate to: `C:\Users\pesonviv\.cursor\NameIt`
5. Click **"Publish repository"**
6. Commit and push your files

### Starting Fresh on GitHub

If you need to delete and recreate your repository:

1. **Delete the old repository:**
   - Go to your GitHub repository
   - Click **"Settings"** tab
   - Scroll to **"Danger Zone"** (bottom)
   - Click **"Delete this repository"**
   - Type the repository name to confirm

2. **Create a new repository:**
   - Click **"+"** → **"New repository"**
   - Name it: `nameit-game` (or any name)
   - **Don't** check "Add a README file"
   - Click **"Create repository"**

3. **Upload files separately** (see Method 1 above)

### Handling Hidden Files (.gitignore)

**Option A: Show hidden files in Windows:**
1. Open File Explorer
2. Go to: `C:\Users\pesonviv\.cursor\NameIt`
3. Click **"View"** tab
4. Check **"Hidden items"**
5. Now you'll see `.gitignore` file!

**Option B: Create .gitignore on GitHub:**
1. Go to your GitHub repository
2. Click **"Add file"** → **"Create new file"**
3. Type filename: `.gitignore` (with the dot)
4. Paste this content:
   ```
   # Git ignore file for NameIt game
   .DS_Store
   Thumbs.db
   desktop.ini
   .vscode/
   .idea/
   *.swp
   *.swo
   *~
   *.tmp
   *.log
   node_modules/
   dist/
   build/
   ```
5. Commit the file

**Note:** `.gitignore` is optional - your game works fine without it!

### Which Files to Upload?

**✅ Essential Files:**
- `index.html`, `styles.css`, `script.js`, `images.js`
- `images/` folder, `audio/` folders, `image_first picture/` folder

**📄 Optional Files:**
- Documentation files (`.md` files)
- `.gitignore`

**❌ Skip These:**
- `*.bat` files (local server scripts)
- `*.ps1` files (PowerShell scripts)
- `compress_images.py` (Python script)

---

## 3. Connecting GitHub to Netlify

Once your files are on GitHub, connect them to Netlify for automatic deployments:

### Step-by-Step Connection

1. **Go to Netlify**
   - Open: **https://app.netlify.com**
   - Log in

2. **Access Site Settings**
   - Click on your site
   - Click **"Site settings"** (gear icon)
   - Go to **"Build & deploy"**

3. **Link Your GitHub Repository**
   - Find **"Continuous Deployment"** section
   - Click **"Link repository"**
   - Click **"GitHub"** and authorize Netlify
   - Select your NameIt repository
   - Click **"Connect"**

4. **Configure Build Settings**
   - **Base directory:** Leave EMPTY (files are in root)
   - **Build command:** Leave EMPTY (static site, no build needed)
   - **Publish directory:** Leave EMPTY
   - Click **"Deploy site"**

5. **Wait for Deployment**
   - Usually takes 30-60 seconds
   - Watch for "Site is live" message

6. **Test Your Site**
   - Click your site URL
   - Your game should load!

### (Optional) Change Site Name

For a better URL:
1. Go to **Site settings** → **"General"**
2. Click **"Change site name"**
3. Type: `nameit-game` or `play-nameit`
4. Click **"Save"**
5. New URL: `https://nameit-game.netlify.app`

---

## 4. Git Version Control

Git helps you track changes to your code. Here are the basics:

### What is Git?

Git is like a **time machine for your code**. It saves snapshots so you can:
- Go back to previous versions if something breaks
- See what changed between versions
- Work safely knowing you can undo mistakes

### Basic Commands

**Check status:**
```bash
git status
```

**Add files:**
```bash
git add .
```

**Save (commit):**
```bash
git commit -m "Description of what you changed"
```

**See history:**
```bash
git log
```

**See what changed:**
```bash
git diff
```

### Common Workflow

1. Make changes to your code
2. Test that it works
3. Save with Git:
   ```bash
   git add .
   git commit -m "What you changed"
   ```

### Good Commit Messages

- ✅ "Added duration selector (30s/60s)"
- ✅ "Fixed start button not working"
- ✅ "Made colors more playful"
- ❌ "stuff" (too vague!)
- ❌ "changes" (not helpful!)

### If Something Breaks

**Go back to last working version:**
```bash
git log
```
Find the commit you want, copy its ID, then:
```bash
git checkout [commit-id]
```

**Undo changes (before committing):**
```bash
git checkout -- [filename]
```

---

## 5. Testing on Phone

Test your game on your phone before deploying:

### Quick Setup

**Step 1: Start the Server**

**Option A - Using Python:**
1. Open terminal in Cursor (Ctrl + `)
2. Make sure you're in the NameIt folder
3. Type:
   ```
   python -m http.server 8000
   ```

**Option B - Using Node.js:**
```
npx http-server -p 8000
```

**Step 2: Fix Firewall**

1. Right-click `fix-firewall.bat` in your NameIt folder
2. Select **"Run as Administrator"**
3. Click **"Yes"** when Windows asks
4. Wait for "SUCCESS!" message

**Step 3: Connect Your Phone**

1. **Find your computer's IP address:**
   - Run `ipconfig` in PowerShell
   - Look for "IPv4 Address"

2. **On your phone:**
   - Make sure phone is on **same Wi-Fi** as computer
   - Open browser (Chrome recommended)
   - Type: `http://YOUR_IP_ADDRESS:8000`
   - **Important:** Use `http://` NOT `https://` (no 's'!)

3. **The game should load!** 🎉

### Troubleshooting

**"ERR_CONNECTION_TIMED_OUT" error:**
- This is usually a Windows Firewall issue
- Run `fix-firewall.bat` as Administrator
- Make sure both devices are on the same Wi-Fi

**"Page not found" or 404 error:**
- Make sure the server is running (check terminal)
- Double-check the IP address
- Make sure you typed `http://` not `https://`

**Quick Reference:**
- **Start server:** `python -m http.server 8000`
- **Stop server:** Press `Ctrl + C`
- **Find IP:** `ipconfig` (look for IPv4 Address)

---

## 6. Updating Your Game

Once connected to GitHub and Netlify, updating is easy:

### How to Update

1. **Edit files on your computer**
   - Make changes in `C:\Users\pesonviv\.cursor\NameIt`

2. **Update on GitHub:**
   - Go to your GitHub repository
   - Click the file you changed (e.g., `script.js`)
   - Click the pencil icon (✏️) to edit
   - Paste your updated code
   - Scroll down → Commit message: `Update script.js`
   - Click **"Commit changes"**

3. **Netlify automatically updates!**
   - Within 30-60 seconds, Netlify detects the change
   - It automatically rebuilds and updates your website
   - You'll see a notification in Netlify when done

**No need to manually deploy anymore!** 🎉

### Best Practices

- **Commit often** - Save after each feature or fix
- **Write clear commit messages** - Describe what you changed
- **Test locally first** - Use the phone testing method above
- **Test after deployment** - Make sure the live site works

---

## Troubleshooting

### Website Issues

**Q: Can I change the site name later?**
A: Yes! Change it anytime in Netlify settings.

**Q: Is there a limit to how many people can play?**
A: No! Netlify's free plan handles thousands of visitors.

**Q: What if I want to stop the website?**
A: Delete the site in Netlify settings, or just stop updating it.

**Q: Can I password-protect the site?**
A: Yes! Netlify has a free password protection feature in site settings.

### GitHub Issues

**Q: My files are too large to upload**
A: GitHub has a 100MB file limit. Compress images first using `compress_images.py`.

**Q: I get an error about authentication**
A: Use the web interface method - it doesn't require authentication setup.

**Q: Can I update files later?**
A: Yes! Just upload new versions using the same method.

**Q: What if I make a mistake?**
A: You can delete files on GitHub by clicking the file and then the trash icon.

### Netlify Connection Issues

**Q: I don't see "Link repository" button**
A: Check "Build & deploy" section, or you might need to create a new site.

**Q: GitHub authorization failed**
A: Make sure you're logged into GitHub in the same browser. Try logging out and back in.

**Q: Build failed with errors**
A: Check that:
- All files are in the root (not in a subfolder)
- `index.html` exists in the root
- All image/audio paths are correct

**Q: Site works but images don't load**
A: Check that the `images/`, `audio/`, etc. folders were uploaded correctly to GitHub.

**Q: How do I know if auto-deploy is working?**
A: Make a small change (like adding a comment in `script.js`), commit it to GitHub, and watch Netlify - you should see a new deploy start automatically!

---

## Quick Checklists

### Initial Setup Checklist
- [ ] Created GitHub account
- [ ] Created GitHub repository
- [ ] Uploaded all game files to GitHub
- [ ] Created Netlify account
- [ ] Connected GitHub to Netlify
- [ ] Configured build settings (all empty)
- [ ] Tested website deployment
- [ ] Changed site name for better URL (optional)

### Update Checklist
- [ ] Made changes to files on computer
- [ ] Tested changes locally (optional)
- [ ] Updated files on GitHub
- [ ] Committed changes with clear message
- [ ] Waited for Netlify to auto-deploy
- [ ] Tested live website

---

## Need More Help?

- **Netlify Support**: https://docs.netlify.com
- **Netlify Community**: https://answers.netlify.com
- **GitHub Help**: https://docs.github.com
- **Git Documentation**: https://git-scm.com/doc

---

## Summary

Your NameIt game is now:
- ✅ Live on the internet (Netlify)
- ✅ Stored safely online (GitHub)
- ✅ Automatically updating (GitHub → Netlify)
- ✅ Ready to share with the world!

**Your game URL:** `https://your-site-name.netlify.app`

Enjoy your game! 🎮🌍
