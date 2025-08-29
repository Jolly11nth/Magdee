# Python Backend Setup Guide

## 1. Install Python Backend Dependencies

```bash
# Navigate to your project root directory
cd your-project-directory

# Install Python dependencies
pip install -r requirements.txt

# Or if you prefer using a virtual environment (recommended):
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Configure Environment Variables

```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your actual values:
# - Copy your SUPABASE_URL from your existing React app
# - Copy your SUPABASE_SERVICE_ROLE_KEY from your Supabase dashboard
# - Add any AI service API keys if you plan to use them
```

## 3. Start the Python Backend

```bash
# Development mode (with auto-reload)
python start.py --mode dev

# Or directly:
python main.py --dev

# The server will start on http://localhost:8000
# API docs will be available at http://localhost:8000/docs
```

## 4. Verify Backend is Running

Open your browser and check:
- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/docs
- API status: http://localhost:8000/api/v1/status

## 5. Next Steps

Once the Python backend is running, we'll integrate it with your React frontend by:
1. Adding Python backend service calls
2. Updating screens to use enhanced features
3. Testing the full integration