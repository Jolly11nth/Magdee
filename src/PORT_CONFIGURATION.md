# 🔌 Port Configuration Guide

## Overview

Magdee uses specific ports for different environments to avoid conflicts and ensure smooth deployment to Railway.

---

## 📊 Port Assignment

### Local Development

| Service | Port | URL | Notes |
|---------|------|-----|-------|
| **Frontend (Vite)** | `5173` | http://localhost:5173 | Vite's default port |
| **Python Backend** | `8001` | http://localhost:8001 | Avoids conflict with common 8000 |
| **Supabase Edge Functions** | Set by Supabase | - | Not run locally |

### Docker Compose

| Service | Port Mapping | Internal Port | Access URL |
|---------|--------------|---------------|------------|
| **Frontend** | `5173:5173` | 5173 | http://localhost:5173 |
| **Python Backend** | `8001:8001` | 8001 | http://localhost:8001 |

### Production (Railway)

| Service | Port | URL | Notes |
|---------|------|-----|-------|
| **Python Backend** | Auto-assigned by Railway | https://your-app.up.railway.app | Railway sets PORT env var |
| **Frontend (Vercel)** | 443 (HTTPS) | https://your-app.vercel.app | Managed by Vercel |

---

## 🔧 Configuration Files

### 1. Python Backend (`app/main.py`)

```python
# Railway sets PORT automatically in production
# Default to 8001 for local development
port = int(os.getenv("PORT", "8001"))
```

**Key Points:**
- ✅ Uses `PORT` environment variable (Railway requirement)
- ✅ Defaults to `8001` for local development
- ✅ Binds to `0.0.0.0` for Railway compatibility

### 2. Frontend (`services/pythonBackend.tsx`)

```typescript
const PYTHON_BACKEND_URL = import.meta.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:8001';
```

**Key Points:**
- ✅ Uses `VITE_PYTHON_BACKEND_URL` environment variable
- ✅ Defaults to local development port `8001`
- ✅ Automatically switches in production

### 3. Vite Config (`vite.config.ts`)

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8001'
    }
  }
}
```

**Key Points:**
- ✅ Uses Vite's default port `5173`
- ✅ Proxies `/api` requests to Python backend
- ✅ Avoids CORS issues in development

### 4. Docker Compose (`docker-compose.yml`)

```yaml
python-backend:
  ports:
    - "8001:8001"
  environment:
    - PORT=8001

frontend:
  ports:
    - "5173:5173"
```

**Key Points:**
- ✅ Consistent with local development
- ✅ No port conflicts
- ✅ Easy networking between containers

---

## 🚀 Environment Variables

### Required Environment Variables

#### Development (`.env`)

```bash
# Python Backend
PORT=8001
VITE_PYTHON_BACKEND_URL=http://localhost:8001

# Frontend
VITE_PORT=5173
FRONTEND_ORIGIN=http://localhost:5173
```

#### Production (Railway Dashboard)

```bash
# Railway automatically sets PORT
# You only need to set:
FRONTEND_ORIGIN=https://your-frontend.vercel.app
ENVIRONMENT=production
DEBUG=false
```

#### Frontend (Vercel/Netlify)

```bash
VITE_PYTHON_BACKEND_URL=https://your-app.up.railway.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
```

---

## 📋 Setup Instructions

### Local Development

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your values:**
   ```bash
   PORT=8001
   VITE_PYTHON_BACKEND_URL=http://localhost:8001
   FRONTEND_ORIGIN=http://localhost:5173
   # Add your Supabase keys...
   ```

3. **Start Python backend:**
   ```bash
   ./start-python-backend.sh
   # Or: python -m app.main
   ```

4. **Start frontend (separate terminal):**
   ```bash
   npm run dev
   ```

5. **Access:**
   - Frontend: http://localhost:5173
   - Python Backend: http://localhost:8001
   - API Docs: http://localhost:8001/api/docs

### Docker Compose

1. **Update `.env` file** (same as above)

2. **Start all services:**
   ```bash
   docker-compose up
   ```

3. **Access:**
   - Frontend: http://localhost:5173
   - Python Backend: http://localhost:8001

### Railway Deployment

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Create project:**
   ```bash
   railway init
   ```

4. **Add environment variables:**
   ```bash
   railway variables set SUPABASE_URL=https://your-project.supabase.co
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key
   railway variables set ENVIRONMENT=production
   railway variables set DEBUG=false
   railway variables set FRONTEND_ORIGIN=https://your-frontend.vercel.app
   railway variables set ELEVENLABS_API_KEY=your_key
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Railway automatically sets:**
   - `PORT` environment variable
   - Public URL (e.g., https://magdee-python-backend.up.railway.app)

7. **Update frontend environment:**
   ```bash
   # In Vercel/Netlify, set:
   VITE_PYTHON_BACKEND_URL=https://your-app.up.railway.app
   ```

---

## 🔍 Verification

### Check Python Backend Port

```bash
# Should show port 8001 in development
curl http://localhost:8001/api/health

# Should show Railway's assigned port in production
curl https://your-app.up.railway.app/api/health
```

### Check Frontend Connection

```bash
# Open browser console on http://localhost:5173
# Look for logs like:
# 🐍 Python Backend: GET /api/v1/...
```

### Check Docker Services

```bash
docker-compose ps
# Should show:
# magdee-python-backend  ... Up      0.0.0.0:8001->8001/tcp
# magdee-frontend        ... Up      0.0.0.0:5173->5173/tcp
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Problem:** `Error: Address already in use`

**Solution:**
```bash
# Find what's using the port
lsof -i :8001  # macOS/Linux
netstat -ano | findstr :8001  # Windows

# Kill the process or change port in .env
PORT=8002 python -m app.main
```

### Frontend Can't Connect to Backend

**Problem:** `Failed to fetch` or CORS errors

**Solutions:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:8001/api/health
   ```

2. **Check environment variable:**
   ```bash
   echo $VITE_PYTHON_BACKEND_URL
   # Should be: http://localhost:8001
   ```

3. **Restart Vite dev server** (environment variables are loaded at startup)

4. **Check CORS configuration** in `app/config.py`

### Railway Deployment Port Issues

**Problem:** Railway shows "Application failed to respond"

**Solutions:**

1. **Verify app binds to `0.0.0.0`:**
   ```python
   uvicorn.run("app.main:app", host="0.0.0.0", port=port)
   ```

2. **Check Railway logs:**
   ```bash
   railway logs
   ```

3. **Ensure PORT environment variable is used:**
   ```python
   port = int(os.getenv("PORT", "8001"))
   ```

4. **Verify health check endpoint:**
   ```bash
   curl https://your-app.up.railway.app/api/health
   ```

---

## 📊 Port Comparison

### Before (Old Configuration)

| Service | Port | Issue |
|---------|------|-------|
| Python Backend | 8000 | Common conflict with other services |
| Frontend | 3000 | Not Vite's default |

### After (New Configuration)

| Service | Port | Benefit |
|---------|------|---------|
| Python Backend | 8001 | Avoids common conflicts |
| Frontend | 5173 | Vite's default port |

---

## ✅ Checklist

### Local Development Setup
- [ ] `.env` file created with correct ports
- [ ] Python backend starts on port 8001
- [ ] Frontend starts on port 5173
- [ ] Frontend can call backend API
- [ ] No port conflicts

### Railway Deployment
- [ ] Railway project created
- [ ] Environment variables set
- [ ] PORT is NOT manually set (Railway does this)
- [ ] App responds to health checks
- [ ] Frontend environment updated with Railway URL
- [ ] CORS includes frontend URL

### Docker Compose
- [ ] Ports 8001 and 5173 are free
- [ ] Both services start successfully
- [ ] Services can communicate
- [ ] Volumes mounted correctly

---

## 🎯 Quick Reference

```bash
# Local Development URLs
Frontend:        http://localhost:5173
Python Backend:  http://localhost:8001
API Docs:        http://localhost:8001/api/docs
Health Check:    http://localhost:8001/api/health

# Docker Compose URLs
Frontend:        http://localhost:5173
Python Backend:  http://localhost:8001

# Production URLs
Frontend:        https://your-app.vercel.app
Python Backend:  https://your-app.up.railway.app
API Docs:        https://your-app.up.railway.app/api/docs
Health Check:    https://your-app.up.railway.app/api/health
```

---

## 📚 Related Documentation

- `RAILWAY_DEPLOYMENT_GUIDE.md` - Detailed Railway deployment
- `ENVIRONMENT_SETUP_GUIDE.md` - Environment configuration
- `.env.example` - Example environment variables
- `DEPLOYMENT.md` - General deployment guide

---

**Status:** ✅ Ports configured for Railway deployment

**Key Changes:**
- Python Backend: 8000 → 8001 (local dev)
- Frontend: 3000 → 5173 (Vite default)
- Production: Railway auto-assigns PORT

**Ready to deploy!** 🚀
