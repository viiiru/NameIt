# Free Website Setup Guide for NameIt Game

Your game is already live at: **https://superlative-sunshine-4a247f.netlify.app/**

This guide will help you:
1. **Get a free custom domain** (like `nameit-game.com` or `play-nameit.netlify.app`)
2. **Set up automatic updates** when you make changes
3. **Make it easier to share** with a better URL

---

## Option 1: Free Custom Subdomain (Easiest - 2 minutes)

Netlify gives you a free custom subdomain that's easier to remember:

### Steps:
1. Go to **https://app.netlify.com** and log in
2. Click on your site (should be named something like "NameIt" or "superlative-sunshine-4a247f")
3. Click **"Site settings"** (gear icon) in the top menu
4. Click **"Change site name"** in the "General" section
5. Type a name like: `nameit-game` or `play-nameit` or `nameit-vocabulary`
6. Click **"Save"**
7. Your new URL will be: `https://nameit-game.netlify.app` (or whatever you chose)

**That's it!** Your game is now at a much easier URL to remember and share.

---

## Option 2: Connect Your Own Domain (Free, but requires buying a domain)

If you want a domain like `nameit.com` or `nameit-game.com`:

### Step 1: Buy a Domain (usually $10-15/year)
- **Namecheap.com** - Popular and cheap
- **Google Domains** - Simple interface
- **GoDaddy** - Well-known option

Look for `.com`, `.net`, or `.org` domains. `.com` is usually $10-15/year.

### Step 2: Connect to Netlify (Free)
1. In Netlify, go to your site → **"Site settings"** → **"Domain management"**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `nameit-game.com`)
4. Follow Netlify's instructions to update your domain's DNS settings
5. Wait 5-60 minutes for DNS to update
6. Your game will be live at your custom domain!

**Note:** Netlify hosting is **completely free** even with a custom domain. You only pay for the domain name itself.

---

## Option 3: Update Your Game Automatically (Recommended)

Set up automatic deployments so when you update the game, it updates on the website automatically:

### Method A: Drag & Drop (Simple, but manual)
1. Make changes to your game files
2. Go to **https://app.netlify.com**
3. Drag your entire `NameIt` folder onto the site
4. Wait for it to deploy (usually 10-30 seconds)
5. Done! Your changes are live

### Method B: Git Integration (Automatic, but requires Git setup)
1. Create a GitHub account (free) at **https://github.com**
2. Create a new repository called `nameit-game`
3. Upload your files to GitHub
4. In Netlify, go to **"Site settings"** → **"Build & deploy"**
5. Click **"Link repository"** and connect your GitHub account
6. Select your `nameit-game` repository
7. Click **"Deploy site"**

Now, whenever you update files on GitHub, Netlify will automatically update your website!

---

## Quick Tips

### Making Your Site More Professional:
1. **Add a favicon** (the little icon in browser tabs):
   - Create a 32x32 pixel image
   - Save it as `favicon.ico` in your project folder
   - Netlify will automatically use it

2. **Add a description** for search engines:
   - In `index.html`, add this inside the `<head>` section:
   ```html
   <meta name="description" content="NameIt - A fast-paced voice-controlled vocabulary game. Say what you see and beat the clock!">
   ```

3. **Share your game**:
   - Send the URL to friends: `https://your-site-name.netlify.app`
   - Works on phones, tablets, and computers
   - No installation needed - just open in a browser!

---

## Current Status

✅ **Your game is already live and working!**
- Current URL: `https://superlative-sunshine-4a247f.netlify.app/`
- Status: Fully functional
- Cost: $0 (completely free)

**Next step:** Follow Option 1 above to get a better URL name!

---

## Troubleshooting

**Q: Can I change the site name later?**
A: Yes! You can change it anytime in Netlify settings.

**Q: Is there a limit to how many people can play?**
A: No! Netlify's free plan handles thousands of visitors. You only need to upgrade if you get millions of visitors per month.

**Q: What if I want to stop the website?**
A: You can delete the site in Netlify settings, or just stop updating it. There's no ongoing cost.

**Q: Can I password-protect the site?**
A: Yes! Netlify has a free password protection feature in site settings.

---

## Need Help?

- **Netlify Support**: https://docs.netlify.com
- **Netlify Community**: https://answers.netlify.com

Your game is ready to share with the world! 🎮🌍
