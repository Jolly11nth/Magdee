import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

// Notification handlers
export async function handleGetUserNotifications(request: Request, userId: string): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log(`handleGetUserNotifications: Starting notifications fetch for userId: ${userId}`);
    
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

    // Get URL parameters for filtering
    const url = new URL(request.url);
    const unreadOnly = url.searchParams.get('unread') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Get user notifications
    let notifications = await kv.get(`user:${userId}:notifications`) || [];

    // Filter unread notifications if requested
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    // Remove expired notifications
    const now = new Date().toISOString();
    notifications = notifications.filter(n => !n.expires_at || n.expires_at > now);

    // Apply limit
    if (limit > 0) {
      notifications = notifications.slice(0, limit);
    }

    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.read).length;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          notifications,
          unreadCount,
          total: notifications.length
        }
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleGetUserNotifications: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error while getting notifications' }),
      { status: 500, headers }
    );
  }
}

export async function handleCreateNotification(request: Request, userId: string): Promise<Response> {
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

    const { type, title, message, data: notificationData, expires_at } = await request.json();
    
    if (!type || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'Type, title, and message are required' }),
        { status: 400, headers }
      );
    }

    // Create new notification
    const notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type,
      title,
      message,
      data: notificationData || null,
      read: false,
      created_at: new Date().toISOString(),
      expires_at: expires_at || null
    };

    // Add to user's notifications
    const userNotifications = await kv.get(`user:${userId}:notifications`) || [];
    userNotifications.unshift(notification);

    // Keep only last 100 notifications
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }

    await kv.set(`user:${userId}:notifications`, userNotifications);

    return new Response(
      JSON.stringify({
        success: true,
        data: notification
      }),
      { status: 201, headers }
    );

  } catch (error) {
    console.error('handleCreateNotification: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error while creating notification' }),
      { status: 500, headers }
    );
  }
}

export async function handleMarkNotificationAsRead(request: Request, userId: string, notificationId: string): Promise<Response> {
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

    // Get user notifications
    const notifications = await kv.get(`user:${userId}:notifications`) || [];
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) {
      return new Response(
        JSON.stringify({ error: 'Notification not found' }),
        { status: 404, headers }
      );
    }

    // Mark as read
    notifications[notificationIndex].read = true;
    await kv.set(`user:${userId}:notifications`, notifications);

    return new Response(
      JSON.stringify({
        success: true,
        data: notifications[notificationIndex]
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleMarkNotificationAsRead: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error while marking notification as read' }),
      { status: 500, headers }
    );
  }
}

// Achievement handlers
export async function handleGetUserAchievements(request: Request, userId: string): Promise<Response> {
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
  };

  try {
    console.log(`handleGetUserAchievements: Starting achievements fetch for userId: ${userId}`);
    
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

    // Get user achievements
    const achievements = await kv.get(`user:${userId}:achievements`) || [];

    // Calculate potential achievements based on user activity
    const [userBooks, readingSessions] = await Promise.all([
      kv.get(`user:${userId}:books`) || [],
      kv.get(`user:${userId}:reading_sessions`) || []
    ]);

    const completedBooks = userBooks.filter(book => book.progress >= 100);
    const totalListeningTime = readingSessions.reduce((total, session) => total + (session.duration || 0), 0);
    const totalListeningHours = Math.floor(totalListeningTime / (1000 * 60 * 60)); // Convert to hours

    // Calculate current streak
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    let currentStreak = 0;
    for (const date of last30Days) {
      const hasActivity = readingSessions.some(session => 
        session.start_time && session.start_time.startsWith(date)
      );
      if (hasActivity) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Check for available achievements
    const availableAchievements = [];

    // Books completed achievements
    if (completedBooks.length >= 1 && !achievements.find(a => a.type === 'first_book')) {
      availableAchievements.push({
        type: 'first_book',
        title: 'First Book Complete',
        description: 'Completed your first audiobook',
        icon: '📚',
        progress: 100,
        target: 1
      });
    }

    if (completedBooks.length >= 5 && !achievements.find(a => a.type === 'book_collector')) {
      availableAchievements.push({
        type: 'book_collector',
        title: 'Book Collector',
        description: 'Completed 5 audiobooks',
        icon: '📖',
        progress: 100,
        target: 5
      });
    }

    if (completedBooks.length >= 10 && !achievements.find(a => a.type === 'book_master')) {
      availableAchievements.push({
        type: 'book_master',
        title: 'Book Master',
        description: 'Completed 10 audiobooks',
        icon: '🎓',
        progress: 100,
        target: 10
      });
    }

    // Listening time achievements
    if (totalListeningHours >= 10 && !achievements.find(a => a.type === 'time_listener')) {
      availableAchievements.push({
        type: 'time_listener',
        title: 'Dedicated Listener',
        description: 'Listened for 10+ hours',
        icon: '⏰',
        progress: 100,
        target: 10
      });
    }

    if (totalListeningHours >= 50 && !achievements.find(a => a.type === 'time_master')) {
      availableAchievements.push({
        type: 'time_master',
        title: 'Time Master',
        description: 'Listened for 50+ hours',
        icon: '🕰️',
        progress: 100,
        target: 50
      });
    }

    // Streak achievements
    if (currentStreak >= 7 && !achievements.find(a => a.type === 'week_warrior')) {
      availableAchievements.push({
        type: 'week_warrior',
        title: 'Week Warrior',
        description: '7-day reading streak',
        icon: '🔥',
        progress: 100,
        target: 7
      });
    }

    if (currentStreak >= 30 && !achievements.find(a => a.type === 'streak_champion')) {
      availableAchievements.push({
        type: 'streak_champion',
        title: 'Streak Champion',
        description: '30-day reading streak',
        icon: '👑',
        progress: 100,
        target: 30
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          achievements,
          availableAchievements,
          stats: {
            completedBooks: completedBooks.length,
            totalListeningHours,
            currentStreak
          }
        }
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('handleGetUserAchievements: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error while getting achievements' }),
      { status: 500, headers }
    );
  }
}

export async function handleCreateAchievement(request: Request, userId: string): Promise<Response> {
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

    const { type, title, description, icon, progress, target } = await request.json();
    
    if (!type || !title || !description) {
      return new Response(
        JSON.stringify({ error: 'Type, title, and description are required' }),
        { status: 400, headers }
      );
    }

    // Create new achievement
    const achievement = {
      id: `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type,
      title,
      description,
      icon: icon || '🏆',
      unlocked_at: new Date().toISOString(),
      progress: progress || 100,
      target: target || 1
    };

    // Add to user's achievements
    const userAchievements = await kv.get(`user:${userId}:achievements`) || [];
    
    // Check if achievement already exists
    if (userAchievements.find(a => a.type === type)) {
      return new Response(
        JSON.stringify({ error: 'Achievement already unlocked' }),
        { status: 400, headers }
      );
    }

    userAchievements.push(achievement);
    await kv.set(`user:${userId}:achievements`, userAchievements);

    // Create a notification for the achievement
    const notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type: 'achievement',
      title: `🏆 Achievement Unlocked!`,
      message: `You've earned "${title}" - ${description}`,
      data: { achievement },
      read: false,
      created_at: new Date().toISOString()
    };

    const userNotifications = await kv.get(`user:${userId}:notifications`) || [];
    userNotifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }
    
    await kv.set(`user:${userId}:notifications`, userNotifications);

    return new Response(
      JSON.stringify({
        success: true,
        data: achievement
      }),
      { status: 201, headers }
    );

  } catch (error) {
    console.error('handleCreateAchievement: Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error while creating achievement' }),
      { status: 500, headers }
    );
  }
}