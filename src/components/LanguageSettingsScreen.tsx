import React, { useState, useEffect } from 'react';
import { ChevronDown, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { BackButton } from './BackButton';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { DatabaseService } from '../services/database';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' }
];

const voiceOptions = [
  { id: 'female1', name: 'Sarah (Female)', type: 'Natural' },
  { id: 'male1', name: 'David (Male)', type: 'Natural' },
  { id: 'female2', name: 'Emma (Female)', type: 'Premium' },
  { id: 'male2', name: 'James (Male)', type: 'Premium' }
];

const speedOptions = [
  { id: '0.5', value: 0.5, name: '0.5x', description: 'Very Slow' },
  { id: '0.75', value: 0.75, name: '0.75x', description: 'Slow' },
  { id: '1', value: 1, name: '1x', description: 'Normal' },
  { id: '1.25', value: 1.25, name: '1.25x', description: 'Fast' },
  { id: '1.5', value: 1.5, name: '1.5x', description: 'Very Fast' },
  { id: '1.75', value: 1.75, name: '1.75x', description: 'Faster' },
  { id: '2', value: 2, name: '2x', description: 'Fastest' }
];

export function LanguageSettingsScreen({ onNavigate }) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  // Form state
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState('female1');
  const [selectedSpeed, setSelectedSpeed] = useState('1');
  const [autoDetect, setAutoDetect] = useState(true);
  
  // UI state
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [isSpeedDropdownOpen, setIsSpeedDropdownOpen] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Database connection state
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'offline' | 'error'>('connecting');
  const [lastConnectionCheck, setLastConnectionCheck] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);
  
  // Original data for comparison
  const [originalData, setOriginalData] = useState({
    language: 'en',
    voice_id: 'female1',
    speed_id: '1',
    auto_detect: true
  });
  
  const selectedLangData = languages.find(lang => lang.code === selectedLanguage);
  const selectedVoiceData = voiceOptions.find(voice => voice.id === selectedVoice);
  const selectedSpeedData = speedOptions.find(speed => speed.id === selectedSpeed);

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

  // Load user preferences from database
  const loadUserPreferences = async () => {
    if (!user?.id) {
      console.log('❌ No user ID available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('📋 Loading user preferences...');
      
      const result = await DatabaseService.getUserPreferences(user.id);
      
      if (result.success && result.data) {
        const prefs = result.data;
        console.log('✅ Loaded preferences:', prefs);
        
        // Update form state
        setSelectedLanguage(prefs.audio?.language || 'en');
        setSelectedVoice(prefs.audio?.voice_id || 'female1');
        setSelectedSpeed(prefs.audio?.playback_speed?.toString() || '1');
        setAutoDetect(prefs.audio?.auto_detect_language !== false);
        
        // Update original data for comparison
        setOriginalData({
          language: prefs.audio?.language || 'en',
          voice_id: prefs.audio?.voice_id || 'female1',
          speed_id: prefs.audio?.playback_speed?.toString() || '1',
          auto_detect: prefs.audio?.auto_detect_language !== false
        });
        
        // Show toast if using defaults
        if (result.data.isDefault) {
          showToast('Using default audio settings. Customize them to your preference!', 'info');
        }
      } else {
        console.log('⚠️ Failed to load preferences, using defaults');
        showToast('Using default audio settings. Unable to load saved preferences.', 'info');
      }
    } catch (error) {
      console.error('❌ Error loading preferences:', error);
      showToast('Failed to load audio settings. Using defaults.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if settings have changed from original
  const hasChanges = () => {
    return (
      selectedLanguage !== originalData.language ||
      selectedVoice !== originalData.voice_id ||
      selectedSpeed !== originalData.speed_id ||
      autoDetect !== originalData.auto_detect
    );
  };

  // Save settings to database
  const handleSaveSettings = async () => {
    if (!user?.id) {
      showToast('Unable to save - no user logged in', 'error');
      return;
    }

    // Check connection before saving
    if (connectionStatus !== 'connected') {
      showToast('Cannot save changes - database connection unavailable. Please check your connection and try again.', 'error');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      console.log('💾 Saving audio settings...');
      
      // Get current voice data
      const selectedVoiceData = voiceOptions.find(voice => voice.id === selectedVoice);
      const selectedSpeedData = speedOptions.find(speed => speed.id === selectedSpeed);
      
      // Prepare audio settings
      const audioSettings = {
        language: selectedLanguage,
        voice_id: selectedVoice,
        voice_name: selectedVoiceData?.name || 'Sarah (Female)',
        voice_type: selectedVoiceData?.type as 'Natural' | 'Premium' || 'Natural',
        playback_speed: selectedSpeedData?.value || 1.0,
        auto_detect_language: autoDetect
      };

      console.log('💾 Saving settings:', audioSettings);
      
      // Save to database
      const result = await DatabaseService.updateAudioSettings(user.id, audioSettings);

      if (result.success) {
        console.log('✅ Settings saved successfully');
        
        // Update original data to match saved data
        setOriginalData({
          language: selectedLanguage,
          voice_id: selectedVoice,
          speed_id: selectedSpeed,
          auto_detect: autoDetect
        });
        
        // Show success state briefly
        setSaveSuccess(true);
        
        // Show success toast
        showToast('Audio settings saved successfully!', 'success');
        
        // Brief delay to show success state, then navigate back
        setTimeout(() => {
          setShowSaveMessage(true);
          
          // Auto-hide message after 2 seconds
          setTimeout(() => {
            setShowSaveMessage(false);
            setSaveSuccess(false);
            onNavigate('profile');
          }, 2000);
        }, 800);
        
      } else {
        throw new Error(result.error || 'Failed to save audio settings');
      }
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      
      // Check if it's a connection error
      if (error.message.includes('unavailable') || error.message.includes('timeout')) {
        setConnectionStatus('offline');
        showToast('Connection lost while saving. Your changes will be saved when connection is restored.', 'error');
      } else {
        showToast('Failed to save audio settings. Please try again.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Manual connection retry
  const handleConnectionRetry = () => {
    setRetryCount(0);
    checkDatabaseConnection();
    showToast('Checking database connection...', 'info');
  };

  // Load preferences on component mount
  useEffect(() => {
    loadUserPreferences();
    checkDatabaseConnection();
  }, [user?.id]);

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

  // Periodic connection checks
  useEffect(() => {
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

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #F3F4F6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BackButton 
            onClick={() => onNavigate('back')}
            title="Go back to profile"
            aria-label="Return to profile screen"
            disabled={isSaving}
          />
          
          {/* Connection status indicator */}
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
        
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#374151',
            margin: 0
          }}>
            Audio Settings
          </h2>
          
          {/* Connection status text */}
          <p style={{ 
            fontSize: '12px', 
            color: connectionStatus === 'connected' ? '#10B981' : 
                   connectionStatus === 'connecting' ? '#F59E0B' : '#EF4444',
            fontWeight: '500',
            fontFamily: 'Poppins, sans-serif',
            margin: '2px 0 0 0'
          }}>
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'connecting' ? 'Connecting...' :
             connectionStatus === 'offline' ? 'Offline' : 'Connection Error'}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      {/* Success Message */}
      {showSaveMessage && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '1rem',
          right: '1rem',
          backgroundColor: '#10B981',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 1001,
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <span style={{ fontSize: '1.25rem' }}>✅</span>
          <div>
            <p style={{
              fontSize: '1rem',
              fontWeight: '600',
              margin: 0,
              fontFamily: 'Poppins, sans-serif'
            }}>
              Settings Saved!
            </p>
            <p style={{
              fontSize: '0.875rem',
              margin: 0,
              opacity: 0.9,
              fontFamily: 'Poppins, sans-serif'
            }}>
              Your audio preferences have been updated.
            </p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #E5E7EB',
            borderTopColor: '#4A90E2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <p style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#374151',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Loading audio settings...
          </p>
        </div>
      )}

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem'
      }}>
        {/* Auto-detect toggle */}
        <div style={{
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: '#F9FAFB',
          borderRadius: '0.75rem',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              margin: 0
            }}>
              Auto-detect Language
            </h3>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '50px',
              height: '24px'
            }}>
              <input
                type="checkbox"
                checked={autoDetect}
                onChange={(e) => setAutoDetect(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: autoDetect ? '#4A90E2' : '#E5E7EB',
                borderRadius: '24px',
                transition: '0.4s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '',
                  height: '18px',
                  width: '18px',
                  left: autoDetect ? '29px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.4s'
                }} />
              </span>
            </label>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#6B7280',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Automatically detect the language of uploaded PDFs for optimal audio conversion.
          </p>
        </div>

        {/* Language Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            Default Language
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#6B7280',
            marginBottom: '1rem',
            lineHeight: '1.5'
          }}>
            Choose your preferred language for the app interface and audio conversion.
          </p>
          
          {/* Language Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.2s ease',
                fontSize: '1rem'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{selectedLangData?.flag}</span>
                <div>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#374151',
                    display: 'block'
                  }}>
                    {selectedLangData?.name}
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#6B7280'
                  }}>
                    {selectedLangData?.nativeName}
                  </span>
                </div>
              </div>
              <ChevronDown 
                size={20} 
                color="#6B7280"
                style={{
                  transform: isLanguageDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {isLanguageDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => {
                      setSelectedLanguage(language.code);
                      setIsLanguageDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      backgroundColor: selectedLanguage === language.code ? '#EBF4FF' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'Poppins, sans-serif',
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid #F3F4F6'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedLanguage !== language.code) {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedLanguage !== language.code) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>{language.flag}</span>
                      <div>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: '500',
                          color: selectedLanguage === language.code ? '#4A90E2' : '#374151',
                          display: 'block'
                        }}>
                          {language.name}
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          color: '#6B7280'
                        }}>
                          {language.nativeName}
                        </span>
                      </div>
                    </div>
                    {selectedLanguage === language.code && (
                      <span style={{
                        fontSize: '1.25rem',
                        color: '#4A90E2'
                      }}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Voice Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            Voice Settings for {selectedLangData?.name}
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#6B7280',
            marginBottom: '1rem',
            lineHeight: '1.5'
          }}>
            Select your preferred voice for audio playback in {selectedLangData?.name}.
          </p>
          
          {/* Voice Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.2s ease',
                fontSize: '1rem'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#4A90E2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  🎤
                </div>
                <div>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#374151',
                    display: 'block'
                  }}>
                    {selectedVoiceData?.name}
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    color: selectedVoiceData?.type === 'Premium' ? '#F59E0B' : '#6B7280'
                  }}>
                    {selectedVoiceData?.type} {selectedVoiceData?.type === 'Premium' && '⭐'}
                  </span>
                </div>
              </div>
              <ChevronDown 
                size={20} 
                color="#6B7280"
                style={{
                  transform: isVoiceDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {isVoiceDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {voiceOptions.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => {
                      setSelectedVoice(voice.id);
                      setIsVoiceDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      backgroundColor: selectedVoice === voice.id ? '#EBF4FF' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'Poppins, sans-serif',
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid #F3F4F6'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedVoice !== voice.id) {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedVoice !== voice.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: selectedVoice === voice.id ? '#4A90E2' : '#F3F4F6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}>
                        🎤
                      </div>
                      <div>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: '500',
                          color: selectedVoice === voice.id ? '#4A90E2' : '#374151',
                          display: 'block'
                        }}>
                          {voice.name}
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          color: voice.type === 'Premium' ? '#F59E0B' : '#6B7280'
                        }}>
                          {voice.type} {voice.type === 'Premium' && '⭐'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          backgroundColor: '#F3F4F6',
                          border: 'none',
                          borderRadius: '0.5rem',
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.75rem',
                          color: '#6B7280',
                          cursor: 'pointer'
                        }}
                      >
                        Preview
                      </button>
                      {selectedVoice === voice.id && (
                        <span style={{
                          fontSize: '1.25rem',
                          color: '#4A90E2'
                        }}>
                          ✓
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reading Speed Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            Reading Speed
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: '#6B7280',
            marginBottom: '1rem',
            lineHeight: '1.5'
          }}>
            Adjust the playback speed for your audio books to match your preferred listening pace.
          </p>
          
          {/* Speed Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsSpeedDropdownOpen(!isSpeedDropdownOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.2s ease',
                fontSize: '1rem'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#4A90E2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  ⚡
                </div>
                <div>
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#374151',
                    display: 'block'
                  }}>
                    {selectedSpeedData?.name} Speed
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#6B7280'
                  }}>
                    {selectedSpeedData?.description}
                  </span>
                </div>
              </div>
              <ChevronDown 
                size={20} 
                color="#6B7280"
                style={{
                  transform: isSpeedDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {isSpeedDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.5rem',
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {speedOptions.map((speed) => (
                  <button
                    key={speed.id}
                    onClick={() => {
                      setSelectedSpeed(speed.id);
                      setIsSpeedDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      backgroundColor: selectedSpeed === speed.id ? '#EBF4FF' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'Poppins, sans-serif',
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid #F3F4F6'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSpeed !== speed.id) {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSpeed !== speed.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: selectedSpeed === speed.id ? '#4A90E2' : '#F3F4F6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}>
                        ⚡
                      </div>
                      <div>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: '500',
                          color: selectedSpeed === speed.id ? '#4A90E2' : '#374151',
                          display: 'block'
                        }}>
                          {speed.name} Speed
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          color: '#6B7280'
                        }}>
                          {speed.description}
                        </span>
                      </div>
                    </div>
                    {selectedSpeed === speed.id && (
                      <span style={{
                        fontSize: '1.25rem',
                        color: '#4A90E2'
                      }}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div style={{ marginTop: '2rem' }}>
          {/* Change indicator */}
          {hasChanges() && !isSaving && (
            <div style={{
              marginBottom: '16px',
              fontSize: '14px',
              color: '#F59E0B',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Poppins, sans-serif',
              textAlign: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#F59E0B',
                borderRadius: '50%'
              }} />
              You have unsaved changes
            </div>
          )}
          
          <button
            onClick={handleSaveSettings}
            disabled={isSaving || !hasChanges() || connectionStatus !== 'connected'}
            style={{
              width: '100%',
              padding: '1rem 2rem',
              backgroundColor: saveSuccess ? '#10B981' : 
                connectionStatus !== 'connected' ? '#9CA3AF' :
                hasChanges() ? '#4A90E2' : '#9CA3AF',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: (isSaving || !hasChanges() || connectionStatus !== 'connected') ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.3s ease',
              boxShadow: hasChanges() && !isSaving && connectionStatus === 'connected' ? '0 4px 12px rgba(74, 144, 226, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: (isSaving || !hasChanges() || connectionStatus !== 'connected') ? 0.7 : 1,
              minHeight: '56px'
            }}
            onMouseEnter={(e) => {
              if (!isSaving && hasChanges() && !saveSuccess && connectionStatus === 'connected') {
                e.target.style.backgroundColor = '#357ABD';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(74, 144, 226, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving && hasChanges() && !saveSuccess && connectionStatus === 'connected') {
                e.target.style.backgroundColor = '#4A90E2';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.3)';
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
                Saving Settings...
              </>
            ) : saveSuccess ? (
              <>
                <span style={{ fontSize: '1.25rem' }}>✅</span>
                Settings Saved!
              </>
            ) : connectionStatus !== 'connected' ? (
              <>
                <WifiOff size={16} />
                Connection Required
              </>
            ) : hasChanges() ? (
              <>
                <span style={{ fontSize: '1.25rem' }}>💾</span>
                Save Audio Settings
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.25rem' }}>✓</span>
                No Changes to Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}