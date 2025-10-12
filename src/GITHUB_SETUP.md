# 🚀 GitHub Integration Setup Guide

Complete guide to set up GitHub repository with CI/CD, automation, and deployment.

## 📋 Table of Contents

1. [Initial Repository Setup](#initial-repository-setup)
2. [GitHub Secrets Configuration](#github-secrets-configuration)
3. [CI/CD Workflows](#cicd-workflows)
4. [Deployment Setup](#deployment-setup)
5. [Branch Protection Rules](#branch-protection-rules)
6. [Additional Configuration](#additional-configuration)

---

## 1. Initial Repository Setup

### Create Repository

**Option A: Via GitHub Web**
1. Go to https://github.com/new
2. Repository name: `magdee`
3. Description: `PDF to Audio conversion platform with Python FastAPI backend`
4. Set to **Private** or **Public** (your choice)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

**Option B: Via GitHub CLI**
```bash
gh repo create magdee --private --description "PDF to Audio conversion platform"
```

### Connect Local Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Magdee with Python FastAPI backend integration"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/magdee.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 2. GitHub Secrets Configuration

### Navigate to Settings
`Repository → Settings → Secrets and variables → Actions → New repository secret`

### Required Secrets

#### Supabase Configuration
```
Name: SUPABASE_URL
Value: https://your-project.supabase.co

Name: SUPABASE_SERVICE_ROLE_KEY
Value: your_service_role_key_here

Name: REACT_APP_SUPABASE_URL
Value: https://your-project.supabase.co

Name: REACT_APP_SUPABASE_ANON_KEY
Value: your_anon_key_here
```

#### Python Backend Deployment
```
Name: RAILWAY_TOKEN
Value: your_railway_token
# Get from: https://railway.app/account/tokens

Name: RENDER_DEPLOY_HOOK
Value: https://api.render.com/deploy/srv-xxxxx
# Get from: Render Dashboard → Service → Settings → Deploy Hook
```

#### Frontend Deployment
```
Name: VERCEL_TOKEN
Value: your_vercel_token
# Get from: https://vercel.com/account/tokens

Name: NETLIFY_AUTH_TOKEN
Value: your_netlify_token
# Get from: https://app.netlify.com/user/applications

Name: NETLIFY_SITE_ID
Value: your_site_id
# Get from: Site Settings → Site Details
```

#### Docker (Optional)
```
Name: DOCKER_USERNAME
Value: your_dockerhub_username

Name: DOCKER_PASSWORD
Value: your_dockerhub_password_or_token
```

#### Python Backend URL
```
Name: VITE_PYTHON_BACKEND_URL
Value: https://your-python-backend.railway.app
# Or your production backend URL
```

---

## 3. CI/CD Workflows

### Workflows Included

1. **`python-backend-ci.yml`** - Python backend testing
   - Runs on: Push/PR to main/develop
   - Tests: Pytest, Lint, Security scan
   - Matrix: Python 3.9, 3.10, 3.11

2. **`frontend-ci.yml`** - Frontend build and testing
   - Runs on: Push/PR to main/develop
   - Tests: Build, Type check, Lint
   - Matrix: Node 18.x, 20.x

3. **`deploy-python-backend.yml`** - Deploy Python backend
   - Runs on: Push to main
   - Deploys to: Railway, Render
   - Builds: Docker image

4. **`deploy-frontend.yml`** - Deploy frontend
   - Runs on: Push to main
   - Deploys to: Vercel, Netlify

5. **`codeql-analysis.yml`** - Security scanning
   - Runs on: Push, PR, Weekly schedule
   - Scans: JavaScript, Python

### Enable Workflows

Workflows are automatically enabled when you push `.github/workflows/` to your repository.

### Manual Workflow Triggers

You can manually trigger deployments:
```bash
# Via GitHub CLI
gh workflow run deploy-python-backend.yml
gh workflow run deploy-frontend.yml

# Or via GitHub web UI:
# Actions → Select workflow → Run workflow
```

---

## 4. Deployment Setup

### Python Backend - Railway

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Create Project**
```bash
railway init
```

4. **Link to GitHub**
```bash
railway link
```

5. **Add Environment Variables**
```bash
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key
railway variables set ENVIRONMENT=production
railway variables set DEBUG=false
```

6. **Deploy**
```bash
railway up
```

7. **Get Deploy Token for CI/CD**
```bash
railway tokens create
# Add this to GitHub Secrets as RAILWAY_TOKEN
```

### Python Backend - Render (Alternative)

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: magdee-python-backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m app.main`
   - **Plan**: Free or Starter
5. Add environment variables
6. Click "Create Web Service"
7. Copy Deploy Hook URL → Add to GitHub Secrets

### Frontend - Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Link Project**
```bash
vercel link
```

4. **Add Environment Variables**
```bash
vercel env add REACT_APP_SUPABASE_URL production
vercel env add REACT_APP_SUPABASE_ANON_KEY production
vercel env add VITE_PYTHON_BACKEND_URL production
```

5. **Deploy**
```bash
vercel --prod
```

6. **Get Token for CI/CD**
```bash
# Go to: https://vercel.com/account/tokens
# Create token → Add to GitHub Secrets as VERCEL_TOKEN
```

### Frontend - Netlify (Alternative)

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables
6. Deploy
7. Get deploy token for CI/CD

---

## 5. Branch Protection Rules

### Set Up Branch Protection

1. Go to: `Repository → Settings → Branches`
2. Click "Add rule"
3. Branch name pattern: `main`

### Recommended Rules

```yaml
✅ Require pull request reviews before merging
   - Required approvals: 1
   
✅ Require status checks to pass before merging
   - Require branches to be up to date
   - Status checks:
     - Python Backend CI / test
     - Frontend CI / build
     
✅ Require conversation resolution before merging

✅ Include administrators

✅ Allow force pushes: No

✅ Allow deletions: No
```

### Additional Branch: `develop`

Create a `develop` branch for staging:
```bash
git checkout -b develop
git push -u origin develop
```

Add similar protection rules for `develop` branch.

---

## 6. Additional Configuration

### Enable Dependabot

Dependabot is configured via `.github/dependabot.yml`. It will:
- Check for npm updates weekly
- Check for pip updates weekly
- Check for GitHub Actions updates weekly
- Create PRs automatically

### Enable GitHub Pages (Optional)

For documentation hosting:

1. Go to `Settings → Pages`
2. Source: Deploy from a branch
3. Branch: `main` → `/docs` folder
4. Save

### Enable Discussions (Optional)

For community engagement:

1. Go to `Settings → General`
2. Features → Check "Discussions"
3. Set up discussion categories

### Labels

Create custom labels for better organization:

```bash
# Via GitHub CLI
gh label create "python-backend" --color "0052CC" --description "Python backend related"
gh label create "frontend" --color "00B8D9" --description "Frontend related"
gh label create "deployment" --color "FF5630" --description "Deployment related"
gh label create "documentation" --color "6554C0" --description "Documentation updates"
```

### Project Boards

Create a project board:

1. Go to `Projects → New project`
2. Choose template: "Automated kanban"
3. Create columns: To Do, In Progress, Done
4. Link to repository

---

## 7. Testing GitHub Integration

### Test CI/CD

1. **Create a test branch**
```bash
git checkout -b test/github-integration
```

2. **Make a small change**
```bash
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: GitHub integration"
git push -u origin test/github-integration
```

3. **Create Pull Request**
```bash
gh pr create --title "Test: GitHub Integration" --body "Testing CI/CD workflows"
```

4. **Check Actions**
- Go to `Actions` tab
- Verify workflows are running
- Check for any errors

5. **Merge if successful**
```bash
gh pr merge --squash
```

### Test Deployments

1. **Python Backend**
```bash
# Check health
curl https://your-app.railway.app/api/health
```

2. **Frontend**
```bash
# Visit your Vercel URL
open https://your-app.vercel.app
```

---

## 8. Maintenance

### Weekly Tasks

- Review Dependabot PRs
- Check failed workflow runs
- Monitor deployment logs
- Review open issues/PRs

### Monthly Tasks

- Update dependencies manually if needed
- Review and update documentation
- Check security advisories
- Optimize workflows if needed

---

## 🎯 Quick Command Reference

```bash
# Repository setup
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/magdee.git
git push -u origin main

# Create branches
git checkout -b develop
git checkout -b feature/new-feature

# Deploy
railway up                  # Deploy Python backend
vercel --prod              # Deploy frontend

# GitHub CLI shortcuts
gh pr create               # Create PR
gh pr merge               # Merge PR
gh workflow run           # Run workflow
gh secret set NAME        # Add secret
```

---

## 🆘 Troubleshooting

### Workflow Failures

**Python tests failing:**
```bash
# Run locally first
pytest app/ -v
```

**Frontend build failing:**
```bash
# Check build locally
npm run build
```

**Deployment failing:**
- Check GitHub Secrets are set correctly
- Verify deployment service is accessible
- Check logs in deployment platform

### Secret Issues

If secrets aren't working:
1. Verify exact secret names match workflow files
2. Check for trailing spaces in secret values
3. Re-create the secret if needed

---

## ✅ Checklist

- [ ] Repository created and pushed
- [ ] All GitHub Secrets configured
- [ ] Branch protection rules set up
- [ ] Railway/Render configured for Python backend
- [ ] Vercel/Netlify configured for frontend
- [ ] Workflows tested and passing
- [ ] Dependabot enabled
- [ ] Documentation updated

---

**GitHub integration is now complete!** 🎉

Your repository is set up with:
- ✅ Automated CI/CD pipelines
- ✅ Automated deployments
- ✅ Security scanning
- ✅ Dependency management
- ✅ Issue templates
- ✅ PR templates

**Next Steps:**
1. Push your code to GitHub
2. Verify workflows run successfully
3. Set up deployment platforms
4. Start developing with confidence!

For questions, check the GitHub Actions logs or deployment platform documentation.
