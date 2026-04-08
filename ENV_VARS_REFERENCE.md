# 🚀 Supabase Environment Variables - Quick Reference

## What You Need

| Status      | Environment Variable            | Example                      | Where to Set              |
| ----------- | ------------------------------- | ---------------------------- | ------------------------- |
| ✅ Required | `NEXT_PUBLIC_SUPABASE_URL`      | `https://abc123.supabase.co` | `.env.local` + **Vercel** |
| ✅ Required | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsIn...`  | `.env.local` + **Vercel** |

## Where to Get These Values

1. Go to https://app.supabase.com/projects/YOUR_PROJECT_ID/settings/api
2. Look for "Project API"
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Keys → anon (public)** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

⚠️ **Don't use the `service_role` key** — it has unrestricted access!

## Setup Checklist

### 1. Local Development (.env.local)

```bash
# Copy template
cp .env.example .env.local

# Edit .env.local with your values (it's in .gitignore, safe from git)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 2. Vercel Production

1. Go to https://vercel.com/dashboard → Select project → Settings
2. **Environment Variables** tab
3. Add both variables above
4. **Redeploy** the project (Deployments tab → ⋮ → Redeploy)

### 3. Verify It Works

**Local:**

```bash
npm run dev
# Visit http://localhost:3000
# Try signup with test@example.com
```

**Production:**

- Visit your Vercel domain
- Try signup with real email
- Check that data persists

## Security Facts

✅ **Safe (Public):**

- `NEXT_PUBLIC_SUPABASE_URL` - It's just a URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Limited by Row Level Security policies

❌ **Dangerous (Keep Secret):**

- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` - Has full database access!

## Troubleshooting

| Problem                            | Solution                                                            |
| ---------------------------------- | ------------------------------------------------------------------- |
| "Missing NEXT_PUBLIC_SUPABASE_URL" | Add both vars to `.env.local`                                       |
| Vercel shows blank page            | Env vars not redeployed - go to Deployments → Redeploy              |
| Login doesn't work                 | Check Supabase Email provider is enabled in Authentication settings |
| Can't see saved data               | Check RLS policies were created (see SUPABASE_SETUP.md)             |

## Important Notes

- ✅ `.env.local` is in `.gitignore` - safe to commit
- ✅ Both `NEXT_PUBLIC_` variables must be set **in two places**: local + Vercel
- ✅ Production uses Supabase free tier (great for projects)
- ⚠️ Never expose `service_role` key to browsers or frontend code

## Next Steps

1. Create Supabase project (free at supabase.com)
2. Copy credentials to `.env.local`
3. Run `npm run dev` and test locally
4. Add credentials to Vercel → Redeploy
5. See full guide: `SUPABASE_SETUP.md`
