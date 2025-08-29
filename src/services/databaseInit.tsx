import { DatabaseService } from './database';
import { BOOKS_DATA } from '../constants/booksData';
import { User, Book, Notification } from '../types/database';

export class DatabaseInitService {
  /**
   * Initialize database for a new user with sample data
   */
  static async initializeUserDatabase(user: User): Promise<void> {
    try {
      console.log('Initializing database for user:', user.email);

      // Create sample books for the user
      await this.createSampleBooks(user.id);

      // Create welcome notifications
      await this.createWelcomeNotifications(user.id);

      // Update user analytics
      await this.updateInitialAnalytics(user.id);

      console.log('Database initialization completed for user:', user.email);
    } catch (error) {
      console.error('Error initializing user database:', error);
      throw error;
    }
  }

  /**
   * Create sample books for new users
   */
  private static async createSampleBooks(userId: string): Promise<void> {
    try {
      const sampleBooks = BOOKS_DATA.slice(0, 3).map((book, index) => ({
        ...book,
        user_id: userId,
        processing_status: 'completed' as const,
        progress: [45, 72, 25][index], // Sample progress values
        file_url: `https://example.com/files/${book.id}.pdf`,
        audio_url: `https://example.com/audio/${book.id}.mp3`,
      }));

      for (const bookData of sampleBooks) {
        await DatabaseService.createBook(bookData);
      }

      console.log(`Created ${sampleBooks.length} sample books for user ${userId}`);
    } catch (error) {
      console.error('Error creating sample books:', error);
      throw error;
    }
  }

  /**
   * Create welcome notifications for new users
   */
  private static async createWelcomeNotifications(userId: string): Promise<void> {
    try {
      const welcomeNotifications = [
        {
          id: `welcome_${Date.now()}_1`,
          user_id: userId,
          type: 'system' as const,
          title: '🎉 Welcome to Magdee!',
          message: 'Your account has been created successfully. Start uploading your first PDF to convert it to audio.',
          read: false,
        },
        {
          id: `welcome_${Date.now()}_2`,
          user_id: userId,
          type: 'new_feature' as const,
          title: '🎵 Audio Settings',
          message: 'Customize your listening experience with voice speed, type, and background sounds in Settings.',
          read: false,
        },
        {
          id: `welcome_${Date.now()}_3`,
          user_id: userId,
          type: 'reminder' as const,
          title: '📚 Sample Books',
          message: 'We\'ve added some sample audiobooks to get you started. Check out your library!',
          read: false,
        },
      ];

      for (const notification of welcomeNotifications) {
        await DatabaseService.createNotification(notification);
      }

      console.log(`Created ${welcomeNotifications.length} welcome notifications for user ${userId}`);
    } catch (error) {
      console.error('Error creating welcome notifications:', error);
      throw error;
    }
  }

  /**
   * Update initial analytics for new users
   */
  private static async updateInitialAnalytics(userId: string): Promise<void> {
    try {
      await DatabaseService.updateUserAnalytics(userId, {
        total_books: 3,
        completed_books: 0,
        total_listening_time: 0,
        average_session_length: 0,
        favorite_genre: 'Self-Help',
        reading_streak: 0,
        books_this_month: 3,
        listening_time_this_week: 0,
        last_activity: new Date().toISOString(),
      });

      console.log(`Updated initial analytics for user ${userId}`);
    } catch (error) {
      console.error('Error updating initial analytics:', error);
      throw error;
    }
  }

  /**
   * Migrate user data if needed (for existing users)
   */
  static async migrateUserData(userId: string): Promise<void> {
    try {
      console.log('Checking migration needs for user:', userId);

      // Check if user has analytics data
      const analyticsResult = await DatabaseService.getUserAnalytics(userId);
      if (!analyticsResult.success) {
        await DatabaseService.initializeUserAnalytics(userId);
        console.log('Initialized analytics for existing user:', userId);
      }

      // Check if user has audio settings
      const audioSettingsResult = await DatabaseService.getAudioSettings(userId);
      if (!audioSettingsResult.success) {
        await DatabaseService.initializeAudioSettings(userId);
        console.log('Initialized audio settings for existing user:', userId);
      }

      console.log('Migration completed for user:', userId);
    } catch (error) {
      console.error('Error migrating user data:', error);
      throw error;
    }
  }

  /**
   * Clean up expired data
   */
  static async cleanupExpiredData(userId: string): Promise<void> {
    try {
      // Clean up expired notifications
      const notificationsResult = await DatabaseService.getUserNotifications(userId);
      if (notificationsResult.success && notificationsResult.data) {
        const now = new Date().toISOString();
        const validNotifications = notificationsResult.data.filter(
          notification => !notification.expires_at || notification.expires_at > now
        );

        if (validNotifications.length !== notificationsResult.data.length) {
          // Update notifications list without expired ones
          await DatabaseService.updateUserNotifications(userId, validNotifications);
          console.log(`Cleaned up expired notifications for user ${userId}`);
        }
      }

      // Clean up old reading sessions (keep only last 50)
      const sessionsResult = await DatabaseService.getReadingSessions(userId);
      if (sessionsResult.success && sessionsResult.data && sessionsResult.data.length > 50) {
        const recentSessions = sessionsResult.data.slice(0, 50);
        await DatabaseService.updateReadingSessions(userId, recentSessions);
        console.log(`Cleaned up old reading sessions for user ${userId}`);
      }

      console.log('Data cleanup completed for user:', userId);
    } catch (error) {
      console.error('Error cleaning up expired data:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats(): Promise<{
    totalUsers: number;
    totalBooks: number;
    totalSessions: number;
    totalNotifications: number;
  }> {
    try {
      // This would need to be implemented with proper queries
      // For now, return placeholder values
      return {
        totalUsers: 0,
        totalBooks: 0,
        totalSessions: 0,
        totalNotifications: 0,
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        totalUsers: 0,
        totalBooks: 0,
        totalSessions: 0,
        totalNotifications: 0,
      };
    }
  }
}

// Add missing methods to DatabaseService
declare module './database' {
  namespace DatabaseService {
    function getUserAnalytics(userId: string): Promise<import('../types/database').DatabaseResult<import('../types/database').UserAnalytics>>;
    function getAudioSettings(userId: string): Promise<import('../types/database').DatabaseResult<import('../types/database').AudioSettings>>;
    function updateUserNotifications(userId: string, notifications: import('../types/database').Notification[]): Promise<import('../types/database').DatabaseResult<boolean>>;
    function getReadingSessions(userId: string): Promise<import('../types/database').DatabaseResult<import('../types/database').ReadingSession[]>>;
    function updateReadingSessions(userId: string, sessions: import('../types/database').ReadingSession[]): Promise<import('../types/database').DatabaseResult<boolean>>;
  }
}