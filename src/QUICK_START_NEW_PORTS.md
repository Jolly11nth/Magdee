# ⚡ Quick Start - New Port Configuration

**Updated ports for Railway deployment!**

---

## 🎯 New Port Assignments

```
Backend:  8001 (was 8000)
Frontend: 5173 (Vite default, was 3000)
```

---

## 🚀 3-Step Quick Start

### Step 1: Setup Environment (1 min)

```bash
cp .env.example .env
```

**Edit `.env` and add your keys:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

### Step 2: Start Backend (30 sec)

```bash
./start-python-backend.sh
```

**Access:** http://localhost:8001

### Step 3: Start Frontend (30 sec)

```bash
npm run dev
```

**Access:** http://localhost:5173

**Done!** 🎉

---

## 📋 Full URLs

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:5173 | Your app |
| Backend | http://localhost:8001 | API |
| API Docs | http://localhost:8001/api/docs | Interactive docs |
| Health | http://localhost:8001/api/health | Status check |

---

## 🧪 Quick Test

```bash
# Test backend
curl http://localhost:8001/api/health

# Should return:
# {"status":"healthy",...}
```

---

## 🚂 Deploy to Railway (5 min)

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Init project
railway init

# Set environment variables
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key
railway variables set ENVIRONMENT=production
railway variables set DEBUG=false
railway variables set FRONTEND_ORIGIN=https://your-frontend.vercel.app

# Deploy
railway up
```

**Get URL:**
```bash
railway status
```

**Update frontend:**
```bash
# Set in Vercel/Netlify:
VITE_PYTHON_BACKEND_URL=https://your-app.up.railway.app
```

---

## ✅ Checklist

- [ ] Copied `.env.example` to `.env`
- [ ] Added Supabase keys
- [ ] Backend starts on port 8001
- [ ] Frontend starts on port 5173
- [ ] Health check works
- [ ] Frontend connects to backend

---

## 🆘 Troubleshooting

### Port in use?
```bash
lsof -i :8001
kill -9 <PID>
```

### Frontend can't connect?
1. Check backend is running: `curl http://localhost:8001/api/health`
2. Check `.env`: `VITE_PYTHON_BACKEND_URL=http://localhost:8001`
3. Restart frontend: `npm run dev`

### Railway deployment fails?
```bash
railway logs
```

---

## 📚 Detailed Guides

- **PORT_CONFIGURATION.md** - Complete port guide
- **RAILWAY_DEPLOYMENT_GUIDE.md** - Full Railway guide
- **PORT_MIGRATION_COMPLETE.md** - Migration details

---

**Ready to code!** 🚀
