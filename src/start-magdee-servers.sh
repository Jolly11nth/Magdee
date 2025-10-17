#!/bin/bash

# Magdee Server Startup Script
# This script starts both the Python backend and checks Supabase connectivity

echo "🚀 Starting Magdee Servers..."
echo "================================"

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: main.py not found. Please run this script from the project root directory."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Error: Python is not installed or not in PATH"
    exit 1
fi

# Check if requirements.txt exists and install dependencies
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
else
    echo "⚠️  Warning: requirements.txt not found"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Creating .env file from .env.example..."
        cp .env.example .env
        echo "⚠️  Please edit .env file with your actual Supabase credentials"
    else
        echo "⚠️  Warning: No .env file found. Please create one with your Supabase credentials."
    fi
fi

# Get port from .env or use default
if [ -f ".env" ]; then
    PORT=$(grep -E "^PORT=" .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ')
fi
PORT=${PORT:-8001}

# Kill any existing Python processes on the port
echo "🧹 Cleaning up existing processes on port ${PORT}..."
lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true

# Start Python backend
echo "🐍 Starting Python FastAPI backend on port ${PORT}..."
python -m app.main &
PYTHON_PID=$!

# Wait a moment for the server to start
sleep 3

# Check if Python backend is running
if curl -s http://localhost:${PORT}/api/health > /dev/null; then
    echo "✅ Python backend is running on http://localhost:${PORT}"
else
    echo "❌ Python backend failed to start"
    kill $PYTHON_PID 2>/dev/null || true
    exit 1
fi

# Check Supabase connectivity (if environment variables are set)
if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON_KEY" ]; then
    echo "🔗 Testing Supabase connectivity..."
    if curl -s -H "apikey: $SUPABASE_ANON_KEY" "$SUPABASE_URL/rest/v1/" > /dev/null; then
        echo "✅ Supabase is accessible"
    else
        echo "⚠️  Supabase connection test failed (but Python backend is still running)"
    fi
else
    echo "⚠️  Supabase environment variables not set, skipping connectivity test"
fi

echo "================================"
echo "🎉 Magdee servers are ready!"
echo ""
echo "📊 Server Status:"
echo "   • Python Backend: http://localhost:${PORT}"
echo "   • Health Check: http://localhost:${PORT}/api/health"
echo "   • API Docs: http://localhost:${PORT}/api/docs"
echo ""
echo "🔧 Useful Commands:"
echo "   • Check status: python check-servers.py"
echo "   • Stop Python backend: kill $PYTHON_PID"
echo "   • View logs: tail -f logs/* (if logs directory exists)"
echo ""
echo "🌐 Next Steps:"
echo "   1. Start your frontend server: npm run dev"
echo "   2. Frontend will run on: http://localhost:5173"
echo "   3. Check the connection status in your app"
echo ""
echo "💡 Environment:"
echo "   • Backend Port: ${PORT}"
echo "   • Frontend Port: 5173 (Vite default)"
echo ""
echo "Press Ctrl+C to stop the Python backend"

# Keep the script running to maintain the Python process
wait $PYTHON_PID