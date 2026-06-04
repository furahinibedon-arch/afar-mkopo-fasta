
# AFAR MKOPO FASTA - Loan Management System

A comprehensive loan management system for microfinance operations, built with:
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma

## 🚀 Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. In your project, go to **Project Settings → Database**
4. Copy the **Connection String (Pooler)** (set to `Session` mode) - this is your `DATABASE_URL`
5. Copy the **Connection String (Session)** - this is your `DIRECT_URL`
6. Create a `.env` file in the `backend/` folder and add:
```env
DATABASE_URL="your-supabase-pooler-connection-string"
DIRECT_URL="your-supabase-session-connection-string"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
```
7. Run Prisma migrations to create tables:
```bash
cd backend
npx prisma migrate dev --name init
```

## 📤 Step 2: Push to Git

1. Create a new repository on GitHub/GitLab
2. Run these commands in your project folder:
```bash
git init
git add .
git commit -m "Initial commit: AFAR MKOPO FASTA"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

## 🌐 Step 3: Deploy to Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com)
2. Import your git repository
3. In Vercel project settings:
   - **Root Directory**: Set to `frontend`
   - **Environment Variables**: Add any frontend env vars if needed
4. Deploy!

## 🔧 Step 4: Deploy Backend (Optional)

You can deploy the backend to:
- Vercel (as serverless functions)
- Render.com
- Railway.app
- Heroku

Make sure to set the environment variables in your backend hosting platform!

## Project Structure

```
AFAR MIKOPO/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma   # Prisma schema
│   ├── index.js            # Express server
│   ├── package.json
│   └── .env                # Database & JWT secrets
├── frontend/
│   ├── app/
│   │   ├── page.tsx        # Home/Login
│   │   ├── borrower/       # Borrower Portal
│   │   └── admin/          # Admin & Analytics
│   ├── package.json
│   └── ...config files
├── .gitignore
├── README.md
└── TECH_STACK.md
```

## Key Features

- Borrower Portal: Registration, KYC, Loan Applications
- Staff Portal: Loan Review & Approval
- Management Dashboard: Analytics, P&L, Debt Ledger
