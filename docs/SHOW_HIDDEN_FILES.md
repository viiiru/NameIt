# How to Show Hidden Files in Windows

## Quick Method (Windows 10/11):

1. **Open File Explorer**
   - Press `Windows Key + E` or click the folder icon

2. **Go to your project folder**
   - Navigate to: `C:\Users\pesonviv\.cursor\NameIt`

3. **Show hidden files**
   - Click the **"View"** tab (top menu)
   - Check the box **"Hidden items"** (in the "Show/hide" section)
   - Now you'll see `.gitignore` file!

4. **Upload to GitHub**
   - Now you can select `.gitignore` along with other files
   - Drag and drop it to GitHub

---

## Alternative: Create .gitignore on GitHub

If you can't see the file, you can create it directly on GitHub:

1. **Go to your GitHub repository**
2. **Click "Add file"** → **"Create new file"**
3. **Type the filename:** `.gitignore` (with the dot at the beginning)
4. **Paste this content:**

```
# Git ignore file for NameIt game
# This tells Git which files to NOT track

# Operating system files
.DS_Store
Thumbs.db
desktop.ini

# Editor files
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary files
*.tmp
*.log

# Node modules (if you add any later)
node_modules/

# Build files (if you add any later)
dist/
build/
```

5. **Scroll down** → Commit message: `Add .gitignore file`
6. **Click "Commit new file"**

Done! ✅

---

## Is .gitignore Required?

**Short answer: No, it's optional!**

- Your game will work fine without it
- It just helps keep your repository clean by ignoring unnecessary files
- You can always add it later

**You can proceed with uploading your other files!** The game will work perfectly without `.gitignore`.
