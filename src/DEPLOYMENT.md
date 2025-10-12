# Magdee Production Deployment Guide

## Overview

This guide covers deploying your Magdee app with the Python FastAPI backend to production.

## Architecture for Production

```
┌──────────────┐
│   Cloudflare │  (CDN, SSL)
│   or Vercel  │
└──────┬───────┘
       │
┌──────▼───────┐
│    Frontend  │  (React + Vite)
│   (Vercel/   │
│   Netlify)   │
└──────┬───────┘
       │
   ┌───┴───┐
   │       │
┌──▼────┐ ┌▼──────────┐
│Supabase│ │Python API │
│Edge Fn │ │(Railway/  │
│        │ │Render/AWS)│
└──┬─────┘ └─┬─────────┘
   │         │
   └────┬────┘
        │
   ┌────▼────┐
   │Supabase │
   │Database │
   └─────────┘
```

## Option 1: Railway (Recommended for Quick Start)

### Why Railway?
- ✅ Free tier available
- ✅ Auto-deploy from GitHub
- ✅ Built-in environment variables
- ✅ Automatic HTTPS
- ✅ No DevOps experience needed

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/magdee.git
git push -u origin main
```

2. **Create Railway Project**
- Go to https://railway.app
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your Magdee repo

3. **Configure Environment Variables**

In Railway dashboard, add:
```env
ENVIRONMENT=production
DEBUG=false
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_ORIGIN=https://your-frontend-domain.com
PORT=8000
ELEVENLABS_API_KEY=your_key
JWT_SECRET_KEY=your_secret_key
```

4. **Set Start Command**
```
python -m app.main
```

5. **Deploy**
- Railway will automatically deploy
- Get your deployment URL: `https://your-app.up.railway.app`

6. **Update Frontend**

Update `.env` in your frontend:
```env
VITE_PYTHON_BACKEND_URL=https://your-app.up.railway.app
```

## Option 2: Render

### Steps

1. **Create Render Account**
- Go to https://render.com
- Connect GitHub account

2. **Create Web Service**
- New > Web Service
- Connect your repo
- Configure:
  - **Name**: magdee-python-backend
  - **Environment**: Python 3
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `python -m app.main`

3. **Environment Variables**
Add same variables as Railway above

4. **Deploy**
- Render will build and deploy
- Get URL: `https://magdee-python-backend.onrender.com`

## Option 3: AWS (Enterprise Grade)

### Components Needed
- **EC2** or **ECS** for Python backend
- **S3** for file storage
- **CloudFront** for CDN
- **Route53** for DNS
- **ALB** for load balancing

### Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "-m", "app.main"]
```

2. **Build Image**
```bash
docker build -t magdee-python-backend .
```

3. **Test Locally**
```bash
docker run -p 8000:8000 --env-file .env magdee-python-backend
```

4. **Push to ECR**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag magdee-python-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/magdee-python-backend:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/magdee-python-backend:latest
```

5. **Deploy to ECS**
- Create ECS cluster
- Create task definition
- Create service with load balancer

## Frontend Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Environment Variables**

In Vercel dashboard, add:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
VITE_PYTHON_BACKEND_URL=https://your-python-backend.railway.app
```

### Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Add environment variables**

## Environment Variables for Production

### Python Backend (.env)
```env
# Required
ENVIRONMENT=production
DEBUG=false
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_ORIGIN=https://your-domain.com

# Optional
ELEVENLABS_API_KEY=your_key
JWT_SECRET_KEY=your_secret
PORT=8000
```

### Frontend (.env)
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
VITE_PYTHON_BACKEND_URL=https://your-python-backend-url.com
```

## SSL/HTTPS

### Railway/Render
- ✅ Automatic HTTPS included

### Custom Domain

1. **Add Domain in Platform**
2. **Update DNS Records**
```
Type: CNAME
Name: api (or @)
Value: your-platform-url.com
```

3. **Update CORS**
```env
FRONTEND_ORIGIN=https://your-domain.com
```

## Monitoring

### Railway
- Built-in metrics dashboard
- View logs in real-time
- CPU/Memory usage graphs

### Render
- Metrics tab
- Log streaming
- Auto-scaling options

### Additional Tools
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **DataDog** - Application monitoring

## Scaling

### Horizontal Scaling
- Add more instances in platform dashboard
- Railway/Render handle automatically

### Vertical Scaling
- Upgrade instance size
- Railway: Increase memory/CPU
- Render: Change instance type

### Database Scaling
- Supabase auto-scales
- Upgrade plan if needed

## Security Checklist

- [ ] Change JWT_SECRET_KEY
- [ ] Enable HTTPS only
- [ ] Set DEBUG=false
- [ ] Use service role key (not anon key)
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Regular security updates
- [ ] Monitor for suspicious activity

## Backup Strategy

### Database (Supabase)
- Automatic daily backups
- Point-in-time recovery available

### Files
- Store in Supabase Storage
- Configure backup bucket

### Code
- Use Git
- Tag releases
- Keep deployment history

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Python Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Railway
        run: |
          # Railway deployment command
          railway up
```

## Cost Estimates

### Railway (Free Tier)
- ✅ $5 free credit monthly
- ✅ Suitable for development/testing

### Railway (Pro)
- 💰 ~$10-20/month
- CPU: 1-2 cores
- Memory: 1-2GB
- Good for small production apps

### Render (Free)
- ✅ Free tier available
- ⚠️ Spins down after inactivity

### Render (Starter)
- 💰 $7/month
- Always on
- 512MB RAM

### AWS
- 💰 $20-100+/month
- Depends on usage
- Best for enterprise

## Performance Optimization

### Backend
- Enable gzip compression
- Use caching headers
- Optimize database queries
- Use connection pooling

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- CDN for static assets

## Troubleshooting Production Issues

### Logs
```bash
# Railway
railway logs

# Render
# View in dashboard

# AWS
aws logs tail /aws/ecs/magdee
```

### Common Issues

**503 Service Unavailable**
- Check if service is running
- Verify environment variables
- Check logs for errors

**CORS Errors**
- Verify FRONTEND_ORIGIN in .env
- Check allowed origins in middleware

**Slow Performance**
- Enable caching
- Upgrade instance size
- Optimize database queries

## Support

Need help deploying?
- Railway: https://railway.app/help
- Render: https://render.com/docs
- AWS: https://aws.amazon.com/support

---

**Ready to deploy!** Choose your platform and follow the steps above. 🚀
