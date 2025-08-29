import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from "./kv_store.tsx";

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

export interface AudioBook {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url?: string;
  audio_url?: string;
  text_content?: string;
  file_path: string;
  conversion_status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  duration?: number;
  created_at: string;
  updated_at: string;
  converted_at?: string;
  metadata?: {
    file_size: number;
    page_count?: number;
    language?: string;
    genre?: string;
  };
}

export async function handleGetRecentBooks(request: Request, userId: string): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log("Get recent books request received for userId:", userId);
    
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
    
    if (authError || !user) {
      console.error('handleGetRecentBooks: Authentication error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers }
      );
    }

    // Check if user is requesting their own books
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to user books' }),
        { status: 403, headers }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status') || 'completed';

    // Get user's books from KV store
    const userBooksIds = await kv.get(`user:${userId}:books`) || [];
    
    if (userBooksIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          data: [],
          total: 0,
          message: "No books found for user"
        }),
        { status: 200, headers }
      );
    }

    // Get book details for each book ID
    const bookDetailsPromises = userBooksIds.map(async (bookId: string) => {
      try {
        const bookData = await kv.get(`book:${bookId}`);
        return bookData;
      } catch (error) {
        console.warn(`Failed to get book data for ${bookId}:`, error);
        return null;
      }
    });

    const allBooks = (await Promise.all(bookDetailsPromises))
      .filter(book => book !== null) as AudioBook[];

    // Filter by conversion status and sort by conversion date
    let filteredBooks = allBooks.filter(book => {
      if (status === 'all') return true;
      return book.conversion_status === status;
    });

    // Sort by converted_at date (most recent first), fallback to updated_at, then created_at
    filteredBooks.sort((a, b) => {
      const dateA = new Date(a.converted_at || a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.converted_at || b.updated_at || b.created_at).getTime();
      return dateB - dateA; // Descending order (most recent first)
    });

    // Apply pagination
    const paginatedBooks = filteredBooks.slice(offset, offset + limit);

    // Add derived fields for frontend compatibility
    const enrichedBooks = paginatedBooks.map(book => ({
      ...book,
      cover: book.cover_url || `https://via.placeholder.com/120x160/4A90E2/ffffff?text=${encodeURIComponent(book.title.substring(0, 2))}`,
      audioUrl: book.audio_url,
      isRecent: true,
      daysAgo: Math.floor((Date.now() - new Date(book.converted_at || book.updated_at || book.created_at).getTime()) / (1000 * 60 * 60 * 24))
    }));

    console.log(`Retrieved ${enrichedBooks.length} recent books for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: enrichedBooks,
        total: filteredBooks.length,
        has_more: offset + limit < filteredBooks.length,
        pagination: {
          limit,
          offset,
          total: filteredBooks.length,
          pages: Math.ceil(filteredBooks.length / limit)
        }
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Error getting recent books:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error while getting recent books",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers }
    );
  }
}

export async function handleGetBookById(request: Request, bookId: string): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log("Get book by ID request received for bookId:", bookId);
    
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
    
    if (authError || !user) {
      console.error('handleGetBookById: Authentication error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers }
      );
    }

    // Get book data
    const bookData = await kv.get(`book:${bookId}`);
    
    if (!bookData) {
      return new Response(
        JSON.stringify({ error: "Book not found" }),
        { status: 404, headers }
      );
    }

    // Check if user has access to this book
    if (bookData.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to book' }),
        { status: 403, headers }
      );
    }

    // Enrich book data for frontend
    const enrichedBook = {
      ...bookData,
      cover: bookData.cover_url || `https://via.placeholder.com/120x160/4A90E2/ffffff?text=${encodeURIComponent(bookData.title.substring(0, 2))}`,
      audioUrl: bookData.audio_url,
      daysAgo: Math.floor((Date.now() - new Date(bookData.converted_at || bookData.updated_at || bookData.created_at).getTime()) / (1000 * 60 * 60 * 24))
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        data: enrichedBook
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Error getting book by ID:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error while getting book",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers }
    );
  }
}

export async function handleUpdateBookProgress(request: Request, bookId: string): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log("Update book progress request received for bookId:", bookId);
    
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
    
    if (authError || !user) {
      console.error('handleUpdateBookProgress: Authentication error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers }
      );
    }

    const { progress, currentTime, duration } = await request.json();

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return new Response(
        JSON.stringify({ error: 'Progress must be a number between 0 and 100' }),
        { status: 400, headers }
      );
    }

    // Get current book data
    const bookData = await kv.get(`book:${bookId}`);
    
    if (!bookData) {
      return new Response(
        JSON.stringify({ error: "Book not found" }),
        { status: 404, headers }
      );
    }

    // Check if user has access to this book
    if (bookData.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to book' }),
        { status: 403, headers }
      );
    }

    // Update book progress
    const updatedBook = {
      ...bookData,
      progress,
      current_time: currentTime,
      duration: duration || bookData.duration,
      updated_at: new Date().toISOString()
    };

    await kv.set(`book:${bookId}`, updatedBook);

    // Update user's reading session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
      id: sessionId,
      user_id: user.id,
      book_id: bookId,
      progress,
      current_time: currentTime,
      duration: duration || bookData.duration,
      timestamp: new Date().toISOString()
    };

    // Add to user's reading sessions
    const userSessions = await kv.get(`user:${user.id}:reading_sessions`) || [];
    await kv.set(`user:${user.id}:reading_sessions`, [sessionId, ...userSessions.slice(0, 49)]); // Keep last 50 sessions
    await kv.set(`session:${sessionId}`, session);

    console.log(`Updated progress for book ${bookId} to ${progress}%`);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          ...updatedBook,
          cover: updatedBook.cover_url || `https://via.placeholder.com/120x160/4A90E2/ffffff?text=${encodeURIComponent(updatedBook.title.substring(0, 2))}`,
          audioUrl: updatedBook.audio_url
        }
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Error updating book progress:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error while updating book progress",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers }
    );
  }
}