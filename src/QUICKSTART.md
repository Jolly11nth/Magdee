# 🚀 Magdee Python Backend - Quick Start

## 60-Second Setup

### 1. Make Startup Script Executable
```bash
chmod +x start-python-backend.sh
```

### 2. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your Supabase credentials
# (Get these from your Supabase project settings)
```

### 3. Start the Backend
```bash
./start-python-backend.sh
```

That's it! The backend will:
- ✅ Create virtual environment (if needed)
- ✅ Install dependencies
- ✅ Create required directories
- ✅ Start on http://localhost:8000

## Verify It's Working

Open these URLs in your browser:

1. **API Docs**: http://localhost:8000/api/docs
2. **Health Check**: http://localhost:8000/api/health  
3. **Root**: http://localhost:8000

## Start Your Full App

### Terminal 1: Python Backend
```bash
./start-python-backend.sh
```

### Terminal 2: Frontend
```bash
npm run dev
```

Your Magdee app is now running with both backends! 🎉

## What You Get

### PDF Processing
```typescript
import { PythonBackendService } from './services/pythonBackend';

// Upload PDF
await PythonBackendService.PDF.uploadPDF(
  userId, 
  pdfFile, 
  { title: 'My Book' },
  accessToken
);
```

### Audio Conversion
```typescript
// Get stream URL
const audioUrl = PythonBackendService.Audio.getStreamURL(bookId);
```

### Analytics
```typescript
// Get analytics
const analytics = await PythonBackendService.Analytics.getOverview(
  userId,
  accessToken
);
```

## Troubleshooting

### "Permission Denied"
```bash
chmod +x start-python-backend.sh
```

### "Port 8000 in use"
```bash
# Kill the process using port 8000
lsof -i :8000
kill -9 <PID>
```

### "Module not found"
```bash
# Reinstall dependencies
source venv/bin/activate
pip install -r requirements.txt --force-reinstall
```

## Next Steps

1. ✅ Backend is running
2. Configure TTS API keys in `.env` (optional)
3. Implement PDF text extraction
4. Add TTS integration
5. Deploy to production

## Need Help?

- 📖 **Full Setup**: See `PYTHON_BACKEND_SETUP.md`
- 🎉 **Integration Details**: See `INTEGRATION_COMPLETE.md`
- 🌐 **API Docs**: http://localhost:8000/api/docs

---

**You're all set!** 🚀 The Python backend is integrated and ready to use.
