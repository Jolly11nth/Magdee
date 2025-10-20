# Magdee - PDF to Audio Conversion App

<div align="center">

![Magdee Logo](./frontend/public/assets/images/magdee-logo.png)

**Transform your PDF documents into high-quality audio experiences**

[![Frontend Deploy](https://github.com/yourusername/magdee/actions/workflows/frontend-deploy.yml/badge.svg)](https://github.com/yourusername/magdee/actions/workflows/frontend-deploy.yml)
[![Backend Deploy](https://github.com/yourusername/magdee/actions/workflows/backend-python-deploy.yml/badge.svg)](https://github.com/yourusername/magdee/actions/workflows/backend-python-deploy.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Demo](https://magdee.vercel.app) • [Documentation](./docs) • [Report Bug](https://github.com/yourusername/magdee/issues) • [Request Feature](https://github.com/yourusername/magdee/issues)

</div>

---

## 🌟 Features

- **📄 PDF Processing** - Upload and extract text from any PDF document
- **🎵 Text-to-Speech** - Convert text to natural-sounding audio with multiple voice options
- **📚 Library Management** - Organize and manage your audiobook collection
- **🎧 Advanced Audio Player** - Feature-rich player with speed control, bookmarks, and repeat modes
- **👤 User Profiles** - Personalized experience with custom preferences
- **📊 Analytics** - Track your reading progress and listening habits
- **🔔 Notifications** - Stay updated with real-time notifications
- **🌐 Responsive Design** - Works seamlessly on desktop and mobile devices

## 🏗️ Project Structure

This project is organized into separate frontend and backend directories for clean, independent deployment:

```
magdee/
├── frontend/              # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
│
├── backend/
│   ├── python/           # FastAPI backend (PDF & Audio processing)
│   │   ├── app/
│   │   │   ├── routers/  # API routes
│   │   │   └── ...
│   │   └── requirements.txt
│   │
│   └── supabase/         # Serverless Edge Functions
│       └── functions/
│           └── server/   # Auth, DB, & real-time features
│
├── docs/                 # Documentation
├── scripts/              # Utility scripts
└── .github/workflows/    # CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.9+** (3.11 recommended)
- **ffmpeg** (for audio processing)
- **Supabase account** and project

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/magdee.git
cd magdee
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# Then start dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 3. Python Backend Setup

```bash
cd backend/python

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Then start server
python -m app.main
```

Backend will run on `http://localhost:8001`

### 4. Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
cd backend/supabase
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Project Structure](./PROJECT_STRUCTURE.md)** - Overview of the codebase organization
- **[Deployment Guide](./DEPLOYMENT_NEW_STRUCTURE.md)** - Detailed deployment instructions
- **[Frontend README](./frontend/README.md)** - Frontend-specific documentation
- **[Python Backend README](./backend/python/README.md)** - Python backend documentation
- **[Supabase README](./backend/supabase/README.md)** - Edge Functions documentation
- **[Database Architecture](./docs/DATABASE_ARCHITECTURE.md)** - Database schema and design
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase Client** - Backend integration

### Backend
- **FastAPI** - Python web framework
- **Uvicorn** - ASGI server
- **Supabase** - Database, Auth, and Storage
- **gTTS** - Text-to-speech engine
- **PyPDF & PDFPlumber** - PDF processing
- **Pydub** - Audio manipulation

### Infrastructure
- **Vercel** - Frontend hosting
- **Railway** - Python backend hosting
- **Supabase** - Edge Functions, Database, Auth
- **GitHub Actions** - CI/CD

## 🌐 Deployment

Each component can be deployed independently:

### Frontend → Vercel
```bash
cd frontend
npm run build
vercel --prod
```

### Python Backend → Railway
```bash
cd backend/python
railway up
```

### Supabase Functions
```bash
cd backend/supabase
supabase functions deploy
```

See [DEPLOYMENT_NEW_STRUCTURE.md](./DEPLOYMENT_NEW_STRUCTURE.md) for detailed instructions.

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
npm run type-check
```

### Backend Tests
```bash
cd backend/python
source venv/bin/activate
pytest
pytest --cov=app
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables

### Frontend (`.env` in `/frontend/`)
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PYTHON_BACKEND_URL=http://localhost:8001
```

### Python Backend (`.env` in `/backend/python/`)
```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
PORT=8001
CORS_ORIGINS=http://localhost:5173
```

### Supabase Secrets
```bash
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
```

## 🐛 Troubleshooting

### Common Issues

**Frontend build fails:**
- Ensure Node.js 18+ is installed
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

**Backend won't start:**
- Check Python version: `python --version` (should be 3.9+)
- Ensure ffmpeg is installed: `ffmpeg -version`
- Verify all environment variables are set

**Supabase functions fail:**
- Check deployment status: `supabase functions list`
- View logs: `supabase functions logs server`
- Verify secrets are set correctly

See individual READMEs for more troubleshooting tips.

## 📊 Project Status

- ✅ Core features implemented
- ✅ Frontend deployed to Vercel
- ✅ Backend deployed to Railway
- ✅ Supabase Edge Functions live
- 🚧 Mobile app (coming soon)
- 🚧 Offline mode (in progress)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Frontend hosting
- [Railway](https://railway.app/) - Backend hosting

## 📧 Contact

- **Project Link:** [https://github.com/yourusername/magdee](https://github.com/yourusername/magdee)
- **Website:** [https://magdee.vercel.app](https://magdee.vercel.app)
- **Email:** support@magdee.app

---

<div align="center">

**Made with ❤️ by the Magdee Team**

[⭐ Star this repo](https://github.com/yourusername/magdee) if you find it helpful!

</div>
