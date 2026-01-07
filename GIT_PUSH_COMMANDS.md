# Git Commands to Push Changes to GitHub

Follow these steps to push your updated files to GitHub.

---

## Step 1: Open PowerShell/Terminal

**Option A - From Cursor:**
1. Press `Ctrl + `` (backtick key, usually above Tab)
2. This opens the terminal in Cursor

**Option B - From Windows:**
1. Press `Windows Key + X`
2. Select **"Windows PowerShell"** or **"Terminal"**

---

## Step 2: Navigate to Your Project Folder

Type this command and press Enter:

```powershell
cd C:\Users\pesonviv\.cursor\NameIt
```

**Verify you're in the right place:**
```powershell
pwd
```
This should show: `C:\Users\pesonviv\.cursor\NameIt`

---

## Step 3: Check What Files Changed

See which files you modified:

```powershell
git status
```

You should see:
- `index.html` (modified)
- `script.js` (modified)
- `images.js` (modified)

---

## Step 4: Add the Changed Files

Add the files you want to commit:

```powershell
git add index.html script.js images.js
```

**Or add all changed files at once:**
```powershell
git add .
```

---

## Step 5: Commit the Changes

Create a commit with a message describing what you changed:

```powershell
git commit -m "Fix file paths with spaces for web deployment"
```

**What this does:**
- Saves your changes locally
- Creates a snapshot with your message
- Prepares to send to GitHub

---

## Step 6: Push to GitHub

Send your changes to GitHub:

```powershell
git push
```

**If this is your first time pushing, you might need:**
```powershell
git push -u origin main
```

**If you get an error about "upstream", use:**
```powershell
git push --set-upstream origin main
```

---

## Step 7: Wait for Netlify

1. **Check GitHub** - Go to your repository, you should see your new commit
2. **Check Netlify** - Go to https://app.netlify.com
3. **Watch the deploy** - You'll see a new deployment start automatically
4. **Wait 30-60 seconds** - Netlify will rebuild your site
5. **Test your site** - Visit your URL to see the fixes!

---

## Troubleshooting

### "fatal: not a git repository"

**Problem:** Git isn't initialized in this folder.

**Solution:**
```powershell
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```
(Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual values)

Then continue from Step 4.

---

### "error: failed to push some refs"

**Problem:** Your local branch is behind the remote.

**Solution:** Pull first, then push:
```powershell
git pull origin main
git push
```

---

### "Authentication failed" or "Permission denied"

**Problem:** GitHub needs your credentials.

**Solution:** You'll need a Personal Access Token:

1. Go to GitHub.com → Your profile → **Settings**
2. Scroll down → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. Click **"Generate new token"** → **"Generate new token (classic)"**
4. Name it: "NameIt Push"
5. Check **"repo"** checkbox
6. Click **"Generate token"**
7. **Copy the token immediately** (you won't see it again!)
8. When Git asks for password, paste the token (not your GitHub password)

---

### "branch 'main' does not exist"

**Problem:** Your branch might be named "master" instead.

**Solution:**
```powershell
git branch -M main
git push -u origin main
```

---

### "nothing to commit, working tree clean"

**Problem:** All changes are already committed.

**Solution:** Check if you need to push:
```powershell
git status
```
If it says "Your branch is ahead of 'origin/main'", just run:
```powershell
git push
```

---

## Quick Reference - All Commands in Order

```powershell
# 1. Navigate to project
cd C:\Users\pesonviv\.cursor\NameIt

# 2. Check status
git status

# 3. Add changed files
git add index.html script.js images.js

# 4. Commit
git commit -m "Fix file paths with spaces for web deployment"

# 5. Push to GitHub
git push
```

---

## What Happens Next?

1. ✅ Files are pushed to GitHub
2. ✅ Netlify detects the change automatically
3. ✅ Netlify rebuilds your site (30-60 seconds)
4. ✅ Your website is updated with the fixes!

**No manual upload needed!** The automatic deployment handles everything. 🎉

---

## Tips

- **Commit often** - Save your work regularly
- **Write clear messages** - Describe what you changed
- **Check status first** - `git status` shows what changed
- **Push after committing** - Don't forget to push!

Good luck! 🚀
