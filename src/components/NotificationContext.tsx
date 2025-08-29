import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DatabaseService } from '../services/database';
import { useAuth } from './AuthContext';

export interface NotificationItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
  icon?: React.ReactNode;
  duration?: number; // milliseconds, 0 for persistent
}

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Convert database notification to NotificationItem format
  const convertDatabaseNotification = (dbNotification: any): NotificationItem => ({
    id: dbNotification.id,
    type: dbNotification.type || 'info',
    title: dbNotification.title,
    message: dbNotification.message,
    timestamp: new Date(dbNotification.created_at),
    isRead: dbNotification.read || false,
    duration: 0, // Database notifications are persistent by default
  });

  // Fetch notifications from database with silent failure
  const refreshNotifications = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const result = await DatabaseService.getUserNotifications(user.id);
      if (result.success && result.data) {
        const convertedNotifications = result.data.map(convertDatabaseNotification);
        setNotifications(convertedNotifications);
      } else {
        // Silent failure - don't log errors when server is unavailable
        if (result.error !== 'Server is currently unavailable') {
          console.error('Failed to load notifications:', result.error);
        }
      }
    } catch (error) {
      // Silent failure for notification loading
      if (error instanceof Error && !error.message.includes('Server is currently unavailable')) {
        console.error('Error loading notifications:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load notifications when user changes
  useEffect(() => {
    if (user?.id) {
      // Try to refresh notifications but don't block if it fails
      refreshNotifications();
      
      // Create some sample notifications for demo (only if server is available)
      const createDemoNotifications = async () => {
        try {
          const serverHealth = DatabaseService.getServerHealthStatus();
          if (!serverHealth.healthy) {
            // Don't try to create notifications if server is unhealthy
            return;
          }

          const result = await DatabaseService.getUserNotifications(user.id);
          if (result.success && result.data && result.data.length === 0) {
            // Create sample notifications
            await DatabaseService.createNotification(user.id, {
              type: 'achievement',
              title: 'Welcome to Magdee! 🎉',
              message: 'Your PDF-to-audio journey begins now',
              data: null,
              expires_at: null,
            });
            
            await DatabaseService.createNotification(user.id, {
              type: 'info',
              title: 'Pro Tip',
              message: 'Upload your first PDF to start converting to audio',
              data: null,
              expires_at: null,
            });
            
            // Refresh to show the new notifications
            setTimeout(() => refreshNotifications(), 500);
          }
        } catch (error) {
          // Silent failure for demo notifications
          if (error instanceof Error && !error.message.includes('Server is currently unavailable')) {
            console.error('Error creating demo notifications:', error);
          }
        }
      };
      
      createDemoNotifications();
    } else {
      setNotifications([]);
    }
  }, [user?.id, refreshNotifications]);

  const addNotification = useCallback(async (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    if (!user?.id) {
      // If no user, just add to local state (for toast notifications)
      const newNotification: NotificationItem = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
        isRead: false,
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Auto-remove notification after duration (default 5 seconds for non-persistent)
      const duration = notification.duration !== undefined ? notification.duration : 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(newNotification.id);
        }, duration);
      }
      return;
    }

    // Check if server is healthy before trying to create notification
    const serverHealth = DatabaseService.getServerHealthStatus();
    if (!serverHealth.healthy) {
      // If server is unhealthy, just add to local state
      const newNotification: NotificationItem = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
        isRead: false,
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Auto-remove notification after duration
      const duration = notification.duration !== undefined ? notification.duration : 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(newNotification.id);
        }, duration);
      }
      return;
    }

    try {
      // Create notification in database
      const result = await DatabaseService.createNotification(user.id, {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: null,
        expires_at: notification.duration && notification.duration > 0 
          ? new Date(Date.now() + notification.duration).toISOString() 
          : null,
      });

      if (result.success) {
        // Refresh notifications to get the latest from database
        await refreshNotifications();
      } else {
        // Silent failure - add to local state as fallback
        if (result.error !== 'Server is currently unavailable') {
          console.error('Failed to create notification:', result.error);
        }
        
        const newNotification: NotificationItem = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          isRead: false,
        };

        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (error) {
      // Silent failure for notification creation
      if (error instanceof Error && !error.message.includes('Server is currently unavailable')) {
        console.error('Error creating notification:', error);
      }
      
      // Add to local state as fallback
      const newNotification: NotificationItem = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date(),
        isRead: false,
      };

      setNotifications(prev => [newNotification, ...prev]);
    }
  }, [user?.id, refreshNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    if (!user?.id) {
      // Fallback to local state update
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
      return;
    }

    try {
      const result = await DatabaseService.markNotificationAsRead(user.id, id);
      if (result.success) {
        // Update local state immediately for better UX
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        );
      } else {
        console.error('Failed to mark notification as read:', result.error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) {
      // Fallback to local state update
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      return;
    }

    try {
      // Mark all notifications as read individually
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(notification => 
          DatabaseService.markNotificationAsRead(user.id!, notification.id)
        )
      );

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?.id, notifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        unreadCount,
        loading,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}