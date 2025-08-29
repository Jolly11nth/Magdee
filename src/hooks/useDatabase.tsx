import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import { DatabaseService } from '../services/database';
import { DatabaseInitService } from '../services/databaseInit';
import {
  Book,
  BookProgress,
  Notification,
  AudioSettings,
  UserAnalytics,
  Achievement,
  BookFilters,
  PaginationOptions,
  DatabaseResult
} from '../types/database';

// Custom hook for user books
export function useUserBooks(filters?: BookFilters, pagination?: PaginationOptions) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result = await DatabaseService.getUserBooks(user.id, filters, pagination);
      if (result.success && result.data) {
        setBooks(result.data);
      } else {
        setError(result.error || 'Failed to load books');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filters, pagination]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const addBook = useCallback(async (bookData: Omit<Book, 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const result = await DatabaseService.createBook({
        ...bookData,
        user_id: user.id,
      });

      if (result.success) {
        await loadBooks(); // Refresh the list
      }

      return result;
    } catch (err) {
      console.error('Error adding book:', err);
      return { success: false, error: 'Failed to add book' };
    }
  }, [user, loadBooks]);

  const updateBook = useCallback(async (bookId: string, updates: Partial<Book>) => {
    try {
      const result = await DatabaseService.updateBook(bookId, updates);
      
      if (result.success) {
        await loadBooks(); // Refresh the list
      }

      return result;
    } catch (err) {
      console.error('Error updating book:', err);
      return { success: false, error: 'Failed to update book' };
    }
  }, [loadBooks]);

  const deleteBook = useCallback(async (bookId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const result = await DatabaseService.deleteBook(user.id, bookId);
      
      if (result.success) {
        await loadBooks(); // Refresh the list
      }

      return result;
    } catch (err) {
      console.error('Error deleting book:', err);
      return { success: false, error: 'Failed to delete book' };
    }
  }, [user, loadBooks]);

  return {
    books,
    loading,
    error,
    addBook,
    updateBook,
    deleteBook,
    refetch: loadBooks,
  };
}

// Custom hook for user notifications
export function useUserNotifications(unreadOnly: boolean = false) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result = await DatabaseService.getUserNotifications(user.id, unreadOnly);
      if (result.success && result.data) {
        setNotifications(result.data);
      } else {
        setError(result.error || 'Failed to load notifications');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user, unreadOnly]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const result = await DatabaseService.markNotificationAsRead(user.id, notificationId);
      
      if (result.success) {
        await loadNotifications(); // Refresh the list
      }

      return result;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  }, [user, loadNotifications]);

  const addNotification = useCallback(async (notificationData: Omit<Notification, 'user_id' | 'created_at'>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const result = await DatabaseService.createNotification({
        ...notificationData,
        user_id: user.id,
      });

      if (result.success) {
        await loadNotifications(); // Refresh the list
      }

      return result;
    } catch (err) {
      console.error('Error adding notification:', err);
      return { success: false, error: 'Failed to add notification' };
    }
  }, [user, loadNotifications]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    addNotification,
    refetch: loadNotifications,
    unreadCount: notifications.filter(n => !n.read).length,
  };
}

// Custom hook for audio settings
export function useAudioSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AudioSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result = await DatabaseService.getAudioSettings(user.id);
      if (result.success && result.data) {
        setSettings(result.data);
      } else {
        // Initialize settings if not found
        const initResult = await DatabaseService.initializeAudioSettings(user.id);
        if (initResult.success && initResult.data) {
          setSettings(initResult.data);
        } else {
          setError(result.error || 'Failed to load audio settings');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading audio settings:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (settingsData: Partial<AudioSettings>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const result = await DatabaseService.updateAudioSettings(user.id, settingsData);
      
      if (result.success && result.data) {
        setSettings(result.data);
      }

      return result;
    } catch (err) {
      console.error('Error updating audio settings:', err);
      return { success: false, error: 'Failed to update audio settings' };
    }
  }, [user]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: loadSettings,
  };
}

// Custom hook for user analytics
export function useUserAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [analyticsResult, statsResult] = await Promise.all([
        DatabaseService.getUserAnalytics(user.id),
        DatabaseService.getUserStats(user.id),
      ]);

      if (analyticsResult.success && analyticsResult.data) {
        setAnalytics(analyticsResult.data);
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      if (!analyticsResult.success && !statsResult.success) {
        setError('Failed to load analytics');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const updateAnalytics = useCallback(async (analyticsData: Partial<UserAnalytics>) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const result = await DatabaseService.updateUserAnalytics(user.id, analyticsData);
      
      if (result.success && result.data) {
        setAnalytics(result.data);
        await loadAnalytics(); // Refresh stats as well
      }

      return result;
    } catch (err) {
      console.error('Error updating analytics:', err);
      return { success: false, error: 'Failed to update analytics' };
    }
  }, [user, loadAnalytics]);

  return {
    analytics,
    stats,
    loading,
    error,
    updateAnalytics,
    refetch: loadAnalytics,
  };
}

// Custom hook for book progress
export function useBookProgress(bookId: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<BookProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    if (!user || !bookId) return;

    setLoading(true);
    setError(null);

    try {
      const progressData = await DatabaseService.getBookProgress(user.id, bookId);
      if (progressData) {
        setProgress(progressData);
      } else {
        // Initialize progress if not found
        const initResult = await DatabaseService.initializeBookProgress(user.id, bookId);
        if (initResult.success && initResult.data) {
          setProgress(initResult.data);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading book progress:', err);
    } finally {
      setLoading(false);
    }
  }, [user, bookId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const updateProgress = useCallback(async (progressData: Partial<BookProgress>) => {
    if (!user || !bookId) return { success: false, error: 'User not authenticated or book not selected' };

    try {
      const result = await DatabaseService.updateBookProgress(user.id, bookId, progressData);
      
      if (result.success && result.data) {
        setProgress(result.data);
      }

      return result;
    } catch (err) {
      console.error('Error updating book progress:', err);
      return { success: false, error: 'Failed to update progress' };
    }
  }, [user, bookId]);

  return {
    progress,
    loading,
    error,
    updateProgress,
    refetch: loadProgress,
  };
}

// Custom hook for database initialization
export function useDatabaseInit() {
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !initialized) {
      setLoading(true);
      
      DatabaseInitService.initializeUserDatabase(user)
        .then(() => {
          setInitialized(true);
          console.log('Database initialized for user:', user.email);
        })
        .catch((error) => {
          console.error('Failed to initialize database:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, initialized]);

  return { initialized, loading };
}