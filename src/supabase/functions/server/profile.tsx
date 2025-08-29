import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from "./kv_store.tsx";

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

export async function handleUpdateProfilePicture(request: Request, userId: string): Promise<Response> {
  try {
    console.log("Update profile picture request received for userId:", userId);
    
    // Get access token from Authorization header
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('handleUpdateProfilePicture: Authentication error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Check if user is updating their own profile
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to user profile' }),
        { 
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    const requestBody = await request.json();
    const { imageUrl, imageData } = requestBody;
    
    if (!imageUrl && !imageData) {
      return new Response(
        JSON.stringify({ error: "Image URL or image data is required" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Get current user profile
    const currentUser = await kv.get(`user:${userId}:profile`);
    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { 
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Update user profile with new avatar - preserve all existing fields
    const updatedUser = {
      ...currentUser,
      avatar_url: imageUrl,
      updated_at: new Date().toISOString()
    };

    // Store updated profile
    await kv.set(`user:${userId}:profile`, updatedUser);

    console.log("Profile picture updated successfully for userId:", userId);

    return new Response(
      JSON.stringify({ 
        data: updatedUser,
        message: "Profile picture updated successfully"
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error updating profile picture:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error while updating profile picture",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export async function handleGetUserProfile(request: Request, userId: string): Promise<Response> {
  try {
    console.log("Get user profile request received for userId:", userId);
    
    // Get access token from Authorization header
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('handleGetUserProfile: Authentication error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Check if user is requesting their own profile
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to user profile' }),
        { 
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // Get user profile
    const userProfile = await kv.get(`user:${userId}:profile`);
    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { 
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ data: userProfile }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error getting user profile:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error while getting user profile",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export async function handleUploadProfileImage(request: Request, userId: string): Promise<Response> {
  try {
    console.log("Upload profile image request received for userId:", userId);
    
    // Get access token from Authorization header
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('handleUploadProfileImage: Authentication error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Check if user is uploading their own profile image
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to user profile' }),
        { 
          status: 403,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    
    // In a real implementation, this would handle file upload to Supabase Storage
    // For now, we'll simulate the upload process
    
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: "No image file provided" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Please upload JPEG, PNG, or WebP images." }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return new Response(
        JSON.stringify({ error: "File size too large. Please use images under 5MB." }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Get current user profile to preserve existing data
    const currentUser = await kv.get(`user:${userId}:profile`);
    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { 
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // In real implementation, upload to Supabase Storage:
    // 1. Create bucket if not exists: `profile-pictures`
    // 2. Upload file with path: `${userId}/profile-${timestamp}.${extension}`
    // 3. Get public URL
    
    // For now, simulate with placeholder
    const imageId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const simulatedUrl = `https://via.placeholder.com/200x200/4A90E2/ffffff?text=${encodeURIComponent(userId.substring(0, 2).toUpperCase())}`;

    // Update user profile - preserve all existing fields
    const updatedUser = {
      ...currentUser,
      avatar_url: simulatedUrl,
      updated_at: new Date().toISOString()
    };

    await kv.set(`user:${userId}:profile`, updatedUser);

    // Create notification
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notification = {
      id: notificationId,
      user_id: userId,
      title: "Profile Updated",
      message: "Your profile picture has been updated successfully.",
      type: "success",
      is_read: false,
      action_type: "navigate_to_profile",
      action_data: {},
      priority: 1,
      created_at: new Date().toISOString()
    };

    await kv.set(`notification:${notificationId}`, notification);

    // Add to user's notifications list
    const userNotifications = await kv.get(`user:${userId}:notifications`) || [];
    await kv.set(`user:${userId}:notifications`, [notificationId, ...userNotifications]);

    console.log("Profile image uploaded successfully for userId:", userId);

    return new Response(
      JSON.stringify({ 
        data: {
          imageUrl: simulatedUrl,
          user: updatedUser
        },
        message: "Profile image uploaded successfully"
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error uploading profile image:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error while uploading profile image",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}