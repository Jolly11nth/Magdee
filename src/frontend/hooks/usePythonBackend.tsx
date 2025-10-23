import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import { pythonBackend, PythonBackendResponse } from '../services/pythonBackend';

interface BackendStatus {
  available: boolean;
  apiStatus: boolean;
  databaseConnected: boolean;
  responseTime: number | null;
  lastChecked: string | null;
  error: string | null;
}

interface UsePythonBackendResult {
  status: BackendStatus;
  isLoading: boolean;
  checkConnection: () => Promise<void>;
  // Convenience methods
  uploadPDF: (file: File, title: string, author: string) => Promise<PythonBackendResponse>;
  sendChatMessage: (message: string, sessionId?: string) => Promise<PythonBackendResponse>;
  logMood: (mood: string, intensity: number, notes?: string, triggers?: string[]) => Promise<PythonBackendResponse>;
  getAnalytics: () => Promise<PythonBackendResponse>;
}

export function usePythonBackend(): UsePythonBackendResult {
  const { user, getAccessToken } = useAuth();
  const [status, setStatus] = useState<BackendStatus>({
    available: false,
    apiStatus: false,
    databaseConnected: false,
    responseTime: null,
    lastChecked: null,
    error: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Checking Python backend connection...');
      
      // Test connection with timeout
      const connectionPromise = pythonBackend.testConnection();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 10000); // 10 second timeout
      });

      const connectionTest = await Promise.race([connectionPromise, timeoutPromise]);
      
      setStatus({
        available: connectionTest.backend_available,
        apiStatus: connectionTest.api_status,
        databaseConnected: connectionTest.database_connected,
        responseTime: connectionTest.response_time,
        lastChecked: new Date().toISOString(),
        error: null
      });

      console.log('✅ Python backend connection check completed:', connectionTest);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      console.warn('⚠️ Python backend connection check failed:', error);
      
      // Determine if this is a network error or server error
      let friendlyError = errorMessage;
      if (errorMessage.includes('fetch')) {
        friendlyError = 'Backend server not running (start with: python start.py --mode dev)';
      } else if (errorMessage.includes('timeout')) {
        friendlyError = 'Connection timeout - backend may be starting up';
      } else if (errorMessage.includes('CORS')) {
        friendlyError = 'CORS error - check backend configuration';
      }
      
      setStatus(prev => ({
        ...prev,
        available: false,
        apiStatus: false,
        databaseConnected: false,
        lastChecked: new Date().toISOString(),
        error: friendlyError
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check connection on mount and when user changes
  useEffect(() => {
    // Small delay to avoid overwhelming the backend on startup
    const timer = setTimeout(() => {
      checkConnection();
    }, 1000);

    return () => clearTimeout(timer);
  }, [checkConnection, user]);

  // Convenience wrapper for PDF upload
  const uploadPDF = useCallback(async (
    file: File, 
    title: string, 
    author: string
  ): Promise<PythonBackendResponse> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!status.available) {
      return { 
        success: false, 
        error: 'Python backend not available. Please start the backend server.' 
      };
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        return { success: false, error: 'No access token available' };
      }

      return await pythonBackend.uploadPDF(user.id, file, title, author, accessToken);
    } catch (error) {
      console.error('❌ PDF upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }, [user, getAccessToken, status.available]);

  // Convenience wrapper for chat
  const sendChatMessage = useCallback(async (
    message: string, 
    sessionId?: string
  ): Promise<PythonBackendResponse> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!status.available) {
      return { 
        success: false, 
        error: 'AI chat requires Python backend. Please start the backend server.' 
      };
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        return { success: false, error: 'No access token available' };
      }

      return await pythonBackend.sendChatMessage(
        user.id, 
        message, 
        accessToken, 
        sessionId
      );
    } catch (error) {
      console.error('❌ Chat message error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Chat failed' 
      };
    }
  }, [user, getAccessToken, status.available]);

  // Convenience wrapper for mood logging
  const logMood = useCallback(async (
    mood: string,
    intensity: number,
    notes?: string,
    triggers?: string[]
  ): Promise<PythonBackendResponse> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!status.available) {
      return { 
        success: false, 
        error: 'Mood tracking requires Python backend. Please start the backend server.' 
      };
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        return { success: false, error: 'No access token available' };
      }

      return await pythonBackend.logMood(
        user.id,
        { mood, intensity, notes, triggers },
        accessToken
      );
    } catch (error) {
      console.error('❌ Mood logging error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Mood logging failed' 
      };
    }
  }, [user, getAccessToken, status.available]);

  // Convenience wrapper for analytics
  const getAnalytics = useCallback(async (): Promise<PythonBackendResponse> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!status.available) {
      return { 
        success: false, 
        error: 'Analytics requires Python backend. Please start the backend server.' 
      };
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        return { success: false, error: 'No access token available' };
      }

      return await pythonBackend.getAnalyticsOverview(user.id, accessToken);
    } catch (error) {
      console.error('❌ Analytics error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Analytics failed' 
      };
    }
  }, [user, getAccessToken, status.available]);

  return {
    status,
    isLoading,
    checkConnection,
    uploadPDF,
    sendChatMessage,
    logMood,
    getAnalytics
  };
}

// Export individual hooks for specific features
export function usePDFUpload() {
  const { uploadPDF, status } = usePythonBackend();
  return { uploadPDF, backendAvailable: status.available };
}

export function useAIChat() {
  const { sendChatMessage, status } = usePythonBackend();
  return { sendChatMessage, backendAvailable: status.available };
}

export function useMoodTracking() {
  const { logMood, status } = usePythonBackend();
  return { logMood, backendAvailable: status.available };
}

export function useAnalytics() {
  const { getAnalytics, status } = usePythonBackend();
  return { getAnalytics, backendAvailable: status.available };
}