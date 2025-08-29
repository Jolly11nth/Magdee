/**
 * KV Store Usage Examples for Magdee App
 * 
 * This file demonstrates how to use the KV store utility functions
 * in common Magdee app scenarios.
 */

import { 
  KVStore, 
  createUser, 
  createBook, 
  createNotification,
  startReadingSession,
  endReadingSession
} from '../utils/kvStore';

// Example 1: Creating a new user account
export async function handleUserSignup(userData: {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}) {
  try {
    // Create user with default data structure
    await createUser(userData);
    
    // Send welcome notification
    await createNotification(userData.id, {
      type: 'system',
      title: '🎉 Welcome to Magdee!',
      message: 'Your account has been created successfully. Start uploading your first PDF to convert it to audio.'
    });
    
    console.log('User created successfully:', userData.email);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Example 2: Adding a new book to user's library
export async function handleBookUpload(userId: string, bookData: {
  title: string;
  author: string;
  cover_url: string;
  file_url: string;
  genre: string;
  description: string;
}) {
  try {
    const bookId = `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create book record
    await createBook({
      id: bookId,
      user_id: userId,
      title: bookData.title,
      author: bookData.author,
      cover_url: bookData.cover_url,
      duration_seconds: 0, // Will be updated after processing
      chapters: 0, // Will be updated after processing
      genre: bookData.genre,
      rating: 0,
      progress: 0,
      description: bookData.description,
      category: bookData.genre,
      file_url: bookData.file_url,
      processing_status: 'pending'
    });
    
    // Initialize book progress
    await KVStore.storeBookProgress(userId, bookId, {
      book_id: bookId,
      user_id: userId,
      current_position: 0,
      current_chapter: 1,
      total_duration: 0,
      completed: false,
      last_accessed: new Date().toISOString(),
      reading_time_today: 0,
      reading_time_total: 0
    });
    
    // Send upload notification
    await createNotification(userId, {
      type: 'system',
      title: '📚 Book Uploaded',
      message: `"${bookData.title}" has been uploaded and is being processed.`
    });
    
    return bookId;
  } catch (error) {
    console.error('Error uploading book:', error);
    throw error;
  }
}

// Example 3: Updating book processing status
export async function handleBookProcessingComplete(userId: string, bookId: string, audioData: {
  audio_url: string;
  duration_seconds: number;
  chapters: number;
}) {
  try {
    // Update book with audio information
    await KVStore.updateBook(bookId, {
      audio_url: audioData.audio_url,
      duration_seconds: audioData.duration_seconds,
      chapters: audioData.chapters,
      processing_status: 'completed'
    });
    
    // Update book progress with total duration
    await KVStore.updateBookProgress(userId, bookId, {
      total_duration: audioData.duration_seconds
    });
    
    // Get book details for notification
    const book = await KVStore.getBook(bookId);
    
    if (book) {
      // Send completion notification
      await createNotification(userId, {
        type: 'processing_complete',
        title: '🎵 Audiobook Ready!',
        message: `"${book.title}" has been converted to audio and is ready to listen.`,
        data: { bookId, audioUrl: audioData.audio_url }
      });
    }
    
    // Update user analytics
    const currentAnalytics = await KVStore.getUserAnalytics(userId);
    await KVStore.updateUserAnalytics(userId, {
      books_this_month: (currentAnalytics?.books_this_month || 0) + 1,
      last_activity: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error updating book processing status:', error);
    throw error;
  }
}

// Example 4: Starting a reading session
export async function handleStartReading(userId: string, bookId: string, startPosition: number = 0) {
  try {
    // Start reading session
    const sessionId = await startReadingSession(userId, bookId);
    
    // Update book progress
    await KVStore.updateBookProgress(userId, bookId, {
      current_position: startPosition,
      last_accessed: new Date().toISOString()
    });
    
    // Update user analytics
    await KVStore.updateUserAnalytics(userId, {
      last_activity: new Date().toISOString()
    });
    
    return sessionId;
  } catch (error) {
    console.error('Error starting reading session:', error);
    throw error;
  }
}

// Example 5: Ending a reading session with progress update
export async function handleEndReading(
  userId: string, 
  bookId: string, 
  sessionId: string,
  sessionData: {
    endPosition: number;
    startPosition: number;
    chaptersCompleted: number[];
  }
) {
  try {
    const sessionDuration = Math.max(0, sessionData.endPosition - sessionData.startPosition);
    
    // End reading session
    await endReadingSession(userId, sessionId, {
      end_position: sessionData.endPosition,
      duration: sessionDuration,
      chapters_completed: sessionData.chaptersCompleted
    });
    
    // Get current progress
    const currentProgress = await KVStore.getBookProgress(userId, bookId);
    const newReadingTimeTotal = (currentProgress?.reading_time_total || 0) + sessionDuration;
    
    // Update book progress
    await KVStore.updateBookProgress(userId, bookId, {
      current_position: sessionData.endPosition,
      reading_time_total: newReadingTimeTotal,
      reading_time_today: (currentProgress?.reading_time_today || 0) + sessionDuration
    });
    
    // Update book completion percentage
    const book = await KVStore.getBook(bookId);
    if (book && book.duration_seconds > 0) {
      const progressPercentage = Math.round((sessionData.endPosition / book.duration_seconds) * 100);
      
      await KVStore.updateBook(bookId, {
        progress: progressPercentage
      });
      
      // Check if book is completed
      if (progressPercentage >= 95 && !currentProgress?.completed) {
        await KVStore.updateBookProgress(userId, bookId, {
          completed: true
        });
        
        // Send completion notification
        await createNotification(userId, {
          type: 'achievement',
          title: '🎉 Book Completed!',
          message: `Congratulations! You've finished "${book.title}".`
        });
        
        // Update analytics
        const analytics = await KVStore.getUserAnalytics(userId);
        await KVStore.updateUserAnalytics(userId, {
          completed_books: (analytics?.completed_books || 0) + 1
        });
      }
    }
    
    // Update user analytics
    const analytics = await KVStore.getUserAnalytics(userId);
    await KVStore.updateUserAnalytics(userId, {
      total_listening_time: (analytics?.total_listening_time || 0) + sessionDuration,
      last_activity: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error ending reading session:', error);
    throw error;
  }
}

// Example 6: Updating user settings
export async function handleUpdateSettings(userId: string, newSettings: {
  audio_speed?: number;
  voice_type?: 'neural' | 'standard';
  language?: string;
  auto_play_next?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}) {
  try {
    const updatedSettings = await KVStore.updateUserSettings(userId, newSettings);
    
    // Send settings update notification
    await createNotification(userId, {
      type: 'system',
      title: '⚙️ Settings Updated',
      message: 'Your preferences have been saved successfully.'
    });
    
    return updatedSettings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

// Example 7: Getting user dashboard data
export async function getUserDashboardData(userId: string) {
  try {
    const [
      profile,
      books,
      notifications,
      analytics,
      settings
    ] = await Promise.all([
      KVStore.getUserProfile(userId),
      KVStore.getUserBooks(userId),
      KVStore.getUserNotifications(userId),
      KVStore.getUserAnalytics(userId),
      KVStore.getUserSettings(userId)
    ]);
    
    // Calculate additional stats
    const completedBooks = books.filter(book => book.progress >= 100);
    const inProgressBooks = books.filter(book => book.progress > 0 && book.progress < 100);
    const unreadNotifications = notifications.filter(notif => !notif.read);
    
    return {
      profile,
      stats: {
        totalBooks: books.length,
        completedBooks: completedBooks.length,
        inProgressBooks: inProgressBooks.length,
        unreadNotifications: unreadNotifications.length,
        totalListeningTime: analytics?.total_listening_time || 0,
        readingStreak: analytics?.reading_streak || 0
      },
      recentBooks: books.slice(0, 5), // Last 5 books
      recentNotifications: notifications.slice(0, 10), // Last 10 notifications
      settings,
      analytics
    };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw error;
  }
}

// Example 8: Searching user's books
export async function searchUserBooks(userId: string, searchQuery: string, filters?: {
  genre?: string;
  completed?: boolean;
  author?: string;
}) {
  try {
    const allBooks = await KVStore.getUserBooks(userId);
    
    let filteredBooks = allBooks;
    
    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query)
      );
    }
    
    // Apply filters
    if (filters?.genre) {
      filteredBooks = filteredBooks.filter(book => 
        book.genre.toLowerCase() === filters.genre!.toLowerCase()
      );
    }
    
    if (filters?.completed !== undefined) {
      filteredBooks = filteredBooks.filter(book => 
        (book.progress >= 100) === filters.completed
      );
    }
    
    if (filters?.author) {
      filteredBooks = filteredBooks.filter(book => 
        book.author.toLowerCase().includes(filters.author!.toLowerCase())
      );
    }
    
    return filteredBooks;
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
}

// Example 9: Bulk operations
export async function handleBulkBookImport(userId: string, booksData: Array<{
  title: string;
  author: string;
  cover_url: string;
  file_url: string;
  genre: string;
  description: string;
}>) {
  try {
    const importedBooks = [];
    
    for (const bookData of booksData) {
      const bookId = await handleBookUpload(userId, bookData);
      importedBooks.push(bookId);
    }
    
    // Send bulk import notification
    await createNotification(userId, {
      type: 'system',
      title: '📚 Bulk Import Complete',
      message: `Successfully imported ${booksData.length} books to your library.`
    });
    
    return importedBooks;
  } catch (error) {
    console.error('Error during bulk import:', error);
    throw error;
  }
}

// Example 10: Data export
export async function exportUserData(userId: string) {
  try {
    const summary = await KVStore.getUserDataSummary(userId);
    const books = await KVStore.getUserBooks(userId);
    const notifications = await KVStore.getUserNotifications(userId);
    const sessions = await KVStore.getUserReadingSessions(userId);
    const settings = await KVStore.getUserSettings(userId);
    const audioSettings = await KVStore.getAudioSettings(userId);
    
    return {
      exported_at: new Date().toISOString(),
      user_profile: summary.profile,
      user_settings: settings,
      audio_settings: audioSettings,
      books,
      notifications,
      reading_sessions: sessions,
      analytics: summary.analytics,
      summary: {
        total_books: summary.totalBooks,
        total_notifications: summary.totalNotifications,
        total_sessions: summary.totalSessions
      }
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
}