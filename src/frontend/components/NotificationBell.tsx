import React from 'react';
import { useNotifications } from './NotificationContext';

interface NotificationBellProps {
  onNavigate: (screen: string) => void;
  size?: number;
  color?: string;
}

export function NotificationBell({ onNavigate, size = 24, color = '#374151' }: NotificationBellProps) {
  const { unreadCount, loading } = useNotifications();

  const handleClick = () => {
    onNavigate('notifications');
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        background: 'none',
        border: 'none',
        cursor: loading ? 'wait' : 'pointer',
        position: 'relative',
        padding: '8px',
        borderRadius: '8px',
        transition: 'background-color 0.2s ease',
        opacity: loading ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = color === '#ffffff' ? 'rgba(255, 255, 255, 0.2)' : '#F3F4F6';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          animation: loading ? 'pulse 1s infinite' : 'none',
        }}
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      
      {unreadCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            backgroundColor: '#EF4444',
            color: '#ffffff',
            borderRadius: '50%',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '600',
            border: '2px solid #ffffff',
            animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
          }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </button>
  );
}