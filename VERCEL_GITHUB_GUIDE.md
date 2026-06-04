
# 🚀 AFAR MKOPO FASTA - Full Deployment Walkthrough

---

## 📤 PART 1: Push to GitHub (5 Minutes)

### Step 1: Open Terminal
1. Press `Win + X` and select **Windows Terminal (or Command Prompt)**
2. Navigate to your project folder by typing:
   ```bash
   cd "c:\Users\KINGKAI\Desktop\TRAE\AFAR MIKOPO"
   ```

### Step 2: Initialize Git & Commit
Run these commands one by one in your terminal:
```bash
git init
git add .
git commit -m "First commit: AFAR MKOPO FASTA Loan System"
git branch -M main
```

### Step 3: Create GitHub Repo
1. Go to [github.com](https://github.com) and log in
2. Click the **+** sign in top right → **New repository**
3. Fill in:
   - **Repository name**: `afar-mkopo-fasta`
   - Set to **Public** or **Private** (your choice)
   - ⚠️ **DO NOT** check "Initialize with README" or .gitignore
4. Click **Create repository**

### Step 4: Push to GitHub
On your new repo page, copy the commands under **"…or push an existing repository from the command line"**
They will look like this:
```bash
git remote add origin https://github.com/YOUR_USERNAME/afar-mkopo-fasta.git
git branch -M main
git push -u origin main
```
Paste them in your terminal and run!

---

## 🌐 PART 2: Deploy to Vercel (5 Minutes)

### Step 1: Log In to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **Log In** and connect with your **GitHub account**

### Step 2: Import Your Project
1. Click **Add New...** → **Project**
2. Find your `afar-mkopo-fasta` repo and click **Import**

### Step 3: Configure Your Project (IMPORTANT!)
On the "Configure Project" page:
1. **Project Name**: Leave as `afar-mkopo-fasta` (or change it)
2. **Root Directory**: ✏️ Click the **Edit** button and type `frontend`
3. **Framework Preset**: Should auto-detect `Next.js`
4. Leave all other settings as default!
5. Click **Deploy**! 🚀

### Step 4: Wait for Deployment
- Vercel will build and deploy your app (takes 1-2 minutes)
- Once done, you'll see a **Congratulations!** screen with your live URL!

---

## 🎊 That's It!
Your AFAR MKOPO FASTA system is now LIVE! 🎉

### Optional: Deploy Backend Later
If you want to deploy the backend later, you can use:
- [Render.com](https://render.com) (free tier available)
- [Railway.app](https://railway.app)
