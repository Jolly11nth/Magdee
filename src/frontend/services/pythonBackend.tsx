/**
 * Python Backend Service Integration
 * Handles communication with the FastAPI Python backend for PDF processing, audio conversion, and analytics
 */

import { projectId, publicAnonKey } from '../utils/supabase/info';

// Python backend configuration
// Auto-detects Railway deployment or uses local development URL
const PYTHON_BACKEND_URL = import.meta.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:8001';

export interface PythonBackendConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
}

const config: PythonBackendConfig = {
  baseURL: PYTHON_BACKEND_URL,
  timeout: 30000, // 30 seconds
  retryAttempts: 3
};

/**
 * Make authenticated API call to Python backend
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<{success: boolean; data?: T; error?: string}> {
  const url = `${config.baseURL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  // Add authorization if token provided
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    console.log(`🐍 Python Backend: ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(config.timeout)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`❌ Python Backend Error:`, errorData);
      return {
        success: false,
        error: errorData.error || errorData.message || `HTTP ${response.status}`
      };
    }

    const data = await response.json();
    console.log(`✅ Python Backend Success:`, endpoint);
    
    return { success: true, data };

  } catch (error) {
    console.error(`💥 Python Backend Request Failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * PDF Processing Service
 */
export const PDFService = {
  /**
   * Upload PDF for processing
   */
  async uploadPDF(
    userId: string,
    file: File,
    metadata: { title?: string; author?: string },
    accessToken: string
  ): Promise<{success: boolean; data?: any; error?: string}> {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `${config.baseURL}/api/v1/pdf/upload/${userId}`;
    const queryParams = new URLSearchParams();
    if (metadata.title) queryParams.append('title', metadata.title);
    if (metadata.author) queryParams.append('author', metadata.author);
    
    const fullUrl = queryParams.toString() ? `${url}?${queryParams}` : url;

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        return { success: false, error: errorData.error || 'Upload failed' };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  },

  /**
   * Get PDF processing status
   */
  async getStatus(
    bookId: string,
    accessToken: string
  ): Promise<{success: boolean; data?: any; error?: string}> {
    return apiCall(`/api/v1/pdf/status/${bookId}`, {
      method: 'GET'
    }, accessToken);
  },

  /**
   * Delete PDF
   */
  async deletePDF(
    bookId: string,
    accessToken: string
  ): Promise<{success: boolean; data?: any; error?: string}> {
    return apiCall(`/api/v1/pdf/${bookId}`, {
      method: 'DELETE'
    }, accessToken);
  }
};

/**
 * Audio Service
 */
export const AudioService = {
  /**
   * Get audio stream URL
   */
  getStreamURL(bookId: string): string {
    return `${config.baseURL}/api/v1/audio/stream/${bookId}`;
  },

  /**
   * Get audio metadata
   */
  async getMetadata(
    bookId: string,
    accessToken: string
  ): Promise<{success: boolean; data?: any; error?: string}> {
    return apiCall(`/api/v1/audio/metadata/${bookId}`, {
      method: 'GET'
    }, accessToken);
  },

  /**
   * Regenerate audio with different settings
   */
  async regenerateAudio(
    bookId: string,
    accessToken: string
  ): Promise<{success: boolean; data?: any; error?: string}> {
    return apiCall(`/api/v1/audio/generate/${bookId}`, {
      method: 'POST'
    }, accessToken);
  },

  /**
   * Delete audio file
   */
  async deleteAudio(
    bookId: string,
    accessToken: string
  ): Promise<{success: boolean; data?: any; error?: string}> {
    return apiCall(`/api/v1/audio/${bookId}`, {
      method: 'DELETE'
    }, accessToken);
  }
};

/**
 * Analytics Service
 */
export const AnalyticsService = {
  /**
   * Get analytics overview
   */
  async getOverview(
    userId: string,
    accessToken: string
  ): Promise<{success: boolean; data?: any; error?: string}> {
    return apiCall(`/api/v1/analytics/overview/${userId}`, {
      method: 'GET'
    }, accessToken);
  },

  /**
   * Get usage analytics
   */
  async getUsageAnalytics(
    userId: string,
    period: 'week' | 'month' | 'year',
    accessToken: string
  ): Promise<{success: boolean; data?: any; error?: string}> {
    return apiCall(`/api/v1/analytics/usage/${userId}?period=${period}`, {
      method: 'GET'
    }, accessToken);
  },

  /**
   * Get book analytics
   */
  async getBookAnalytics(
    userId: string,
    accessToken: string
  ): Promise<{success: boolean; data?: any; error?: string}> {
    return apiCall(`/api/v1/analytics/books/${userId}`, {
      method: 'GET'
    }, accessToken);
  },

  /**
   * Get mood analytics
   */
  async getMoodAnalytics(
    userId: string,
    accessToken: string
  ): Promise<{success: boolean; data?: any; error?: string}> {
    return apiCall(`/api/v1/analytics/mood/${userId}`, {
      method: 'GET'
    }, accessToken);
  }
};

/**
 * Health check for Python backend
 */
export async function checkPythonBackendHealth(): Promise<{
  healthy: boolean;
  environment?: string;
  services?: Record<string, string>;
}> {
  try {
    const response = await fetch(`${config.baseURL}/api/health`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      return { healthy: false };
    }

    const data = await response.json();
    return {
      healthy: data.status === 'healthy',
      environment: data.environment,
      services: data.services
    };

  } catch (error) {
    console.warn('Python backend health check failed:', error);
    return { healthy: false };
  }
}

/**
 * Python Backend Service - Main export
 */
export const PythonBackendService = {
  PDF: PDFService,
  Audio: AudioService,
  Analytics: AnalyticsService,
  checkHealth: checkPythonBackendHealth,
  config
};

export default PythonBackendService;
