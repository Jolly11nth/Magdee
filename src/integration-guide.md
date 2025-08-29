# Python Backend Integration Guide

## 🚀 Quick Start

### 1. Set Up Python Backend

```bash
# Install Python dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start the backend
python start.py --mode dev
```

### 2. Configure React Frontend

```bash
# Add to your React .env file
echo "REACT_APP_PYTHON_BACKEND_URL=http://localhost:8000" >> .env
```

### 3. Test the Integration

1. Start your React app: `npm start`
2. Navigate to any screen (e.g., Home)
3. Check the Python Backend Status indicator in the top-right
4. Visit the test screen by adding `&screen=python-backend-test` to URL

## 🔌 Integration Features

### Available Now
- **Connection Status**: Real-time backend health monitoring
- **Test Interface**: Comprehensive API testing screen
- **Error Handling**: Graceful fallbacks when backend is unavailable
- **Authentication**: Seamless integration with your Supabase auth

### Ready to Integrate
- **PDF Upload**: Enhanced with Python processing
- **AI Chat**: Mental health support chatbot
- **Mood Tracking**: Advanced analytics and insights
- **User Analytics**: Comprehensive usage statistics

## 📱 Enhanced Screens

### PDF Upload (UploadPDFScreen)
```typescript
// Example integration
import { usePDFUpload } from '../hooks/usePythonBackend';

const { uploadPDF, backendAvailable } = usePDFUpload();

const handleUpload = async (file: File) => {
  if (backendAvailable) {
    const result = await uploadPDF(file, title, author);
    // Handle enhanced features
  } else {
    // Fallback to current implementation
  }
};
```

### AI Chat (ChatAIScreen)
```typescript
import { useAIChat } from '../hooks/usePythonBackend';

const { sendChatMessage, backendAvailable } = useAIChat();

const handleChat = async (message: string) => {
  if (backendAvailable) {
    const response = await sendChatMessage(message);
    // Display AI response with suggestions
  }
};
```

### Mood Tracking (MoodTrackingScreen)
```typescript
import { useMoodTracking } from '../hooks/usePythonBackend';

const { logMood, backendAvailable } = useMoodTracking();

const handleMoodLog = async (mood: string, intensity: number) => {
  if (backendAvailable) {
    await logMood(mood, intensity, notes, triggers);
    // Access advanced analytics
  }
};
```

## 🎯 Next Steps

### Immediate (Next 30 minutes)
1. ✅ **Start Python backend**: `python start.py --mode dev`
2. ✅ **Test connection**: Check the status indicator
3. ✅ **Run tests**: Visit the Python Backend Test screen

### Short-term (Next few hours)
1. **Update UploadPDFScreen**: Add Python backend PDF processing
2. **Enhance ChatAIScreen**: Integrate AI chatbot responses
3. **Improve MoodTrackingScreen**: Add analytics and insights

### Medium-term (Next few days)
1. **Analytics Dashboard**: Create comprehensive user analytics
2. **Performance Optimization**: Fine-tune backend integration
3. **Error Recovery**: Implement robust fallback mechanisms

## 🛠️ Development Workflow

### Backend Development
```bash
# Start with auto-reload
python start.py --mode dev

# Check logs for errors
tail -f logs/backend.log

# View API docs
open http://localhost:8000/docs
```

### Frontend Development
```bash
# Start React app
npm start

# Test integration
# Visit: http://localhost:3000?screen=python-backend-test
```

### Testing Integration
1. Both servers running (React + Python)
2. Check Python Backend Status indicator
3. Test individual features in test screen
4. Monitor browser console for errors

## 🔧 Troubleshooting

### Common Issues

**Backend not starting:**
- Check Python version (3.8+)
- Install requirements: `pip install -r requirements.txt`
- Verify environment variables in `.env`

**Connection errors:**
- Ensure backend is running on port 8000
- Check CORS configuration
- Verify React app has correct backend URL

**Authentication issues:**
- Check Supabase credentials match between services
- Verify access tokens are being passed correctly
- Check network tab for authentication headers

### Debug Tools
- Python Backend Status indicator (top-right)
- Python Backend Test screen
- Browser developer tools (Network tab)
- Backend logs and API docs

## 📊 Monitoring

### What to Watch
- Backend status indicator (should be green)
- Response times (should be < 500ms)
- Error rates in browser console
- API endpoint success rates

### Performance Tips
- Backend auto-reconnects on failure
- Graceful fallbacks when offline
- Caching for repeated requests
- Optimized for mobile performance

---

Your Magdee app now has a powerful Python backend! Start with the test screen to verify everything works, then begin integrating enhanced features one screen at a time.