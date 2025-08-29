import React, { useState, useRef, useEffect } from 'react';
import {
  Edit3,
  Camera,
  Settings,
  Star,
  Clock,
  BookOpen,
  Award,
  Headphones,
  User,
  Home,
  LogOut,
  Save,
  X,
  Upload,
  Crown,
  TrendingUp,
  Heart,
  Check,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { NotificationBell } from './NotificationBell';
import { BackButton } from './BackButton';
import { useAuth } from './AuthContext';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { useUserDisplayInfo } from '../hooks/useUserProfile';
import { DatabaseService } from '../services/database';
import { useNotifications } from './NotificationContext';

export function EditProfileScreen({ onNavigate, user }) {
  const { refreshUserProfile } = useAuth();
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'offline' | 'error'>('connecting');
  const [lastConnectionCheck, setLastConnectionCheck] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);
  
  // Original data for comparison
  const [originalData, setOriginalData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    username: user?.user_metadata?.username || '',
    email: user?.email || '',
    bio: user?.user_metadata?.bio || '',
    location: user?.user_metadata?.location || '',
    website: user?.user_metadata?.website || ''
  });
  
  // Current form data
  const [formData, setFormData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    username: user?.user_metadata?.username || '',
    email: user?.email || '',
    bio: user?.user_metadata?.bio || '',
    location: user?.user_metadata?.location || '',
    website: user?.user_metadata?.website || ''
  });

  const { displayName, username: displayUsername } = useUserDisplayInfo(user);

  // Helper function to show toast notifications
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    addNotification({
      type,
      title: type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Info',
      message,
      duration: 4000
    });
  };

  // Check database connection status
  const checkDatabaseConnection = async () => {
    try {
      setConnectionStatus('connecting');
      const healthStatus = await DatabaseService.forceHealthCheck();
      
      if (healthStatus) {
        setConnectionStatus('connected');
        setRetryCount(0);
        setLastConnectionCheck(Date.now());
        console.log('🔗 Database connection: Connected');
      } else {
        setConnectionStatus('offline');
        console.log('🔗 Database connection: Offline');
      }
    } catch (error) {
      console.error('🔗 Database connection check failed:', error);
      setConnectionStatus('error');
    }
  };

  // Initial connection check
  useEffect(() => {
    checkDatabaseConnection();
    
    // Set up periodic connection checks every 30 seconds
    const connectionInterval = setInterval(() => {
      const serverHealth = DatabaseService.getServerHealthStatus();
      if (serverHealth.healthy) {
        setConnectionStatus('connected');
      } else {
        // Only check if we haven't checked recently
        const now = Date.now();
        if (now - lastConnectionCheck > 30000) {
          checkDatabaseConnection();
        }
      }
    }, 30000);

    return () => clearInterval(connectionInterval);
  }, [lastConnectionCheck]);

  // Auto-retry connection when offline
  useEffect(() => {
    if (connectionStatus === 'offline' || connectionStatus === 'error') {
      const retryDelay = Math.min(5000 * Math.pow(2, retryCount), 60000); // Exponential backoff, max 1 minute
      
      const retryTimer = setTimeout(() => {
        if (retryCount < 5) { // Max 5 retries
          console.log(`🔄 Retrying database connection (attempt ${retryCount + 1})`);
          setRetryCount(prev => prev + 1);
          checkDatabaseConnection();
        }
      }, retryDelay);

      return () => clearTimeout(retryTimer);
    }
  }, [connectionStatus, retryCount]);

  // Check if form data has changed from original
  const hasChanges = () => {
    return Object.keys(formData).some(key => {
      if (key === 'email') return false; // Email is not editable
      return formData[key] !== originalData[key];
    });
  };

  // Auto-save draft to localStorage
  useEffect(() => {
    if (isEditing) {
      const draftKey = `profile-draft-${user?.id}`;
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, isEditing, user?.id]);

  // Update original data when user data changes
  useEffect(() => {
    const newOriginalData = {
      full_name: user?.user_metadata?.full_name || '',
      username: user?.user_metadata?.username || '',
      email: user?.email || '',
      bio: user?.user_metadata?.bio || '',
      location: user?.user_metadata?.location || '',
      website: user?.user_metadata?.website || ''
    };
    setOriginalData(newOriginalData);
    setFormData(newOriginalData);
  }, [user]);

  // Restore draft on edit start
  const handleStartEdit = () => {
    const draftKey = `profile-draft-${user?.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(draft);
      } catch (e) {
        console.warn('Failed to restore draft:', e);
      }
    }
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Check connection before saving
    if (connectionStatus !== 'connected') {
      showToast('Cannot save changes - database connection unavailable. Please check your connection and try again.', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('💾 Saving profile changes:', formData);
      
      // Save to database
      const result = await DatabaseService.updateUserProfile(user.id, {
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        website: formData.website
      });

      if (result.success) {
        console.log('✅ Profile updated successfully');
        
        // Show success state briefly
        setSaveSuccess(true);
        
        // Clear draft
        const draftKey = `profile-draft-${user?.id}`;
        localStorage.removeItem(draftKey);
        
        // Update original data to match saved data
        setOriginalData(formData);
        
        // Refresh user profile data
        await refreshUserProfile();
        
        // Show success toast
        showToast('Profile updated successfully!', 'success');
        
        // Brief delay to show success state, then navigate back
        setTimeout(() => {
          setIsEditing(false);
          setSaveSuccess(false);
          onNavigate('profile'); // Navigate back to profile screen
        }, 800);
        
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      
      // Check if it's a connection error
      if (error.message.includes('unavailable') || error.message.includes('timeout')) {
        setConnectionStatus('offline');
        showToast('Connection lost while saving. Your changes are saved locally and will sync when connection is restored.', 'error');
      } else {
        showToast('Failed to update profile. Please try again.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form data to original when exiting edit mode without saving
  const handleExitEdit = () => {
    // Clear draft
    const draftKey = `profile-draft-${user?.id}`;
    localStorage.removeItem(draftKey);
    
    // Reset form data to original
    setFormData(originalData);
    setIsEditing(false);
  };

  // Manual connection retry
  const handleConnectionRetry = () => {
    setRetryCount(0);
    checkDatabaseConnection();
    showToast('Checking database connection...', 'info');
  };

  // Handle back button click
  const handleBackClick = () => {
    if (isEditing) {
      handleExitEdit();
    } else {
      onNavigate('back');
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Poppins, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header - Consistent with other screens */}
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
            onClick={handleBackClick}
            disabled={isSaving}
            title={isEditing ? "Cancel editing and go back" : "Go back to profile"}
            aria-label={isEditing ? "Cancel editing and return to profile" : "Return to profile screen"}
          />
          
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1F2937', 
              marginBottom: '4px',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Edit Profile
            </h1>
            
            {/* Connection Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {connectionStatus === 'connected' ? (
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
                    Database connected
                  </p>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#F59E0B',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#F59E0B',
                    fontWeight: '500',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Connecting...
                  </p>
                </>
              ) : connectionStatus === 'offline' ? (
                <>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#EF4444',
                    borderRadius: '50%'
                  }} />
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#EF4444',
                    fontWeight: '500',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Database offline
                  </p>
                </>
              ) : (
                <>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#EF4444',
                    borderRadius: '50%'
                  }} />
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#EF4444',
                    fontWeight: '500',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Connection error
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <NotificationBell 
            onNavigate={onNavigate}
            color="#4A90E2"
            size={20}
          />
          
          {/* Connection retry button when offline */}
          {(connectionStatus === 'offline' || connectionStatus === 'error') && (
            <button
              onClick={handleConnectionRetry}
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                color: '#EF4444',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                fontFamily: 'Poppins, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#EF4444';
                e.target.style.color = '#ffffff';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#FEF2F2';
                e.target.style.color = '#EF4444';
                e.target.style.transform = 'translateY(0)';
              }}
              title="Retry database connection"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Connection Warning Banner */}
      {(connectionStatus === 'offline' || connectionStatus === 'error') && (
        <div style={{
          backgroundColor: '#FEF2F2',
          borderBottom: '1px solid #FECACA',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1
          }}>
            <AlertCircle size={16} style={{ color: '#EF4444' }} />
            <span style={{
              color: '#DC2626',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Database connection unavailable. Changes will be saved locally.
            </span>
          </div>
          <button
            onClick={handleConnectionRetry}
            style={{
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              fontFamily: 'Poppins, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#DC2626';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#EF4444';
            }}
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px 20px',
        background: 'linear-gradient(135deg, #EBF5FB 0%, #F8FFFE 100%)'
      }}>
        {/* Profile Picture Section */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(74, 144, 226, 0.1)',
          transform: 'translateZ(0)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: '24px',
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Profile Picture
          </h3>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <ProfilePictureUpload 
              user={user}
              onUploadComplete={(imageUrl) => {
                console.log('Profile picture uploaded:', imageUrl);
                showToast('Profile picture updated!', 'success');
              }}
            />
          </div>
          
          <p style={{
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '14px',
            lineHeight: '1.4',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Upload a photo to help others recognize you
          </p>
        </div>

        {/* Profile Information */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(74, 144, 226, 0.1)',
          transform: 'translateZ(0)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1F2937',
                margin: 0,
                fontFamily: 'Poppins, sans-serif'
              }}>
                Profile Information
              </h3>
              
              {/* Database connection status for this section */}
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 
                  connectionStatus === 'connected' ? '#10B981' :
                  connectionStatus === 'connecting' ? '#F59E0B' :
                  '#EF4444',
                animation: connectionStatus === 'connecting' ? 'pulse 2s infinite' : 'none'
              }} />
            </div>

            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                style={{
                  backgroundColor: '#4A90E2',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: 'translateZ(0)',
                  boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
                  fontFamily: 'Poppins, sans-serif'
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
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '8px'
              }}>
                {/* Change indicator */}
                {hasChanges() && !isSaving && (
                  <div style={{
                    fontSize: '12px',
                    color: '#F59E0B',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#F59E0B',
                      borderRadius: '50%'
                    }} />
                    Unsaved changes
                  </div>
                )}
                
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges() || connectionStatus !== 'connected'}
                  style={{
                    backgroundColor: saveSuccess ? '#10B981' : 
                      connectionStatus !== 'connected' ? '#9CA3AF' :
                      hasChanges() ? '#10B981' : '#9CA3AF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (isSaving || !hasChanges() || connectionStatus !== 'connected') ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: (isSaving || !hasChanges() || connectionStatus !== 'connected') ? 0.6 : 1,
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: 'translateZ(0)',
                    boxShadow: hasChanges() && !isSaving && connectionStatus === 'connected' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                    minWidth: '140px',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSaving && hasChanges() && !saveSuccess && connectionStatus === 'connected') {
                      e.target.style.backgroundColor = '#059669';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSaving && hasChanges() && !saveSuccess && connectionStatus === 'connected') {
                      e.target.style.backgroundColor = '#10B981';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }
                  }}
                >
                  {isSaving ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check size={16} />
                      Saved!
                    </>
                  ) : connectionStatus !== 'connected' ? (
                    <>
                      <WifiOff size={16} />
                      Offline
                    </>
                  ) : hasChanges() ? (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      No Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div style={{
            display: 'grid',
            gap: '24px'
          }}>
            {/* Full Name */}
            <div style={{
              transform: 'translateZ(0)',
              transition: 'all 0.3s ease'
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: `2px solid ${isEditing ? '#E5E7EB' : 'transparent'}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: isEditing ? 'white' : '#F9FAFB',
                  color: '#374151',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                  boxShadow: isEditing ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none'
                }}
                onFocus={(e) => {
                  if (isEditing) {
                    e.target.style.borderColor = '#4A90E2';
                    e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.15)';
                  }
                }}
                onBlur={(e) => {
                  if (isEditing) {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  }
                }}
              />
            </div>

            {/* Username */}
            <div style={{
              transform: 'translateZ(0)',
              transition: 'all 0.3s ease'
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your username"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: `2px solid ${isEditing ? '#E5E7EB' : 'transparent'}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: isEditing ? 'white' : '#F9FAFB',
                  color: '#374151',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                  boxShadow: isEditing ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none'
                }}
                onFocus={(e) => {
                  if (isEditing) {
                    e.target.style.borderColor = '#4A90E2';
                    e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.15)';
                  }
                }}
                onBlur={(e) => {
                  if (isEditing) {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  }
                }}
              />
            </div>

            {/* Email (Read-only) */}
            <div style={{
              transform: 'translateZ(0)',
              transition: 'all 0.3s ease'
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid transparent',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: '#F3F4F6',
                  color: '#6B7280',
                  cursor: 'not-allowed',
                  transition: 'all 0.3s ease'
                }}
              />
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                marginTop: '8px',
                fontStyle: 'italic',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Email cannot be changed for security reasons
              </p>
            </div>

            {/* Bio */}
            <div style={{
              transform: 'translateZ(0)',
              transition: 'all 0.3s ease'
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: `2px solid ${isEditing ? '#E5E7EB' : 'transparent'}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: isEditing ? 'white' : '#F9FAFB',
                  color: '#374151',
                  resize: 'vertical',
                  minHeight: '100px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                  boxShadow: isEditing ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none'
                }}
                onFocus={(e) => {
                  if (isEditing) {
                    e.target.style.borderColor = '#4A90E2';
                    e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.15)';
                  }
                }}
                onBlur={(e) => {
                  if (isEditing) {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  }
                }}
              />
            </div>

            {/* Location */}
            <div style={{
              transform: 'translateZ(0)',
              transition: 'all 0.3s ease'
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing}
                placeholder="Your location"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: `2px solid ${isEditing ? '#E5E7EB' : 'transparent'}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: isEditing ? 'white' : '#F9FAFB',
                  color: '#374151',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                  boxShadow: isEditing ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none'
                }}
                onFocus={(e) => {
                  if (isEditing) {
                    e.target.style.borderColor = '#4A90E2';
                    e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.15)';
                  }
                }}
                onBlur={(e) => {
                  if (isEditing) {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  }
                }}
              />
            </div>

            {/* Website */}
            <div style={{
              transform: 'translateZ(0)',
              transition: 'all 0.3s ease'
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!isEditing}
                placeholder="https://your-website.com"
                style={{
                  width: '100%',
                  padding: '16px',
                  border: `2px solid ${isEditing ? '#E5E7EB' : 'transparent'}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: isEditing ? 'white' : '#F9FAFB',
                  color: '#374151',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                  boxShadow: isEditing ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none'
                }}
                onFocus={(e) => {
                  if (isEditing) {
                    e.target.style.borderColor = '#4A90E2';
                    e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.15)';
                  }
                }}
                onBlur={(e) => {
                  if (isEditing) {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(74, 144, 226, 0.1)',
          transform: 'translateZ(0)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: '24px',
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Your Reading Journey
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #EBF5FB 0%, #F0F9FF 100%)',
              border: '1px solid rgba(74, 144, 226, 0.1)'
            }}>
              <BookOpen size={24} style={{ color: '#4A90E2', margin: '0 auto 8px' }} />
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', fontFamily: 'Poppins, sans-serif' }}>12</div>
              <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>Books Read</div>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F0FDF4 0%, #F7FEF7 100%)',
              border: '1px solid rgba(34, 197, 94, 0.1)'
            }}>
              <Clock size={24} style={{ color: '#22C55E', margin: '0 auto 8px' }} />
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', fontFamily: 'Poppins, sans-serif' }}>42h</div>
              <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>Listened</div>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
              border: '1px solid rgba(245, 158, 11, 0.1)'
            }}>
              <Award size={24} style={{ color: '#F59E0B', margin: '0 auto 8px' }} />
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', fontFamily: 'Poppins, sans-serif' }}>7</div>
              <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'Poppins, sans-serif' }}>Achievements</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}