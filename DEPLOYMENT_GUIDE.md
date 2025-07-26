# Vercel Deployment Guide for Gym Tracker

## Step 1: Prepare Your Code for Deployment

1. **Download your code** from Replit:
   - Click on the three dots menu (⋯) in the file explorer
   - Select "Download as zip"
   - Extract the zip file on your computer

## Step 2: Set Up Database (Free Option)

Since you'll need a PostgreSQL database, use **Supabase** (free tier):

1. Go to [supabase.com](https://supabase.com)
2. Create a free account and new project
3. Go to Settings → Database
4. Copy your connection string (it looks like: `postgresql://user:pass@host:port/database`)
5. Keep this handy - you'll need it for environment variables

## Step 3: Deploy to Vercel

1. **Install Vercel CLI** (optional but recommended):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via GitHub** (recommended):
   - Upload your code to a GitHub repository
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login and click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables** in Vercel dashboard:
   ```
   DATABASE_URL=your_supabase_connection_string
   SESSION_SECRET=any_random_long_string_here
   NODE_ENV=production
   REPL_ID=your_project_name
   REPLIT_DOMAINS=your-app.vercel.app
   ISSUER_URL=https://replit.com/oidc
   ```

## Step 4: Update Authentication

Since you're moving from Replit to Vercel, you'll need to:

1. **Replace Replit Auth** with a simpler solution like:
   - Google OAuth (free)
   - Auth0 (free tier)
   - NextAuth.js
   - Or remove auth temporarily for testing

## Step 5: Fix the Build Configuration

Update your `vercel.json` to:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```

## Alternative: Simple Static Deployment

For a **super simple deployment** without backend:
1. Remove authentication temporarily
2. Use localStorage instead of database
3. Deploy just the frontend to Vercel/Netlify (100% free)

## Cost Breakdown

**Vercel + Supabase (Recommended):**
- Vercel: Free (hobby plan)
- Supabase: Free (up to 500MB database)
- Total: **$0/month**

**Limitations on free tier:**
- Vercel: 100GB bandwidth/month
- Supabase: 500MB database, 2GB data transfer

Would you like me to help you with any specific step, or would you prefer the simplified version without authentication first?