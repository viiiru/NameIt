# Git Version Control Guide for Beginners

## What is Git?

**Git** is like a **time machine for your code**. It saves snapshots of your project so you can:
- **Go back** to previous versions if something breaks
- **See what changed** between versions
- **Work safely** knowing you can undo mistakes
- **Share your code** with others

Think of it like saving a game: you can save at different points and go back to any save point.

---

## Basic Git Commands You'll Use

### 1. **Check Status** - See what files changed
```bash
git status
```
Shows you which files are new, modified, or deleted.

### 2. **Add Files** - Tell Git which files to save
```bash
git add .
```
The `.` means "all files". This stages files for the next save.

### 3. **Save (Commit)** - Create a snapshot
```bash
git commit -m "Description of what you changed"
```
This creates a save point with a message describing what you did.

### 4. **See History** - View all your saves
```bash
git log
```
Shows a list of all your commits (saves) with messages.

### 5. **See What Changed** - Compare versions
```bash
git diff
```
Shows the exact changes you made to files.

---

## Your First Steps

### Step 1: Initialize Git (Already Done!)
I've already initialized Git for you. You're ready to go!

### Step 2: Make Your First Save
```bash
git add .
git commit -m "Initial commit - NameIt game"
```

### Step 3: Make Regular Saves
Every time you make changes you're happy with:
```bash
git add .
git commit -m "Added duration selector (30s/60s)"
```

**Good commit messages** describe what you did:
- ✅ "Added end music when time is up"
- ✅ "Fixed start button not working"
- ✅ "Made colors more playful"
- ❌ "stuff" (too vague!)
- ❌ "changes" (not helpful!)

---

## Common Workflow

1. **Make changes** to your code
2. **Test** that it works
3. **Save** with Git:
   ```bash
   git add .
   git commit -m "What you changed"
   ```

---

## If Something Breaks

### Go Back to Last Working Version
```bash
git log
```
Find the commit (save) you want to go back to, copy its ID (the long string), then:
```bash
git checkout [commit-id]
```

### Undo Changes (Before Committing)
If you made changes but haven't committed yet:
```bash
git checkout -- [filename]
```
This reverts that file to the last saved version.

---

## What Files Are Tracked?

Git tracks all your important files:
- ✅ `index.html`
- ✅ `styles.css`
- ✅ `script.js`
- ✅ `images.js`
- ✅ `NameIt_explained.md`
- ✅ Image files in `images/`
- ✅ Sound files in `audio/` folders

Git **ignores** (doesn't track):
- ❌ Temporary files
- ❌ Editor settings
- ❌ System files

This is controlled by `.gitignore` (I created this for you).

---

## Tips for Beginners

1. **Commit often** - Save after each feature or fix
2. **Write clear messages** - Future you will thank you!
3. **Don't worry** - Git is safe, you can't lose your code
4. **Start simple** - Just use `add` and `commit` for now

---

## Next Steps (Optional - For Later)

Once you're comfortable, you can learn:
- **Branches** - Work on features separately
- **GitHub** - Share your code online
- **Pull/Push** - Sync with online repositories

But for now, just focus on:
- `git add .`
- `git commit -m "your message"`

You're all set! 🎉
