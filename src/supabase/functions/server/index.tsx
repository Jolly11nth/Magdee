import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

// Import handlers - only core auth handlers for now
import { handleSignup, handleSignin, handleLookupEmail, handleGetUser, handleUpdateUser } from "./auth.tsx";

// Import analytics handlers
import { handleErrorAnalytics, handleErrorSummary, handleErrorBatch, handleUserErrors } from "./analytics.tsx";

// Import progress handlers
import { 
  handleGetUserProgress, 
  handleStartReadingSession, 
  handleEndReadingSession,
  handleGetUserBooks,
  handleCreateBook,
  handleUpdateBookProgress
} from "./progress.tsx";

// Import notification handlers
import { 
  handleGetUserNotifications,
  handleCreateNotification,
  handleMarkNotificationAsRead,
  handleGetUserAchievements,
  handleCreateAchievement
} from "./notifications.tsx";

// Import profile handlers
import {
  handleUpdateProfilePicture,
  handleGetUserProfile,
  handleUploadProfileImage
} from "./profile.tsx";

// Import preferences handlers
import {
  handleGetUserPreferences,
  handleUpdateUserPreferences,
  handleUpdateAudioSettings
} from "./preferences.tsx";

// Import books handlers
import { handleGetRecentBooks, handleGetBookById, handleUpdateBookProgress as handleUpdateBookProgressNew } from "./books.tsx";

// Import seed handler
import { handleSeedData } from "./seed.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-989ff5a9/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Debug endpoint to check environment variables
app.get("/make-server-989ff5a9/debug/env", (c) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  return c.json({
    hasSupabaseUrl: !!supabaseUrl,
    hasServiceRoleKey: !!serviceRoleKey,
    hasAnonKey: !!anonKey,
    supabaseUrlLength: supabaseUrl?.length || 0,
    serviceRoleKeyLength: serviceRoleKey?.length || 0,
    anonKeyLength: anonKey?.length || 0,
  });
});

// Authentication routes
app.post("/make-server-989ff5a9/auth/signup", async (c) => {
  try {
    console.log("Signup request received");
    return await handleSignup(c.req.raw);
  } catch (error) {
    console.error("Error in signup route:", error);
    return c.json(
      { error: "Internal server error during signup" },
      { status: 500 }
    );
  }
});

app.post("/make-server-989ff5a9/auth/lookup-email", async (c) => {
  try {
    console.log("Email lookup request received");
    return await handleLookupEmail(c.req.raw);
  } catch (error) {
    console.error("Error in email lookup route:", error);
    return c.json(
      { error: "Internal server error during email lookup" },
      { status: 500 }
    );
  }
});

app.post("/make-server-989ff5a9/auth/signin", async (c) => {
  try {
    console.log("Signin request received");
    return await handleSignin(c.req.raw);
  } catch (error) {
    console.error("Error in signin route:", error);
    return c.json(
      { error: "Internal server error during signin" },
      { status: 500 }
    );
  }
});

app.get("/make-server-989ff5a9/user/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Get user request received for userId:", userId);
    return await handleGetUser(c.req.raw, userId);
  } catch (error) {
    console.error("Error in get user route:", error);
    return c.json(
      { error: "Internal server error while getting user" },
      { status: 500 }
    );
  }
});

app.put("/make-server-989ff5a9/user/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Update user request received for userId:", userId);
    return await handleUpdateUser(c.req.raw, userId);
  } catch (error) {
    console.error("Error in update user route:", error);
    return c.json(
      { error: "Internal server error while updating user" },
      { status: 500 }
    );
  }
});

// Profile picture routes
app.get("/make-server-989ff5a9/profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Get user profile request received for userId:", userId);
    return await handleGetUserProfile(c.req.raw, userId);
  } catch (error) {
    console.error("Error in get user profile route:", error);
    return c.json(
      { error: "Internal server error while getting user profile" },
      { status: 500 }
    );
  }
});

app.put("/make-server-989ff5a9/profile/:userId/picture", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Update profile picture request received for userId:", userId);
    
    // Check authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, { status: 401 });
    }

    return await handleUpdateProfilePicture(c.req.raw, userId);
  } catch (error) {
    console.error("Error in update profile picture route:", error);
    return c.json(
      { error: "Internal server error while updating profile picture" },
      { status: 500 }
    );
  }
});

app.post("/make-server-989ff5a9/profile/:userId/upload", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Upload profile image request received for userId:", userId);
    
    // Check authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, { status: 401 });
    }

    return await handleUploadProfileImage(c.req.raw, userId);
  } catch (error) {
    console.error("Error in upload profile image route:", error);
    return c.json(
      { error: "Internal server error while uploading profile image" },
      { status: 500 }
    );
  }
});

// User Preferences routes
app.get("/make-server-989ff5a9/preferences/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Get user preferences request received for userId:", userId);
    
    // Check authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, { status: 401 });
    }

    return await handleGetUserPreferences(c.req.raw, userId);
  } catch (error) {
    console.error("Error in get user preferences route:", error);
    return c.json(
      { error: "Internal server error while getting preferences" },
      { status: 500 }
    );
  }
});

app.put("/make-server-989ff5a9/preferences/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Update user preferences request received for userId:", userId);
    
    // Check authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, { status: 401 });
    }

    return await handleUpdateUserPreferences(c.req.raw, userId);
  } catch (error) {
    console.error("Error in update user preferences route:", error);
    return c.json(
      { error: "Internal server error while updating preferences" },
      { status: 500 }
    );
  }
});

// Audio Settings routes (for backwards compatibility)
app.put("/make-server-989ff5a9/audio-settings/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Update audio settings request received for userId:", userId);
    
    // Check authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, { status: 401 });
    }

    return await handleUpdateAudioSettings(c.req.raw, userId);
  } catch (error) {
    console.error("Error in update audio settings route:", error);
    return c.json(
      { error: "Internal server error while updating audio settings" },
      { status: 500 }
    );
  }
});

// Error Analytics routes
app.post("/make-server-989ff5a9/analytics/error", async (c) => {
  try {
    console.log("Error analytics request received");
    return await handleErrorAnalytics(c.req.raw);
  } catch (error) {
    console.error("Error in analytics route:", error);
    return c.json(
      { error: "Internal server error while storing analytics" },
      { status: 500 }
    );
  }
});

app.get("/make-server-989ff5a9/analytics/error-summary", async (c) => {
  try {
    const days = parseInt(c.req.query('days') || '7');
    console.log("Error summary request received for", days, "days");
    return await handleErrorSummary(c.req.raw, days);
  } catch (error) {
    console.error("Error in error summary route:", error);
    return c.json(
      { error: "Internal server error while getting error summary" },
      { status: 500 }
    );
  }
});

app.post("/make-server-989ff5a9/analytics/error-batch", async (c) => {
  try {
    console.log("Error batch request received");
    return await handleErrorBatch(c.req.raw);
  } catch (error) {
    console.error("Error in error batch route:", error);
    return c.json(
      { error: "Internal server error while processing error batch" },
      { status: 500 }
    );
  }
});

app.get("/make-server-989ff5a9/analytics/user-errors/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("User error patterns request received for userId:", userId);
    return await handleUserErrors(c.req.raw, userId);
  } catch (error) {
    console.error("Error in user errors route:", error);
    return c.json(
      { error: "Internal server error while getting user errors" },
      { status: 500 }
    );
  }
});

// Recent Books routes
app.get("/make-server-989ff5a9/recent-books/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Get recent books request received for userId:", userId);
    
    // Check authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, { status: 401 });
    }

    return await handleGetRecentBooks(c.req.raw, userId);
  } catch (error) {
    console.error("Error in get recent books route:", error);
    return c.json(
      { error: "Internal server error while getting recent books" },
      { status: 500 }
    );
  }
});

app.get("/make-server-989ff5a9/book/:bookId", async (c) => {
  try {
    const bookId = c.req.param('bookId');
    console.log("Get book by ID request received for bookId:", bookId);
    
    // Check authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, { status: 401 });
    }

    return await handleGetBookById(c.req.raw, bookId);
  } catch (error) {
    console.error("Error in get book by ID route:", error);
    return c.json(
      { error: "Internal server error while getting book" },
      { status: 500 }
    );
  }
});

app.put("/make-server-989ff5a9/book/:bookId/progress", async (c) => {
  try {
    const bookId = c.req.param('bookId');
    console.log("Update book progress request received for bookId:", bookId);
    
    // Check authentication
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, { status: 401 });
    }

    return await handleUpdateBookProgressNew(c.req.raw, bookId);
  } catch (error) {
    console.error("Error in update book progress route:", error);
    return c.json(
      { error: "Internal server error while updating book progress" },
      { status: 500 }
    );
  }
});

// Progress Tracking routes
app.get("/make-server-989ff5a9/progress/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Get user progress request received for userId:", userId);
    return await handleGetUserProgress(c.req.raw, userId);
  } catch (error) {
    console.error("Error in get user progress route:", error);
    return c.json(
      { error: "Internal server error while getting user progress" },
      { status: 500 }
    );
  }
});

app.post("/make-server-989ff5a9/reading-session/:userId/start", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Start reading session request received for userId:", userId);
    return await handleStartReadingSession(c.req.raw, userId);
  } catch (error) {
    console.error("Error in start reading session route:", error);
    return c.json(
      { error: "Internal server error while starting reading session" },
      { status: 500 }
    );
  }
});

app.put("/make-server-989ff5a9/reading-session/:userId/:sessionId/end", async (c) => {
  try {
    const userId = c.req.param('userId');
    const sessionId = c.req.param('sessionId');
    console.log("End reading session request received for userId:", userId, "sessionId:", sessionId);
    return await handleEndReadingSession(c.req.raw, userId, sessionId);
  } catch (error) {
    console.error("Error in end reading session route:", error);
    return c.json(
      { error: "Internal server error while ending reading session" },
      { status: 500 }
    );
  }
});

app.get("/make-server-989ff5a9/books/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Get user books request received for userId:", userId);
    return await handleGetUserBooks(c.req.raw, userId);
  } catch (error) {
    console.error("Error in get user books route:", error);
    return c.json(
      { error: "Internal server error while getting user books" },
      { status: 500 }
    );
  }
});

app.post("/make-server-989ff5a9/books/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Create book request received for userId:", userId);
    return await handleCreateBook(c.req.raw, userId);
  } catch (error) {
    console.error("Error in create book route:", error);
    return c.json(
      { error: "Internal server error while creating book" },
      { status: 500 }
    );
  }
});

app.put("/make-server-989ff5a9/books/:userId/:bookId/progress", async (c) => {
  try {
    const userId = c.req.param('userId');
    const bookId = c.req.param('bookId');
    console.log("Update book progress request received for userId:", userId, "bookId:", bookId);
    return await handleUpdateBookProgress(c.req.raw, userId, bookId);
  } catch (error) {
    console.error("Error in update book progress route:", error);
    return c.json(
      { error: "Internal server error while updating book progress" },
      { status: 500 }
    );
  }
});

// Notification routes
app.get("/make-server-989ff5a9/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Get user notifications request received for userId:", userId);
    return await handleGetUserNotifications(c.req.raw, userId);
  } catch (error) {
    console.error("Error in get user notifications route:", error);
    return c.json(
      { error: "Internal server error while getting notifications" },
      { status: 500 }
    );
  }
});

app.post("/make-server-989ff5a9/notifications/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Create notification request received for userId:", userId);
    return await handleCreateNotification(c.req.raw, userId);
  } catch (error) {
    console.error("Error in create notification route:", error);
    return c.json(
      { error: "Internal server error while creating notification" },
      { status: 500 }
    );
  }
});

app.put("/make-server-989ff5a9/notifications/:userId/:notificationId/read", async (c) => {
  try {
    const userId = c.req.param('userId');
    const notificationId = c.req.param('notificationId');
    console.log("Mark notification as read request received for userId:", userId, "notificationId:", notificationId);
    return await handleMarkNotificationAsRead(c.req.raw, userId, notificationId);
  } catch (error) {
    console.error("Error in mark notification as read route:", error);
    return c.json(
      { error: "Internal server error while marking notification as read" },
      { status: 500 }
    );
  }
});

// Achievement routes
app.get("/make-server-989ff5a9/achievements/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Get user achievements request received for userId:", userId);
    return await handleGetUserAchievements(c.req.raw, userId);
  } catch (error) {
    console.error("Error in get user achievements route:", error);
    return c.json(
      { error: "Internal server error while getting achievements" },
      { status: 500 }
    );
  }
});

app.post("/make-server-989ff5a9/achievements/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log("Create achievement request received for userId:", userId);
    return await handleCreateAchievement(c.req.raw, userId);
  } catch (error) {
    console.error("Error in create achievement route:", error);
    return c.json(
      { error: "Internal server error while creating achievement" },
      { status: 500 }
    );
  }
});

// Development/Testing routes
app.post("/make-server-989ff5a9/seed-data", async (c) => {
  try {
    console.log("Seed data request received");
    return await handleSeedData(c.req.raw);
  } catch (error) {
    console.error("Error in seed data route:", error);
    return c.json(
      { error: "Internal server error while seeding data" },
      { status: 500 }
    );
  }
});

console.log("🚀 Magdee server starting up...");
Deno.serve(app.fetch);