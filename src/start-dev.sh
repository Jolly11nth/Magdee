#!/bin/bash

# Magdee Development Startup Script
# Starts all services in the new project structure

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║       Magdee Development Mode         ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Check if running in correct directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    echo -e "${YELLOW}Expected structure:${NC}"
    echo "  magdee/"
    echo "  ├── frontend/"
    echo "  └── backend/"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command_exists python3; then
    echo -e "${RED}❌ Python not found. Please install Python 3.9+${NC}"
    exit 1
fi

if ! command_exists ffmpeg; then
    echo -e "${YELLOW}⚠️  ffmpeg not found. Audio conversion may not work.${NC}"
    echo -e "${YELLOW}   Install with: brew install ffmpeg (macOS) or sudo apt-get install ffmpeg (Ubuntu)${NC}"
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Check environment files
echo -e "${BLUE}🔍 Checking environment files...${NC}"

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env not found${NC}"
    if [ -f "frontend/.env.example" ]; then
        echo -e "${YELLOW}   Copying .env.example to .env...${NC}"
        cp frontend/.env.example frontend/.env
        echo -e "${RED}   ⚠️  Please edit frontend/.env with your credentials before continuing${NC}"
        exit 1
    fi
fi

if [ ! -f "backend/python/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/python/.env not found${NC}"
    if [ -f "backend/python/.env.example" ]; then
        echo -e "${YELLOW}   Copying .env.example to .env...${NC}"
        cp backend/python/.env.example backend/python/.env
        echo -e "${RED}   ⚠️  Please edit backend/python/.env with your credentials before continuing${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Environment files OK${NC}"
echo ""

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi
cd ..
echo ""

# Setup Python backend
echo -e "${BLUE}🐍 Setting up Python backend...${NC}"
cd backend/python

if [ ! -d "venv" ]; then
    echo "  Creating virtual environment..."
    python3 -m venv venv
fi

echo "  Activating virtual environment..."
source venv/bin/activate

echo "  Installing Python dependencies..."
pip install -q -r requirements.txt

cd ../..
echo ""

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
echo ""

# Create logs directory
mkdir -p logs

# Trap to cleanup background processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    echo -e "${GREEN}✓ All services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Frontend
echo -e "${GREEN}Starting Frontend (http://localhost:5173)...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Give frontend a moment to start
sleep 2

# Start Python Backend
echo -e "${GREEN}Starting Python Backend (http://localhost:8001)...${NC}"
cd backend/python
source venv/bin/activate
python -m app.main > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Give backend a moment to start
sleep 3

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 Services Started!                 ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Service URLs:${NC}"
echo "  • Frontend:        http://localhost:5173"
echo "  • Backend API:     http://localhost:8001"
echo "  • API Docs:        http://localhost:8001/docs"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo "  • Frontend:        tail -f logs/frontend.log"
echo "  • Backend:         tail -f logs/backend.log"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • Press Ctrl+C to stop all services"
echo "  • Frontend hot-reloads on file changes"
echo "  • Backend restarts on file changes"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""

# Wait for services
wait
