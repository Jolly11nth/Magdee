# 🎧 Magdee - PDF to Audio Conversion Platform

Transform your PDFs into engaging audiobooks with AI-powered text-to-speech.

## 🌟 Features

- **PDF Processing** - Upload and process PDF documents
- **Audio Conversion** - Convert text to high-quality audio
- **User Analytics** - Track reading habits and progress
- **Multi-language Support** - Support for multiple languages
- **Audio Player** - Built-in audio player with controls
- **Progress Tracking** - Track your listening progress
- **User Profiles** - Manage your account and preferences

## 🏗️ Architecture

Magdee uses a **hybrid backend architecture**:

- **Frontend**: React + TypeScript + Vite
- **Backend 1**: Supabase Edge Functions (TypeScript/Deno)
  - User authentication
  - Profile management
  - Notifications
- **Backend 2**: Python FastAPI
  - PDF processing
  - Audio conversion
  - Analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- Supabase account

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/magdee.git
cd magdee
```

### 2. Install Dependencies

```bash
# Frontend dependencies
npm install

# Python dependencies
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your credentials
nano .env
```

### 4. Start Development Servers

**Terminal 1 - Python Backend:**
```bash
chmod +x start-python-backend.sh
./start-python-backend.sh
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit:
- **Frontend**: http://localhost:3000
- **Python API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

## 📚 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in 60 seconds
- **[Python Backend Setup](PYTHON_BACKEND_SETUP.md)** - Detailed backend setup
- **[Integration Guide](INTEGRATION_COMPLETE.md)** - Architecture and integration details
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Database Guide](DATABASE_SETUP_GUIDE.md)** - Database schema and setup

## 🎯 API Endpoints

### PDF Processing
- `POST /api/v1/pdf/upload/{user_id}` - Upload PDF
- `GET /api/v1/pdf/status/{book_id}` - Get processing status
- `DELETE /api/v1/pdf/{book_id}` - Delete PDF

### Audio Conversion
- `GET /api/v1/audio/stream/{book_id}` - Stream audio
- `GET /api/v1/audio/metadata/{book_id}` - Get metadata
- `POST /api/v1/audio/generate/{book_id}` - Regenerate audio

### Analytics
- `GET /api/v1/analytics/overview/{user_id}` - Get overview
- `GET /api/v1/analytics/usage/{user_id}` - Usage statistics
- `GET /api/v1/analytics/books/{user_id}` - Book analytics

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
VITE_PYTHON_BACKEND_URL=http://localhost:8000
```

#### Python Backend (.env)
```env
ENVIRONMENT=development
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

See `.env.example` for all available options.

## 🧪 Testing

```bash
# Frontend tests
npm test

# Python tests
pytest

# Integration tests
pytest app/tests/integration/
```

## 📦 Production Deployment

### Option 1: Railway (Recommended)

```bash
# Deploy Python backend to Railway
railway up

# Deploy frontend to Vercel
vercel --prod
```

### Option 2: Docker

```bash
# Build Docker image
docker build -t magdee-python-backend .

# Run container
docker run -p 8000:8000 --env-file .env magdee-python-backend
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛠️ Built With

### Frontend
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [Supabase](https://supabase.com/) - Database & Auth
- [PyPDF2](https://pypdf2.readthedocs.io/) - PDF processing
- [ElevenLabs](https://elevenlabs.io/) - Text-to-speech

## 📊 Project Status

- ✅ Frontend UI complete
- ✅ Python backend integrated
- ✅ PDF upload functionality
- ✅ Analytics system
- 🔄 TTS integration (in progress)
- 🔄 Audio generation (in progress)
- 📅 Mobile app (planned)

## 🐛 Known Issues

- PDF text extraction needs optimization
- TTS integration requires API key configuration
- Background job processing not yet implemented

See [Issues](https://github.com/yourusername/magdee/issues) for full list.

## 💡 Roadmap

### Q1 2024
- [x] Python backend integration
- [x] PDF upload system
- [ ] Complete TTS integration
- [ ] Background job processing

### Q2 2024
- [ ] Mobile responsive design
- [ ] Multi-language support
- [ ] Batch PDF processing
- [ ] Audio quality settings

### Q3 2024
- [ ] Mobile apps (iOS/Android)
- [ ] Offline mode
- [ ] Social features
- [ ] Premium features

## 📞 Support

Need help? Choose your option:

- 📧 Email: support@magdee.app
- 💬 Discord: [Join our server](https://discord.gg/magdee)
- 📖 Docs: [Read the docs](https://docs.magdee.app)
- 🐛 Issues: [Report a bug](https://github.com/yourusername/magdee/issues)

## 🙏 Acknowledgments

- Supabase team for the amazing platform
- FastAPI for the excellent framework
- React community for helpful resources
- All contributors who make this project possible

---

**Made with ❤️ by the Magdee team**

⭐ Star us on GitHub — it helps!

[Website](https://magdee.app) • [Documentation](https://docs.magdee.app) • [Blog](https://blog.magdee.app)
