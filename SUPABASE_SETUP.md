# Supabase Integration Guide

## Overview

This app uses **Supabase** for:

- 🔐 User authentication (signup, login, password reset)
- 💾 Database storage (job applications, resume analyses, match results)
- 🔒 Row Level Security (RLS) to protect user data

## Environment Variables Explained

### Public Variables (Safe for Browser)

These variables start with `NEXT_PUBLIC_` because they're exposed in your frontend code. This is secure because:

1. They only work with the Supabase **anonymous key** (read in `.env.example`)
2. The anonymous key can only perform operations allowed by RLS policies
3. Users can only access their own data

| Variable                        | Example Value                | Used For               |
| ------------------------------- | ---------------------------- | ---------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://abc123.supabase.co` | API endpoint           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` (JWT token)     | Browser authentication |

### Secret Variables (NEVER Expose)

These should NEVER be used in frontend code:

- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` - This has unrestricted database access. Keep it secret!
- Used only for backend operations (if you add API routes later)

## Security Architecture

### Why Row Level Security (RLS)?

RLS policies ensure users can only access their own data:

```sql
-- Example: Users can only see their own applications
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);
```

This means even if someone tried to hack the anon key, they could only access their own records.

### How It Works

1. **User signs up** → Supabase Auth creates user account
2. **Session stored** → User's session ID saved in browser (secure, httpOnly cookie if possible)
3. **API calls authenticated** → Session ID sent with each request
4. **RLS checks** → Supabase verifies `auth.uid()` matches `user_id` in database
5. **Data protected** → Only their data is returned

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up
2. Click "New Project"
3. Choose your region (same region as users = faster)
4. Set a strong database password
5. Wait for initialization (~2-3 minutes)

### Step 2: Get API Credentials

1. Open your project → Click "Settings" (⚙️ icon)
2. Go to "API" tab
3. Copy these values:
   - **Project URL** (under "Project API")
   - **Project API Keys** → Copy the `anon` key (labeled "public")

⚠️ **Important**: There are multiple keys visible. Use only:

- ✅ `anon` (public) - Safe for browser
- ❌ `service_role` - NEVER expose to browser

### Step 3: Create Database Tables

In your Supabase project:

1. Go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Paste the complete SQL below
4. Click **RUN**

```sql
-- Applications Tracker Table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'Applied',
  applied_date DATE,
  next_step TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resume Analyses History
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

-- Job Match Results
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

-- Security Policies for Applications
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON applications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON applications
  FOR DELETE USING (auth.uid() = user_id);

-- Security Policies for Resume Analyses
CREATE POLICY "Users can view own resume analyses" ON resume_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create resume analyses" ON resume_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Security Policies for Job Matches
CREATE POLICY "Users can view own job matches" ON job_matches
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create job matches" ON job_matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Step 4: Configure Authentication

1. In your Supabase project, go to **Authentication** (left sidebar)
2. Click **Providers**
3. Ensure **Email** provider is enabled (default: yes)
4. Go to **URL Configuration** (still in Authentication settings)
5. Add your callback URLs:
   - **Redirect URLs**: Add your Vercel domain and localhost
     ```
     http://localhost:3000
     https://your-app.vercel.app
     ```
6. Save

### Step 5: Local Development

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

3. Test locally:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Try: Signup → Login → Create application entry → Tracker
   ```

### Step 6: Production (Vercel)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
   ```
5. Go to **Deployments** and redeploy
6. Test at your Vercel domain

## Troubleshooting

### "Missing environment variables"

**Symptom**: Error message about missing `NEXT_PUBLIC_SUPABASE_URL`

**Fix**:

- Local: Add both variables to `.env.local`
- Production: Add to Vercel's Environment Variables → Redeploy

### Auth showing config error

**Symptom**: Error like "Supabase configuration error" on login page

**Fix**:

1. Check that your `.env.local` values are correct
2. Ensure URL ends with `.supabase.co` (no trailing slash)
3. Verify anon key starts with `eyJ` (it's a JWT)

### Can't sign up / Authentication failing

**Symptom**: Signup form shows 401 error

**Fix**:

1. Verify you're using the `anon` (public) key, not `service_role`
2. Check that Email provider is enabled in Supabase Authentication settings
3. Ensure callback URLs are configured in Supabase

### Can't see tracker data

**Symptom**: Authenticated but tracker page shows no applications

**Fix**:

1. Check RLS policies were created correctly (see SQL step above)
2. Verify tables exist: Supabase → Table Editor, should see `applications`, `resume_analyses`, `job_matches`
3. Try adding a test application manually in Supabase Table Editor

### Performance Issues

**Optimize**:

- Add indexes for frequently queried columns:
  ```sql
  CREATE INDEX idx_applications_user_id ON applications(user_id);
  CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
  ```
- Monitor usage at https://app.supabase.com → Database → Usage

## Best Practices

### 1. Never Log Credentials

✅ Safe:

```typescript
console.log("Supabase initialized"); // ✅
```

❌ Unsafe:

```typescript
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); // ❌
```

### 2. Always Check for Missing Env Vars

```typescript
if (!supabase) {
  return <div>Configuration error - check your env variables</div>;
}
```

### 3. Use RLS Policies for Security

Always add RLS policies when creating new tables. Never rely solely on frontend checks.

### 4. Rotate Keys if Compromised

If anon key is exposed:

1. Go to Supabase → Settings → API
2. Click ⚙️ next to the anon key
3. Generate a new key
4. Update all deployments with new key

## Production Checklist

- [ ] Supabase project created
- [ ] Tables created with RLS policies
- [ ] Email authentication configured
- [ ] Callback URLs added to Supabase
- [ ] `.env.local` configured for local testing
- [ ] `npm run dev` works locally with signup/login
- [ ] Environment variables added to Vercel Project Settings
- [ ] Vercel deployment redeployed after adding env vars
- [ ] Production signup tested with real email
- [ ] Tracked an application in production
- [ ] Verify RLS is working (can't access other users' data)

## Getting Help

- Supabase Docs: https://supabase.com/docs
- Supabase Community: https://discord.gg/erZmwtqezT
- Next.js & Supabase: https://supabase.com/docs/guides/getting-started/nextjs
