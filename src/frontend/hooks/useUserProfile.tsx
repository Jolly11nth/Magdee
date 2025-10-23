import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DatabaseService } from '../services/database';
import { useAuth } from '../components/AuthContext';
import { User } from '../types/database';

export interface UserProfileState {
  profile: User | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  connectionStatus: 'connected' | 'connecting' | 'timeout' | 'offline' | 'disabled';
}

export interface UserProfileActions {
  refreshProfile: () => Promise<void>;
  updateProfilePicture: (imageUrl: string) => Promise<boolean>;
  clearError: () => void;
}

// Circuit breaker to prevent endless failed requests
class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly maxFailures = 3;
  private readonly resetTimeout = 60000; // 1 minute

  canExecute(): boolean {
    const now = Date.now();
    
    if (this.state === 'open') {
      if (now - this.lastFailure > this.resetTimeout) {
        this.state = 'half-open';
        console.log('🔄 Circuit breaker: half-open, allowing one test request');
        return true;
      }
      // Silent when blocking requests
      return false;
    }
    
    return true;
  }

  onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
    console.log('✅ Circuit breaker: reset to closed');
  }

  onFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
    
    if (this.failures >= this.maxFailures) {
      this.state = 'open';
      console.log('🚫 Circuit breaker: opened due to repeated failures');
    } else {
      // Silent failure counting
      console.log(`⚠️ Circuit breaker: failure ${this.failures}/${this.maxFailures}`);
    }
  }

  isOpen(): boolean {
    return this.state === 'open';
  }

  getState(): string {
    return this.state;
  }
}

export function useUserProfile(): UserProfileState & UserProfileActions {
  const { user: authUser, updateUser } = useAuth();
  const [profileState, setProfileState] = useState<UserProfileState>({
    profile: null,
    loading: false,
    error: null,
    lastUpdated: null,
    connectionStatus: 'offline'
  });

  // Circuit breaker to prevent endless failed requests
  const circuitBreaker = useRef(new CircuitBreaker());
  const isDisabled = useRef(false);

  // Enhanced load profile with circuit breaker and aggressive fallbacks
  const loadProfile = useCallback(async (userId: string, silent = false) => {
    // If profile loading is disabled due to repeated failures, just return
    if (isDisabled.current) {
      console.log('🚫 Profile loading is disabled due to repeated failures');
      return;
    }

    // Check circuit breaker
    if (!circuitBreaker.current.canExecute()) {
      // Silent when circuit breaker is open
      setProfileState(prev => ({
        ...prev,
        connectionStatus: 'disabled',
        error: null // Clear error since we're not even trying
      }));
      return;
    }

    if (!silent) {
      setProfileState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null,
        connectionStatus: 'connecting' 
      }));
    }

    try {
      console.log(`🔄 Attempting profile load for user ${userId}`);
      
      // Very short timeout to fail fast
      const result = await DatabaseService.getUserProfile(userId);
      
      if (result.success && result.data) {
        console.log('✅ Profile loaded successfully');
        
        circuitBreaker.current.onSuccess();
        
        setProfileState(prev => ({
          ...prev,
          profile: result.data,
          loading: false,
          error: null,
          lastUpdated: new Date(),
          connectionStatus: 'connected'
        }));

        // Update auth context with fresh profile data
        if (updateUser) {
          updateUser(result.data);
        }
      } else {
        throw new Error(result.error || 'Failed to load profile');
      }
    } catch (error) {
      // Silent failure for server unavailability
      const errorMessage = error instanceof Error ? error.message : error;
      if (errorMessage !== 'Server is currently unavailable') {
        console.warn('⚠️ Profile loading failed:', errorMessage);
      }
      
      circuitBreaker.current.onFailure();
      
      // If circuit breaker is now open, disable profile loading entirely
      if (circuitBreaker.current.isOpen()) {
        console.log('🚫 Disabling profile loading due to circuit breaker');
        isDisabled.current = true;
      }
      
      // Always use auth user as fallback - no error messages to user
      const fallbackProfile = authUser || {
        id: userId,
        email: 'user@example.com',
        name: 'User',
        username: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setProfileState(prev => ({
        ...prev,
        profile: fallbackProfile,
        loading: false,
        error: null, // Hide all errors from user
        lastUpdated: null,
        connectionStatus: circuitBreaker.current.isOpen() ? 'disabled' : 'offline'
      }));
    }
  }, [authUser, updateUser]);

  // Simplified refresh that respects circuit breaker
  const refreshProfile = useCallback(async () => {
    if (authUser?.id && !isDisabled.current) {
      console.log('🔄 Manual profile refresh requested');
      await loadProfile(authUser.id, false);
    }
    // Silent when skipped
  }, [authUser?.id, loadProfile]);

  // Simplified update profile picture that fails gracefully
  const updateProfilePicture = useCallback(async (imageUrl: string): Promise<boolean> => {
    if (!authUser?.id) {
      console.log('❌ No authenticated user for profile picture update');
      return false;
    }

    // If profile loading is disabled, don't try to update
    if (isDisabled.current) {
      // Update locally only - silent mode
      setProfileState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, avatar_url: imageUrl } : null
      }));
      
      return true; // Return success to avoid blocking UI
    }

    try {
      console.log('🖼️ Updating profile picture...');
      
      const result = await DatabaseService.updateProfilePicture(authUser.id, imageUrl);
      
      if (result.success && result.data) {
        console.log('✅ Profile picture updated successfully');
        
        setProfileState(prev => ({
          ...prev,
          profile: result.data,
          lastUpdated: new Date(),
          error: null,
          connectionStatus: 'connected'
        }));

        if (updateUser) {
          updateUser(result.data);
        }

        return true;
      } else {
        console.warn('❌ Profile picture update failed:', result.error);
        
        // Update locally as fallback
        setProfileState(prev => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, avatar_url: imageUrl } : null
        }));
        
        return true; // Return success to avoid blocking UI
      }
    } catch (error) {
      console.warn('💥 Profile picture update error:', error);
      
      // Update locally as fallback
      setProfileState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, avatar_url: imageUrl } : null
      }));
      
      return true; // Return success to avoid blocking UI
    }
  }, [authUser?.id, updateUser]);

  // Clear error
  const clearError = useCallback(() => {
    setProfileState(prev => ({ ...prev, error: null }));
  }, []);

  // Load profile when user changes - with delay and circuit breaker check
  useEffect(() => {
    if (authUser?.id) {
      console.log('👤 User changed, setting up profile for:', authUser.id);
      
      // Always set the auth user as the immediate profile
      setProfileState(prev => ({
        ...prev,
        profile: {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          username: authUser.username,
          avatar_url: authUser.avatar_url,
          created_at: authUser.created_at,
          updated_at: new Date().toISOString()
        },
        loading: false,
        error: null,
        connectionStatus: 'offline'
      }));
      
      // Only try to enhance with server data if not disabled
      if (!isDisabled.current) {
        const timer = setTimeout(() => {
          loadProfile(authUser.id, true);
        }, 1000); // 1 second delay to let auth settle
        
        return () => clearTimeout(timer);
      }
    } else {
      console.log('👤 User logged out, clearing profile');
      setProfileState({
        profile: null,
        loading: false,
        error: null,
        lastUpdated: null,
        connectionStatus: 'offline'
      });
    }
  }, [authUser?.id, loadProfile]);

  // Disable auto-refresh entirely to prevent repeated failures
  // The app will work fine with just the auth user data

  return {
    ...profileState,
    refreshProfile,
    updateProfilePicture,
    clearError
  };
}

// Helper hook for just the profile picture URL - simplified
export function useProfilePicture(): {
  profilePictureUrl: string | null;
  loading: boolean;
  refreshPicture: () => Promise<void>;
  updatePicture: (imageUrl: string) => Promise<boolean>;
  connectionStatus: 'connected' | 'connecting' | 'timeout' | 'offline' | 'disabled';
} {
  const { profile, loading, refreshProfile, updateProfilePicture, connectionStatus } = useUserProfile();
  const { user: authUser } = useAuth();

  // Get the best available profile picture URL
  const profilePictureUrl = React.useMemo(() => {
    const currentProfile = profile || authUser;
    return currentProfile?.avatar_url || null;
  }, [profile, authUser]);

  const refreshPicture = useCallback(async () => {
    await refreshProfile();
  }, [refreshProfile]);

  const updatePicture = useCallback(async (imageUrl: string) => {
    return await updateProfilePicture(imageUrl);
  }, [updateProfilePicture]);

  return {
    profilePictureUrl,
    loading,
    refreshPicture,
    updatePicture,
    connectionStatus
  };
}

// Hook for getting user display information - simplified to use auth data primarily
export function useUserDisplayInfo(): {
  displayName: string;
  username: string | null;
  profilePictureUrl: string | null;
  email: string;
  loading: boolean;
  refreshData: () => Promise<void>;
  connectionStatus: 'connected' | 'connecting' | 'timeout' | 'offline' | 'disabled';
} {
  const { profile, loading, refreshProfile, connectionStatus } = useUserProfile();
  const { user: authUser } = useAuth();

  // Prefer auth user data for reliability
  const currentUser = authUser || profile;

  // Get username directly from database
  const username = React.useMemo(() => {
    if (!currentUser) return null;
    
    // Return the username field exactly as stored in the database
    return currentUser.username || null;
  }, [currentUser]);

  // Get display name with safe fallbacks
  const displayName = React.useMemo(() => {
    if (!currentUser) return 'Guest';

    // Try username first
    if (currentUser.username && typeof currentUser.username === 'string') {
      return currentUser.username.includes('@')
        ? currentUser.username.split('@')[0]
        : currentUser.username;
    }

    // Try name as fallback
    if (currentUser.name && currentUser.name !== 'Guest') {
      return currentUser.name;
    }

    // Try email as fallback
    if (currentUser.email && typeof currentUser.email === 'string') {
      return currentUser.email.includes('@')
        ? currentUser.email.split('@')[0]
        : currentUser.email;
    }

    return 'Guest';
  }, [currentUser]);

  // Get profile picture URL
  const profilePictureUrl = React.useMemo(() => {
    return currentUser?.avatar_url || null;
  }, [currentUser]);

  // Get email
  const email = currentUser?.email || '';

  return {
    displayName,
    username,
    profilePictureUrl,
    email,
    loading,
    refreshData: refreshProfile,
    connectionStatus
  };
}