# Magdee Project Structure

This project is organized into separate frontend and backend directories for clean deployment.

## Directory Structure

```
magdee/
├── frontend/              # React + Vite frontend application
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/               # Backend services
│   ├── python/           # FastAPI Python backend
│   │   ├── app/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   └── supabase/         # Supabase Edge Functions
│       └── functions/
│           └── server/
│
├── docs/                 # Documentation
├── scripts/              # Utility scripts
├── .github/              # GitHub Actions workflows
└── docker-compose.yml    # Docker orchestration
```

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm install
npm run build
```

### Backend - Python (Railway/Render)
```bash
cd backend/python
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Backend - Supabase Edge Functions
```bash
cd backend/supabase
supabase functions deploy
```

## Development

### Run Frontend
```bash
cd frontend
npm run dev
```

### Run Python Backend
```bash
cd backend/python
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m app.main
```

## Environment Variables

- Frontend: Create `.env` in `/frontend/`
- Python Backend: Create `.env` in `/backend/python/`
- Supabase: Configure in Supabase dashboard

## Notes

- Each directory has its own README with specific instructions
- Dependencies are managed separately for frontend and backend
- CI/CD workflows are configured for independent deployments
