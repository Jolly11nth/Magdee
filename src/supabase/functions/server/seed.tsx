import * as kv from "./kv_store.tsx";

export interface SampleBook {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url: string;
  audio_url?: string;
  text_content?: string;
  file_path: string;
  conversion_status: 'completed';
  progress: number;
  duration: number;
  created_at: string;
  updated_at: string;
  converted_at: string;
  metadata: {
    file_size: number;
    page_count: number;
    language: string;
    genre: string;
  };
}

const SAMPLE_BOOKS: Omit<SampleBook, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'converted_at'>[] = [
  {
    title: "The Science of Learning",
    author: "Dr. Sarah Johnson",
    cover_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=160&fit=crop&crop=face",
    file_path: "/uploads/science-of-learning.pdf",
    conversion_status: 'completed',
    progress: 45,
    duration: 7200, // 2 hours
    metadata: {
      file_size: 2048000, // 2MB
      page_count: 150,
      language: "en",
      genre: "Science"
    }
  },
  {
    title: "Digital Transformation Guide",
    author: "Mark Thompson",
    cover_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&h=160&fit=crop",
    file_path: "/uploads/digital-transformation.pdf",
    conversion_status: 'completed',
    progress: 78,
    duration: 5400, // 1.5 hours
    metadata: {
      file_size: 1536000, // 1.5MB
      page_count: 120,
      language: "en",
      genre: "Technology"
    }
  },
  {
    title: "Modern Psychology",
    author: "Dr. Emily Chen",
    cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120&h=160&fit=crop",
    file_path: "/uploads/modern-psychology.pdf",
    conversion_status: 'completed',
    progress: 23,
    duration: 8100, // 2.25 hours
    metadata: {
      file_size: 3072000, // 3MB
      page_count: 200,
      language: "en",
      genre: "Psychology"
    }
  },
  {
    title: "Business Strategy 2024",
    author: "James Wilson",
    cover_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=160&fit=crop",
    file_path: "/uploads/business-strategy.pdf",
    conversion_status: 'completed',
    progress: 0,
    duration: 6300, // 1.75 hours
    metadata: {
      file_size: 1843200, // 1.8MB
      page_count: 100,
      language: "en",
      genre: "Business"
    }
  },
  {
    title: "Creative Writing Mastery",
    author: "Rachel Adams",
    cover_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=120&h=160&fit=crop",
    file_path: "/uploads/creative-writing.pdf",
    conversion_status: 'completed',
    progress: 89,
    duration: 4800, // 1.33 hours
    metadata: {
      file_size: 1228800, // 1.2MB
      page_count: 80,
      language: "en",
      genre: "Writing"
    }
  }
];

export async function seedUserBooks(userId: string): Promise<void> {
  console.log(`Seeding sample books for user: ${userId}`);
  
  const now = new Date();
  const bookIds: string[] = [];

  // Create books with different conversion dates
  for (let i = 0; i < SAMPLE_BOOKS.length; i++) {
    const sampleBook = SAMPLE_BOOKS[i];
    const bookId = `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`;
    
    // Create books converted at different times (most recent first)
    const daysAgo = i; // 0, 1, 2, 3, 4 days ago
    const convertedAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    const createdAt = new Date(convertedAt.getTime() - (60 * 60 * 1000)); // 1 hour before conversion
    
    const book: SampleBook = {
      ...sampleBook,
      id: bookId,
      user_id: userId,
      created_at: createdAt.toISOString(),
      updated_at: convertedAt.toISOString(),
      converted_at: convertedAt.toISOString(),
      audio_url: `https://example.com/audio/${bookId}.mp3`
    };

    // Store book data
    await kv.set(`book:${bookId}`, book);
    bookIds.push(bookId);
    
    console.log(`Created sample book: ${book.title} (${daysAgo} days ago)`);
  }

  // Update user's book list
  const existingBooks = await kv.get(`user:${userId}:books`) || [];
  const allBooks = [...new Set([...bookIds, ...existingBooks])]; // Avoid duplicates
  await kv.set(`user:${userId}:books`, allBooks);

  console.log(`Seeded ${bookIds.length} books for user ${userId}`);
}

export async function handleSeedData(request: Request): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    const { userId, force = false } = await request.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers }
      );
    }

    // Check if user already has books (unless force is true)
    if (!force) {
      const existingBooks = await kv.get(`user:${userId}:books`) || [];
      if (existingBooks.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: true,
            message: `User already has ${existingBooks.length} books. Use force=true to add more.`,
            existing_books: existingBooks.length
          }),
          { status: 200, headers }
        );
      }
    }

    // Seed the data
    await seedUserBooks(userId);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Sample books created successfully',
        books_created: SAMPLE_BOOKS.length
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("Error seeding data:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error while seeding data",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers }
    );
  }
}