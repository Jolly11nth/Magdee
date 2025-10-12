# Magdee Python Backend Setup Guide

## Overview

The Magdee Python backend provides three core services:
1. **PDF Processing** - Upload and process PDFs for conversion
2. **Audio Conversion** - Convert text to audio using TTS services
3. **Analytics** - User analytics, usage patterns, and insights

## Quick Start

### 1. Install Dependencies

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# Environment
ENVIRONMENT=development
DEBUG=true

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Frontend Origin
FRONTEND_ORIGIN=http://localhost:3000

# Server
PORT=8000
LOG_LEVEL=INFO

# File Paths
UPLOAD_PATH=/tmp/magdee/uploads
OUTPUT_PATH=/tmp/magdee/outputs

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# TTS APIs (Optional)
ELEVENLABS_API_KEY=your_key_here
```

### 3. Start the Server

#### Option A: Using the startup script (Recommended)
```bash
chmod +x start-python-backend.sh
./start-python-backend.sh
```

#### Option B: Manual start
```bash
source venv/bin/activate
python3 -m app.main
```

The server will start at **http://localhost:8000**

### 4. Verify Installation

Visit these URLs to confirm the backend is running:
- **API Docs**: http://localhost:8000/api/docs
- **Health Check**: http://localhost:8000/api/health
- **Root**: http://localhost:8000

## API Endpoints

### PDF Processing

#### Upload PDF
```http
POST /api/v1/pdf/upload/{user_id}
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: <PDF file>
title: "Book Title" (optional)
author: "Author Name" (optional)
```

#### Get Processing Status
```http
GET /api/v1/pdf/status/{book_id}
Authorization: Bearer {access_token}
```

#### Delete PDF
```http
DELETE /api/v1/pdf/{book_id}
Authorization: Bearer {access_token}
```

### Audio Conversion

#### Stream Audio
```http
GET /api/v1/audio/stream/{book_id}
Authorization: Bearer {access_token}
```

#### Get Audio Metadata
```http
GET /api/v1/audio/metadata/{book_id}
Authorization: Bearer {access_token}
```

#### Regenerate Audio
```http
POST /api/v1/audio/generate/{book_id}
Authorization: Bearer {access_token}
```

### Analytics

#### Get Analytics Overview
```http
GET /api/v1/analytics/overview/{user_id}
Authorization: Bearer {access_token}
```

#### Get Usage Analytics
```http
GET /api/v1/analytics/usage/{user_id}?period=week
Authorization: Bearer {access_token}

Query Parameters:
- period: week | month | year
```

#### Get Book Analytics
```http
GET /api/v1/analytics/books/{user_id}
Authorization: Bearer {access_token}
```

#### Get Mood Analytics
```http
GET /api/v1/analytics/mood/{user_id}
Authorization: Bearer {access_token}
```

## Frontend Integration

The Python backend is already integrated with your frontend via `/services/pythonBackend.tsx`:

```typescript
import { PythonBackendService } from '../services/pythonBackend';

// Upload PDF
const result = await PythonBackendService.PDF.uploadPDF(
  userId,
  pdfFile,
  { title: 'My Book', author: 'John Doe' },
  accessToken
);

// Get analytics
const analytics = await PythonBackendService.Analytics.getOverview(
  userId,
  accessToken
);

// Check backend health
const health = await PythonBackendService.checkHealth();
```

## Architecture

### Hybrid Backend Design

Your Magdee app uses a **hybrid backend architecture**:

```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼────┐ ┌──▼────────┐
│Supabase│ │Python     │
│Edge    │ │FastAPI    │
│Functions│ │Backend    │
└───┬────┘ └──┬────────┘
    │         │
    └────┬────┘
         │
    ┌────▼────┐
    │Supabase │
    │Database │
    └─────────┘
```

**Supabase Edge Functions handle**:
- User authentication
- User profiles
- Book metadata storage
- Notifications
- Preferences

**Python FastAPI handles**:
- PDF processing
- Audio conversion
- Analytics generation

## Development Workflow

### 1. Run Both Backends

Terminal 1 - Python Backend:
```bash
./start-python-backend.sh
```

Terminal 2 - Supabase Functions:
```bash
# Already running via your existing setup
```

Terminal 3 - Frontend:
```bash
npm run dev
```

### 2. Testing

```bash
# Run Python tests
pytest

# Test specific endpoint
pytest app/routers/test_pdf_router.py
```

### 3. Debugging

Enable debug mode in `.env`:
```env
DEBUG=true
LOG_LEVEL=DEBUG
```

Check logs for detailed information about requests and errors.

## Production Deployment

### Environment Variables

Update `.env` for production:
```env
ENVIRONMENT=production
DEBUG=false
FRONTEND_ORIGIN=https://your-production-domain.com
```

### Deployment Options

#### Option 1: Railway/Render
1. Connect your GitHub repo
2. Set environment variables
3. Deploy with auto-scaling

#### Option 2: AWS/GCP
1. Use Docker container
2. Deploy to ECS/Cloud Run
3. Configure load balancer

#### Option 3: DigitalOcean App Platform
1. Push to GitHub
2. Connect repo to App Platform
3. Auto-deploy on push

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "-m", "app.main"]
```

Build and run:
```bash
docker build -t magdee-python-backend .
docker run -p 8000:8000 --env-file .env magdee-python-backend
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

### Module Not Found
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Permission Denied
```bash
# Make script executable
chmod +x start-python-backend.sh
```

### Supabase Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Check network connectivity
- Ensure Supabase project is active

## Next Steps

1. ✅ Start the Python backend
2. ✅ Verify health check endpoint
3. ✅ Test PDF upload from frontend
4. Configure TTS API keys for audio conversion
5. Monitor analytics endpoints

## Support

For issues or questions:
- Check the API docs at `/api/docs`
- Review logs in the terminal
- Ensure all environment variables are set
- Verify both backends are running

## Features Roadmap

- [ ] Implement actual PDF text extraction
- [ ] Integrate ElevenLabs/Azure TTS
- [ ] Add audio chunking for large books
- [ ] Implement caching for analytics
- [ ] Add webhook support for status updates
- [ ] Set up background job queue (Celery/RQ)

---

**Status**: ✅ Python backend integrated and ready for use!
