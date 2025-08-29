import { DatabaseService } from './database';
import { Book } from '../types/database';

export interface PlaylistData {
  totalBooks: number;
  inProgressBooks: number;
  completedBooks: number;
  recentBooks: Book[];
  favoriteGenre: string;
}

export interface PlaylistState {
  loading: boolean;
  data: PlaylistData | null;
  error: string | null;
  lastUpdated: Date | null;
}

export class PlaylistService {
  private static cache = new Map<string, { data: PlaylistData; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getUserPlaylistData(userId: string, forceRefresh = false): Promise<PlaylistData> {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh && this.cache.has(userId)) {
        const cached = this.cache.get(userId)!;
        const now = Date.now();
        if (now - cached.timestamp < this.CACHE_DURATION) {
          return cached.data;
        }
      }

      // Check server health before making request
      const serverHealth = DatabaseService.getServerHealthStatus();
      if (!serverHealth.healthy) {
        // Return cached data or empty data if server is unhealthy
        if (this.cache.has(userId)) {
          return this.cache.get(userId)!.data;
        }
        // Return empty playlist data as fallback
        const emptyData: PlaylistData = {
          totalBooks: 0,
          inProgressBooks: 0,
          completedBooks: 0,
          recentBooks: [],
          favoriteGenre: 'None'
        };
        return emptyData;
      }

      // Fetch fresh data from database
      const booksResult = await DatabaseService.getUserBooks(userId);
      
      if (!booksResult.success) {
        // Check if it's a server availability error
        if (booksResult.error === 'Server is currently unavailable') {
          // Return cached data or empty data
          if (this.cache.has(userId)) {
            return this.cache.get(userId)!.data;
          }
          const emptyData: PlaylistData = {
            totalBooks: 0,
            inProgressBooks: 0,
            completedBooks: 0,
            recentBooks: [],
            favoriteGenre: 'None'
          };
          return emptyData;
        }
        throw new Error(booksResult.error || 'Failed to fetch user books');
      }

      const books = booksResult.data || [];
      
      // Calculate playlist statistics
      const completedBooks = books.filter(book => book.progress >= 100);
      const inProgressBooks = books.filter(book => book.progress > 0 && book.progress < 100);
      const recentBooks = books
        .sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0);
          const dateB = new Date(b.updated_at || b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

      // Find most common genre
      const genreCounts = books.reduce((acc, book) => {
        const genre = book.genre || 'Unknown';
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const favoriteGenre = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

      const playlistData: PlaylistData = {
        totalBooks: books.length,
        inProgressBooks: inProgressBooks.length,
        completedBooks: completedBooks.length,
        recentBooks,
        favoriteGenre
      };

      // Cache the result
      this.cache.set(userId, {
        data: playlistData,
        timestamp: Date.now()
      });

      return playlistData;
    } catch (error) {
      // Silent failure for server unavailability
      if (error instanceof Error && error.message !== 'Server is currently unavailable') {
        console.error('Error fetching playlist data:', error);
      }
      throw error;
    }
  }

  static clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }

  static async refreshUserPlaylistData(userId: string): Promise<PlaylistData> {
    return this.getUserPlaylistData(userId, true);
  }
}

// React hook for using playlist service
export function usePlaylist(userId: string | null) {
  const [state, setState] = React.useState<PlaylistState>({
    loading: false,
    data: null,
    error: null,
    lastUpdated: null
  });

  const loadPlaylistData = React.useCallback(async (forceRefresh = false) => {
    if (!userId) {
      setState(prev => ({ ...prev, loading: false, data: null, error: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await PlaylistService.getUserPlaylistData(userId, forceRefresh);
      setState({
        loading: false,
        data,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      // Silent failure for server unavailability
      const errorMessage = error instanceof Error ? error.message : 'Failed to load playlist data';
      if (errorMessage !== 'Server is currently unavailable') {
        console.error('Error fetching playlist data:', errorMessage);
      }
      
      setState({
        loading: false,
        data: null,
        error: errorMessage === 'Server is currently unavailable' ? null : errorMessage, // Hide server unavailable errors
        lastUpdated: null
      });
    }
  }, [userId]);

  const refreshData = React.useCallback(() => {
    return loadPlaylistData(true);
  }, [loadPlaylistData]);

  // Load data when userId changes
  React.useEffect(() => {
    loadPlaylistData();
  }, [loadPlaylistData]);

  return {
    ...state,
    refreshData,
    isAuthenticated: !!userId
  };
}

// Export React import for the hook
import React from 'react';