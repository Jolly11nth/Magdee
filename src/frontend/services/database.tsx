import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import {
  User,
  Book,
  BookProgress,
  ReadingSession,
  Notification,
  Achievement,
  AudioSettings,
  UserAnalytics,
  UserPreferences,
  DatabaseResult,
  PaginationOptions,
  BookFilters
} from '../types/database';

export class DatabaseService {
  // Server health status
  private static serverHealthy = true;
  private static lastHealthCheck = 0;
  private static healthCheckInterval = 30000; // 30 seconds

  // Helper method to get access token
  private static async getAccessToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Quick server health check with silent failure
  private static async checkServerHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Skip check if we checked recently
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.serverHealthy;
    }

    try {
      console.log('🏥 Checking server health...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // Reduced to 1.5 second timeout
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/health`, {
        method: 'GET',
        signal: controller.signal,
        // Add headers to prevent caching
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      this.serverHealthy = response.ok;
      this.lastHealthCheck = now;
      
      if (this.serverHealthy) {
        console.log('🏥 Server health check: healthy');
      } else {
        console.log('🏥 Server health check: unhealthy (bad response)');
      }
      return this.serverHealthy;
    } catch (error) {
      // Silent failure - only log if it's not a common network error
      if (error instanceof Error && 
          !error.message.includes('fetch') && 
          !error.message.includes('signal is aborted') &&
          !error.message.includes('Failed to fetch')) {
        console.warn('🏥 Server health check failed:', error.message);
      } else {
        console.log('🏥 Server health check failed: network unavailable');
      }
      this.serverHealthy = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  // Helper method to make authenticated API calls with silent failure when offline
  private static async apiCall<T>(
    endpoint: string, 
    options: RequestInit = {},
    timeoutMs: number = 2000 // Reduced to 2 seconds for faster failure
  ): Promise<DatabaseResult<T>> {
    let timeoutId: NodeJS.Timeout | null = null;
    let controller: AbortController | null = null;

    try {
      // Quick health check first
      const isHealthy = await this.checkServerHealth();
      if (!isHealthy) {
        // Silent failure when server is known to be unhealthy
        return { success: false, error: 'Server is currently unavailable' };
      }

      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: 'No authentication token available' };
      }

      // Create abort controller for timeout
      controller = new AbortController();
      
      // Set up aggressive timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          if (controller) {
            controller.abort();
          }
          reject(new Error(`Request timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      // Only log API calls when server is healthy
      console.log(`📡 Making API call to ${endpoint}`);

      // Make the API call
      const fetchPromise = fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...options.headers,
        },
        signal: controller.signal,
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      // Clear timeout on success
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        this.serverHealthy = false; // Mark as unhealthy on HTTP errors
        return { success: false, error: errorData.error || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      // Clean up timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Handle different types of errors silently when offline
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          // Mark server as unhealthy on timeout
          this.serverHealthy = false;
          return { success: false, error: 'Server is currently unavailable' };
        }
        
        // Network errors - mark as unhealthy and return generic error
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          this.serverHealthy = false;
          return { success: false, error: 'Server is currently unavailable' };
        }
        
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Server is currently unavailable' };
    }
  }

  // User operations
  static async createUser(userData: Omit<User, 'created_at' | 'updated_at'>): Promise<DatabaseResult<User>> {
    // User creation is handled by the signup process in auth.tsx
    // This method is kept for compatibility
    return { success: false, error: 'User creation should be done through signup process' };
  }

  static async getUser(userId: string): Promise<DatabaseResult<User>> {
    return this.apiCall<User>(`/user/${userId}`, {}, 2000); // 2 second timeout
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<DatabaseResult<User>> {
    return this.apiCall<User>(`/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, 3000);
  }

  // Profile operations
  static async updateUserProfile(userId: string, profileData: {
    full_name?: string;
    username?: string;
    bio?: string;
    location?: string;
    website?: string;
  }): Promise<DatabaseResult<User>> {
    return this.apiCall<User>(`/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }, 3000);
  }

  // Profile picture operations
  static async updateProfilePicture(userId: string, imageUrl: string): Promise<DatabaseResult<User>> {
    return this.apiCall<User>(`/profile/${userId}/picture`, {
      method: 'PUT',
      body: JSON.stringify({ imageUrl }),
    }, 3000);
  }

  // Recent Books operations
  static async getRecentBooks(userId: string, options?: {
    limit?: number;
    offset?: number;
    status?: 'completed' | 'all';
  }): Promise<DatabaseResult<any[]>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.status) params.append('status', options.status);
    
    const queryString = params.toString();
    const url = `/recent-books/${userId}${queryString ? `?${queryString}` : ''}`;
    
    return this.apiCall<any[]>(url, {
      method: 'GET',
    }, 3000);
  }

  static async getBookById(bookId: string): Promise<DatabaseResult<any>> {
    return this.apiCall<any>(`/book/${bookId}`, {
      method: 'GET',
    }, 2000);
  }

  // Development/Testing methods
  static async seedSampleData(userId: string, force: boolean = false): Promise<DatabaseResult<any>> {
    return this.apiCall<any>(`/seed-data`, {
      method: 'POST',
      body: JSON.stringify({ userId, force }),
    }, 5000); // Longer timeout for seeding
  }

  static async uploadProfileImage(userId: string, imageFile: File): Promise<DatabaseResult<{ imageUrl: string; user: User }>> {
    try {
      // Check health first
      const isHealthy = await this.checkServerHealth();
      if (!isHealthy) {
        return { success: false, error: 'Server is currently unavailable' };
      }

      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: 'No authentication token available' };
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for uploads

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/profile/${userId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        return { success: false, error: errorData.error || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Profile image upload error:', error);
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
        return { success: false, error: 'Upload timeout - please try again' };
      }
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getUserProfile(userId: string): Promise<DatabaseResult<User>> {
    // Quick health check first
    const isHealthy = await this.checkServerHealth();
    if (!isHealthy) {
      // Silent failure when server is known to be unhealthy
      return { success: false, error: 'Server is currently unavailable' };
    }

    // Try the profile endpoint with very short timeout
    try {
      const result = await this.apiCall<User>(`/profile/${userId}`, {}, 1500); // 1.5 second timeout
      return result;
    } catch (error) {
      // Silent failure for profile requests
      return { success: false, error: 'Server is currently unavailable' };
    }
  }

  // Book operations
  static async createBook(bookData: Omit<Book, 'created_at' | 'updated_at'>): Promise<DatabaseResult<Book>> {
    return this.apiCall<Book>(`/books/${bookData.user_id}`, {
      method: 'POST',
      body: JSON.stringify(bookData),
    }, 5000);
  }

  static async getUserBooks(userId: string, filters?: BookFilters, pagination?: PaginationOptions): Promise<DatabaseResult<Book[]>> {
    // For now, return the API call. Filtering and pagination can be added later
    return this.apiCall<Book[]>(`/books/${userId}`, {}, 3000);
  }

  static async updateBook(bookId: string, updates: Partial<Book>): Promise<DatabaseResult<Book>> {
    // This requires getting the user_id first. For now, we'll implement progress updates separately
    return { success: false, error: 'Direct book updates not implemented. Use updateBookProgress instead.' };
  }

  static async deleteBook(userId: string, bookId: string): Promise<DatabaseResult<boolean>> {
    return this.apiCall<boolean>(`/books/${userId}/${bookId}`, {
      method: 'DELETE',
    }, 3000);
  }

  // Book progress operations (now handled by backend)
  static async initializeBookProgress(userId: string, bookId: string): Promise<DatabaseResult<BookProgress>> {
    // Book progress is automatically initialized when a book is created
    return { success: true, data: null };
  }

  static async updateBookProgress(userId: string, bookId: string, progressData: Partial<BookProgress>): Promise<DatabaseResult<BookProgress>> {
    return this.apiCall<BookProgress>(`/books/${userId}/${bookId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    }, 3000);
  }

  static async getBookProgress(userId: string, bookId: string): Promise<BookProgress | null> {
    const result = await this.apiCall<BookProgress>(`/books/${userId}/${bookId}/progress`, {}, 2000);
    return result.success ? result.data : null;
  }

  // Legacy notification operations (kept for compatibility, but newer methods below are preferred)

  // Audio settings operations (using API endpoints)
  static async initializeAudioSettings(userId: string): Promise<DatabaseResult<AudioSettings>> {
    // This should be done through the API if needed
    // For now, audio settings are handled directly by the server
    return { success: false, error: 'Audio settings initialization should be done through user setup' };
  }

  // Analytics operations (using API endpoints)
  static async initializeUserAnalytics(userId: string): Promise<DatabaseResult<UserAnalytics>> {
    // Analytics initialization should be done through the server
    return { success: false, error: 'Analytics initialization should be done through server setup' };
  }

  static async updateUserAnalytics(userId: string, analyticsData: Partial<UserAnalytics>): Promise<DatabaseResult<UserAnalytics>> {
    // Analytics updates should be done through the API
    return this.apiCall<UserAnalytics>(`/analytics/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(analyticsData),
    }, 3000);
  }

  static async getUserAnalytics(userId: string): Promise<DatabaseResult<UserAnalytics>> {
    return this.apiCall<UserAnalytics>(`/analytics/${userId}`, {}, 2000);
  }

  static async getAudioSettings(userId: string): Promise<DatabaseResult<AudioSettings>> {
    // Audio settings should be retrieved through API if implemented
    return { success: false, error: 'Audio settings retrieval should be done through API endpoints' };
  }

  static async updateUserNotifications(userId: string, notifications: Notification[]): Promise<DatabaseResult<boolean>> {
    // Bulk notification updates should be done through the API if needed
    return { success: false, error: 'Bulk notification updates not implemented. Use individual operations instead.' };
  }

  static async getReadingSessions(userId: string, limit?: number): Promise<DatabaseResult<ReadingSession[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.apiCall<ReadingSession[]>(`/reading-session/${userId}${params}`, {}, 3000);
  }

  static async updateReadingSessions(userId: string, sessions: ReadingSession[]): Promise<DatabaseResult<boolean>> {
    // Bulk session updates should be done through individual API calls
    return { success: false, error: 'Bulk session updates not implemented. Use individual operations instead.' };
  }

  // Legacy achievement operations (kept for compatibility)

  // Utility methods
  static async getUserStats(userId: string): Promise<DatabaseResult<{
    totalBooks: number;
    completedBooks: number;
    inProgressBooks: number;
    totalListeningTime: number;
    averageRating: number;
    favoriteGenre: string;
  }>> {
    try {
      const booksResult = await this.getUserBooks(userId);
      const analyticsResult = await this.getUserAnalytics(userId);

      if (!booksResult.success || !analyticsResult.success) {
        return { success: false, error: 'Failed to get user data' };
      }

      const books = booksResult.data || [];
      const analytics = analyticsResult.data;

      const completedBooks = books.filter(book => book.progress >= 100);
      const inProgressBooks = books.filter(book => book.progress > 0 && book.progress < 100);
      const averageRating = books.length > 0 
        ? books.reduce((sum, book) => sum + book.rating, 0) / books.length 
        : 0;

      // Find favorite genre
      const genreCounts = books.reduce((acc, book) => {
        acc[book.genre] = (acc[book.genre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const favoriteGenre = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      const stats = {
        totalBooks: books.length,
        completedBooks: completedBooks.length,
        inProgressBooks: inProgressBooks.length,
        totalListeningTime: analytics?.total_listening_time || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        favoriteGenre,
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { success: false, error: 'Failed to get user stats' };
    }
  }

  // Legacy reading session operations (kept for compatibility)

  static async endReadingSession(userId: string, sessionId: string, endData: Partial<ReadingSession>): Promise<DatabaseResult<ReadingSession>> {
    return this.apiCall<ReadingSession>(`/reading-session/${userId}/${sessionId}/end`, {
      method: 'PUT',
      body: JSON.stringify(endData),
    }, 3000);
  }

  // Progress tracking methods
  static async getUserProgress(userId: string): Promise<DatabaseResult<{
    totalBooks: number;
    completedBooks: number;
    totalListeningTime: number;
    currentStreak: number;
    weeklyProgress: number;
    recentActivity: any[];
  }>> {
    return this.apiCall(`/progress/${userId}`, {}, 3000);
  }

  // Reading session methods
  static async startReadingSession(userId: string, bookId: string, startPosition?: number): Promise<DatabaseResult<ReadingSession>> {
    return this.apiCall<ReadingSession>(`/reading-session/${userId}/start`, {
      method: 'POST',
      body: JSON.stringify({ bookId, startPosition }),
    }, 3000);
  }

  // Notification methods
  static async getUserNotifications(userId: string, unreadOnly?: boolean): Promise<DatabaseResult<Notification[]>> {
    const params = unreadOnly ? '?unread=true' : '';
    return this.apiCall<{ notifications: Notification[]; unreadCount: number }>(`/notifications/${userId}${params}`, {}, 3000)
      .then(result => ({
        ...result,
        data: result.data?.notifications || []
      }));
  }

  static async createNotification(userId: string, notificationData: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'read'>): Promise<DatabaseResult<Notification>> {
    return this.apiCall<Notification>(`/notifications/${userId}`, {
      method: 'POST',
      body: JSON.stringify(notificationData),
    }, 3000);
  }

  static async markNotificationAsRead(userId: string, notificationId: string): Promise<DatabaseResult<Notification>> {
    return this.apiCall<Notification>(`/notifications/${userId}/${notificationId}/read`, {
      method: 'PUT',
    }, 2000);
  }

  // Achievement methods
  static async getUserAchievements(userId: string): Promise<DatabaseResult<{ achievements: Achievement[]; availableAchievements: Achievement[] }>> {
    return this.apiCall(`/achievements/${userId}`, {}, 3000);
  }

  static async createAchievement(userId: string, achievementData: Omit<Achievement, 'id' | 'user_id' | 'unlocked_at'>): Promise<DatabaseResult<Achievement>> {
    return this.apiCall<Achievement>(`/achievements/${userId}`, {
      method: 'POST',
      body: JSON.stringify(achievementData),
    }, 3000);
  }

  // Helper method to get server health status
  static getServerHealthStatus(): { healthy: boolean; lastCheck: number } {
    return {
      healthy: this.serverHealthy,
      lastCheck: this.lastHealthCheck
    };
  }

  // Helper method to reset server health (for testing)
  static resetServerHealth(): void {
    this.serverHealthy = true;
    this.lastHealthCheck = 0;
  }

  // Force a fresh health check
  static async forceHealthCheck(): Promise<boolean> {
    this.lastHealthCheck = 0; // Reset to force fresh check
    return await this.checkServerHealth();
  }

  // Set server health manually (for testing/debug purposes)
  static setServerHealth(healthy: boolean): void {
    this.serverHealthy = healthy;
    this.lastHealthCheck = Date.now();
  }

  // User Preferences methods
  static async getUserPreferences(userId: string): Promise<DatabaseResult<UserPreferences & { isDefault?: boolean }>> {
    console.log('🎧 Getting user preferences for:', userId);
    return this.apiCall<UserPreferences & { isDefault?: boolean }>(`/preferences/${userId}`, {}, 2000);
  }

  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<DatabaseResult<UserPreferences>> {
    console.log('💾 Updating user preferences for:', userId, preferences);
    return this.apiCall<UserPreferences>(`/preferences/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    }, 3000);
  }

  // Audio Settings methods (for backwards compatibility)
  static async updateAudioSettings(userId: string, audioSettings: {
    language?: string;
    voice_id?: string;
    voice_name?: string;
    voice_type?: 'Natural' | 'Premium';
    playback_speed?: number;
    auto_detect_language?: boolean;
  }): Promise<DatabaseResult<UserPreferences>> {
    console.log('🎧 Updating audio settings for:', userId, audioSettings);
    return this.apiCall<UserPreferences>(`/audio-settings/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(audioSettings),
    }, 3000);
  }
}