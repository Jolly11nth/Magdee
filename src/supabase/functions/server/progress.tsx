import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

// Progress tracking and analytics handlers
export async function handleGetUserProgress(request: Request, userId: string): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log(`handleGetUserProgress: Starting progress fetch for userId: ${userId}`);
    
    // Get access token from Authorization header
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { status: 401, headers }
      );
    }

    // Get user books and reading sessions
    const [userBooks, readingSessions, userAnalytics, achievements] = await Promise.all([
      kv.get(`user:${userId}:books`) || [],
      kv.get(`user:${userId}:reading_sessions`) || [],
      kv.get(`user:${userId}:analytics`) || {},
      kv.get(`user:${userId}:achievements`) || []
    ]);

    // Calculate progress statistics
    const completedBooks = userBooks.filter(book => book.progress >= 100);
    const inProgressBooks = userBooks.filter(book => book.progress > 0 && book.progress < 100);
    
    // Calculate total listening time from reading sessions
    const totalListeningTime = readingSessions.reduce((total, session) => total + (session.duration || 0), 0);
    
    // Calculate current streak (days with reading activity)
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    const activeDays = last7Days.filter(date => {
      return readingSessions.some(session => 
        session.start_time && session.start_time.startsWith(date)
      );
    });
    
    // Calculate weekly progress (last 7 days)
    const weeklyListeningTime = readingSessions
      .filter(session => {
        if (!session.start_time) return false;
        const sessionDate = new Date(session.start_time);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate >= weekAgo;
      })
      .reduce((total, session) => total + (session.duration || 0), 0);

    // Get favorite genre
    const genreCounts = userBooks.reduce((acc, book) => {
      acc[book.genre] = (acc[book.genre] || 0) + 1;
      return acc;
    }, {});
    
    const favoriteGenre = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Fiction';

    // Calculate average session time
    const averageSessionTime = readingSessions.length > 0 
      ? Math.round(totalListeningTime / readingSessions.length)
      : 0;

    // Get recent activity (last 10 sessions)
    const recentActivity = readingSessions
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .slice(0, 10)
      .map(session => {
        const book = userBooks.find(b => b.id === session.book_id);
        return {
          id: session.id,
          bookTitle: book?.title || 'Unknown Book',
          sessionTime: Math.round(session.duration / 60), // Convert to minutes
          date: new Date(session.start_time).toISOString().split('T')[0],
          progress: book?.progress || 0
        };
      });

    const progressStats = {
      totalBooksRead: completedBooks.length,
      totalListeningTime: Math.round(totalListeningTime / 60), // Convert to minutes
      currentStreak: activeDays.length,
      weeklyGoal: 300, // Default 5 hours per week in minutes
      weeklyProgress: Math.round(weeklyListeningTime / 60), // Convert to minutes
      averageSessionTime: Math.round(averageSessionTime / 60), // Convert to minutes
      favoriteGenre,
      totalSessions: readingSessions.length,
      booksInProgress: inProgressBooks.length,
      totalBooks: userBooks.length,
      recentActivity,
      achievements: achievements.length
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: progressStats
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleGetUserProgress: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error while getting user progress' }),
      { status: 500, headers }
    );
  }
}

export async function handleStartReadingSession(request: Request, userId: string): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    // Get access token from Authorization header
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { status: 401, headers }
      );
    }

    const { bookId, startPosition } = await request.json();
    
    if (!bookId) {
      return new Response(
        JSON.stringify({ error: 'Book ID is required' }),
        { status: 400, headers }
      );
    }

    // Create new reading session
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      book_id: bookId,
      start_time: new Date().toISOString(),
      start_position: startPosition || 0,
      duration: 0,
      end_position: startPosition || 0,
      chapters_completed: [],
      created_at: new Date().toISOString(),
    };

    // Add to user's reading sessions
    const existingSessions = await kv.get(`user:${userId}:reading_sessions`) || [];
    existingSessions.unshift(session);

    // Keep only last 100 sessions
    if (existingSessions.length > 100) {
      existingSessions.splice(100);
    }

    await kv.set(`user:${userId}:reading_sessions`, existingSessions);

    return new Response(
      JSON.stringify({
        success: true,
        data: session
      }),
      { status: 201, headers }
    );

  } catch (error) {
    console.error('handleStartReadingSession: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error while starting reading session' }),
      { status: 500, headers }
    );
  }
}

export async function handleEndReadingSession(request: Request, userId: string, sessionId: string): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    // Get access token from Authorization header
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { status: 401, headers }
      );
    }

    const { endPosition, chaptersCompleted } = await request.json();

    // Get user's reading sessions
    const sessions = await kv.get(`user:${userId}:reading_sessions`) || [];
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers }
      );
    }

    // Calculate session duration
    const session = sessions[sessionIndex];
    const endTime = new Date();
    const startTime = new Date(session.start_time);
    const duration = Math.max(0, endTime.getTime() - startTime.getTime()); // in milliseconds

    // Update session
    const updatedSession = {
      ...session,
      end_time: endTime.toISOString(),
      end_position: endPosition || session.start_position,
      duration: duration,
      chapters_completed: chaptersCompleted || []
    };

    sessions[sessionIndex] = updatedSession;
    await kv.set(`user:${userId}:reading_sessions`, sessions);

    // Update book progress if needed
    if (endPosition !== undefined && session.book_id) {
      const userBooks = await kv.get(`user:${userId}:books`) || [];
      const bookIndex = userBooks.findIndex(book => book.id === session.book_id);
      
      if (bookIndex !== -1) {
        // Calculate progress percentage (assuming endPosition is in seconds and we have total duration)
        const book = userBooks[bookIndex];
        if (book.duration && typeof book.duration === 'string') {
          // Parse duration string like "2h 30m" to seconds
          const durationMatch = book.duration.match(/(\d+)h?\s*(\d+)?m?/);
          if (durationMatch) {
            const hours = parseInt(durationMatch[1]) || 0;
            const minutes = parseInt(durationMatch[2]) || 0;
            const totalSeconds = (hours * 3600) + (minutes * 60);
            
            if (totalSeconds > 0) {
              const progressPercent = Math.min(100, Math.round((endPosition / totalSeconds) * 100));
              userBooks[bookIndex].progress = progressPercent;
              await kv.set(`user:${userId}:books`, userBooks);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedSession
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleEndReadingSession: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error while ending reading session' }),
      { status: 500, headers }
    );
  }
}

export async function handleGetUserBooks(request: Request, userId: string): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    // Get access token from Authorization header
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { status: 401, headers }
      );
    }

    // Get user books
    const userBooks = await kv.get(`user:${userId}:books`) || [];

    return new Response(
      JSON.stringify({
        success: true,
        data: userBooks
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleGetUserBooks: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error while getting user books' }),
      { status: 500, headers }
    );
  }
}

export async function handleCreateBook(request: Request, userId: string): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    // Get access token from Authorization header
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { status: 401, headers }
      );
    }

    const bookData = await request.json();
    
    // Validate required fields
    if (!bookData.title || !bookData.author) {
      return new Response(
        JSON.stringify({ error: 'Title and author are required' }),
        { status: 400, headers }
      );
    }

    // Create new book
    const book = {
      id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: bookData.title,
      author: bookData.author,
      cover: bookData.cover || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
      duration: bookData.duration || '0h 0m',
      chapters: bookData.chapters || 1,
      genre: bookData.genre || 'General',
      rating: bookData.rating || 0,
      progress: 0,
      description: bookData.description || '',
      dateAdded: new Date().toISOString(),
      category: bookData.category || 'Uploaded',
      file_url: bookData.file_url || null,
      audio_url: bookData.audio_url || null,
      processing_status: bookData.processing_status || 'pending',
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to user's books
    const userBooks = await kv.get(`user:${userId}:books`) || [];
    userBooks.unshift(book);
    await kv.set(`user:${userId}:books`, userBooks);

    // Store book details separately for quick access
    await kv.set(`book:${book.id}:details`, book);

    return new Response(
      JSON.stringify({
        success: true,
        data: book
      }),
      { status: 201, headers }
    );

  } catch (error) {
    console.error('handleCreateBook: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error while creating book' }),
      { status: 500, headers }
    );
  }
}

export async function handleUpdateBookProgress(request: Request, userId: string, bookId: string): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    // Get access token from Authorization header
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { status: 401, headers }
      );
    }

    const { progress, currentPosition, currentChapter } = await request.json();

    // Get user books
    const userBooks = await kv.get(`user:${userId}:books`) || [];
    const bookIndex = userBooks.findIndex(book => book.id === bookId);
    
    if (bookIndex === -1) {
      return new Response(
        JSON.stringify({ error: 'Book not found' }),
        { status: 404, headers }
      );
    }

    // Update book progress
    const updatedBook = {
      ...userBooks[bookIndex],
      progress: progress !== undefined ? Math.min(100, Math.max(0, progress)) : userBooks[bookIndex].progress,
      updated_at: new Date().toISOString()
    };

    userBooks[bookIndex] = updatedBook;
    await kv.set(`user:${userId}:books`, userBooks);

    // Update book details
    await kv.set(`book:${bookId}:details`, updatedBook);

    // Store detailed progress information
    const bookProgress = {
      book_id: bookId,
      user_id: userId,
      current_position: currentPosition || 0,
      current_chapter: currentChapter || 1,
      total_duration: 0, // Should be calculated from book metadata
      completed: progress >= 100,
      last_accessed: new Date().toISOString(),
      reading_time_today: 0, // Should be calculated from today's sessions
      reading_time_total: 0 // Should be calculated from all sessions
    };

    await kv.set(`user:${userId}:book:${bookId}:progress`, bookProgress);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          book: updatedBook,
          progress: bookProgress
        }
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleUpdateBookProgress: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error while updating book progress' }),
      { status: 500, headers }
    );
  }
}