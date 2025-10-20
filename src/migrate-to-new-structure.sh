#!/bin/bash

# Magdee Project Structure Migration Script
# This script reorganizes the project into frontend/backend structure

set -e  # Exit on error

echo "🚀 Starting Magdee project structure migration..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create new directory structure
echo -e "${BLUE}📁 Creating new directory structure...${NC}"

mkdir -p frontend/src/{components,hooks,services,types,utils,constants,styles}
mkdir -p frontend/src/components/{ui,audio-player,figma}
mkdir -p frontend/src/utils/supabase
mkdir -p frontend/public/assets/images
mkdir -p backend/python/app/routers
mkdir -p backend/supabase/functions/server
mkdir -p docs
mkdir -p scripts
mkdir -p .github/workflows

echo -e "${GREEN}✓ Directories created${NC}"

# Move Frontend Files
echo ""
echo -e "${BLUE}📦 Moving frontend files...${NC}"

# Main app file
if [ -f "App.tsx" ]; then
    mv App.tsx frontend/src/
    echo "  ✓ Moved App.tsx"
fi

# Components
if [ -d "components" ]; then
    cp -r components/* frontend/src/components/ 2>/dev/null || true
    echo "  ✓ Moved components"
fi

# Hooks
if [ -d "hooks" ]; then
    cp -r hooks/* frontend/src/hooks/ 2>/dev/null || true
    echo "  ✓ Moved hooks"
fi

# Services
if [ -d "services" ]; then
    cp -r services/* frontend/src/services/ 2>/dev/null || true
    echo "  ✓ Moved services"
fi

# Types
if [ -d "types" ]; then
    cp -r types/* frontend/src/types/ 2>/dev/null || true
    echo "  ✓ Moved types"
fi

# Utils
if [ -d "utils" ]; then
    cp -r utils/* frontend/src/utils/ 2>/dev/null || true
    echo "  ✓ Moved utils"
fi

# Constants
if [ -d "constants" ]; then
    cp -r constants/* frontend/src/constants/ 2>/dev/null || true
    echo "  ✓ Moved constants"
fi

# Styles
if [ -d "styles" ]; then
    cp -r styles/* frontend/src/styles/ 2>/dev/null || true
    echo "  ✓ Moved styles"
fi

# Public assets
if [ -d "public" ]; then
    cp -r public/* frontend/public/ 2>/dev/null || true
    echo "  ✓ Moved public assets"
fi

echo -e "${GREEN}✓ Frontend files moved${NC}"

# Move Backend Files
echo ""
echo -e "${BLUE}📦 Moving backend files...${NC}"

# Python backend
if [ -d "app" ]; then
    cp -r app/* backend/python/app/ 2>/dev/null || true
    echo "  ✓ Moved Python app"
fi

# Supabase functions
if [ -d "supabase/functions/server" ]; then
    cp -r supabase/functions/server/* backend/supabase/functions/server/ 2>/dev/null || true
    echo "  ✓ Moved Supabase functions"
fi

echo -e "${GREEN}✓ Backend files moved${NC}"

# Move Documentation
echo ""
echo -e "${BLUE}📄 Moving documentation...${NC}"

# Move all .md files to docs/ except README.md
for file in *.md; do
    if [ "$file" != "README.md" ] && [ "$file" != "PROJECT_STRUCTURE.md" ] && [ "$file" != "DEPLOYMENT_NEW_STRUCTURE.md" ]; then
        mv "$file" docs/ 2>/dev/null || true
    fi
done

echo -e "${GREEN}✓ Documentation moved${NC}"

# Move Scripts
echo ""
echo -e "${BLUE}🔧 Moving scripts...${NC}"

for script in *.sh *.py *.js; do
    if [ -f "$script" ] && [ "$script" != "migrate-to-new-structure.sh" ]; then
        mv "$script" scripts/ 2>/dev/null || true
    fi
done

echo -e "${GREEN}✓ Scripts moved${NC}"

# Move GitHub Workflows
echo ""
echo -e "${BLUE}⚙️  Moving GitHub workflows...${NC}"

if [ -d "workflows" ]; then
    cp -r workflows/* .github/workflows/ 2>/dev/null || true
    echo "  ✓ Moved workflows"
fi

echo -e "${GREEN}✓ GitHub workflows moved${NC}"

# Create environment template files
echo ""
echo -e "${BLUE}📝 Creating environment templates...${NC}"

# Frontend .env.example
cat > frontend/.env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Python Backend URL
VITE_PYTHON_BACKEND_URL=http://localhost:8001

# Optional: Analytics, Feature Flags, etc.
EOF

# Backend Python .env.example
cat > backend/python/.env.example << 'EOF'
# Server Configuration
HOST=0.0.0.0
PORT=8001

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.com

# Storage Configuration
UPLOAD_DIR=/tmp/uploads
AUDIO_OUTPUT_DIR=/tmp/audio

# Optional: TTS API Keys
# ELEVENLABS_API_KEY=your-api-key
EOF

echo -e "${GREEN}✓ Environment templates created${NC}"

# Create Docker Compose for local development
echo ""
echo -e "${BLUE}🐳 Creating Docker Compose configuration...${NC}"

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_PYTHON_BACKEND_URL=http://backend:8001
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  backend:
    build:
      context: ./backend/python
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    environment:
      - HOST=0.0.0.0
      - PORT=8001
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    volumes:
      - ./backend/python:/app
      - /tmp/uploads:/tmp/uploads
      - /tmp/audio:/tmp/audio
    command: uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

networks:
  default:
    name: magdee-network
EOF

echo -e "${GREEN}✓ Docker Compose created${NC}"

# Create Dockerfiles
echo ""
echo -e "${BLUE}🐳 Creating Dockerfiles...${NC}"

# Frontend Dockerfile
cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
EOF

# Backend Dockerfile
cat > backend/python/Dockerfile << 'EOF'
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
EOF

echo -e "${GREEN}✓ Dockerfiles created${NC}"

# Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Migration complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📁 New structure:${NC}"
echo "  frontend/          - React + Vite frontend"
echo "  backend/python/    - FastAPI Python backend"
echo "  backend/supabase/  - Supabase Edge Functions"
echo "  docs/              - Documentation"
echo "  scripts/           - Utility scripts"
echo "  .github/workflows/ - CI/CD workflows"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "  1. Review and update import paths in frontend/src/"
echo "  2. Copy .env.example files and fill in your values"
echo "  3. Test frontend: cd frontend && npm install && npm run dev"
echo "  4. Test backend: cd backend/python && pip install -r requirements.txt"
echo "  5. Update GitHub workflows with correct paths"
echo "  6. Update README.md with new structure information"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  - PROJECT_STRUCTURE.md - Overview of new structure"
echo "  - DEPLOYMENT_NEW_STRUCTURE.md - Deployment guide"
echo "  - frontend/README.md - Frontend setup"
echo "  - backend/python/README.md - Python backend setup"
echo "  - backend/supabase/README.md - Supabase functions setup"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
