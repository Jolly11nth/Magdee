# Magdee Python Backend

FastAPI backend for PDF processing, audio conversion, and analytics.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Supabase** - Database and auth integration
- **gTTS** - Text-to-speech conversion
- **PyPDF/PDFPlumber** - PDF processing

## Getting Started

### Prerequisites

- Python 3.9+ (Python 3.11 recommended)
- pip and virtualenv
- ffmpeg (for audio processing)

### System Dependencies

#### macOS
```bash
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

#### Windows
Download from https://ffmpeg.org/download.html

### Installation

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the `backend/python/` directory:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8001

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Optional: TTS Configuration
ELEVENLABS_API_KEY=your-elevenlabs-key  # If using premium TTS

# Storage Configuration
UPLOAD_DIR=/tmp/uploads
AUDIO_OUTPUT_DIR=/tmp/audio

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
```

## Development

### Run the Server

```bash
# Activate virtual environment
source venv/bin/activate

# Run with uvicorn
python -m app.main

# Or directly with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

The API will be available at `http://localhost:8001`

### API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

## Project Structure

```
app/
├── __init__.py
├── main.py              # FastAPI app entry point
├── config.py            # Configuration settings
├── database.py          # Database connections
├── middleware.py        # Custom middleware
└── routers/
    ├── __init__.py
    ├── analytics_router.py   # Analytics endpoints
    ├── audio_router.py       # Audio conversion endpoints
    ├── pdf_router.py         # PDF processing endpoints
    └── user_router.py        # User management endpoints
```

## API Endpoints

### PDF Processing
- `POST /api/pdf/upload` - Upload and process PDF
- `GET /api/pdf/{pdf_id}` - Get PDF details
- `DELETE /api/pdf/{pdf_id}` - Delete PDF

### Audio Conversion
- `POST /api/audio/convert` - Convert text to audio
- `GET /api/audio/{audio_id}` - Get audio file
- `GET /api/audio/{audio_id}/status` - Check conversion status

### Analytics
- `GET /api/analytics/user/{user_id}` - Get user analytics
- `POST /api/analytics/track` - Track user events

### User Management
- `GET /api/user/{user_id}` - Get user profile
- `PUT /api/user/{user_id}` - Update user profile

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_pdf_router.py
```

## Code Quality

```bash
# Format code with black
black app/

# Sort imports
isort app/

# Lint with flake8
flake8 app/

# Type checking
mypy app/

# Security scan
bandit -r app/
```

## Deployment

### Railway

1. Create a new Railway project
2. Connect your GitHub repository
3. Set root directory to `backend/python`
4. Add environment variables
5. Railway will auto-detect and deploy

### Render

1. Create a new Web Service
2. Connect repository
3. Set root directory: `backend/python`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Docker

```bash
# Build image
docker build -t magdee-backend .

# Run container
docker run -p 8001:8001 --env-file .env magdee-backend
```

## Performance

- Uses async/await for non-blocking I/O
- Configurable worker processes for uvicorn
- File streaming for large PDF uploads
- Background tasks for audio conversion

## Troubleshooting

### ffmpeg not found
Make sure ffmpeg is installed and in your PATH

### Import errors
Ensure virtual environment is activated and dependencies are installed

### Port already in use
Change the PORT in your .env file or stop the conflicting process

## Contributing

See the main project CONTRIBUTING.md for guidelines.

## License

See LICENSE file in the root directory.
