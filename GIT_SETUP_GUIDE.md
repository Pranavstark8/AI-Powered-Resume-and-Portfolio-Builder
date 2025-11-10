# 🚀 Git Setup & Push Guide

## Complete Step-by-Step Guide to Push Your Project to GitHub

Follow these steps **in order** to successfully push your code to GitHub.

---

## 📋 Prerequisites Checklist

Before starting, ensure:
- [ ] You have Git installed (`git --version` to check)
- [ ] You have a GitHub account
- [ ] Repository URL: `https://github.com/Pranavstark8/AI-Powered-Resume-and-Portfolio-Builder.git`
- [ ] `.gitignore` file is properly configured
- [ ] `.env` files are NOT in the repository (they're ignored)

---

## 🔄 Option 1: Fresh Start (Recommended)

Use this if your Git is completely messed up or you want to start clean.

### Step 1: Remove Existing Git Configuration

```bash
# Navigate to your project root
cd D:\Resume_Builder

# Remove the .git folder (Windows PowerShell)
Remove-Item -Recurse -Force .git

# Verify it's gone
Get-ChildItem -Force
```

### Step 2: Initialize Fresh Git Repository

```bash
# Initialize new Git repository
git init

# Check status
git status
```

### Step 3: Configure Git (If Not Already Done)

```bash
# Set your name
git config --global user.name "Pranav Stark"

# Set your email (use your GitHub email)
git config --global user.email "your-email@example.com"

# Verify configuration
git config --list
```

### Step 4: Add All Files

```bash
# Add all files (respecting .gitignore)
git add .

# Check what will be committed
git status
```

**⚠️ Important**: Verify that `node_modules/` and `.env` files are NOT in the list!

### Step 5: Create Initial Commit

```bash
# Create your first commit
git commit -m "Initial commit: AI-Powered Resume and Portfolio Builder"
```

### Step 6: Add Remote Repository

```bash
# Add GitHub repository as remote
git remote add origin https://github.com/Pranavstark8/AI-Powered-Resume-and-Portfolio-Builder.git

# Verify remote was added
git remote -v
```

### Step 7: Push to GitHub

```bash
# Push to GitHub (main branch)
git branch -M main
git push -u origin main
```

**If you get an authentication error**, you'll need to use a Personal Access Token:
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permissions
3. Use token as password when prompted

---

## 🔄 Option 2: Fix Existing Repository

Use this if you want to fix issues without starting fresh.

### Step 1: Check Current Status

```bash
cd D:\Resume_Builder
git status
```

### Step 2: Remove All Tracked Files from Git (Keep Local Files)

```bash
# Remove everything from Git index
git rm -r --cached .

# Add everything back (respecting .gitignore)
git add .

# Check status
git status
```

### Step 3: Commit Changes

```bash
git commit -m "Fix: Update .gitignore and clean repository"
```

### Step 4: Check Remote

```bash
# Check if remote exists
git remote -v

# If no remote, add it:
git remote add origin https://github.com/Pranavstark8/AI-Powered-Resume-and-Portfolio-Builder.git

# If remote exists but wrong URL:
git remote set-url origin https://github.com/Pranavstark8/AI-Powered-Resume-and-Portfolio-Builder.git
```

### Step 5: Push to GitHub

```bash
# If repository is empty on GitHub
git push -u origin main

# If repository has content and you want to overwrite (⚠️ CAREFUL!)
git push -f origin main
```

---

## 📂 What Should Be Committed?

### ✅ **DO COMMIT** (Should be in Git):

```
✅ Source code files (.js, .jsx, .json)
✅ Configuration files (without secrets)
✅ package.json files
✅ README.md
✅ .gitignore
✅ Public assets (images, icons)
✅ Database migration files
✅ Documentation files
```

### ❌ **DON'T COMMIT** (Should be in .gitignore):

```
❌ node_modules/
❌ .env files (environment variables)
❌ build/ or dist/ folders
❌ .DS_Store (Mac files)
❌ *.log files
❌ IDE-specific files (.vscode/, .idea/)
❌ package-lock.json (optional)
```

---

## 🐛 Common Errors & Solutions

### **Error 1: "Permission denied (publickey)"**

**Solution**: Use HTTPS instead of SSH or set up SSH keys

```bash
# Change to HTTPS
git remote set-url origin https://github.com/Pranavstark8/AI-Powered-Resume-and-Portfolio-Builder.git
```

### **Error 2: "fatal: not a git repository"**

**Solution**: Initialize Git

```bash
git init
```

### **Error 3: "failed to push some refs"**

**Solution**: Pull first or force push

```bash
# Pull first (if remote has changes)
git pull origin main --allow-unrelated-histories

# Or force push (⚠️ destroys remote history)
git push -f origin main
```

### **Error 4: "Large files detected"**

**Solution**: Check for accidentally committed files

```bash
# Find large files
find . -type f -size +50M

# Remove from Git
git rm --cached path/to/large/file
```

### **Error 5: ".env file in repository"**

**Solution**: Remove from Git immediately!

```bash
# Remove from Git (keeps local file)
git rm --cached backend/.env
git rm --cached frontend/.env

# Commit removal
git commit -m "Remove .env files from repository"

# Push
git push origin main
```

---

## ✅ Verification Checklist

After pushing, verify:

- [ ] Go to: https://github.com/Pranavstark8/AI-Powered-Resume-and-Portfolio-Builder
- [ ] You should see all your code files
- [ ] `node_modules/` folder is NOT visible
- [ ] `.env` files are NOT visible
- [ ] README.md is displayed on the main page
- [ ] All commits are visible in the commit history

---

## 🔒 Security Checklist

Before pushing, ALWAYS check:

- [ ] No API keys in code
- [ ] No database passwords in code
- [ ] No JWT secrets in code
- [ ] All sensitive data is in `.env` files
- [ ] `.env` files are in `.gitignore`
- [ ] No personal information in code

---

## 📝 Recommended Git Workflow (After Initial Push)

### Daily Workflow:

```bash
# 1. Make changes to your code

# 2. Check what changed
git status

# 3. Add specific files
git add filename.js
# Or add all changes
git add .

# 4. Commit with meaningful message
git commit -m "feat: Add profile picture upload feature"

# 5. Push to GitHub
git push origin main
```

### Commit Message Convention:

```bash
feat: Add new feature
fix: Fix a bug
docs: Update documentation
style: Format code (no logic change)
refactor: Restructure code
test: Add tests
chore: Update dependencies
```

---

## 🆘 Emergency: Accidentally Pushed Secrets

If you accidentally pushed `.env` or secrets:

### 1. Remove from Repository

```bash
git rm --cached backend/.env
git commit -m "Remove .env file"
git push origin main
```

### 2. Change All Secrets Immediately!

- Generate new JWT secret
- Change database password
- Regenerate Cloudinary API keys
- Update GitHub Personal Access Token

### 3. Use Git Secret Scanning

GitHub automatically scans for exposed secrets. Check:
- Repository → Security → Secret scanning alerts

---

## 📞 Need Help?

If you're stuck:
1. Check Git status: `git status`
2. Check Git log: `git log --oneline`
3. Check remote: `git remote -v`
4. Google the exact error message
5. Ask on Stack Overflow

---

## ✨ You're All Set!

Your code is now on GitHub! 🎉

**Next Steps:**
1. Add a LICENSE file
2. Add screenshots to README
3. Set up GitHub Actions for CI/CD
4. Enable GitHub Pages for documentation
5. Invite collaborators

---

**Repository URL**: https://github.com/Pranavstark8/AI-Powered-Resume-and-Portfolio-Builder

**Happy Coding!** 🚀

