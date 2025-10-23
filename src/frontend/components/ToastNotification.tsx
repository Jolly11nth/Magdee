import React, { useEffect, useState } from 'react';
import { useNotifications, NotificationItem } from './NotificationContext';

interface ToastNotificationProps {
  notification: NotificationItem;
  onClose: () => void;
}

function ToastNotification({ notification, onClose }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    if (notification.duration !== 0) {
      const timer = setTimeout(handleClose, notification.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          backgroundColor: '#10B981',
          icon: '✓'
        };
      case 'achievement':
        return {
          backgroundColor: '#F59E0B',
          icon: '🎉'
        };
      case 'warning':
        return {
          backgroundColor: '#EF4444',
          icon: '⚠️'
        };
      case 'info':
        return {
          backgroundColor: '#4A90E2',
          icon: 'ℹ️'
        };
      case 'system':
        return {
          backgroundColor: '#6B7280',
          icon: '⚙️'
        };
      default:
        return {
          backgroundColor: '#4A90E2',
          icon: 'ℹ️'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: `translateX(-50%) ${isLeaving ? 'translateY(-100%)' : 'translateY(0)'}`,
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        minWidth: '320px',
        maxWidth: '90vw',
        opacity: isLeaving ? 0 : 1,
        transition: 'all 0.3s ease',
        border: `2px solid ${styles.backgroundColor}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: styles.backgroundColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            flexShrink: 0,
          }}
        >
          {notification.icon || styles.icon}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontWeight: '600', 
            color: '#111827',
            fontSize: '14px',
            marginBottom: '4px'
          }}>
            {notification.title}
          </div>
          <div style={{ 
            color: '#6B7280',
            fontSize: '13px',
            lineHeight: '1.4'
          }}>
            {notification.message}
          </div>
          
          {notification.action && (
            <button
              onClick={notification.action.handler}
              style={{
                marginTop: '8px',
                padding: '4px 12px',
                backgroundColor: styles.backgroundColor,
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '2px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { notifications } = useNotifications();
  const [activeToasts, setActiveToasts] = useState<NotificationItem[]>([]);
  const shownNotificationIds = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    const latestNotification = notifications.find(n => 
      !n.isRead && !shownNotificationIds.current.has(n.id)
    );
    
    if (latestNotification) {
      shownNotificationIds.current.add(latestNotification.id);
      setActiveToasts(prev => [latestNotification, ...prev.slice(0, 2)]); // Show max 3 toasts
    }
  }, [notifications]);

  const handleCloseToast = (notificationId: string) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== notificationId));
    // Remove from shown notifications set so it can potentially be shown again
    shownNotificationIds.current.delete(notificationId);
  };

  return (
    <>
      {activeToasts.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            transform: `translateY(${index * 80}px)`,
            zIndex: 1000 - index,
          }}
        >
          <ToastNotification
            notification={notification}
            onClose={() => handleCloseToast(notification.id)}
          />
        </div>
      ))}
    </>
  );
}