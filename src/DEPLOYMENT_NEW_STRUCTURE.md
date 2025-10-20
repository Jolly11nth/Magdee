# Deployment Guide - New Structure

This guide covers deploying Magdee with the new frontend/backend split structure.

## Overview

The project is now organized into three deployable components:

1. **Frontend** (`/frontend/`) - React + Vite app
2. **Python Backend** (`/backend/python/`) - FastAPI service
3. **Supabase Edge Functions** (`/backend/supabase/`) - Serverless functions

Each component can be deployed independently to different platforms.

---

## 1. Frontend Deployment

### Vercel (Recommended)

#### Step 1: Connect Repository
1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository

#### Step 2: Configure Build Settings
```
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### Step 3: Environment Variables
Add these in Vercel dashboard:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PYTHON_BACKEND_URL=https://your-backend.railway.app
```

#### Step 4: Deploy
Click "Deploy" - Vercel will automatically deploy on every push.

### Netlify

#### Build Settings
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

#### Environment Variables
Same as Vercel, add in Netlify dashboard.

### Manual Static Hosting

```bash
cd frontend
npm install
npm run build
# Upload 'dist' folder to your hosting (S3, CloudFlare Pages, etc.)
```

---

## 2. Python Backend Deployment

### Railway (Recommended)

#### Step 1: Create New Project
1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"

#### Step 2: Configure Service
```
Root Directory: backend/python
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### Step 3: Environment Variables
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
CORS_ORIGINS=https://your-frontend.vercel.app
PORT=8001
```

#### Step 4: System Dependencies
Railway automatically installs system dependencies. For ffmpeg, add a `nixpacks.toml`:

```toml
# backend/python/nixpacks.toml
[phases.setup]
nixPkgs = ["ffmpeg"]
```

### Render

#### Service Configuration
```
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Root Directory: backend/python
```

Add environment variables in Render dashboard.

### Docker Deployment

```bash
cd backend/python
docker build -t magdee-backend .
docker run -p 8001:8001 --env-file .env magdee-backend
```

---

## 3. Supabase Edge Functions Deployment

### Prerequisites
```bash
npm install -g supabase
supabase login
```

### Link to Project
```bash
cd backend/supabase
supabase link --project-ref your-project-ref
```

### Set Environment Variables
```bash
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_DB_URL=your-db-url
```

### Deploy
```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy server
```

### Verify Deployment
```bash
# Check function status
supabase functions list

# View logs
supabase functions logs server
```

---

## 4. CI/CD Setup

### GitHub Actions Workflows

The project includes GitHub Actions workflows in `.github/workflows/`:

#### Frontend CI/CD (`frontend-ci.yml`)
```yaml
name: Frontend CI/CD
on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        working-directory: frontend
        run: |
          npm install
          npm run build
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

#### Python Backend CI/CD (`python-backend-ci.yml`)
```yaml
name: Python Backend CI/CD
on:
  push:
    branches: [main]
    paths:
      - 'backend/python/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        working-directory: backend/python
        run: |
          pip install -r requirements.txt
          # Railway auto-deploys via webhook
```

### Required GitHub Secrets

Add these in your repository settings:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
SUPABASE_ACCESS_TOKEN=your-supabase-token
SUPABASE_PROJECT_ID=your-project-id
```

---

## 5. Environment Configuration

### Frontend `.env`
```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend URLs
VITE_PYTHON_BACKEND_URL=https://your-backend.railway.app
```

### Python Backend `.env`
```env
# Server
HOST=0.0.0.0
PORT=8001

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# CORS
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173

# Storage
UPLOAD_DIR=/tmp/uploads
AUDIO_OUTPUT_DIR=/tmp/audio
```

### Supabase Secrets
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DB_URL=postgresql://...
```

---

## 6. Deployment Checklist

### Pre-Deployment

- [ ] Update environment variables
- [ ] Test locally with production-like config
- [ ] Run linting and type checking
- [ ] Update API endpoints in frontend
- [ ] Verify CORS settings

### Frontend

- [ ] Build succeeds without errors
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

### Python Backend

- [ ] All dependencies in requirements.txt
- [ ] ffmpeg available in production
- [ ] Database connections working
- [ ] File upload paths configured
- [ ] CORS origins include frontend URL

### Supabase

- [ ] All functions deployed successfully
- [ ] Environment secrets set
- [ ] KV store table exists
- [ ] Auth configured properly

### Post-Deployment

- [ ] Test all API endpoints
- [ ] Verify authentication flow
- [ ] Check file uploads work
- [ ] Test audio conversion
- [ ] Monitor error logs

---

## 7. Monitoring & Logs

### Frontend (Vercel)
- Dashboard: `https://vercel.com/your-project`
- Logs: Real-time in Vercel dashboard
- Analytics: Built-in Vercel Analytics

### Python Backend (Railway)
- Dashboard: `https://railway.app/project/your-project`
- Logs: Real-time logs in Railway dashboard
- Metrics: CPU, Memory, Network usage

### Supabase Functions
```bash
# View logs
supabase functions logs server --project-ref your-ref

# Follow logs in real-time
supabase functions logs server --project-ref your-ref --follow
```

---

## 8. Rollback Strategy

### Frontend
Vercel keeps deployment history - rollback from dashboard.

### Python Backend
Railway allows instant rollback to previous deployments.

### Supabase Functions
```bash
# List function versions
supabase functions list

# Redeploy previous version from git
git checkout <previous-commit>
supabase functions deploy server
```

---

## 9. Troubleshooting

### Frontend Issues

**Build fails:**
- Check Node.js version (18+)
- Clear `node_modules` and reinstall
- Verify all imports are correct

**API calls failing:**
- Verify backend URL in env vars
- Check CORS configuration on backend
- Inspect network tab in browser DevTools

### Backend Issues

**Server won't start:**
- Check Python version (3.9+)
- Verify all env vars are set
- Check port is not in use

**ffmpeg errors:**
- Ensure ffmpeg is installed in production
- For Railway: Add nixpacks.toml with ffmpeg

### Supabase Function Issues

**Function not found:**
- Verify deployment: `supabase functions list`
- Check function name matches code

**Database connection fails:**
- Verify service role key is correct
- Check KV store table exists
- Ensure permissions are set

---

## 10. Cost Estimates

### Vercel (Frontend)
- Hobby: Free (100GB bandwidth)
- Pro: $20/month (unlimited bandwidth)

### Railway (Python Backend)
- Free: $5 credit/month
- Developer: $10/month + usage
- Team: $20/month + usage

### Supabase
- Free: 500MB database, 2GB bandwidth
- Pro: $25/month (8GB database, 50GB bandwidth)

### Total Estimated Cost
- **Development:** Free - $5/month
- **Production:** $25 - $55/month

---

## Support

For deployment issues:
1. Check service-specific documentation
2. Review application logs
3. Consult the README in each directory
4. Open an issue on GitHub

## Next Steps

1. Set up staging environment
2. Configure custom domains
3. Set up monitoring/alerts
4. Implement backup strategy
5. Document runbooks for common issues
