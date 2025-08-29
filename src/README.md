# Magdee - PDF to Audio Conversion App

![Magdee Logo](https://img.shields.io/badge/Magdee-PDF%20to%20Audio-blue?style=for-the-badge)

A comprehensive PDF-to-audio conversion application built with React frontend and Python FastAPI backend, featuring modern UI/UX design, real-time audio playback, and cloud database integration.

## 🚀 Features

### Core Functionality
- **PDF Upload & Conversion**: Upload PDF documents and convert them to high-quality audio
- **Audio Playbook**: Advanced audio player with reading text synchronization
- **My Library**: Organize and manage your audiobook collection
- **User Profiles**: Complete user management with profile pictures and preferences
- **Real-time Sync**: Cloud-based synchronization across devices

### Technical Features
- **React Frontend**: Modern React app with TypeScript and Tailwind CSS
- **Python Backend**: FastAPI backend for PDF processing and audio conversion
- **Supabase Integration**: Real-time database, authentication, and storage
- **Performance Optimized**: Lazy loading, error boundaries, and performance monitoring
- **Mobile-First Design**: Responsive design optimized for mobile devices (375px × 812px)
- **Comprehensive Error Handling**: Error boundaries, fallback components, and analytics

### User Experience
- **Onboarding Flow**: Welcome, intro, authentication screens
- **Audio Settings**: Playback speed, repeat modes, and audio preferences
- **Notifications**: Smart notification system with toast messages
- **Offline Support**: Graceful handling of network issues
- **Accessibility**: Screen reader support and keyboard navigation

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Lucide React** for icons
- **Motion/React** for animations
- **Recharts** for data visualization
- **Shadcn/UI** component library

### Backend
- **Python 3.8+**
- **FastAPI** web framework
- **Uvicorn** ASGI server
- **Supabase** for database and storage
- **PDF processing libraries**
- **Audio conversion tools**

### Database
- **Supabase PostgreSQL** with real-time subscriptions
- **6-table schema**: Users, Books, Progress, Analytics, Preferences, Notifications
- **Row Level Security (RLS)** for data protection

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/magdee-pdf-to-audio.git
   cd magdee-pdf-to-audio
   ```

2. **Install dependencies**
   ```bash
   # Install both frontend and backend dependencies
   npm run setup
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your Supabase credentials
   # SUPABASE_URL=your_supabase_url
   # SUPABASE_ANON_KEY=your_anon_key
   # SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup**
   Follow the [Database Setup Guide](DATABASE_SETUP_GUIDE.md) to configure your Supabase database.

5. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm start          # Frontend only
   npm run backend    # Backend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🏗 Project Structure

```
├── components/              # React components
│   ├── audio-player/       # Audio player components
│   ├── figma/             # Figma-imported assets
│   └── ui/                # Shadcn/UI components
├── app/                    # Python FastAPI backend
│   └── routers/           # API route handlers
├── supabase/              # Supabase edge functions
│   └── functions/server/  # Server-side functions
├── services/              # Frontend services
├── hooks/                 # React custom hooks
├── utils/                 # Utility functions
├── types/                 # TypeScript type definitions
├── constants/             # App constants and data
└── styles/               # Global CSS styles
```

## 🚀 Development

### Frontend Development
```bash
npm start                 # Start React development server
npm run build            # Build for production
npm test                 # Run tests
```

### Backend Development
```bash
python main.py           # Start FastAPI server
python check-servers.py  # Check server status
```

### Database Management
```bash
# Check connection status
npm run check-servers

# View database documentation
open DATABASE_SETUP_GUIDE.md
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: #4A90E2 (Main brand color)
- **Secondary Blue**: #357ABD (Hover states)
- **Light Blue**: #74b9ff (Gradients)
- **Background**: #F3F4F6 (Light gray)
- **Text**: #111827 (Dark gray)

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800
- **Responsive sizing** with mobile-first approach

### Mobile Design
- **Device Frame**: 375px × 812px (iPhone X/11/12 size)
- **Border Radius**: 1.5rem for device frame, 10px for book covers
- **Shadows**: Layered shadows for depth and elevation

## 📱 Features Deep Dive

### Audio Player
- **Advanced Controls**: Play, pause, skip, repeat modes
- **Reading Sync**: Text highlighting synchronized with audio
- **Progress Tracking**: Visual progress bar with time stamps
- **Speed Control**: Variable playback speed (0.5x to 2x)

### Library Management
- **Recent Books**: Recently converted and accessed books
- **Search & Filter**: Find books quickly
- **Progress Tracking**: Continue where you left off
- **Offline Access**: Downloaded content available offline

### User Management
- **Authentication**: Secure signup/login with Supabase Auth
- **Profile Management**: Full name, username, profile pictures
- **Preferences**: Audio settings, notifications, language
- **Analytics**: Reading progress and usage statistics

## 🔧 Configuration

### Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Backend Configuration (optional)
BACKEND_URL=http://localhost:8000
PYTHON_ENV=development
```

### Supabase Setup
1. Create a new Supabase project
2. Run the SQL scripts from `DATABASE_SETUP_GUIDE.md`
3. Configure Row Level Security (RLS)
4. Set up storage buckets for profile pictures and audio files
5. Configure authentication providers

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
python -m pytest

# Integration tests
npm run test:integration

# Check server status
python check-servers.py
```

## 📈 Performance

### Optimization Features
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Automatic bundle optimization
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Service worker for offline functionality
- **Error Boundaries**: Graceful error handling

### Performance Monitoring
- **Component Performance**: Render time tracking
- **Error Analytics**: Comprehensive error logging
- **User Analytics**: Usage patterns and insights
- **Network Monitoring**: Connection status tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass before submitting PR

## 📚 Documentation

- [Database Setup Guide](DATABASE_SETUP_GUIDE.md)
- [Database Architecture](DATABASE_ARCHITECTURE.md)
- [Python Backend Setup](python-backend-setup.md)
- [Integration Guide](integration-guide.md)
- [Attributions](Attributions.md)

## 🐛 Troubleshooting

### Common Issues

**Frontend won't start**
```bash
rm -rf node_modules
npm install
npm start
```

**Backend connection issues**
```bash
python check-servers.py
python main.py
```

**Database connection problems**
- Check your Supabase credentials in `.env`
- Verify your project is not paused
- Check network connectivity

**Audio not playing**
- Verify browser audio permissions
- Check audio file formats
- Test with different browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Figma** for the design system and UI components
- **Supabase** for backend infrastructure
- **Shadcn/UI** for the component library
- **Lucide** for the icon set
- **The React community** for excellent tooling and libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/magdee-pdf-to-audio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/magdee-pdf-to-audio/discussions)
- **Email**: your.email@example.com

---

**Made with ❤️ for better reading experiences**

![GitHub stars](https://img.shields.io/github/stars/yourusername/magdee-pdf-to-audio?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/magdee-pdf-to-audio?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/magdee-pdf-to-audio)
![GitHub license](https://img.shields.io/github/license/yourusername/magdee-pdf-to-audio)