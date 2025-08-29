# Magdee Database Setup Guide

This guide provides comprehensive instructions for setting up and managing the Magdee application database using Supabase's KV store system with a modern API-first architecture.

## Database Architecture

Magdee uses a hybrid architecture combining Supabase's KV store for data persistence with a comprehensive REST API layer for all database operations. This provides optimal performance, scalability, and maintainability.

### Architecture Overview
```
Frontend (React) → Database Service → REST API → Supabase Edge Functions → KV Store
```

## 🚨 Important Implementation Note

**Current Environment:**
- Uses Supabase KV store with comprehensive REST API layer
- All database operations go through authenticated API endpoints
- Fully functional with user management, progress tracking, achievements, and notifications
- Production-ready architecture suitable for scaling

## API Endpoints

### Authentication Endpoints
- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - Sign in existing user
- `POST /auth/lookup-email` - Find email by username
- `GET /user/{userId}` - Get user profile
- `PUT /user/{userId}` - Update user profile

### Progress Tracking Endpoints
- `GET /progress/{userId}` - Get comprehensive user progress statistics
- `POST /reading-session/{userId}/start` - Start new reading session
- `PUT /reading-session/{userId}/{sessionId}/end` - End reading session

### Book Management Endpoints
- `GET /books/{userId}` - Get user's book library
- `POST /books/{userId}` - Add new book to library
- `PUT /books/{userId}/{bookId}/progress` - Update book reading progress

### Notification Endpoints
- `GET /notifications/{userId}` - Get user notifications (supports ?unread=true)
- `POST /notifications/{userId}` - Create new notification
- `PUT /notifications/{userId}/{notificationId}/read` - Mark notification as read

### Achievement Endpoints
- `GET /achievements/{userId}` - Get user achievements and available achievements
- `POST /achievements/{userId}` - Create/unlock new achievement

### Analytics Endpoints
- `POST /analytics/error` - Log application errors
- `GET /analytics/error-summary` - Get error summary (supports ?days=7)
- `POST /analytics/error-batch` - Batch error logging
- `GET /analytics/user-errors/{userId}` - Get user-specific error patterns

## Core Data Models

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_type VARCHAR(50) DEFAULT 'free',
  preferences JSONB DEFAULT '{}'::jsonb
);
```

### 2. Books Table
```sql
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  cover_url TEXT,
  pdf_file_url TEXT,
  audio_file_url TEXT,
  duration_seconds INTEGER,
  total_chapters INTEGER DEFAULT 0,
  genre VARCHAR(100),
  category VARCHAR(100),
  rating DECIMAL(2,1) DEFAULT 0.0,
  description TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  file_size_bytes BIGINT,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. User Progress Table
```sql
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  current_position_seconds INTEGER DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  current_chapter INTEGER DEFAULT 1,
  reading_speed DECIMAL(3,1) DEFAULT 1.0,
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_listening_time_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  bookmarks JSONB DEFAULT '[]'::jsonb,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);
```

### 4. Notifications Table
```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- success, achievement, warning, info, system
  is_read BOOLEAN DEFAULT FALSE,
  action_type VARCHAR(100), -- navigate_to_book, download_complete, etc.
  action_data JSONB DEFAULT '{}'::jsonb,
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);
```

### 5. Audio Processing Jobs Table
```sql
CREATE TABLE processing_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL, -- pdf_to_audio, text_extraction, etc.
  status VARCHAR(50) DEFAULT 'queued', -- queued, processing, completed, failed
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  error_message TEXT,
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  estimated_completion_time TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. User Settings Table
```sql
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  audio_speed DECIMAL(3,1) DEFAULT 1.0,
  voice_type VARCHAR(50) DEFAULT 'neural',
  language VARCHAR(10) DEFAULT 'en',
  auto_play_next BOOLEAN DEFAULT TRUE,
  notification_preferences JSONB DEFAULT '{
    "processing_complete": true,
    "new_features": true,
    "achievements": true,
    "learning_tips": false
  }'::jsonb,
  theme VARCHAR(20) DEFAULT 'light',
  quality_preference VARCHAR(20) DEFAULT 'standard', -- low, standard, high
  download_over_wifi_only BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

## 🔧 How to Set Up Supabase Externally

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: "Magdee"
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
6. Click "Create new project"

### Step 2: Enable Authentication
1. Go to Authentication > Settings
2. Enable email authentication
3. Configure email templates (optional)
4. Set up social providers if needed (Google, Apple, etc.)

### Step 3: Create Database Tables
1. Go to SQL Editor
2. Copy and paste each table creation SQL from above
3. Run them one by one
4. Verify tables are created in Database > Tables

### Step 4: Set Up Storage
1. Go to Storage
2. Create buckets:
   - `pdf-files` (for uploaded PDFs)
   - `audio-files` (for generated audio)
   - `book-covers` (for book cover images)
3. Set up Row Level Security (RLS) policies

### Step 5: Configure Row Level Security
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Example policies (run in SQL Editor)
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Books policies
CREATE POLICY "Users can view own books" ON books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own books" ON books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add similar policies for other tables...
```

## 💡 Using KV Store in Current Environment

Since you can't create custom tables in Figma Make, here's how to effectively use the existing KV store:

### Store User Data
```typescript
// Store user profile
await kv.set(`user:${userId}:profile`, {
  id: userId,
  email: 'user@example.com',
  name: 'John Doe',
  avatar_url: 'https://...',
  created_at: new Date().toISOString()
});

// Store user settings
await kv.set(`user:${userId}:settings`, {
  audio_speed: 1.0,
  voice_type: 'neural',
  language: 'en',
  notification_preferences: {
    processing_complete: true,
    new_features: true
  }
});
```

### Store Books Data
```typescript
// Store book metadata
await kv.set(`book:${bookId}`, {
  id: bookId,
  user_id: userId,
  title: 'Book Title',
  author: 'Author Name',
  cover_url: 'https://...',
  duration_seconds: 3600,
  genre: 'Self-Help',
  processing_status: 'completed'
});

// Store user's books list
await kv.set(`user:${userId}:books`, [bookId1, bookId2, bookId3]);
```

### Store Progress Data
```typescript
// Store reading progress
await kv.set(`progress:${userId}:${bookId}`, {
  current_position_seconds: 1800,
  progress_percentage: 45.5,
  current_chapter: 3,
  last_played_at: new Date().toISOString(),
  is_completed: false,
  bookmarks: [],
  notes: []
});
```

### Store Notifications
```typescript
// Store notifications
await kv.set(`notification:${notificationId}`, {
  id: notificationId,
  user_id: userId,
  title: 'Processing Complete',
  message: 'Your book is ready to listen!',
  type: 'success',
  is_read: false,
  created_at: new Date().toISOString()
});

// Store user's notification list
await kv.set(`user:${userId}:notifications`, [notifId1, notifId2]);
```

## 🎯 Next Steps

### For Prototyping (Current Environment)
1. Use the KV store patterns above
2. Implement user authentication with the existing system
3. Store all data as JSON objects with structured keys
4. Use `getByPrefix()` for querying related data

### For Production (External Supabase)
1. Set up external Supabase project with the schema above
2. Migrate from KV store to proper relational tables
3. Implement proper RLS policies
4. Set up real-time subscriptions for live updates
5. Configure storage buckets for files

## 🔄 Migration Strategy
When ready to move from KV store to full database:
1. Export data from KV store
2. Transform to match new schema
3. Import into Supabase tables
4. Update app to use new database queries
5. Test thoroughly before switching over

The KV store approach will work perfectly for prototyping and can handle significant user loads before needing to migrate to a full relational database structure.