// User related types
export interface User {
  id: string;
  email: string;
  name: string; // Full name (e.g., "John Smith")
  username?: string; // Username handle (e.g., "johnsmith123")
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  audio_speed: number;
  voice_type: 'neural' | 'standard';
  language: string;
  auto_play_next: boolean;
  theme: 'light' | 'dark' | 'auto';
  notification_preferences: NotificationPreferences;
}

export interface NotificationPreferences {
  processing_complete: boolean;
  new_features: boolean;
  achievements: boolean;
  learning_tips: boolean;
  daily_reminders: boolean;
  weekly_summary: boolean;
}

// Book related types
export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  duration: string;
  chapters: number;
  genre: string;
  rating: number;
  progress: number;
  description: string;
  dateAdded: string;
  category: string;
  file_url?: string;
  audio_url?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface BookProgress {
  book_id: string;
  user_id: string;
  current_position: number; // in seconds
  current_chapter: number;
  total_duration: number; // in seconds
  completed: boolean;
  last_accessed: string;
  reading_time_today: number; // in seconds
  reading_time_total: number; // in seconds
}

export interface ReadingSession {
  id: string;
  user_id: string;
  book_id: string;
  start_time: string;
  end_time?: string;
  duration: number; // in seconds
  start_position: number;
  end_position: number;
  chapters_completed: number[];
  created_at: string;
}

// Notification types
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

// Achievement types
export interface Achievement {
  id: string;
  user_id: string;
  type: 'books_completed' | 'reading_streak' | 'time_listened' | 'genres_explored';
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
  progress: number;
  target: number;
}

// Audio settings types
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

// Analytics types
export interface UserAnalytics {
  user_id: string;
  total_books: number;
  completed_books: number;
  total_listening_time: number; // in seconds
  average_session_length: number; // in seconds
  favorite_genre: string;
  reading_streak: number; // in days
  books_this_month: number;
  listening_time_this_week: number;
  last_activity: string;
  updated_at: string;
}

// Database operation result types
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationOptions {
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BookFilters {
  genre?: string;
  category?: string;
  completed?: boolean;
  search?: string;
  author?: string;
}

// KV Store key patterns
export const KV_KEYS = {
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  USER_BOOKS: (userId: string) => `user:${userId}:books`,
  USER_NOTIFICATIONS: (userId: string) => `user:${userId}:notifications`,
  USER_ACHIEVEMENTS: (userId: string) => `user:${userId}:achievements`,
  USER_ANALYTICS: (userId: string) => `user:${userId}:analytics`,
  USER_AUDIO_SETTINGS: (userId: string) => `user:${userId}:audio_settings`,
  BOOK_PROGRESS: (userId: string, bookId: string) => `user:${userId}:book:${bookId}:progress`,
  READING_SESSIONS: (userId: string) => `user:${userId}:reading_sessions`,
  BOOK_DETAILS: (bookId: string) => `book:${bookId}:details`,
  GLOBAL_BOOKS: () => 'books:all',
  USER_PREFERENCES: (userId: string) => `user:${userId}:preferences`,
} as const;