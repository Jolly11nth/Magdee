import * as kv from '../supabase/functions/server/kv_store';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserSettings {
  audio_speed: number;
  voice_type: 'neural' | 'standard';
  language: string;
  theme: 'light' | 'dark' | 'auto';
  auto_play_next: boolean;
  notification_preferences: {
    processing_complete: boolean;
    new_features: boolean;
    achievements: boolean;
    learning_tips: boolean;
    daily_reminders: boolean;
    weekly_summary: boolean;
  };
}

export interface BookData {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url: string;
  duration_seconds: number;
  chapters: number;
  genre: string;
  rating: number;
  progress: number;
  description: string;
  category: string;
  file_url?: string;
  audio_url?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at?: string;
}

export interface BookProgress {
  book_id: string;
  user_id: string;
  current_position: number;
  current_chapter: number;
  total_duration: number;
  completed: boolean;
  last_accessed: string;
  reading_time_today: number;
  reading_time_total: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'processing_complete' | 'new_feature' | 'achievement' | 'reminder' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  expires_at?: string;
}

export interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  start_time: string;
  end_time?: string;
  duration: number;
  start_position: number;
  end_position: number;
  chapters_completed: number[];
  created_at: string;
}

export interface UserAnalytics {
  user_id: string;
  total_books: number;
  completed_books: number;
  total_listening_time: number;
  average_session_length: number;
  favorite_genre: string;
  reading_streak: number;
  books_this_month: number;
  listening_time_this_week: number;
  last_activity: string;
  updated_at: string;
}

export interface AudioSettings {
  user_id: string;
  playback_speed: number;
  voice_preference: string;
  auto_bookmark: boolean;
  skip_silence: boolean;
  enhance_speech: boolean;
  background_noise: 'none' | 'rain' | 'forest' | 'cafe';
  equalizer_preset: 'default' | 'speech' | 'music' | 'custom';
  updated_at: string;
}

/**
 * KV Store Utility Class
 * Provides structured methods for storing and retrieving data using consistent key patterns
 */
export class KVStore {
  // Key generation utilities
  private static getUserKey(userId: string, dataType: string): string {
    return `user:${userId}:${dataType}`;
  }

  private static getBookKey(bookId: string): string {
    return `book:${bookId}`;
  }

  private static getBookProgressKey(userId: string, bookId: string): string {
    return `user:${userId}:book:${bookId}:progress`;
  }

  private static getGlobalKey(keyType: string): string {
    return keyType;
  }

  // User Profile Operations
  static async storeUserProfile(userId: string, profile: UserProfile): Promise<void> {
    const key = this.getUserKey(userId, 'profile');
    await kv.set(key, profile);
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const key = this.getUserKey(userId, 'profile');
    return await kv.get(key);
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const key = this.getUserKey(userId, 'profile');
    const currentProfile = await kv.get(key);
    
    if (!currentProfile) {
      return null;
    }

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updated_at: new Date().toISOString()
    };

    await kv.set(key, updatedProfile);
    return updatedProfile;
  }

  // User Settings Operations
  static async storeUserSettings(userId: string, settings: UserSettings): Promise<void> {
    const key = this.getUserKey(userId, 'settings');
    await kv.set(key, settings);
  }

  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    const key = this.getUserKey(userId, 'settings');
    return await kv.get(key);
  }

  static async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | null> {
    const key = this.getUserKey(userId, 'settings');
    const currentSettings = await kv.get(key);
    
    if (!currentSettings) {
      // Create default settings if none exist
      const defaultSettings: UserSettings = {
        audio_speed: 1.0,
        voice_type: 'neural',
        language: 'en',
        theme: 'light',
        auto_play_next: true,
        notification_preferences: {
          processing_complete: true,
          new_features: true,
          achievements: true,
          learning_tips: false,
          daily_reminders: true,
          weekly_summary: true
        }
      };
      
      const newSettings = { ...defaultSettings, ...updates };
      await kv.set(key, newSettings);
      return newSettings;
    }

    const updatedSettings = { ...currentSettings, ...updates };
    await kv.set(key, updatedSettings);
    return updatedSettings;
  }

  // Book Operations
  static async storeBook(bookData: BookData): Promise<void> {
    const bookKey = this.getBookKey(bookData.id);
    await kv.set(bookKey, bookData);

    // Also add to user's books list
    await this.addBookToUserList(bookData.user_id, bookData.id);
  }

  static async getBook(bookId: string): Promise<BookData | null> {
    const key = this.getBookKey(bookId);
    return await kv.get(key);
  }

  static async updateBook(bookId: string, updates: Partial<BookData>): Promise<BookData | null> {
    const key = this.getBookKey(bookId);
    const currentBook = await kv.get(key);
    
    if (!currentBook) {
      return null;
    }

    const updatedBook = {
      ...currentBook,
      ...updates,
      updated_at: new Date().toISOString()
    };

    await kv.set(key, updatedBook);
    return updatedBook;
  }

  static async deleteBook(bookId: string, userId: string): Promise<boolean> {
    try {
      // Remove from book store
      const bookKey = this.getBookKey(bookId);
      await kv.del(bookKey);

      // Remove from user's books list
      await this.removeBookFromUserList(userId, bookId);

      // Remove book progress
      const progressKey = this.getBookProgressKey(userId, bookId);
      await kv.del(progressKey);

      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      return false;
    }
  }

  // User Books List Operations
  static async getUserBooksList(userId: string): Promise<string[]> {
    const key = this.getUserKey(userId, 'books');
    const booksList = await kv.get(key);
    return booksList || [];
  }

  static async addBookToUserList(userId: string, bookId: string): Promise<void> {
    const key = this.getUserKey(userId, 'books');
    const currentBooks = await kv.get(key) || [];
    
    if (!currentBooks.includes(bookId)) {
      currentBooks.push(bookId);
      await kv.set(key, currentBooks);
    }
  }

  static async removeBookFromUserList(userId: string, bookId: string): Promise<void> {
    const key = this.getUserKey(userId, 'books');
    const currentBooks = await kv.get(key) || [];
    const updatedBooks = currentBooks.filter((id: string) => id !== bookId);
    await kv.set(key, updatedBooks);
  }

  static async getUserBooks(userId: string): Promise<BookData[]> {
    const bookIds = await this.getUserBooksList(userId);
    const books: BookData[] = [];

    for (const bookId of bookIds) {
      const book = await this.getBook(bookId);
      if (book) {
        books.push(book);
      }
    }

    return books;
  }

  // Book Progress Operations
  static async storeBookProgress(userId: string, bookId: string, progress: BookProgress): Promise<void> {
    const key = this.getBookProgressKey(userId, bookId);
    await kv.set(key, progress);
  }

  static async getBookProgress(userId: string, bookId: string): Promise<BookProgress | null> {
    const key = this.getBookProgressKey(userId, bookId);
    return await kv.get(key);
  }

  static async updateBookProgress(userId: string, bookId: string, updates: Partial<BookProgress>): Promise<BookProgress | null> {
    const key = this.getBookProgressKey(userId, bookId);
    const currentProgress = await kv.get(key);
    
    if (!currentProgress) {
      // Initialize progress if it doesn't exist
      const newProgress: BookProgress = {
        book_id: bookId,
        user_id: userId,
        current_position: 0,
        current_chapter: 1,
        total_duration: 0,
        completed: false,
        last_accessed: new Date().toISOString(),
        reading_time_today: 0,
        reading_time_total: 0,
        ...updates
      };
      
      await kv.set(key, newProgress);
      return newProgress;
    }

    const updatedProgress = {
      ...currentProgress,
      ...updates,
      last_accessed: new Date().toISOString()
    };

    await kv.set(key, updatedProgress);
    return updatedProgress;
  }

  // Notifications Operations
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    const key = this.getUserKey(userId, 'notifications');
    return await kv.get(key) || [];
  }

  static async addNotification(userId: string, notification: Notification): Promise<void> {
    const key = this.getUserKey(userId, 'notifications');
    const currentNotifications = await kv.get(key) || [];
    
    // Add new notification to the beginning
    currentNotifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (currentNotifications.length > 100) {
      currentNotifications.splice(100);
    }
    
    await kv.set(key, currentNotifications);
  }

  static async markNotificationAsRead(userId: string, notificationId: string): Promise<boolean> {
    const key = this.getUserKey(userId, 'notifications');
    const notifications = await kv.get(key) || [];
    
    let found = false;
    const updatedNotifications = notifications.map((notif: Notification) => {
      if (notif.id === notificationId) {
        found = true;
        return { ...notif, read: true };
      }
      return notif;
    });
    
    if (found) {
      await kv.set(key, updatedNotifications);
    }
    
    return found;
  }

  static async clearUserNotifications(userId: string): Promise<void> {
    const key = this.getUserKey(userId, 'notifications');
    await kv.set(key, []);
  }

  // Reading Sessions Operations
  static async getUserReadingSessions(userId: string): Promise<ReadingSession[]> {
    const key = this.getUserKey(userId, 'reading_sessions');
    return await kv.get(key) || [];
  }

  static async addReadingSession(userId: string, session: ReadingSession): Promise<void> {
    const key = this.getUserKey(userId, 'reading_sessions');
    const currentSessions = await kv.get(key) || [];
    
    currentSessions.unshift(session);
    
    // Keep only last 50 sessions
    if (currentSessions.length > 50) {
      currentSessions.splice(50);
    }
    
    await kv.set(key, currentSessions);
  }

  static async updateReadingSession(userId: string, sessionId: string, updates: Partial<ReadingSession>): Promise<boolean> {
    const key = this.getUserKey(userId, 'reading_sessions');
    const sessions = await kv.get(key) || [];
    
    let found = false;
    const updatedSessions = sessions.map((session: ReadingSession) => {
      if (session.id === sessionId) {
        found = true;
        return { ...session, ...updates };
      }
      return session;
    });
    
    if (found) {
      await kv.set(key, updatedSessions);
    }
    
    return found;
  }

  // User Analytics Operations
  static async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    const key = this.getUserKey(userId, 'analytics');
    return await kv.get(key);
  }

  static async updateUserAnalytics(userId: string, analytics: Partial<UserAnalytics>): Promise<UserAnalytics> {
    const key = this.getUserKey(userId, 'analytics');
    const currentAnalytics = await kv.get(key);
    
    const defaultAnalytics: UserAnalytics = {
      user_id: userId,
      total_books: 0,
      completed_books: 0,
      total_listening_time: 0,
      average_session_length: 0,
      favorite_genre: '',
      reading_streak: 0,
      books_this_month: 0,
      listening_time_this_week: 0,
      last_activity: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const updatedAnalytics = {
      ...(currentAnalytics || defaultAnalytics),
      ...analytics,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(key, updatedAnalytics);
    return updatedAnalytics;
  }

  // Audio Settings Operations
  static async getAudioSettings(userId: string): Promise<AudioSettings | null> {
    const key = this.getUserKey(userId, 'audio_settings');
    return await kv.get(key);
  }

  static async updateAudioSettings(userId: string, settings: Partial<AudioSettings>): Promise<AudioSettings> {
    const key = this.getUserKey(userId, 'audio_settings');
    const currentSettings = await kv.get(key);
    
    const defaultSettings: AudioSettings = {
      user_id: userId,
      playback_speed: 1.0,
      voice_preference: 'neural',
      auto_bookmark: true,
      skip_silence: false,
      enhance_speech: true,
      background_noise: 'none',
      equalizer_preset: 'speech',
      updated_at: new Date().toISOString()
    };
    
    const updatedSettings = {
      ...(currentSettings || defaultSettings),
      ...settings,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(key, updatedSettings);
    return updatedSettings;
  }

  // Utility Methods
  static async initializeUserData(userId: string, profile: UserProfile): Promise<void> {
    // Store user profile
    await this.storeUserProfile(userId, profile);

    // Initialize empty books list
    await kv.set(this.getUserKey(userId, 'books'), []);

    // Initialize empty notifications
    await kv.set(this.getUserKey(userId, 'notifications'), []);

    // Initialize empty reading sessions
    await kv.set(this.getUserKey(userId, 'reading_sessions'), []);

    // Initialize default settings
    await this.updateUserSettings(userId, {});

    // Initialize analytics
    await this.updateUserAnalytics(userId, {
      total_books: 0,
      completed_books: 0,
      total_listening_time: 0,
      average_session_length: 0,
      favorite_genre: '',
      reading_streak: 0,
      books_this_month: 0,
      listening_time_this_week: 0,
      last_activity: new Date().toISOString()
    });

    // Initialize audio settings
    await this.updateAudioSettings(userId, {});
  }

  static async deleteUserData(userId: string): Promise<void> {
    // Get user's books first
    const bookIds = await this.getUserBooksList(userId);
    
    // Delete all user books
    for (const bookId of bookIds) {
      await this.deleteBook(bookId, userId);
    }

    // Delete user data
    const userKeys = [
      'profile',
      'settings', 
      'books',
      'notifications',
      'reading_sessions',
      'analytics',
      'audio_settings'
    ];

    for (const keyType of userKeys) {
      const key = this.getUserKey(userId, keyType);
      await kv.del(key);
    }
  }

  static async getUserDataSummary(userId: string): Promise<{
    profile: UserProfile | null;
    totalBooks: number;
    totalNotifications: number;
    totalSessions: number;
    analytics: UserAnalytics | null;
  }> {
    const [profile, bookIds, notifications, sessions, analytics] = await Promise.all([
      this.getUserProfile(userId),
      this.getUserBooksList(userId),
      this.getUserNotifications(userId),
      this.getUserReadingSessions(userId),
      this.getUserAnalytics(userId)
    ]);

    return {
      profile,
      totalBooks: bookIds.length,
      totalNotifications: notifications.length,
      totalSessions: sessions.length,
      analytics
    };
  }
}

// Export individual functions for backward compatibility and easier imports
export const {
  storeUserProfile,
  getUserProfile,
  updateUserProfile,
  storeUserSettings,
  getUserSettings,
  updateUserSettings,
  storeBook,
  getBook,
  updateBook,
  deleteBook,
  getUserBooks,
  getUserBooksList,
  addBookToUserList,
  removeBookFromUserList,
  storeBookProgress,
  getBookProgress,
  updateBookProgress,
  getUserNotifications,
  addNotification,
  markNotificationAsRead,
  clearUserNotifications,
  getUserReadingSessions,
  addReadingSession,
  updateReadingSession,
  getUserAnalytics,
  updateUserAnalytics,
  getAudioSettings,
  updateAudioSettings,
  initializeUserData,
  deleteUserData,
  getUserDataSummary
} = KVStore;

// Helper functions for common operations
export const createUser = async (userData: {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}): Promise<void> => {
  const profile: UserProfile = {
    ...userData,
    created_at: new Date().toISOString()
  };
  
  await KVStore.initializeUserData(userData.id, profile);
};

export const createBook = async (bookData: Omit<BookData, 'created_at'>): Promise<void> => {
  const book: BookData = {
    ...bookData,
    created_at: new Date().toISOString()
  };
  
  await KVStore.storeBook(book);
};

export const createNotification = async (
  userId: string,
  notificationData: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'read'>
): Promise<void> => {
  const notification: Notification = {
    ...notificationData,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId,
    read: false,
    created_at: new Date().toISOString()
  };
  
  await KVStore.addNotification(userId, notification);
};

export const startReadingSession = async (userId: string, bookId: string): Promise<string> => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const session: ReadingSession = {
    id: sessionId,
    user_id: userId,
    book_id: bookId,
    start_time: new Date().toISOString(),
    duration: 0,
    start_position: 0,
    end_position: 0,
    chapters_completed: [],
    created_at: new Date().toISOString()
  };
  
  await KVStore.addReadingSession(userId, session);
  return sessionId;
};

export const endReadingSession = async (
  userId: string,
  sessionId: string,
  endData: {
    end_position: number;
    duration: number;
    chapters_completed?: number[];
  }
): Promise<void> => {
  await KVStore.updateReadingSession(userId, sessionId, {
    ...endData,
    end_time: new Date().toISOString()
  });
};