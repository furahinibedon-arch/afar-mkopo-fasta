
# AFAR MKOPO FASTA - Full Deployment Guide

## 📋 What's Already Done
✅ Project code is written
✅ Supabase credentials are set
✅ .gitignore is created
✅ Prisma schema is ready
✅ Frontend/Backend config is set

---

## 🚀 Step 1: Set Up the Database (Run in Backend Folder)
Open a terminal and run these commands **in order**:
```bash
# Go to backend folder
cd "c:\Users\KINGKAI\Desktop\TRAE\AFAR MIKOPO\backend"

# Generate Prisma Client
npx prisma generate

# Create tables in Supabase
npx prisma migrate dev --name init
```

---

## 📤 Step 2: Push to Git
```bash
# Go to project root
cd "c:\Users\KINGKAI\Desktop\TRAE\AFAR MIKOPO"

# Initialize git
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit: AFAR MKOPO FASTA Loan Management System"

# Rename branch to main
git branch -M main

# Now go to GitHub and create a new repo, then run:
# (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## 🌐 Step 3: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up / Log in
3. Click "Add New Project"
4. Import your GitHub repo
5. In **Configure Project**:
   - **Root Directory**: Enter `frontend`
6. Click "Deploy"! 🚀

---

## 🛠️ Step 4: Start the System Locally (Optional)
To test locally first:

### Backend
```bash
cd "c:\Users\KINGKAI\Desktop\TRAE\AFAR MIKOPO\backend"
node index.js
```

### Frontend (New Terminal)
```bash
cd "c:\Users\KINGKAI\Desktop\TRAE\AFAR MIKOPO\frontend"
npm run dev
```

Then open http://localhost:3000!

---

## 📊 Supabase Connection Details
- **Project URL**: https://woubprgtnjhpnthtggsd.supabase.co
- **Database**: Connected to your Supabase PostgreSQL!
