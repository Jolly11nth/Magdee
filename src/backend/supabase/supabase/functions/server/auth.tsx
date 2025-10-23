import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

export async function handleSignup(request: Request): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log('handleSignup: === STARTING SIGNUP PROCESS ===');
    
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      supabaseUrlLength: supabaseUrl?.length || 0,
      serviceRoleKeyLength: serviceRoleKey?.length || 0
    });

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing environment variables' }),
        { status: 500, headers }
      );
    }

    const { email, password, name, username } = await request.json();
    console.log('handleSignup: Received request for email:', email, 'username:', username);

    if (!email || !password || !name) {
      console.error('handleSignup: Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Email, password, and name are required' }),
        { status: 400, headers }
      );
    }

    // Validate username if provided
    if (username) {
      if (username.length < 3) {
        return new Response(
          JSON.stringify({ error: 'Username must be at least 3 characters long' }),
          { status: 400, headers }
        );
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return new Response(
          JSON.stringify({ error: 'Username can only contain letters, numbers, and underscores' }),
          { status: 400, headers }
        );
      }

      // Check if username is already taken
      try {
        const usernameMapping = await kv.get(`username:${username}`);
        if (usernameMapping) {
          return new Response(
            JSON.stringify({ error: 'This username is already taken. Please choose a different one.' }),
            { status: 400, headers }
          );
        }
      } catch (kvError) {
        console.error('Error checking username availability:', kvError);
      }
    }

    console.log('handleSignup: Creating user with Supabase Auth Admin');

    // Create user with Supabase Auth Admin
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, username },
      email_confirm: true
    });

    if (error) {
      console.error('Supabase auth error during user creation:', error);
      
      if (error.code === 'email_exists' || 
         error.message?.includes('already been registered')) {
        return new Response(
          JSON.stringify({ error: 'A user with this email address has already been registered' }),
          { status: 400, headers }
        );
      }
      
      if (error.message.includes('Invalid email')) {
        return new Response(
          JSON.stringify({ error: 'Please enter a valid email address' }),
          { status: 400, headers }
        );
      }
      
      if (error.message.includes('Password')) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 6 characters long' }),
          { status: 400, headers }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Authentication error: ${error.message}` }),
        { status: 400, headers }
      );
    }

    if (!data.user) {
      console.error('handleSignup: No user data returned from Supabase');
      return new Response(
        JSON.stringify({ error: 'Failed to create user - no user data returned' }),
        { status: 400, headers }
      );
    }

    console.log('handleSignup: User created successfully, storing profile in KV store');

    try {
      // Initialize user data structure
      const userProfile = {
        id: data.user.id,
        email: data.user.email,
        name,
        username: username || null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        preferences: {
          audio_speed: 1.0,
          voice_type: 'neural',
          language: 'en',
          auto_play_next: true,
          theme: 'light',
          notification_preferences: {
            processing_complete: true,
            new_features: true,
            achievements: true,
            learning_tips: false,
            daily_reminders: true,
            weekly_summary: true
          }
        }
      };

      // Initialize all user data
      const promises = [
        kv.set(`user:${data.user.id}:profile`, userProfile),
        kv.set(`user:${data.user.id}:books`, []),
        kv.set(`user:${data.user.id}:notifications`, [
          {
            id: `welcome_${Date.now()}_1`,
            user_id: data.user.id,
            type: 'system',
            title: '🎉 Welcome to Magdee!',
            message: 'Your account has been created successfully. Start uploading your first PDF to convert it to audio.',
            read: false,
            created_at: new Date().toISOString()
          },
          {
            id: `welcome_${Date.now()}_2`,
            user_id: data.user.id,
            type: 'new_feature',
            title: '🎵 Audio Settings',
            message: 'Customize your listening experience with voice speed, type, and background sounds in Settings.',
            read: false,
            created_at: new Date().toISOString()
          }
        ]),
        kv.set(`user:${data.user.id}:achievements`, []),
        kv.set(`user:${data.user.id}:reading_sessions`, [])
      ];
      
      // Add username mapping if provided
      if (username) {
        promises.push(kv.set(`username:${username}`, { 
          email: data.user.email, 
          userId: data.user.id 
        }));
      }
      
      await Promise.all(promises);
      console.log('handleSignup: User database structure initialized successfully');
    } catch (kvError) {
      console.error('handleSignup: Error initializing user database structure:', kvError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: data.user.id,
          email: data.user.email,
          name,
          username: username || null
        }
      }),
      { status: 201, headers }
    );

  } catch (error) {
    console.error('handleSignup: Unexpected error:', error);
    
    let errorMessage = 'Internal server error during signup';
    if (error instanceof SyntaxError) {
      errorMessage = 'Invalid request format';
    } else if (error instanceof TypeError) {
      errorMessage = 'Network or configuration error';
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers }
    );
  }
}

export async function handleLookupEmail(request: Request): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    const { username } = await request.json();
    
    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { status: 400, headers }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return new Response(
        JSON.stringify({ error: 'Invalid username format' }),
        { status: 400, headers }
      );
    }

    try {
      const usernameMapping = await kv.get(`username:${username}`);
      if (usernameMapping && usernameMapping.email) {
        return new Response(
          JSON.stringify({ email: usernameMapping.email }),
          { status: 200, headers }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Username not found' }),
        { status: 404, headers }
      );
    } catch (kvError) {
      console.error('handleLookupEmail: Error querying KV store:', kvError);
      return new Response(
        JSON.stringify({ error: 'Error looking up username' }),
        { status: 500, headers }
      );
    }

  } catch (error) {
    console.error('handleLookupEmail: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error during email lookup' }),
      { status: 500, headers }
    );
  }
}

export async function handleSignin(request: Request): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers }
      );
    }

    const regularSupabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );

    const { data, error } = await regularSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error during signin:', error);
      
      if (error.message.includes('Invalid login')) {
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { status: 401, headers }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Authentication error: ${error.message}` }),
        { status: 401, headers }
      );
    }

    if (!data.user || !data.session) {
      return new Response(
        JSON.stringify({ error: 'Failed to sign in - no session data returned' }),
        { status: 401, headers }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleSignin: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error during signin' }),
      { status: 500, headers }
    );
  }
}

export async function handleGetUser(request: Request, userId: string): Promise<Response> {
  const startTime = Date.now();
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log(`handleGetUser: Starting profile fetch for userId: ${userId}`);
    
    // Get access token from Authorization header
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers }
      );
    }

    console.log('handleGetUser: Token found, verifying authentication...');

    // Add timeout to authentication verification
    const authController = new AbortController();
    const authTimeoutId = setTimeout(() => authController.abort(), 5000); // 5 second timeout

    let authResult;
    try {
      // Verify the user is authenticated with timeout
      authResult = await Promise.race([
        supabase.auth.getUser(accessToken),
        new Promise((_, reject) => {
          authController.signal.addEventListener('abort', () => {
            reject(new Error('Authentication verification timeout'));
          });
        })
      ]);
      
      clearTimeout(authTimeoutId);
      console.log(`handleGetUser: Auth verification completed in ${Date.now() - startTime}ms`);
    } catch (authTimeout) {
      clearTimeout(authTimeoutId);
      if (authTimeout.message.includes('timeout')) {
        console.error('handleGetUser: Authentication verification timeout');
        return new Response(
          JSON.stringify({ error: 'Authentication verification timeout - please try again' }),
          { status: 408, headers }
        );
      }
      throw authTimeout;
    }

    const { data: { user }, error: authError } = authResult;
    
    if (authError || !user) {
      console.error('handleGetUser: Authentication error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers }
      );
    }

    // Check if user is requesting their own profile
    if (user.id !== userId) {
      console.log(`handleGetUser: Unauthorized access attempt - user ${user.id} requesting ${userId}`);
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to user profile' }),
        { status: 403, headers }
      );
    }

    console.log('handleGetUser: User authenticated, fetching profile from KV store...');

    // Add timeout to KV store access
    const kvController = new AbortController();
    const kvTimeoutId = setTimeout(() => kvController.abort(), 3000); // 3 second timeout

    let userProfile;
    try {
      // Get user profile from KV store with timeout
      userProfile = await Promise.race([
        kv.get(`user:${userId}:profile`),
        new Promise((_, reject) => {
          kvController.signal.addEventListener('abort', () => {
            reject(new Error('KV store access timeout'));
          });
        })
      ]);
      
      clearTimeout(kvTimeoutId);
      console.log(`handleGetUser: Profile fetch completed in ${Date.now() - startTime}ms`);
    } catch (kvTimeout) {
      clearTimeout(kvTimeoutId);
      if (kvTimeout.message.includes('timeout')) {
        console.error('handleGetUser: KV store timeout - returning fallback profile');
        
        // Return a minimal fallback profile if KV store times out
        const fallbackProfile = {
          id: userId,
          email: user.email || '',
          name: user.user_metadata?.name || 'User',
          username: user.user_metadata?.username || null,
          avatar_url: null,
          created_at: user.created_at || new Date().toISOString(),
          preferences: {
            audio_speed: 1.0,
            voice_type: 'neural',
            language: 'en',
            auto_play_next: true,
            theme: 'light'
          }
        };
        
        return new Response(
          JSON.stringify({
            success: true,
            user: fallbackProfile,
            fallback: true,
            message: 'Using fallback profile due to database timeout'
          }),
          { status: 200, headers }
        );
      }
      throw kvTimeout;
    }

    if (!userProfile) {
      console.log('handleGetUser: No profile found in KV store, creating from user metadata');
      
      // Create profile from auth metadata if not found in KV store
      const newProfile = {
        id: userId,
        email: user.email || '',
        name: user.user_metadata?.name || 'User',
        username: user.user_metadata?.username || null,
        avatar_url: null,
        created_at: user.created_at || new Date().toISOString(),
        preferences: {
          audio_speed: 1.0,
          voice_type: 'neural',
          language: 'en',
          auto_play_next: true,
          theme: 'light'
        }
      };

      // Try to save the new profile (but don't fail if it fails)
      try {
        await kv.set(`user:${userId}:profile`, newProfile);
        console.log('handleGetUser: New profile saved to KV store');
      } catch (saveError) {
        console.warn('handleGetUser: Failed to save new profile to KV store:', saveError);
      }

      userProfile = newProfile;
    }

    console.log(`handleGetUser: Profile retrieved successfully in ${Date.now() - startTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        user: userProfile
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleGetUser: Unexpected error:', error);
    
    let errorMessage = 'Internal server error while getting user';
    if (error instanceof SyntaxError) {
      errorMessage = 'Invalid request format';
    } else if (error instanceof TypeError) {
      errorMessage = 'Network or configuration error';
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers }
    );
  }
}

export async function handleUpdateUser(request: Request, userId: string): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log(`handleUpdateUser: Starting profile update for userId: ${userId}`);
    
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
      console.error('handleUpdateUser: Authentication error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers }
      );
    }

    // Check if user is updating their own profile
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to user profile' }),
        { status: 403, headers }
      );
    }

    // Parse the request body
    const { name, username, email } = await request.json();
    console.log('handleUpdateUser: Update data received:', {
      name: name ? `"${name}"` : 'null',
      username: username ? `"${username}"` : 'null', 
      email: email ? `"${email}"` : 'null'
    });

    // Validation - name and email are required, username is optional
    if (!name?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Full name is required' }),
        { status: 400, headers }
      );
    }

    if (!email?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Email address is required' }),
        { status: 400, headers }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address' }),
        { status: 400, headers }
      );
    }

    // Validate username if provided
    const cleanUsername = username?.trim() || null;
    if (cleanUsername) {
      if (cleanUsername.length < 3) {
        return new Response(
          JSON.stringify({ error: 'Username must be at least 3 characters long' }),
          { status: 400, headers }
        );
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
        return new Response(
          JSON.stringify({ error: 'Username can only contain letters, numbers, and underscores' }),
          { status: 400, headers }
        );
      }

      // Check if username is already taken by another user
      try {
        const usernameMapping = await kv.get(`username:${cleanUsername}`);
        if (usernameMapping && usernameMapping.userId !== userId) {
          return new Response(
            JSON.stringify({ error: 'This username is already taken. Please choose a different one.' }),
            { status: 400, headers }
          );
        }
      } catch (kvError) {
        console.error('handleUpdateUser: Error checking username availability:', kvError);
      }
    }

    // Get current user profile
    let currentProfile;
    try {
      currentProfile = await kv.get(`user:${userId}:profile`);
    } catch (kvError) {
      console.error('handleUpdateUser: Error getting current profile:', kvError);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve current profile' }),
        { status: 500, headers }
      );
    }

    if (!currentProfile) {
      currentProfile = {
        id: userId,
        email: user.email,
        name: user.user_metadata?.name || 'User',
        username: user.user_metadata?.username || null,
        created_at: user.created_at || new Date().toISOString(),
        preferences: {
          audio_speed: 1.0,
          voice_type: 'neural',
          language: 'en',
          auto_play_next: true,
          theme: 'light'
        }
      };
    }

    // Prepare updated profile data
    const updatedProfile = {
      ...currentProfile,
      name: name.trim(), // Full name (separate from username)
      username: cleanUsername, // Username handle (separate from name)
      email: email.trim(),
      updated_at: new Date().toISOString()
    };

    // Update the profile in KV store
    try {
      await kv.set(`user:${userId}:profile`, updatedProfile);
      console.log('handleUpdateUser: Profile updated in KV store');

      // Handle username mapping updates
      const oldUsername = currentProfile.username;
      const newUsername = cleanUsername;

      // If username changed, update mappings
      if (oldUsername !== newUsername) {
        // Remove old username mapping if it exists
        if (oldUsername) {
          try {
            await kv.del(`username:${oldUsername}`);
          } catch (delError) {
            console.warn('handleUpdateUser: Failed to remove old username mapping:', delError);
          }
        }

        // Add new username mapping if new username provided
        if (newUsername) {
          await kv.set(`username:${newUsername}`, { 
            email: email.trim(), 
            userId: userId 
          });
        }
      }

      // Update user metadata in Supabase Auth
      try {
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { 
            name: name.trim(), 
            username: newUsername 
          }
        });
      } catch (authUpdateError) {
        console.warn('handleUpdateUser: Failed to update Supabase user metadata (non-critical):', authUpdateError);
      }

    } catch (kvError) {
      console.error('handleUpdateUser: Error updating profile in KV store:', kvError);
      return new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: updatedProfile.id,
          email: updatedProfile.email,
          name: updatedProfile.name,
          username: updatedProfile.username,
          avatar_url: updatedProfile.avatar_url,
          created_at: updatedProfile.created_at,
          updated_at: updatedProfile.updated_at
        }
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleUpdateUser: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error while updating user' }),
      { status: 500, headers }
    );
  }
}