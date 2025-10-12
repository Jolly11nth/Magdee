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
    echo -e "${YELLOW}⚙️  Creating .env file from template...${NC}"
    cat > .env << EOF
# Magdee Python Backend Configuration

# Environment
ENVIRONMENT=development
DEBUG=true

# Supabase Configuration (copy from your Supabase project)
SUPABASE_URL=https://djsjlwgtyfzhcnbvoubo.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Frontend Origin
FRONTEND_ORIGIN=http://localhost:3000

# Server Configuration
PORT=8000
LOG_LEVEL=INFO

# File Upload Configuration  
UPLOAD_PATH=/tmp/magdee/uploads
OUTPUT_PATH=/tmp/magdee/outputs

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# TTS API Keys (Optional - for audio conversion)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
# OPENAI_API_KEY=your_openai_api_key

# Security
JWT_SECRET_KEY=change_this_in_production_$(openssl rand -hex 32)
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please update .env with your Supabase credentials${NC}"
fi

# Create required directories
echo -e "${YELLOW}📁 Creating upload/output directories...${NC}"
mkdir -p /tmp/magdee/uploads
mkdir -p /tmp/magdee/outputs
echo -e "${GREEN}✓ Directories created${NC}"

# Display startup information
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Starting Magdee Python Backend Server${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  📍 Server: ${GREEN}http://localhost:8000${NC}"
echo -e "  📚 API Docs: ${GREEN}http://localhost:8000/api/docs${NC}"
echo -e "  ❤️  Health: ${GREEN}http://localhost:8000/api/health${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the server
cd "$(dirname "$0")"
python3 -m app.main

# Deactivate virtual environment on exit
deactivate
