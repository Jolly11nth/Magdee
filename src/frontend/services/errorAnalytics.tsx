import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface ErrorAnalyticsData {
  id: string;
  timestamp: string;
  error_type: string;
  error_message: string;
  error_code?: string;
  screen: string;
  user_agent: string;
  user_id?: string;
  session_id: string;
  additional_context?: Record<string, any>;
}

export interface ErrorSummary {
  error_type: string;
  count: number;
  latest_occurrence: string;
  common_messages: string[];
}

class ErrorAnalyticsService {
  private sessionId: string;
  private isEnabled: boolean = true;

  constructor() {
    // Generate a unique session ID
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track authentication errors
  async trackAuthError(
    errorType: 'signup' | 'signin' | 'signout' | 'session_load' | 'profile_load',
    errorMessage: string,
    screen: string,
    userId?: string,
    additionalContext?: Record<string, any>
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.trackError({
        error_type: `auth_${errorType}`,
        error_message: errorMessage,
        screen,
        user_id: userId,
        additional_context: {
          ...additionalContext,
          category: 'authentication'
        }
      });
    } catch (error) {
      console.warn('Failed to track auth error:', error);
    }
  }

  // Track network errors (with filtering for common connectivity issues)
  async trackNetworkError(
    endpoint: string,
    statusCode: number,
    errorMessage: string,
    screen: string,
    userId?: string
  ): Promise<void> {
    if (!this.isEnabled) return;

    // Filter out common connectivity errors that are expected in offline mode
    const commonConnectivityErrors = [
      'Server is currently unavailable',
      'Failed to fetch',
      'Network request failed',
      'Request timeout',
      'signal is aborted'
    ];

    const isCommonConnectivityError = commonConnectivityErrors.some(commonError => 
      errorMessage.toLowerCase().includes(commonError.toLowerCase())
    );

    // Don't track common connectivity errors to reduce noise
    if (isCommonConnectivityError) {
      return;
    }

    try {
      await this.trackError({
        error_type: 'network_error',
        error_code: statusCode.toString(),
        error_message: errorMessage,
        screen,
        user_id: userId,
        additional_context: {
          endpoint,
          status_code: statusCode,
          category: 'network'
        }
      });
    } catch (error) {
      // Silent failure for analytics tracking
    }
  }

  // Track validation errors
  async trackValidationError(
    field: string,
    errorMessage: string,
    screen: string,
    formData?: Record<string, any>
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.trackError({
        error_type: 'validation_error',
        error_message: errorMessage,
        screen,
        additional_context: {
          field,
          form_data: formData ? Object.keys(formData) : undefined, // Only track field names, not values
          category: 'validation'
        }
      });
    } catch (error) {
      console.warn('Failed to track validation error:', error);
    }
  }

  // Track UI/UX errors
  async trackUIError(
    component: string,
    errorMessage: string,
    screen: string,
    userId?: string,
    additionalContext?: Record<string, any>
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.trackError({
        error_type: 'ui_error',
        error_message: errorMessage,
        screen,
        user_id: userId,
        additional_context: {
          component,
          ...additionalContext,
          category: 'ui_ux'
        }
      });
    } catch (error) {
      console.warn('Failed to track UI error:', error);
    }
  }

  // Track server errors
  async trackServerError(
    endpoint: string,
    errorMessage: string,
    screen: string,
    statusCode?: number,
    userId?: string
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.trackError({
        error_type: 'server_error',
        error_code: statusCode?.toString(),
        error_message: errorMessage,
        screen,
        user_id: userId,
        additional_context: {
          endpoint,
          status_code: statusCode,
          category: 'server'
        }
      });
    } catch (error) {
      console.warn('Failed to track server error:', error);
    }
  }

  // Generic error tracking method
  private async trackError(errorData: Omit<ErrorAnalyticsData, 'id' | 'timestamp' | 'user_agent' | 'session_id'>): Promise<void> {
    if (!this.isEnabled) return;

    const analyticsData: ErrorAnalyticsData = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      session_id: this.sessionId,
      ...errorData
    };

    try {
      // Send to server for storage
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/analytics/error`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
      });

      if (!response.ok) {
        // Silent failure for analytics - don't log warnings for expected server unavailability
        this.storeErrorLocally(analyticsData);
      }
    } catch (error) {
      // Store locally if server request fails - silent failure
      this.storeErrorLocally(analyticsData);
    }
  }

  // Store error data locally as fallback
  private storeErrorLocally(errorData: ErrorAnalyticsData): void {
    try {
      const localErrors = JSON.parse(localStorage.getItem('magdee_error_analytics') || '[]');
      localErrors.push(errorData);
      
      // Keep only the last 50 errors to prevent storage bloat
      if (localErrors.length > 50) {
        localErrors.splice(0, localErrors.length - 50);
      }
      
      localStorage.setItem('magdee_error_analytics', JSON.stringify(localErrors));
    } catch (error) {
      console.warn('Failed to store error locally:', error);
    }
  }

  // Get error analytics summary
  async getErrorSummary(days: number = 7): Promise<ErrorSummary[]> {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/analytics/error-summary?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to fetch error summary:', error);
    }

    // Fallback to local data
    return this.getLocalErrorSummary(days);
  }

  // Get error summary from local storage
  private getLocalErrorSummary(days: number = 7): ErrorSummary[] {
    try {
      const localErrors = JSON.parse(localStorage.getItem('magdee_error_analytics') || '[]');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentErrors = localErrors.filter((error: ErrorAnalyticsData) => 
        new Date(error.timestamp) > cutoffDate
      );

      const errorGroups: Record<string, ErrorSummary> = {};

      recentErrors.forEach((error: ErrorAnalyticsData) => {
        if (!errorGroups[error.error_type]) {
          errorGroups[error.error_type] = {
            error_type: error.error_type,
            count: 0,
            latest_occurrence: error.timestamp,
            common_messages: []
          };
        }

        const group = errorGroups[error.error_type];
        group.count++;
        
        if (new Date(error.timestamp) > new Date(group.latest_occurrence)) {
          group.latest_occurrence = error.timestamp;
        }

        if (!group.common_messages.includes(error.error_message) && group.common_messages.length < 5) {
          group.common_messages.push(error.error_message);
        }
      });

      return Object.values(errorGroups).sort((a, b) => b.count - a.count);
    } catch (error) {
      console.warn('Failed to get local error summary:', error);
      return [];
    }
  }

  // Send any locally stored errors to server
  async syncLocalErrors(): Promise<void> {
    try {
      const localErrors = JSON.parse(localStorage.getItem('magdee_error_analytics') || '[]');
      
      if (localErrors.length === 0) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/analytics/error-batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors: localErrors }),
      });

      if (response.ok) {
        // Clear local storage after successful sync
        localStorage.removeItem('magdee_error_analytics');
      }
    } catch (error) {
      // Silent failure for sync - this is expected when server is unavailable
      // The errors will remain in local storage and be synced later
    }
  }

  // Get user-specific error patterns
  async getUserErrorPatterns(userId: string): Promise<ErrorSummary[]> {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/analytics/user-errors/${userId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to fetch user error patterns:', error);
    }

    return [];
  }

  // Disable/enable analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Check if analytics is enabled
  isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create singleton instance
export const errorAnalytics = new ErrorAnalyticsService();

// Hook for using error analytics in React components
export function useErrorAnalytics() {
  return {
    trackAuthError: errorAnalytics.trackAuthError.bind(errorAnalytics),
    trackNetworkError: errorAnalytics.trackNetworkError.bind(errorAnalytics),
    trackValidationError: errorAnalytics.trackValidationError.bind(errorAnalytics),
    trackUIError: errorAnalytics.trackUIError.bind(errorAnalytics),
    trackServerError: errorAnalytics.trackServerError.bind(errorAnalytics),
    getErrorSummary: errorAnalytics.getErrorSummary.bind(errorAnalytics),
    getUserErrorPatterns: errorAnalytics.getUserErrorPatterns.bind(errorAnalytics),
    syncLocalErrors: errorAnalytics.syncLocalErrors.bind(errorAnalytics),
    setEnabled: errorAnalytics.setEnabled.bind(errorAnalytics),
    isAnalyticsEnabled: errorAnalytics.isAnalyticsEnabled.bind(errorAnalytics),
  };
}