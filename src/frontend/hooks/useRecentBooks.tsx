import React, { useState, useEffect, useCallback } from 'react';
import { DatabaseService } from '../services/database';
import { useAuth } from '../components/AuthContext';

export interface RecentBook {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover: string;
  cover_url?: string;
  audio_url?: string;
  audioUrl?: string;
  text_content?: string;
  file_path: string;
  conversion_status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  duration?: number;
  created_at: string;
  updated_at: string;
  converted_at?: string;
  isRecent?: boolean;
  daysAgo?: number;
  metadata?: {
    file_size: number;
    page_count?: number;
    language?: string;
    genre?: string;
  };
}

export interface RecentBooksState {
  books: RecentBook[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  lastUpdated: Date | null;
}

export interface RecentBooksOptions {
  limit?: number;
  offset?: number;
  status?: 'completed' | 'all';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useRecentBooks(options: RecentBooksOptions = {}) {
  const { user } = useAuth();
  const {
    limit = 10,
    offset = 0,
    status = 'completed',
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options;

  const [state, setState] = useState<RecentBooksState>({
    books: [],
    loading: false,
    error: null,
    total: 0,
    hasMore: false,
    lastUpdated: null
  });

  // Load recent books from database
  const loadRecentBooks = useCallback(async (silent = false) => {
    if (!user?.id) {
      setState(prev => ({
        ...prev,
        books: [],
        loading: false,
        error: null,
        total: 0,
        hasMore: false,
        lastUpdated: null
      }));
      return;
    }

    if (!silent) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      console.log('Loading recent books for user:', user.id);
      
      const result = await DatabaseService.getRecentBooks(user.id, {
        limit,
        offset,
        status
      });

      if (result.success && result.data) {
        // Handle response structure from backend
        const responseData = Array.isArray(result.data) ? result.data : result.data.data || [];
        const total = result.data.total || responseData.length;
        const hasMore = result.data.has_more || false;

        setState(prev => ({
          ...prev,
          books: responseData,
          loading: false,
          error: null,
          total,
          hasMore,
          lastUpdated: new Date()
        }));

        console.log(`Loaded ${responseData.length} recent books`);
      } else {
        console.warn('Failed to load recent books:', result.error);
        setState(prev => ({
          ...prev,
          books: [],
          loading: false,
          error: result.error || 'Failed to load recent books',
          total: 0,
          hasMore: false,
          lastUpdated: null
        }));
      }
    } catch (error) {
      console.error('Error loading recent books:', error);
      setState(prev => ({
        ...prev,
        books: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load recent books',
        total: 0,
        hasMore: false,
        lastUpdated: null
      }));
    }
  }, [user?.id, limit, offset, status]);

  // Refresh recent books
  const refreshBooks = useCallback(async () => {
    await loadRecentBooks(false);
  }, [loadRecentBooks]);

  // Load more books (pagination)
  const loadMore = useCallback(async () => {
    if (!user?.id || state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const result = await DatabaseService.getRecentBooks(user.id, {
        limit,
        offset: state.books.length,
        status
      });

      if (result.success && result.data) {
        const responseData = Array.isArray(result.data) ? result.data : result.data.data || [];
        const total = result.data.total || state.total;
        const hasMore = result.data.has_more || false;

        setState(prev => ({
          ...prev,
          books: [...prev.books, ...responseData],
          loading: false,
          error: null,
          total,
          hasMore,
          lastUpdated: new Date()
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to load more books'
        }));
      }
    } catch (error) {
      console.error('Error loading more books:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load more books'
      }));
    }
  }, [user?.id, state.books.length, state.hasMore, state.loading, limit, status]);

  // Update book progress
  const updateBookProgress = useCallback(async (bookId: string, progress: number, currentTime?: number, duration?: number) => {
    if (!user?.id) return false;

    try {
      const result = await DatabaseService.updateBookProgress(bookId, progress, currentTime, duration);
      
      if (result.success && result.data) {
        // Update the book in local state
        setState(prev => ({
          ...prev,
          books: prev.books.map(book => 
            book.id === bookId 
              ? { ...book, progress, current_time: currentTime, duration: duration || book.duration, updated_at: new Date().toISOString() }
              : book
          ),
          lastUpdated: new Date()
        }));

        return true;
      } else {
        console.error('Failed to update book progress:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating book progress:', error);
      return false;
    }
  }, [user?.id]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initial load when user changes
  useEffect(() => {
    if (user?.id) {
      loadRecentBooks(false);
    }
  }, [user?.id, loadRecentBooks]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !user?.id) return;

    const intervalId = setInterval(() => {
      loadRecentBooks(true); // Silent refresh
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, user?.id, loadRecentBooks]);

  // Filter recently converted books (last 30 days)
  const recentlyConverted = React.useMemo(() => {
    return state.books.filter(book => {
      if (!book.converted_at && !book.updated_at) return false;
      
      const convertedDate = new Date(book.converted_at || book.updated_at);
      const daysDiff = (Date.now() - convertedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysDiff <= 30; // Last 30 days
    });
  }, [state.books]);

  // Get books with progress > 0 (for "continue reading" section)
  const booksInProgress = React.useMemo(() => {
    return state.books.filter(book => book.progress > 0 && book.progress < 100);
  }, [state.books]);

  // New releases (converted in last 7 days)
  const newReleases = React.useMemo(() => {
    return state.books.filter(book => {
      if (!book.converted_at && !book.updated_at) return false;
      
      const convertedDate = new Date(book.converted_at || book.updated_at);
      const daysDiff = (Date.now() - convertedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysDiff <= 7; // Last 7 days
    });
  }, [state.books]);

  return {
    // State
    ...state,
    
    // Computed data
    recentlyConverted,
    booksInProgress,
    newReleases,
    
    // Actions
    refreshBooks,
    loadMore,
    updateBookProgress,
    clearError,
    
    // Utilities
    isEmpty: state.books.length === 0 && !state.loading,
    isInitialLoad: state.books.length === 0 && state.loading && !state.lastUpdated,
    canLoadMore: state.hasMore && !state.loading,
    
    // Metadata
    lastRefresh: state.lastUpdated,
    nextRefresh: autoRefresh && state.lastUpdated ? new Date(state.lastUpdated.getTime() + refreshInterval) : null
  };
}

// Simplified hook for just getting recently converted books for HomeScreen
export function useRecentlyConvertedBooks(limit: number = 4) {
  const { user } = useAuth();
  const [books, setBooks] = useState<RecentBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    if (!user?.id) {
      setBooks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await DatabaseService.getRecentBooks(user.id, {
        limit,
        status: 'completed'
      });

      if (result.success && result.data) {
        const responseData = Array.isArray(result.data) ? result.data : result.data.data || [];
        setBooks(responseData);
      } else {
        setError(result.error || 'Failed to load recent books');
        setBooks([]);
      }
    } catch (error) {
      console.error('Error loading recently converted books:', error);
      setError(error instanceof Error ? error.message : 'Failed to load recent books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, limit]);

  // Load books when user changes
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!user?.id) return;

    const intervalId = setInterval(loadBooks, 2 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [user?.id, loadBooks]);

  return {
    books,
    loading,
    error,
    refresh: loadBooks,
    isEmpty: books.length === 0 && !loading
  };
}