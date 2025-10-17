#!/bin/bash

# Magdee Python Backend Startup Script

echo "🐍 Starting Magdee Python Backend..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

echo -e "${GREEN}✓ Python found: $(python3 --version)${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
    python3 -m venv venv
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to create virtual environment${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}🔄 Activating virtual environment...${NC}"
source venv/bin/activate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to activate virtual environment${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Virtual environment activated${NC}"

# Install/upgrade dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️  No .env file found${NC}"
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}📋 Copying from .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✓ .env file created${NC}"
        echo -e "${YELLOW}⚠️  Please update .env with your actual credentials${NC}"
    else
        echo -e "${RED}❌ No .env.example found${NC}"
        echo "Please create .env file manually or run: cp .env.example .env"
        exit 1
    fi
fi

# Create required directories
echo -e "${YELLOW}📁 Creating upload/output directories...${NC}"
mkdir -p /tmp/magdee/uploads
mkdir -p /tmp/magdee/outputs
echo -e "${GREEN}✓ Directories created${NC}"

# Get port from .env or use default
PORT=$(grep -E "^PORT=" .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ')
PORT=${PORT:-8001}

# Display startup information
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Starting Magdee Python Backend Server${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  📍 Server: ${GREEN}http://localhost:${PORT}${NC}"
echo -e "  📚 API Docs: ${GREEN}http://localhost:${PORT}/api/docs${NC}"
echo -e "  ❤️  Health: ${GREEN}http://localhost:${PORT}/api/health${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Frontend should use http://localhost:${PORT}${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the server
cd "$(dirname "$0")"
python3 -m app.main

# Deactivate virtual environment on exit
deactivate
