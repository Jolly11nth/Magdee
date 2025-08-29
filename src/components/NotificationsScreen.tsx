import React from 'react';
import { useNotifications } from './NotificationContext';
import { BackButton } from './BackButton';

interface NotificationsScreenProps {
  onNavigate: (screen: string) => void;
}

export function NotificationsScreen({ onNavigate }: NotificationsScreenProps) {
  const { notifications, markAsRead, markAllAsRead, clearNotifications, unreadCount, loading, refreshNotifications } = useNotifications();

  // Refresh notifications when screen loads
  React.useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'achievement': return '🎯';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'system': return '⚙️';
      default: return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#10B981';
      case 'achievement': return '#F59E0B';
      case 'warning': return '#EF4444';
      case 'info': return '#4A90E2';
      case 'system': return '#6B7280';
      default: return '#4A90E2';
    }
  };

  return (
    <div style={{
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #F3F4F6',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <BackButton 
            onClick={() => onNavigate('back')}
            title="Go back to previous screen"
            aria-label="Return to previous screen"
          />
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1F2937', 
              marginBottom: '4px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Notifications
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {unreadCount > 0 ? (
                <>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#EF4444',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#EF4444',
                    fontWeight: '500',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
                  </p>
                </>
              ) : (
                <>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#10B981',
                    borderRadius: '50%'
                  }} />
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#10B981',
                    fontWeight: '500',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    All caught up! 🎉
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {notifications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={refreshNotifications}
              style={{
                padding: '6px 12px',
                backgroundColor: '#10B981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Poppins, sans-serif',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10B981';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
              }}
            >
              🔄 Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#4A90E2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: '0 2px 4px rgba(74, 144, 226, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#357ABD';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(74, 144, 226, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#4A90E2';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(74, 144, 226, 0.2)';
                }}
              >
                ✓ Mark All Read
              </button>
            )}
            <button
              onClick={clearNotifications}
              style={{
                padding: '6px 12px',
                backgroundColor: '#F8FAFC',
                color: '#64748B',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Poppins, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#FEF2F2';
                e.target.style.color = '#EF4444';
                e.target.style.borderColor = '#FECACA';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#F8FAFC';
                e.target.style.color = '#64748B';
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🗑️ Clear All
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: notifications.length > 0 ? '0' : '20px'
      }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6B7280'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '16px', 
              opacity: 0.5,
              animation: 'pulse 1.5s infinite'
            }}>
              🔔
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Loading notifications...
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
              Fetching your latest notifications from the server.
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#6B7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
              🔔
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              No notifications yet
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
              We'll notify you about book conversions, achievements, and learning milestones.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #F3F4F6',
                backgroundColor: notification.isRead ? '#ffffff' : '#F8FAFF',
                cursor: notification.isRead ? 'default' : 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: getTypeColor(notification.type),
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  {getTypeIcon(notification.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: notification.isRead ? '500' : '600',
                      color: '#111827',
                      lineHeight: '1.3'
                    }}>
                      {notification.title}
                    </h4>
                    <span style={{
                      fontSize: '12px',
                      color: '#9CA3AF',
                      flexShrink: 0
                    }}>
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    lineHeight: '1.4',
                    marginBottom: notification.action ? '12px' : '0'
                  }}>
                    {notification.message}
                  </p>

                  {notification.action && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        notification.action!.handler();
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: getTypeColor(notification.type),
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

                {!notification.isRead && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#4A90E2',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}