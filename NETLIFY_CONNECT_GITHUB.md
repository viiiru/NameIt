# Connect GitHub to Netlify - Step by Step

Now that all your files are on GitHub, let's connect them to Netlify so your website updates automatically!

---

## Step 1: Go to Netlify

1. Open your browser
2. Go to: **https://app.netlify.com**
3. Log in to your Netlify account

---

## Step 2: Access Your Site Settings

1. **Find your site** in the dashboard
   - You should see your site listed (might be named "NameIt" or have a random name)
   - If you don't see it, you might need to create a new site

2. **Click on your site** to open it

3. **Go to Site Settings**
   - Click **"Site settings"** button (gear icon) in the top menu
   - Or click **"Site configuration"** → **"Build & deploy"** from the left sidebar

---

## Step 3: Link Your GitHub Repository

1. **Find "Continuous Deployment" section**
   - Scroll down to find **"Build & deploy"** or **"Continuous Deployment"**

2. **Click "Link repository"**
   - You'll see a button that says **"Link repository"** or **"Connect to Git provider"**
   - Click it

3. **Authorize Netlify**
   - You'll see options: **GitHub**, **GitLab**, **Bitbucket**
   - Click **"GitHub"**
   - GitHub will ask you to authorize Netlify
   - Click **"Authorize netlify"** or **"Authorize"**
   - You might need to enter your GitHub password or use two-factor authentication

4. **Select your repository**
   - Netlify will show a list of your GitHub repositories
   - Find and click on your **NameIt repository** (the one you just uploaded files to)
   - Click **"Connect"** or **"Select"**

---

## Step 4: Configure Build Settings

After selecting your repository, Netlify will show build settings. Configure them like this:

### Build Settings:

1. **Branch to deploy:**
   - Should be: `main` (or `master` if that's what your repository uses)
   - Leave as default

2. **Base directory:**
   - **Leave EMPTY** (since your files are in the root of the repository)
   - If you see a value, delete it

3. **Build command:**
   - **Leave EMPTY** (this is a static site, no build needed)
   - Delete any value if present

4. **Publish directory:**
   - **Leave EMPTY** (files are already in the right place)
   - Delete any value if present

5. **Click "Deploy site"** or **"Save"**

---

## Step 5: Wait for Deployment

1. **Netlify will start deploying**
   - You'll see a progress indicator
   - This usually takes 30-60 seconds

2. **Watch the deploy log**
   - You can see what Netlify is doing
   - Look for "Site is live" message

3. **Check for errors**
   - If you see errors (red text), let me know and I'll help fix them
   - Most likely it will work fine!

---

## Step 6: Verify Your Site Works

1. **Get your site URL**
   - After deployment, you'll see your site URL at the top
   - It might be: `https://your-site-name.netlify.app`
   - Or: `https://random-name-12345.netlify.app`

2. **Test the site**
   - Click the URL or copy it and open in a new tab
   - Your game should load!
   - Try clicking "Start Round" to make sure it works

---

## Step 7: (Optional) Change Site Name

If you want a better URL:

1. **Go to Site settings** → **"General"**
2. **Click "Change site name"**
3. **Type a new name** like: `nameit-game` or `play-nameit`
4. **Click "Save"**
5. Your new URL will be: `https://nameit-game.netlify.app`

---

## ✅ You're Done!

Now your website is:
- ✅ Live on the internet
- ✅ Connected to GitHub
- ✅ Will automatically update when you change files on GitHub

---

## How to Update Your Game in the Future

Whenever you make changes:

1. **Edit files on your computer** (in `C:\Users\pesonviv\.cursor\NameIt`)

2. **Update on GitHub:**
   - Go to your GitHub repository
   - Click the file you changed (e.g., `script.js`)
   - Click the pencil icon (✏️) to edit
   - Paste your updated code
   - Scroll down → Commit message: `Update script.js` (or describe your change)
   - Click "Commit changes"

3. **Netlify automatically updates!**
   - Within 30-60 seconds, Netlify will detect the change
   - It will automatically rebuild and update your website
   - You'll see a notification in Netlify when it's done

**No need to manually deploy anymore!** 🎉

---

## Troubleshooting

**Q: I don't see "Link repository" button**
A: You might need to delete the old site and create a new one, or the button might be in "Build & deploy" section.

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

## Quick Checklist

- [ ] Logged into Netlify
- [ ] Found Site settings
- [ ] Clicked "Link repository"
- [ ] Authorized GitHub
- [ ] Selected your repository
- [ ] Left build settings empty (or set correctly)
- [ ] Clicked "Deploy site"
- [ ] Waited for deployment to complete
- [ ] Tested the website URL
- [ ] (Optional) Changed site name for better URL

**You're all set!** Your game is now live and will update automatically! 🚀🎮
