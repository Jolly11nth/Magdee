import React from 'react';
import { Home, Headphones, User } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useUserDisplayInfo } from '../hooks/useUserProfile';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BackButton } from './BackButton';

export function ProfileScreen({ onNavigate }) {
  const { user, signOut } = useAuth();
  const { displayName, profilePictureUrl, email } = useUserDisplayInfo();

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('welcome');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      fontFamily: 'Poppins, sans-serif',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingTop: '1rem'
      }}>
        <BackButton 
          onClick={() => onNavigate('back')}
          title="Go back to previous screen"
          aria-label="Return to previous screen"
        />
        
        <div style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#374151'
        }}>
          Profile
        </div>
        
        <div style={{ width: '32px' }}></div> {/* Spacer to center the title */}
      </div>
      
      {/* Profile Info Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        {/* Profile Picture Display (Non-editable) */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#F3F4F6',
          border: '4px solid #E5E7EB',
          marginBottom: '1rem',
          position: 'relative'
        }}>
          {profilePictureUrl ? (
            <ImageWithFallback
              src={profilePictureUrl}
              alt="Profile picture"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              color: '#9CA3AF'
            }}>
              👤
            </div>
          )}
          
          {/* Database indicator for profile picture */}
          {profilePictureUrl && (
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '16px',
                height: '16px',
                backgroundColor: '#10B981',
                borderRadius: '50%',
                border: '3px solid white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
              title="Profile picture loaded from database"
            />
          )}
        </div>

        {/* User Info */}
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#374151',
          textAlign: 'center'
        }}>
          {displayName}
        </div>
        
        {user?.username && (
          <div style={{
            fontSize: '1rem',
            color: '#4A90E2',
            marginTop: '0.25rem',
            fontWeight: '500'
          }}>
            @{user.username}
          </div>
        )}
        
        {email && (
          <div style={{
            fontSize: '0.875rem',
            color: '#6B7280',
            marginTop: '0.25rem'
          }}>
            {email}
          </div>
        )}
        
        {/* Edit Profile Button */}
        <button
          onClick={() => onNavigate('edit-profile')}
          style={{
            marginTop: '1.5rem',
            backgroundColor: '#4A90E2',
            border: 'none',
            borderRadius: '12px',
            padding: '0.875rem 2rem',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            fontFamily: 'Poppins, sans-serif',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#357ABD';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(74, 144, 226, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#4A90E2';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.3)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Profile
        </button>
      </div>
      
      {/* Menu Options */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        paddingBottom: '6rem'
      }}>
        <button 
          onClick={() => onNavigate('language-settings')}
          style={{
            padding: '1rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '0.75rem',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '1rem',
            fontFamily: 'Poppins, sans-serif',
            color: '#374151',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          🎧 Audio Settings
        </button>
        
        <button 
          onClick={() => onNavigate('notifications')}
          style={{
            padding: '1rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '0.75rem',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '1rem',
            fontFamily: 'Poppins, sans-serif',
            color: '#374151',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          🔔 Notifications
        </button>
        
        <button 
          style={{
            padding: '1rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '0.75rem',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '1rem',
            fontFamily: 'Poppins, sans-serif',
            color: '#374151',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ℹ️ Help & Support
        </button>
        
        <button 
          style={{
            padding: '1rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '0.75rem',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '1rem',
            fontFamily: 'Poppins, sans-serif',
            color: '#374151',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          🔒 Privacy & Security
        </button>
        
        <button 
          onClick={() => onNavigate('error-analytics')}
          style={{
            padding: '1rem',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FCD34D',
            borderRadius: '0.75rem',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '1rem',
            fontFamily: 'Poppins, sans-serif',
            color: '#92400E',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#FDE68A';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#FEF3C7';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          📊 Error Analytics
        </button>
        
        <button 
          onClick={() => onNavigate('progress-tracking')}
          style={{
            padding: '1rem',
            backgroundColor: '#DBEAFE',
            border: '1px solid #93C5FD',
            borderRadius: '0.75rem',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '1rem',
            fontFamily: 'Poppins, sans-serif',
            color: '#1E40AF',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#BFDBFE';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#DBEAFE';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          📈 Progress Tracking
        </button>
        
        <button 
          onClick={handleSignOut}
          style={{
            padding: '1rem',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '0.75rem',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '1rem',
            color: '#DC2626',
            fontFamily: 'Poppins, sans-serif',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#FCA5A5';
            e.target.style.color = '#ffffff';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#FEF2F2';
            e.target.style.color = '#DC2626';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          🚪 Sign Out
        </button>
      </div>
      
      {/* Bottom Navigation */}
      <div
        style={{
          position: "absolute",
          bottom: "1.25rem",
          left: "1.25rem",
          right: "1.25rem",
          backgroundColor: "#E3F2FD",
          borderRadius: "15px",
          padding: "0 1rem",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => onNavigate("home")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            color: "#6B7280",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#4A90E2";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#6B7280";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <Home size={24} />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "500",
            }}
          >
            Home
          </span>
        </button>

        <button
          onClick={() => onNavigate("my-library")} // Fixed: should be "my-library"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            color: "#6B7280",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#4A90E2";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#6B7280";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <Headphones size={24} />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "500",
            }}
          >
            Audio books
          </span>
        </button>

        <button
          onClick={() => onNavigate("profile")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            color: "#4A90E2", // Active state for current screen
          }}
        >
          <User size={24} />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "500",
            }}
          >
            Profile
          </span>
        </button>
      </div>
    </div>
  );
}