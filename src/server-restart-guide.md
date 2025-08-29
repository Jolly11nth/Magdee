# Server Restart Guide for Magdee App

## Quick Start Commands

### 1. Start Python FastAPI Backend
```bash
# Make sure you're in the project root directory
cd /path/to/your/magdee-project

# Install Python dependencies (if not already installed)
pip install -r requirements.txt

# Start the FastAPI server
python main.py
```

### 2. Start Supabase Backend
```bash
# If using Supabase CLI locally
supabase start

# Or if deployed, check your Supabase dashboard at:
# https://app.supabase.com/project/[your-project-id]
```

## Detailed Troubleshooting Steps

### Python Backend (FastAPI)

#### Check if Python backend is running:
```bash
# Test the health endpoint
curl http://localhost:8000/health

# Or check if the port is in use
lsof -i :8000
```

#### If Python backend won't start:
1. **Check Python version** (requires Python 3.8+):
   ```bash
   python --version
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Check for port conflicts**:
   ```bash
   # Kill any process using port 8000
   lsof -ti:8000 | xargs kill -9
   ```

4. **Start with debug mode**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
   ```

#### Common Python Backend Issues:
- **Import errors**: Make sure all dependencies are installed
- **Port already in use**: Change port in main.py or kill existing process
- **Environment variables**: Check if required env vars are set
- **Database connection**: Verify Supabase credentials

### Supabase Backend

#### Check Supabase status:
1. **Visit your Supabase dashboard**: https://app.supabase.com
2. **Check project status**: Ensure your project is running
3. **Verify API keys**: Make sure SUPABASE_URL and SUPABASE_ANON_KEY are correct

#### Environment Variables Check:
```bash
# Check if environment variables are set
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
```

#### Test Supabase connection:
```bash
# Test API endpoint
curl -X GET 'https://[your-project-id].supabase.co/rest/v1/kv_store_989ff5a9' \
  -H "apikey: [your-anon-key]" \
  -H "Authorization: Bearer [your-anon-key]"
```

## Status Monitoring

Your app includes built-in status monitoring:

### Python Backend Status
- **Component**: `PythonBackendStatus` (visible in development mode)
- **Endpoint**: Check http://localhost:8000/health
- **Indicator**: Green = healthy, Red = down

### Supabase Connection Status  
- **Component**: `ConnectionStatus`
- **Shows**: Real-time connection status to Supabase
- **Indicator**: Connected/Disconnected status

## Quick Fix Commands

### Restart Everything:
```bash
# Kill all existing processes
pkill -f "python main.py"
pkill -f "uvicorn"

# Restart Python backend
python main.py &

# Check Supabase in dashboard
echo "Check Supabase at: https://app.supabase.com"
```

### Verify Both Services:
```bash
# Test Python backend
curl http://localhost:8000/health

# Test Supabase (replace with your actual values)
curl -X GET 'https://[your-project-id].supabase.co/rest/v1/' \
  -H "apikey: [your-anon-key]"
```

## Environment Setup

### Required Environment Variables:
```bash
# Supabase
SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Python Backend (if needed)
BACKEND_URL=http://localhost:8000
```

### Create .env file:
```bash
cp .env.example .env
# Edit .env with your actual values
```

## Next Steps After Restart

1. **Check app status**: Open your React app and look for status indicators
2. **Test functionality**: Try uploading a PDF or using audio features
3. **Monitor logs**: Check both Python backend logs and browser console
4. **Verify database**: Ensure data is being saved/retrieved correctly

## Common Port Assignments
- **React App**: http://localhost:3000 (or your dev server port)
- **Python Backend**: http://localhost:8000
- **Supabase**: https://[your-project-id].supabase.co

## Emergency Reset

If nothing works, try this complete reset:
```bash
# Stop all processes
pkill -f "python"
pkill -f "node"

# Clear any cached data
rm -rf __pycache__/
rm -rf node_modules/.cache/

# Restart everything
npm install  # for React app
pip install -r requirements.txt  # for Python backend
python main.py  # start Python backend
npm start  # start React app
```