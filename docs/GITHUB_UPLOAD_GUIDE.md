# How to Upload Files to GitHub

This guide shows you **3 easy ways** to upload your NameIt game files to GitHub.

---

## Method 1: GitHub Web Interface (Easiest - No Git needed!)

This is the **simplest method** - just drag and drop files in your browser.

### Steps:

1. **Go to your GitHub repository**
   - Open https://github.com in your browser
   - Log in to your account
   - Click on your repository (the one you created for this game)

2. **Upload files**
   - Click the **"Add file"** button (top right, next to the green "Code" button)
   - Select **"Upload files"** from the dropdown

3. **Drag and drop your files**
   - Open File Explorer on your computer
   - Navigate to: `C:\Users\pesonviv\.cursor\NameIt`
   - **Select these important files and folders:**
     - `index.html`
     - `styles.css`
     - `script.js`
     - `images.js`
     - `images/` folder (drag the entire folder)
     - `audio/` folder
     - `audio_startmusic/` folder
     - `audio_endmusic/` folder
     - `image_first picture/` folder
   - **Optional files** (documentation - you can skip these if you want):
     - `FREE_WEBSITE_GUIDE.md`
     - `GIT_GUIDE.md`
     - `NameIt_explained.md`
     - Any other `.md` files
   - **Skip these files** (not needed for the website):
     - `*.bat` files (start-server.bat, etc.)
     - `*.ps1` files
     - `compress_images.py`
     - `.gitignore` (GitHub will create one if needed)

4. **Commit the files**
   - Scroll down to the bottom of the page
   - In the "Commit changes" section:
     - **First line:** Type: `Initial upload of NameIt game`
     - **Description (optional):** Type: `Uploading all game files for Netlify deployment`
   - Make sure **"Commit directly to the main branch"** is selected
   - Click the green **"Commit changes"** button

5. **Wait for upload**
   - GitHub will upload your files (this may take a few minutes if you have many images)
   - You'll see a progress bar
   - When done, you'll see all your files in the repository!

**✅ Done!** Your files are now on GitHub.

---

## Method 2: Git Command Line (More Professional)

If you want to use Git commands (like a pro developer), follow these steps:

### Step 1: Open PowerShell in your project folder

1. Press `Windows Key + X`
2. Select **"Windows PowerShell"** or **"Terminal"**
3. Type this command and press Enter:
   ```powershell
   cd C:\Users\pesonviv\.cursor\NameIt
   ```

### Step 2: Initialize Git (if not already done)

```powershell
git init
```

### Step 3: Add your GitHub repository as remote

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

**Example:** If your username is `john` and your repo is `nameit-game`, it would be:
```powershell
git remote add origin https://github.com/john/nameit-game.git
```

### Step 4: Add all files

```powershell
git add .
```

This adds all files to Git (respecting your `.gitignore` file).

### Step 5: Commit the files

```powershell
git commit -m "Initial upload of NameIt game"
```

### Step 6: Push to GitHub

```powershell
git branch -M main
git push -u origin main
```

**Note:** GitHub will ask for your username and password. 
- **Username:** Your GitHub username
- **Password:** You'll need a **Personal Access Token** (not your regular password)

### How to get a Personal Access Token:

1. Go to GitHub.com → Click your profile picture (top right) → **Settings**
2. Scroll down → Click **"Developer settings"** (left sidebar)
3. Click **"Personal access tokens"** → **"Tokens (classic)"**
4. Click **"Generate new token"** → **"Generate new token (classic)"**
5. Give it a name like "NameIt Upload"
6. Check the box **"repo"** (this gives access to repositories)
7. Scroll down and click **"Generate token"**
8. **Copy the token immediately** (you won't see it again!)
9. Use this token as your password when Git asks

**✅ Done!** Your files are now on GitHub.

---

## Method 3: GitHub Desktop (Visual Tool)

GitHub Desktop is a free app that makes Git easier with a visual interface.

### Step 1: Download GitHub Desktop

1. Go to: https://desktop.github.com/
2. Click **"Download for Windows"**
3. Install the app

### Step 2: Sign in

1. Open GitHub Desktop
2. Sign in with your GitHub account

### Step 3: Add your repository

1. Click **"File"** → **"Add local repository"**
2. Click **"Choose..."** and navigate to: `C:\Users\pesonviv\.cursor\NameIt`
3. Click **"Add repository"**

### Step 4: Publish to GitHub

1. If this is a new repository, click **"Publish repository"** (top right)
2. Choose your repository name
3. Make sure **"Keep this code private"** is **unchecked** (unless you want it private)
4. Click **"Publish repository"**

### Step 5: Commit and push

1. In the left sidebar, you'll see all your changed files
2. At the bottom, type a commit message: `Initial upload of NameIt game`
3. Click **"Commit to main"**
4. Click **"Push origin"** (top right)

**✅ Done!** Your files are now on GitHub.

---

## Which Files Should I Upload?

### ✅ **Essential Files (Must Upload):**
- `index.html` - Main game page
- `styles.css` - Game styling
- `script.js` - Game logic
- `images.js` - Image definitions
- `images/` folder - All game images
- `audio/` folder - Sound effects
- `audio_startmusic/` folder - Background music
- `audio_endmusic/` folder - End music
- `image_first picture/` folder - Start and end images

### 📄 **Optional Files (Nice to Have):**
- `FREE_WEBSITE_GUIDE.md` - Website setup guide
- `GIT_GUIDE.md` - Git tutorial
- `NameIt_explained.md` - Code explanation
- `.gitignore` - Git ignore rules

### ❌ **Skip These (Not Needed):**
- `*.bat` files - Local server scripts (not needed on website)
- `*.ps1` files - PowerShell scripts (not needed on website)
- `compress_images.py` - Python script (not needed on website)
- `*.backup` files - Backup files (if any)

---

## After Uploading to GitHub

Once your files are on GitHub, go back to Netlify and connect them:

1. Go to **https://app.netlify.com**
2. Click on your site
3. Go to **"Site settings"** → **"Build & deploy"**
4. Under **"Continuous Deployment"**, click **"Link repository"**
5. Click **"GitHub"** and authorize Netlify
6. Select your repository
7. Click **"Deploy site"**

**That's it!** Now whenever you update files on GitHub, Netlify will automatically update your website!

---

## Troubleshooting

**Q: My files are too large to upload**
A: GitHub has a 100MB file limit. If your images are too big:
- Use the `compress_images.py` script first to compress them
- Or upload images one by one

**Q: I get an error about authentication**
A: Use Method 1 (web interface) - it doesn't require authentication setup.

**Q: Can I update files later?**
A: Yes! Just upload new versions of files using the same method you chose.

**Q: What if I make a mistake?**
A: You can delete files on GitHub by clicking the file and then clicking the trash icon.

---

## Recommended: Start with Method 1

**Method 1 (Web Interface)** is the easiest and fastest way to get started. You can always learn Git commands later if you want!

Good luck! 🚀
