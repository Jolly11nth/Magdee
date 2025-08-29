/**
 * Python Backend Service
 * Handles communication with the FastAPI Python backend
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getEnvVar, ENV_CONFIG } from '../utils/environment';

// Configuration
const PYTHON_BACKEND_URL = ENV_CONFIG.pythonBackendUrl;
const API_VERSION = 'v1';
const BASE_API_URL = `${PYTHON_BACKEND_URL}/api/${API_VERSION}`;

// Types
export interface PythonBackendResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PDFUploadResponse {
  success: boolean;
  book_id: string;
  title: string;
  status: string;
  message: string;
  estimated_processing_time?: string;
}

export interface BookProcessingStatus {
  book_id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  updated_at: string;
  audio_url?: string;
  duration?: number;
  error_message?: string;
}

export interface ChatResponse {
  success: boolean;
  response: {
    message: string;
    suggestions?: string[];
    mood_check?: boolean;
    resources?: string[];
  };
  chat_id: string;
  timestamp: string;
}

export interface MoodEntry {
  mood: string;
  intensity: number;
  notes?: string;
  triggers?: string[];
}

export interface UserAnalytics {
  summary: {
    total_books: number;
    total_activities: number;
    mood_entries: number;
    chat_messages: number;
    account_age_days: number;
  };
  usage_patterns: any;
  book_analytics: any;
  mood_analytics: any;
  engagement_metrics: any;
}

class PythonBackendService {
  private backendUrl: string;
  private baseApiUrl: string;
  private isConfigured: boolean;

  constructor() {
    this.backendUrl = PYTHON_BACKEND_URL;
    this.baseApiUrl = BASE_API_URL;
    this.isConfigured = this.backendUrl !== 'http://localhost:8000' || ENV_CONFIG.isDevelopment;
    
    // Log configuration for debugging
    if (ENV_CONFIG.isDevelopment) {
      console.log('🐍 Python Backend Service initialized:', {
        backendUrl: this.backendUrl,
        baseApiUrl: this.baseApiUrl,
        isConfigured: this.isConfigured
      });
    }
  }

  private getAuthHeaders(accessToken: string) {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    accessToken?: string
  ): Promise<PythonBackendResponse<T>> {
    try {
      const url = `${this.baseApiUrl}${endpoint}`;
      
      if (ENV_CONFIG.isDevelopment) {
        console.log(`🐍 Python Backend API call: ${options.method || 'GET'} ${url}`);
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add authorization if token provided
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ Python Backend API error:`, {
          status: response.status,
          statusText: response.statusText,
          data
        });
        
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          data: null
        };
      }

      if (ENV_CONFIG.isDevelopment) {
        console.log(`✅ Python Backend API success:`, data);
      }
      return data;

    } catch (error) {
      console.error('❌ Python Backend network error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
        data: null
      };
    }
  }

  // Health and status checks
  async checkHealth(): Promise<PythonBackendResponse> {
    return this.makeRequest('/health');
  }

  async getApiStatus(): Promise<PythonBackendResponse> {
    return this.makeRequest('/status');
  }

  // PDF Processing
  async uploadPDF(
    userId: string, 
    file: File, 
    title: string, 
    author: string, 
    accessToken: string
  ): Promise<PythonBackendResponse<PDFUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('author', author);

    return this.makeRequest<PDFUploadResponse>(
      `/pdf/upload/${userId}`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
      }
    );
  }

  async getProcessingStatus(
    bookId: string, 
    accessToken: string
  ): Promise<PythonBackendResponse<BookProcessingStatus>> {
    return this.makeRequest<BookProcessingStatus>(
      `/pdf/status/${bookId}`,
      { method: 'GET' },
      accessToken
    );
  }

  async deletePDF(
    bookId: string, 
    accessToken: string
  ): Promise<PythonBackendResponse> {
    return this.makeRequest(
      `/pdf/${bookId}`,
      { method: 'DELETE' },
      accessToken
    );
  }

  // AI Features
  async sendChatMessage(
    userId: string,
    message: string,
    accessToken: string,
    sessionId?: string,
    context?: string
  ): Promise<PythonBackendResponse<ChatResponse>> {
    return this.makeRequest<ChatResponse>(
      `/ai/chat/${userId}`,
      {
        method: 'POST',
        body: JSON.stringify({
          message,
          session_id: sessionId || 'default',
          context
        }),
      },
      accessToken
    );
  }

  async getChatHistory(
    userId: string,
    accessToken: string,
    sessionId?: string,
    limit = 50
  ): Promise<PythonBackendResponse> {
    const params = new URLSearchParams();
    if (sessionId) params.append('session_id', sessionId);
    params.append('limit', limit.toString());

    return this.makeRequest(
      `/ai/chat/${userId}/history?${params.toString()}`,
      { method: 'GET' },
      accessToken
    );
  }

  async logMood(
    userId: string,
    moodEntry: MoodEntry,
    accessToken: string
  ): Promise<PythonBackendResponse> {
    return this.makeRequest(
      `/ai/mood/${userId}`,
      {
        method: 'POST',
        body: JSON.stringify(moodEntry),
      },
      accessToken
    );
  }

  async getMoodHistory(
    userId: string,
    accessToken: string,
    days = 30
  ): Promise<PythonBackendResponse> {
    return this.makeRequest(
      `/ai/mood/${userId}?days=${days}`,
      { method: 'GET' },
      accessToken
    );
  }

  async analyzeMood(
    userId: string,
    accessToken: string,
    period = 'week'
  ): Promise<PythonBackendResponse> {
    return this.makeRequest(
      `/ai/mood/${userId}/analysis`,
      {
        method: 'POST',
        body: JSON.stringify({ period }),
      },
      accessToken
    );
  }

  // User Management
  async getUserProfile(
    userId: string, 
    accessToken: string
  ): Promise<PythonBackendResponse> {
    return this.makeRequest(
      `/users/${userId}/profile`,
      { method: 'GET' },
      accessToken
    );
  }

  async updateUserPreferences(
    userId: string,
    preferences: any,
    accessToken: string
  ): Promise<PythonBackendResponse> {
    return this.makeRequest(
      `/users/${userId}/preferences`,
      {
        method: 'PUT',
        body: JSON.stringify(preferences),
      },
      accessToken
    );
  }

  async getUserBooks(
    userId: string, 
    accessToken: string
  ): Promise<PythonBackendResponse> {
    return this.makeRequest(
      `/users/${userId}/books`,
      { method: 'GET' },
      accessToken
    );
  }

  async getUserActivity(
    userId: string,
    accessToken: string,
    limit = 50,
    activityType?: string
  ): Promise<PythonBackendResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (activityType) params.append('activity_type', activityType);

    return this.makeRequest(
      `/users/${userId}/activity?${params.toString()}`,
      { method: 'GET' },
      accessToken
    );
  }

  // Analytics
  async getAnalyticsOverview(
    userId: string, 
    accessToken: string
  ): Promise<PythonBackendResponse<UserAnalytics>> {
    return this.makeRequest<UserAnalytics>(
      `/analytics/overview/${userId}`,
      { method: 'GET' },
      accessToken
    );
  }

  async getUsageAnalytics(
    userId: string,
    accessToken: string,
    period = 'week'
  ): Promise<PythonBackendResponse> {
    return this.makeRequest(
      `/analytics/usage/${userId}?period=${period}`,
      { method: 'GET' },
      accessToken
    );
  }

  async getBookAnalytics(
    userId: string, 
    accessToken: string
  ): Promise<PythonBackendResponse> {
    return this.makeRequest(
      `/analytics/books/${userId}`,
      { method: 'GET' },
      accessToken
    );
  }

  async getMoodAnalytics(
    userId: string, 
    accessToken: string
  ): Promise<PythonBackendResponse> {
    return this.makeRequest(
      `/analytics/mood/${userId}`,
      { method: 'GET' },
      accessToken
    );
  }

  // Audio Management
  async getAudioMetadata(
    bookId: string, 
    accessToken: string
  ): Promise<PythonBackendResponse> {
    return this.makeRequest(
      `/audio/metadata/${bookId}`,
      { method: 'GET' },
      accessToken
    );
  }

  async regenerateAudio(
    bookId: string, 
    accessToken: string
  ): Promise<PythonBackendResponse> {
    return this.makeRequest(
      `/audio/generate/${bookId}`,
      { method: 'POST' },
      accessToken
    );
  }

  // Utility methods
  getAudioStreamUrl(bookId: string): string {
    return `${this.baseApiUrl}/audio/stream/${bookId}`;
  }

  isBackendAvailable(): Promise<boolean> {
    return this.checkHealth()
      .then(response => response.success)
      .catch(() => false);
  }

  async testConnection(): Promise<{
    backend_available: boolean;
    api_status: boolean;
    database_connected: boolean;
    response_time: number;
  }> {
    const startTime = Date.now();
    
    try {
      const [healthCheck, apiStatus] = await Promise.all([
        this.checkHealth(),
        this.getApiStatus()
      ]);

      const responseTime = Date.now() - startTime;

      return {
        backend_available: healthCheck.success,
        api_status: apiStatus.success,
        database_connected: healthCheck.data?.services?.database === 'operational',
        response_time: responseTime
      };
    } catch (error) {
      return {
        backend_available: false,
        api_status: false,
        database_connected: false,
        response_time: Date.now() - startTime
      };
    }
  }

  // Get current configuration (for debugging)
  getConfig() {
    return {
      backendUrl: this.backendUrl,
      baseApiUrl: this.baseApiUrl,
      isConfigured: this.isConfigured,
      environmentConfig: ENV_CONFIG
    };
  }
}

// Export singleton instance
export const pythonBackend = new PythonBackendService();

// Export for testing
export { PythonBackendService };