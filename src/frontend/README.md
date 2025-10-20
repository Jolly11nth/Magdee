# Magdee Frontend

React + Vite frontend application for the Magdee PDF-to-Audio conversion app.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Supabase** - Backend integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Access to Supabase project

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Python Backend URL (for development)
VITE_PYTHON_BACKEND_URL=http://localhost:8001

# Optional: Analytics, etc.
```

### Development

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

### Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── App.tsx              # Main app component
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   ├── audio-player/   # Audio player components
│   └── ...
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
├── constants/          # App constants
└── styles/            # Global styles
```

## Key Features

- 🎵 Audio player with text synchronization
- 📚 Library management
- 🎨 Modern UI with Tailwind CSS
- 🔐 Supabase authentication
- 📱 Responsive design
- 🔔 Real-time notifications

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Connect repository to Netlify
2. Set base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

### Manual Deployment

```bash
npm run build
# Upload 'dist' folder to your hosting service
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

See the main project CONTRIBUTING.md for guidelines.

## License

See LICENSE file in the root directory.
