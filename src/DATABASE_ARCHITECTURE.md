# Magdee Database Architecture

## Overview

The Magdee app uses a comprehensive database layer built on top of Supabase's Key-Value store system. This provides a flexible, scalable solution for managing user data, books, progress tracking, and analytics.

## Data Models

### User Profile
```typescript
interface User {
  id: string;                    // Supabase user ID
  email: string;                 // User email
  name: string;                  // Full name
  username?: string;             // Optional unique username
  avatar_url?: string;           // Profile picture URL
  created_at: string;           // Account creation date
  updated_at?: string;          // Last profile update
  preferences: UserPreferences; // User settings
}
```

### Books & Content
```typescript
interface Book {
  id: string;                   // Unique book identifier
  title: string;               // Book title
  author: string;              // Author name
  cover: string;               // Cover image URL
  duration: string;            // Audio duration (e.g., "4h 30m")
  chapters: number;            // Number of chapters
  genre: string;               // Book genre
  rating: number;              // User rating (1-5)
  progress: number;            // Completion percentage (0-100)
  description: string;         // Book description
  dateAdded: string;           // When added to library
  category: string;            // Content category
  file_url?: string;           // Original PDF URL
  audio_url?: string;          // Generated audio URL
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  user_id: string;             // Owner user ID
  created_at: string;          // Creation timestamp
  updated_at?: string;         // Last update timestamp
}
```

### Progress Tracking
```typescript
interface BookProgress {
  book_id: string;             // Associated book ID
  user_id: string;             // User ID
  current_position: number;    // Current playback position (seconds)
  current_chapter: number;     // Current chapter number
  total_duration: number;      // Total audio duration (seconds)
  completed: boolean;          // Whether book is finished
  last_accessed: string;       // Last reading session
  reading_time_today: number;  // Time spent today (seconds)
  reading_time_total: number;  // Total time spent (seconds)
}
```

### Notifications
```typescript
interface Notification {
  id: string;                  // Unique notification ID
  user_id: string;             // Target user ID
  type: 'processing_complete' | 'new_feature' | 'achievement' | 'reminder' | 'system';
  title: string;               // Notification title
  message: string;             // Notification content
  data?: Record<string, any>;  // Additional data
  read: boolean;               // Read status
  created_at: string;          // Creation timestamp
  expires_at?: string;         // Expiration date (optional)
}
```

### User Analytics
```typescript
interface UserAnalytics {
  user_id: string;             // User ID
  total_books: number;         // Total books in library
  completed_books: number;     // Books finished
  total_listening_time: number; // Total time listened (seconds)
  average_session_length: number; // Average session duration
  favorite_genre: string;      // Most read genre
  reading_streak: number;      // Current reading streak (days)
  books_this_month: number;    // Books added this month
  listening_time_this_week: number; // Time listened this week
  last_activity: string;       // Last app usage
  updated_at: string;          // Last analytics update
}
```

### Error Analytics
```typescript
interface ErrorAnalyticsData {
  id: string;                    // Unique error ID
  timestamp: string;             // When the error occurred
  error_type: string;            // Type of error (auth_signup, network_error, etc.)
  error_message: string;         // Error message
  error_code?: string;           // HTTP status code or error code
  screen: string;                // Screen where error occurred
  user_agent: string;            // Browser/device information
  user_id?: string;              // User ID if available
  session_id: string;            // Session identifier
  additional_context?: Record<string, any>; // Extra context data
}

interface ErrorSummary {
  error_type: string;            // Type of error
  count: number;                 // Number of occurrences
  latest_occurrence: string;     // Most recent occurrence
  common_messages: string[];     // Most common error messages
}
```

## Key-Value Store Structure

The database uses a hierarchical key structure for efficient data organization:

```
user:{userId}:profile           - User profile data (includes username)
user:{userId}:books            - User's book library
user:{userId}:notifications    - User notifications
user:{userId}:achievements     - User achievements
user:{userId}:analytics        - User analytics data
user:{userId}:audio_settings   - Audio preferences
user:{userId}:reading_sessions - Reading session history
user:{userId}:book:{bookId}:progress - Individual book progress
book:{bookId}:details          - Book metadata
books:all                      - Global book catalog
analytics:error:{timestamp}:{id} - Individual error records
analytics:counter:{error_type} - Error type counters
analytics:recent_errors        - Last 100 errors for quick access
```

## Database Services

### DatabaseService
Main service class providing CRUD operations:

```typescript
// User operations
DatabaseService.createUser(userData)
DatabaseService.getUser(userId)
DatabaseService.updateUser(userId, updates)

// Book operations
DatabaseService.createBook(bookData)
DatabaseService.getUserBooks(userId, filters?, pagination?)
DatabaseService.updateBook(bookId, updates)
DatabaseService.deleteBook(userId, bookId)

// Progress tracking
DatabaseService.initializeBookProgress(userId, bookId)
DatabaseService.updateBookProgress(userId, bookId, progressData)
DatabaseService.getBookProgress(userId, bookId)

// Notifications
DatabaseService.createNotification(notificationData)
DatabaseService.getUserNotifications(userId, unreadOnly?)
DatabaseService.markNotificationAsRead(userId, notificationId)

// Analytics
DatabaseService.getUserAnalytics(userId)
DatabaseService.updateUserAnalytics(userId, analyticsData)
DatabaseService.getUserStats(userId)
```

### DatabaseInitService
Handles database initialization and migrations:

```typescript
// Initialize new user database
DatabaseInitService.initializeUserDatabase(user)

// Create sample content
DatabaseInitService.createSampleBooks(userId)
DatabaseInitService.createWelcomeNotifications(userId)

// Data maintenance
DatabaseInitService.migrateUserData(userId)
DatabaseInitService.cleanupExpiredData(userId)
```

## React Hooks

### useUserBooks
Manages user's book library:

```typescript
const { books, loading, error, addBook, updateBook, deleteBook, refetch } = useUserBooks(filters?, pagination?);
```

### useUserNotifications
Handles notifications:

```typescript
const { notifications, loading, error, markAsRead, addNotification, refetch, unreadCount } = useUserNotifications(unreadOnly?);
```

### useAudioSettings
Manages audio preferences:

```typescript
const { settings, loading, error, updateSettings, refetch } = useAudioSettings();
```

### useUserAnalytics
Provides analytics data:

```typescript
const { analytics, stats, loading, error, updateAnalytics, refetch } = useUserAnalytics();
```

### useBookProgress
Tracks reading progress:

```typescript
const { progress, loading, error, updateProgress, refetch } = useBookProgress(bookId);
```

## Usage Examples

### Adding a New Book
```typescript
const { addBook } = useUserBooks();

const newBook = {
  id: generateId(),
  title: "The Power of Habit",
  author: "Charles Duhigg",
  cover: "https://example.com/cover.jpg",
  duration: "6h 45m",
  chapters: 15,
  genre: "Self-Help",
  rating: 0,
  progress: 0,
  description: "A book about habit formation...",
  dateAdded: new Date().toISOString(),
  category: "Self-Help",
  processing_status: "pending"
};

await addBook(newBook);
```

### Updating Reading Progress
```typescript
const { updateProgress } = useBookProgress(bookId);

await updateProgress({
  current_position: 1800,     // 30 minutes in
  current_chapter: 3,
  total_duration: 24300,      // 6h 45m total
  reading_time_today: 1800    // 30 minutes today
});
```

### Creating a Notification
```typescript
const { addNotification } = useUserNotifications();

await addNotification({
  id: generateId(),
  type: "processing_complete",
  title: "Book Ready!",
  message: "Your audiobook 'The Power of Habit' is ready to listen.",
  read: false
});
```

## Data Flow

1. **User Registration**: Creates user profile and initializes database structure
2. **Book Upload**: Stores book metadata and initializes progress tracking
3. **Audio Processing**: Updates book status and sends completion notifications
4. **Reading Sessions**: Tracks progress and updates analytics in real-time
5. **Analytics Updates**: Aggregates data for insights and recommendations

## Performance Considerations

- **Pagination**: Large datasets use offset/limit pagination
- **Caching**: Frequently accessed data is cached in React state
- **Batch Operations**: Multiple updates are batched for efficiency
- **Data Cleanup**: Expired notifications and old sessions are automatically cleaned
- **Lazy Loading**: Data is loaded on-demand to reduce initial load times

## Migration Strategy

The database layer is designed to handle schema evolution gracefully:

1. **Backward Compatibility**: New fields are optional with sensible defaults
2. **Data Migration**: `DatabaseInitService.migrateUserData()` handles existing users
3. **Version Management**: Database structure versions are tracked for future migrations
4. **Graceful Fallbacks**: Missing data is handled with default values

## Security

- **User Isolation**: All data is scoped to individual users
- **Access Control**: Server-side validation ensures users can only access their data
- **Data Validation**: Input validation prevents malformed data storage
- **Audit Trail**: All operations are logged for debugging and security

This architecture provides a solid foundation for the Magdee app while maintaining flexibility for future enhancements and scaling needs.