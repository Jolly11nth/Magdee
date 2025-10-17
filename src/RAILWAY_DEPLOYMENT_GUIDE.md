# 🚂 Railway Deployment Guide

Complete guide to deploy Magdee Python backend to Railway.

---

## 📋 Prerequisites

- ✅ Railway account ([railway.app](https://railway.app))
- ✅ GitHub repository with Magdee code
- ✅ Supabase project setup
- ✅ API keys (ElevenLabs, OpenAI)

---

## 🚀 Quick Deploy (5 Minutes)

### Step 1: Install Railway CLI

```bash
# macOS/Linux
npm install -g @railway/cli

# Or using Homebrew (macOS)
brew install railway
```

### Step 2: Login to Railway

```bash
railway login
```

This opens your browser for authentication.

### Step 3: Initialize Project

```bash
# In your project root directory
railway init
```

Select:
- **Create a new project**
- **Choose a name:** `magdee-python-backend`

### Step 4: Link GitHub Repository (Optional but Recommended)

```bash
# Link to existing GitHub repo
railway link

# Or deploy from GitHub
# 1. Go to https://railway.app/new
# 2. Click "Deploy from GitHub repo"
# 3. Select your magdee repository
```

### Step 5: Set Environment Variables

```bash
# Required variables
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
railway variables set SUPABASE_ANON_KEY=your_anon_key
railway variables set ENVIRONMENT=production
railway variables set DEBUG=false
railway variables set FRONTEND_ORIGIN=https://your-frontend.vercel.app
railway variables set ELEVENLABS_API_KEY=your_elevenlabs_key
railway variables set OPENAI_API_KEY=your_openai_key

# Optional but recommended
railway variables set LOG_LEVEL=INFO
railway variables set RATE_LIMIT_PER_MINUTE=60
railway variables set RATE_LIMIT_PER_HOUR=1000
```

### Step 6: Deploy

```bash
railway up
```

That's it! Railway will:
- ✅ Build your Docker container
- ✅ Set the PORT automatically
- ✅ Deploy your application
- ✅ Provide a public URL

### Step 7: Get Your URL

```bash
# Get deployment URL
railway status

# Or open in browser
railway open
```

Your backend is now live at: `https://magdee-python-backend.up.railway.app`

---

## 🔧 Detailed Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | ❌ Auto-set | Railway sets this automatically | - |
| `SUPABASE_URL` | ✅ | Your Supabase project URL | https://xxx.supabase.co |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (secret) | eyJ... |
| `SUPABASE_ANON_KEY` | ✅ | Anonymous key (public) | eyJ... |
| `ENVIRONMENT` | ✅ | Set to `production` | production |
| `DEBUG` | ✅ | Set to `false` | false |
| `FRONTEND_ORIGIN` | ✅ | Your frontend URL | https://your-app.vercel.app |
| `ELEVENLABS_API_KEY` | ⚠️ | For TTS (required for audio) | your_key |
| `OPENAI_API_KEY` | ⚠️ | For AI features (optional) | sk-... |
| `LOG_LEVEL` | ❌ | Logging level | INFO |
| `RATE_LIMIT_PER_MINUTE` | ❌ | API rate limit | 60 |
| `JWT_SECRET_KEY` | ⚠️ | For auth tokens | random-secure-key |

### Setting Variables via Dashboard

1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Select your project
3. Click **Variables** tab
4. Click **New Variable**
5. Add key-value pairs
6. Click **Save**

---

## 📦 Deployment Methods

### Method 1: CLI Deployment (Recommended)

```bash
# Deploy current directory
railway up

# Deploy and follow logs
railway up --detach=false

# Deploy specific service
railway up --service python-backend
```

### Method 2: GitHub Integration (Auto-Deploy)

1. **Connect GitHub:**
   ```bash
   railway link
   ```

2. **Configure auto-deploy:**
   - Go to Railway dashboard
   - Select your project
   - Go to **Settings** → **Source**
   - Enable **Auto-deploy**

3. **Now every push to main triggers deployment:**
   ```bash
   git push origin main
   # Railway automatically deploys!
   ```

### Method 3: Railway Dashboard

1. Go to [railway.app/new](https://railway.app/new)
2. Click **Deploy from GitHub repo**
3. Authorize Railway
4. Select repository
5. Configure build settings
6. Add environment variables
7. Deploy

---

## 🔍 Verification

### Check Deployment Status

```bash
# View deployment status
railway status

# View logs
railway logs

# Follow logs in real-time
railway logs --follow
```

### Test Endpoints

```bash
# Get your Railway URL
RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].domain')

# Test health check
curl https://$RAILWAY_URL/api/health

# Or manually
curl https://magdee-python-backend.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": 1234567890,
  "environment": "production",
  "services": {
    "pdf_processing": "operational",
    "audio_conversion": "operational",
    "analytics": "operational"
  }
}
```

### Test API Documentation

Visit: `https://your-app.up.railway.app/api/docs`

You should see interactive API documentation.

---

## 🌐 Update Frontend

After deploying to Railway, update your frontend:

### Vercel

```bash
# Set environment variable
vercel env add VITE_PYTHON_BACKEND_URL production

# Enter: https://your-app.up.railway.app

# Redeploy
vercel --prod
```

### Netlify

1. Go to **Site settings** → **Environment variables**
2. Add `VITE_PYTHON_BACKEND_URL`
3. Value: `https://your-app.up.railway.app`
4. Trigger redeploy

### Local `.env`

Update `.env` for testing:
```bash
VITE_PYTHON_BACKEND_URL=https://your-app.up.railway.app
```

---

## 📊 Monitoring & Logs

### View Logs

```bash
# Recent logs
railway logs

# Follow logs (real-time)
railway logs --follow

# Filter logs
railway logs | grep ERROR

# Export logs
railway logs > logs.txt
```

### Metrics Dashboard

1. Go to Railway dashboard
2. Select your project
3. View **Metrics** tab:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

### Alerts (Pro Plan)

Set up alerts for:
- High CPU usage
- High memory usage
- Deployment failures
- Health check failures

---

## 🔄 Updates & Rollbacks

### Deploy Updates

```bash
# Deploy latest code
railway up

# Deploy specific commit
git checkout <commit-hash>
railway up
```

### Rollback

```bash
# List deployments
railway deployments

# Rollback to specific deployment
railway rollback <deployment-id>
```

### Zero-Downtime Deployment

Railway automatically does zero-downtime deployments:
1. Builds new version
2. Starts new container
3. Waits for health check
4. Routes traffic to new version
5. Shuts down old version

---

## 💰 Pricing & Limits

### Starter Plan (Free)
- $5 free credits/month
- Perfect for development
- 512 MB RAM
- 1 vCPU

### Developer Plan ($5/month)
- $5 + usage
- 8 GB RAM
- 8 vCPU
- Custom domains

### Estimating Costs

For Magdee backend:
- **Light usage**: $5-10/month
- **Medium usage**: $10-20/month
- **Heavy usage**: $20-50/month

Monitor usage:
```bash
railway billing
```

---

## 🐛 Troubleshooting

### Deployment Fails

**Check logs:**
```bash
railway logs
```

**Common issues:**

1. **Missing environment variables**
   ```bash
   railway variables
   # Verify all required variables are set
   ```

2. **Dockerfile build fails**
   ```bash
   # Test locally
   docker build -t test .
   ```

3. **Port binding issues**
   - Ensure app reads `PORT` from environment
   - Ensure app binds to `0.0.0.0`

### Health Check Fails

**Symptoms:**
- Deployment shows as unhealthy
- Traffic not routed to app

**Solutions:**

1. **Check health endpoint:**
   ```bash
   railway logs | grep health
   ```

2. **Verify endpoint exists:**
   ```python
   @app.get("/api/health")
   async def health_check():
       return {"status": "healthy"}
   ```

3. **Update railway.json:**
   ```json
   {
     "deploy": {
       "healthcheckPath": "/api/health",
       "healthcheckTimeout": 100
     }
   }
   ```

### Application Crashes

**Check logs:**
```bash
railway logs --follow
```

**Common causes:**

1. **Missing dependencies:**
   ```bash
   # Ensure requirements.txt is complete
   pip freeze > requirements.txt
   ```

2. **Environment variable issues:**
   ```bash
   railway variables
   # Check all required vars are set
   ```

3. **Memory issues:**
   - Upgrade plan for more RAM
   - Optimize memory usage

### CORS Errors

**Update CORS origins in production:**

```python
# app/config.py
@property
def cors_origins(self) -> List[str]:
    if self.environment == "production":
        return [
            self.frontend_origin,
            "https://your-actual-domain.com"
        ]
```

**Set FRONTEND_ORIGIN:**
```bash
railway variables set FRONTEND_ORIGIN=https://your-frontend.vercel.app
```

### Slow Performance

**Solutions:**

1. **Check metrics** in Railway dashboard
2. **Upgrade plan** for more resources
3. **Optimize code:**
   - Add caching
   - Optimize database queries
   - Use async operations

---

## 🔐 Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env` files
- ✅ Use Railway's variable management
- ✅ Rotate keys regularly
- ❌ Don't hardcode secrets

### 2. Service Role Key

```bash
# Keep service role key secure
railway variables set SUPABASE_SERVICE_ROLE_KEY=xxx --secret
```

### 3. CORS Configuration

```bash
# Only allow your frontend
railway variables set FRONTEND_ORIGIN=https://your-app.vercel.app
```

### 4. Rate Limiting

```bash
# Set appropriate limits
railway variables set RATE_LIMIT_PER_MINUTE=60
railway variables set RATE_LIMIT_PER_HOUR=1000
```

---

## 📈 Scaling

### Vertical Scaling

Upgrade to higher tier for:
- More RAM
- More CPU
- Better performance

```bash
# Check current usage
railway metrics
```

### Horizontal Scaling (Pro Plan)

Railway supports:
- Multiple instances
- Auto-scaling
- Load balancing

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code tested locally
- [ ] All dependencies in requirements.txt
- [ ] Dockerfile works locally
- [ ] Environment variables documented
- [ ] Health check endpoint works
- [ ] API documentation accessible

### Railway Setup
- [ ] Railway account created
- [ ] Project initialized
- [ ] GitHub connected (optional)
- [ ] All environment variables set
- [ ] FRONTEND_ORIGIN configured correctly

### Deployment
- [ ] `railway up` succeeds
- [ ] Health check passes
- [ ] Logs show no errors
- [ ] API endpoints respond
- [ ] API docs accessible

### Post-Deployment
- [ ] Frontend updated with Railway URL
- [ ] Frontend can call backend
- [ ] End-to-end testing complete
- [ ] Monitoring set up
- [ ] Team has access

---

## 🎯 Quick Commands Reference

```bash
# Deploy
railway up

# Logs
railway logs
railway logs --follow

# Variables
railway variables
railway variables set KEY=value

# Status
railway status
railway open

# Deployments
railway deployments
railway rollback <id>

# Billing
railway billing

# Help
railway --help
```

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status Page](https://status.railway.app)
- [Railway Changelog](https://railway.app/changelog)

---

## 🆘 Getting Help

1. **Check logs first:**
   ```bash
   railway logs
   ```

2. **Railway Discord:**
   - Join: https://discord.gg/railway
   - Fast community support

3. **GitHub Issues:**
   - Railway: https://github.com/railwayapp/railway
   - Your project issues

4. **Railway Support:**
   - Email: team@railway.app
   - Response within 24 hours

---

**Status:** ✅ Ready to deploy to Railway!

**Deployment time:** ~5 minutes

**Next step:** Run `railway up` 🚀
