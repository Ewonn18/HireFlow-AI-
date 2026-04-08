# Production Deployment Guide

This project is now production-ready for deployment on Vercel or similar platforms.

## Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase project (free tier available)

## Environment Variables

### What You Need

This app requires **two** Supabase environment variables:

| Variable                        | Where to Get                        | What It Does                            |
| ------------------------------- | ----------------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Dashboard → Settings → API | Your Supabase project endpoint (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | Anonymous auth key for browser (public) |

**Why `NEXT_PUBLIC_` prefix?**

- These variables are safe to expose in the browser
- They only allow operations permitted by your Supabase Row Level Security (RLS) policies
- Never expose the `service_role` key to the browser

### Supabase Setup (Required Before Deployment)

1. **Create a Supabase project** (free tier available):
   - Go to https://supabase.com
   - Sign up with GitHub, Google, or email
   - Click "New Project" and choose your region
   - Wait for project initialization (~2 minutes)

2. **Get your API credentials**:
   - Open your project dashboard
   - Go to **Settings** → **API**
   - Copy the **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy the **anon public** API key (the `public` key, NOT `service_role`)
   - ⚠️ Never expose the `service_role` key to the browser

3. **Set up required tables** (for Application Tracker):

   ```sql
   -- Run these in your Supabase SQL Editor (Settings → SQL)
   CREATE TABLE applications (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     company TEXT NOT NULL,
     role TEXT NOT NULL,
     status TEXT DEFAULT 'Applied' CHECK (status IN ('Applied', 'Interviewing', 'Offer', 'Rejected', 'Saved')),
     applied_date DATE,
     next_step TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE resume_analyses (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     file_name TEXT NOT NULL,
     extracted_text TEXT,
     match_score INTEGER,
     strengths TEXT[],
     missing_skills TEXT[],
     suggestions TEXT[],
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE job_matches (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     job_description TEXT NOT NULL,
     match_score INTEGER,
     matched_skills TEXT[],
     missing_skills TEXT[],
     suggestions TEXT[],
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Enable Row Level Security
   ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

   -- Allow users to see only their own data
   CREATE POLICY "Users can view own applications" ON applications
     FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can create applications" ON applications
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own applications" ON applications
     FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can delete own applications" ON applications
     FOR DELETE USING (auth.uid() = user_id);

   CREATE POLICY "Users can view own resume analyses" ON resume_analyses
     FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can create resume analyses" ON resume_analyses
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can view own job matches" ON job_matches
     FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can create job matches" ON job_matches
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

### Local Development Setup

1. **Copy `.env.example` to `.env.local`:**

   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your Supabase credentials in `.env.local`:**

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://iyqfpqmixmunmyzusvlh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Test locally:**

   ```bash
   npm run dev
   # Visit http://localhost:3000 and test signup/login
   ```

4. **Important:** Never commit `.env.local` to git (it's in `.gitignore`)

### Vercel Production Setup

1. **Deploy on Vercel**:
   - Push your code to GitHub
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Click "Deploy" (it will fail without env vars, which is expected)

2. **Add environment variables in Vercel**:
   - After deployment, go to **Project Settings** → **Environment Variables**
   - Add both variables:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - Save changes

3. **Redeploy**:
   - Go to **Deployments**
   - Click the ⋮ menu on the top deployment
   - Select "Redeploy"
   - Wait for deployment to complete

4. **Test production**:
   - Visit your Vercel domain (e.g., `hireflow-ai.vercel.app`)
   - Test signup with a new email account
   - Test all features to ensure they work

**Important:**

- Never commit `.env.local` with real keys to git
- Use Vercel's Environment Variables dashboard for production keys
- Environment variables are built into the app at deploy time

## Deployment on Vercel

1. **Connect repository:** Push this project to GitHub
2. **Import to Vercel:** Visit https://vercel.com/new and import your GitHub repo
3. **Configure environment:** Add the environment variables above in Vercel dashboard
4. **Deploy:** Vercel deploys automatically on push to main branch

## Production Optimizations Applied

- ✅ Security headers configured (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
- ✅ Image optimization enabled
- ✅ Source maps disabled in production
- ✅ Compression enabled
- ✅ Error boundary (error.tsx) for graceful error handling
- ✅ 404 page (not-found.tsx) for missing routes
- ✅ Development console logs excluded from production
- ✅ API route validation and error handling improved
- ✅ TypeScript strict mode passing

## Pre-deployment Checklist

- [ ] Environment variables set in Vercel dashboard
- [ ] Test login/signup with real Supabase project
- [ ] Test all features: resume upload, cover letter generation, job match
- [ ] Verify tracker works with authenticated user
- [ ] Test in incognito/private mode to verify auth redirects
- [ ] Check mobile responsiveness
- [ ] Verify dark mode works correctly

## Monitoring & Support

- Check Vercel deployment logs: https://vercel.com/dashboard
- Enable error tracking (recommended: Sentry, LogRocket)
- Monitor Supabase usage at https://app.supabase.com

## Building Locally

```bash
npm run build
npm run start
```

The app will run on http://localhost:3000

## Troubleshooting

**Build fails with "NEXT_PUBLIC_SUPABASE_URL not found"**

- Ensure environment variables are set in Vercel (not just locally)
- Variables must be prefixed with `NEXT_PUBLIC_` to be accessible in browser

**Auth redirects not working**

- Verify Supabase URL and anon key are correct
- Check Supabase project's Auth settings
- Ensure callback URLs are configured in Supabase

**Images not loading**

- Verify image paths in `next.config.ts`
- Check public folder permissions
