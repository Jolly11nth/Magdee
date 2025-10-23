import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from "./kv_store.tsx";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

// KV Store key patterns (inline to avoid import issues)
const KV_KEYS = {
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

// Enhanced audio settings interface to match frontend
interface AudioPreferences {
  language: string;
  voice_id: string;
  voice_name: string;
  voice_type: 'Natural' | 'Premium';
  playback_speed: number;
  auto_detect_language: boolean;
  updated_at: string;
}

interface UserPreferences {
  audio: AudioPreferences;
  theme: 'light' | 'dark' | 'auto';
  notification_preferences: {
    processing_complete: boolean;
    new_features: boolean;
    achievements: boolean;
    learning_tips: boolean;
    daily_reminders: boolean;
    weekly_summary: boolean;
  };
  updated_at: string;
}

/**
 * Get user preferences from database
 */
export async function handleGetUserPreferences(request: Request, userId: string): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log("📋 Getting user preferences for userId:", userId);

    // Validate userId
    if (!userId || typeof userId !== 'string') {
      console.error("❌ Invalid userId provided");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid userId provided" }),
        { status: 400, headers }
      );
    }

    // Check authentication
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
        { status: 403, headers }
      );
    }

    // Get preferences from KV store
    const preferencesKey = KV_KEYS.USER_PREFERENCES(userId);
    console.log("🔍 Looking up preferences with key:", preferencesKey);
    
    const preferences = await kv.get(preferencesKey);
    console.log("📋 Raw preferences from database:", preferences);

    if (!preferences) {
      console.log("📋 No preferences found, returning defaults");
      
      // Return default preferences
      const defaultPreferences: UserPreferences = {
        audio: {
          language: 'en',
          voice_id: 'female1',
          voice_name: 'Sarah (Female)',
          voice_type: 'Natural',
          playback_speed: 1.0,
          auto_detect_language: true,
          updated_at: new Date().toISOString()
        },
        theme: 'auto',
        notification_preferences: {
          processing_complete: true,
          new_features: true,
          achievements: true,
          learning_tips: true,
          daily_reminders: false,
          weekly_summary: true
        },
        updated_at: new Date().toISOString()
      };

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: defaultPreferences,
          isDefault: true
        }),
        { status: 200, headers }
      );
    }

    // Ensure preferences have the correct structure
    const validatedPreferences = {
      audio: {
        language: preferences.audio?.language || 'en',
        voice_id: preferences.audio?.voice_id || 'female1',
        voice_name: preferences.audio?.voice_name || 'Sarah (Female)',
        voice_type: preferences.audio?.voice_type || 'Natural',
        playback_speed: preferences.audio?.playback_speed || 1.0,
        auto_detect_language: preferences.audio?.auto_detect_language !== false, // Default to true
        updated_at: preferences.audio?.updated_at || new Date().toISOString()
      },
      theme: preferences.theme || 'auto',
      notification_preferences: {
        processing_complete: preferences.notification_preferences?.processing_complete !== false,
        new_features: preferences.notification_preferences?.new_features !== false,
        achievements: preferences.notification_preferences?.achievements !== false,
        learning_tips: preferences.notification_preferences?.learning_tips !== false,
        daily_reminders: preferences.notification_preferences?.daily_reminders === true,
        weekly_summary: preferences.notification_preferences?.weekly_summary !== false
      },
      updated_at: preferences.updated_at || new Date().toISOString()
    };

    console.log("✅ Successfully retrieved user preferences:", validatedPreferences);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: validatedPreferences,
        isDefault: false
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("❌ Error getting user preferences:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Failed to get user preferences: ${error.message}` 
      }),
      { status: 500, headers }
    );
  }
}

/**
 * Update user preferences in database
 */
export async function handleUpdateUserPreferences(request: Request, userId: string): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log("💾 Updating user preferences for userId:", userId);

    // Validate userId
    if (!userId || typeof userId !== 'string') {
      console.error("❌ Invalid userId provided");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid userId provided" }),
        { status: 400, headers }
      );
    }

    // Check authentication
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
        { status: 403, headers }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log("📝 Update preferences request body:", body);

    // Validate required fields
    if (!body.preferences) {
      console.error("❌ Missing preferences data");
      return new Response(
        JSON.stringify({ success: false, error: "Missing preferences data" }),
        { status: 400, headers }
      );
    }

    // Get current preferences first
    const preferencesKey = KV_KEYS.USER_PREFERENCES(userId);
    const currentPreferences = await kv.get(preferencesKey);
    console.log("📋 Current preferences:", currentPreferences);

    // Merge with existing preferences (deep merge)
    const updatedPreferences: UserPreferences = {
      audio: {
        language: body.preferences.audio?.language || currentPreferences?.audio?.language || 'en',
        voice_id: body.preferences.audio?.voice_id || currentPreferences?.audio?.voice_id || 'female1',
        voice_name: body.preferences.audio?.voice_name || currentPreferences?.audio?.voice_name || 'Sarah (Female)',
        voice_type: body.preferences.audio?.voice_type || currentPreferences?.audio?.voice_type || 'Natural',
        playback_speed: body.preferences.audio?.playback_speed !== undefined ? 
          body.preferences.audio.playback_speed : 
          (currentPreferences?.audio?.playback_speed || 1.0),
        auto_detect_language: body.preferences.audio?.auto_detect_language !== undefined ? 
          body.preferences.audio.auto_detect_language : 
          (currentPreferences?.audio?.auto_detect_language !== false),
        updated_at: new Date().toISOString()
      },
      theme: body.preferences.theme || currentPreferences?.theme || 'auto',
      notification_preferences: {
        processing_complete: body.preferences.notification_preferences?.processing_complete !== undefined ?
          body.preferences.notification_preferences.processing_complete :
          (currentPreferences?.notification_preferences?.processing_complete !== false),
        new_features: body.preferences.notification_preferences?.new_features !== undefined ?
          body.preferences.notification_preferences.new_features :
          (currentPreferences?.notification_preferences?.new_features !== false),
        achievements: body.preferences.notification_preferences?.achievements !== undefined ?
          body.preferences.notification_preferences.achievements :
          (currentPreferences?.notification_preferences?.achievements !== false),
        learning_tips: body.preferences.notification_preferences?.learning_tips !== undefined ?
          body.preferences.notification_preferences.learning_tips :
          (currentPreferences?.notification_preferences?.learning_tips !== false),
        daily_reminders: body.preferences.notification_preferences?.daily_reminders !== undefined ?
          body.preferences.notification_preferences.daily_reminders :
          (currentPreferences?.notification_preferences?.daily_reminders === true),
        weekly_summary: body.preferences.notification_preferences?.weekly_summary !== undefined ?
          body.preferences.notification_preferences.weekly_summary :
          (currentPreferences?.notification_preferences?.weekly_summary !== false)
      },
      updated_at: new Date().toISOString()
    };

    console.log("💾 Saving updated preferences:", updatedPreferences);

    // Save to KV store
    await kv.set(preferencesKey, updatedPreferences);
    console.log("✅ Successfully saved user preferences");

    // Also save a backup in audio settings key for compatibility
    const audioSettingsKey = KV_KEYS.USER_AUDIO_SETTINGS(userId);
    const audioSettings = {
      user_id: userId,
      playback_speed: updatedPreferences.audio.playback_speed,
      voice_preference: updatedPreferences.audio.voice_id,
      language: updatedPreferences.audio.language,
      auto_detect_language: updatedPreferences.audio.auto_detect_language,
      voice_type: updatedPreferences.audio.voice_type,
      voice_name: updatedPreferences.audio.voice_name,
      updated_at: updatedPreferences.audio.updated_at
    };
    await kv.set(audioSettingsKey, audioSettings);
    console.log("✅ Also saved audio settings backup");

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: updatedPreferences,
        message: "Preferences updated successfully"
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error("❌ Error updating user preferences:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Failed to update user preferences: ${error.message}` 
      }),
      { status: 500, headers }
    );
  }
}

/**
 * Update only audio preferences (for compatibility)
 */
export async function handleUpdateAudioSettings(request: Request, userId: string): Promise<Response> {
  try {
    console.log("🎧 Updating audio settings for userId:", userId);

    // Parse request body
    const body = await request.json();
    console.log("📝 Audio settings request body:", body);

    // Create preferences update format
    const preferencesUpdate = {
      preferences: {
        audio: {
          language: body.language,
          voice_id: body.voice_id,
          voice_name: body.voice_name,
          voice_type: body.voice_type,
          playback_speed: body.playback_speed,
          auto_detect_language: body.auto_detect_language
        }
      }
    };

    // Create new request with updated format
    const newRequest = new Request(request.url, {
      method: 'PUT',
      headers: request.headers,
      body: JSON.stringify(preferencesUpdate)
    });

    // Use the main preferences update handler
    return await handleUpdateUserPreferences(newRequest, userId);

  } catch (error) {
    console.error("❌ Error updating audio settings:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Failed to update audio settings: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*'
        }
      }
    );
  }
}