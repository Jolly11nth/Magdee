import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { errorAnalytics } from '../services/errorAnalytics';

interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: any;
  signUp: (email: string, password: string, name: string, username?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (emailOrUsername: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updatedData: Partial<User>) => void;
  updateUser?: (updatedUser: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Request deduplication for profile loading
  const [profileLoadingPromises, setProfileLoadingPromises] = useState<Map<string, Promise<void>>>(new Map());
  
  // Track if we're already initializing to prevent duplicate session requests
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Circuit breaker for profile loading - prevent repeated failures
  const [profileLoadFailures, setProfileLoadFailures] = useState<Map<string, { count: number; lastFailure: number }>>(new Map());

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Get initial session with timeout and fallback
    const getInitialSession = async () => {
      if (isInitializing) {
        console.log('🔄 Session initialization already in progress - skipping');
        return;
      }
      
      setIsInitializing(true);
      
      try {
        console.log('🚀 Starting initial session check...');
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted && initialLoad) {
            console.log('⏰ Session check timeout - proceeding without auth');
            setLoading(false);
            setInitialLoad(false);
            setIsInitializing(false);
          }
        }, 8000); // Increased to 8 seconds to allow for slower connections

        // Add timeout to the session request itself  
        let sessionResult;
        let sessionAttempts = 0;
        const maxSessionAttempts = 2;
        let currentSessionController = new AbortController();
        let currentSessionTimeoutId = setTimeout(() => {
          console.warn('⏰ Session request timeout after 6 seconds - aborting');
          currentSessionController.abort();
        }, 6000);

        while (sessionAttempts < maxSessionAttempts) {
          try {
            sessionAttempts++;
            console.log(`🔄 Session attempt ${sessionAttempts}/${maxSessionAttempts}`);
            
            sessionResult = await Promise.race([
              supabase.auth.getSession(),
              new Promise((_, reject) => {
                currentSessionController.signal.addEventListener('abort', () => {
                  reject(new Error('Session request timeout'));
                });
              })
            ]);
            clearTimeout(currentSessionTimeoutId);
            break; // Success, exit retry loop
            
          } catch (sessionError) {
            clearTimeout(currentSessionTimeoutId);
            
            if (sessionError.message.includes('timeout') || sessionError.name === 'AbortError') {
              if (sessionAttempts >= maxSessionAttempts) {
                console.log('⏰ Session request timeout after retries - proceeding without session (this is normal for slower connections)');
                if (mounted) {
                  clearTimeout(timeoutId);
                  setLoading(false);
                  setInitialLoad(false);
                  setIsInitializing(false);
                }
                return;
              } else {
                console.log(`⏰ Session attempt ${sessionAttempts} timed out, retrying in 1 second...`);
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Create new controller for retry
                currentSessionController = new AbortController();
                currentSessionTimeoutId = setTimeout(() => {
                  console.warn(`⏰ Session request timeout after 6 seconds - aborting attempt ${sessionAttempts + 1}`);
                  currentSessionController.abort();
                }, 6000);
                continue; // Retry
              }
            }
            throw sessionError; // Non-timeout error, rethrow
          }
        }
        
        if (!mounted) return;

        // Clear timeout since we got a response
        clearTimeout(timeoutId);

        const { data: { session }, error } = sessionResult;

        if (error) {
          console.error('❌ Error getting session:', error);
          // Only track significant errors, not routine auth errors
          if (!error.message.includes('timeout') && !error.message.includes('network')) {
            errorAnalytics.trackAuthError('session_load', error.message, 'app_init').catch(err => {
              console.warn('Failed to track session error:', err);
            });
          }
          // Don't block the app for auth errors
          setLoading(false);
          setInitialLoad(false);
          setIsInitializing(false);
          return;
        }

        console.log('✅ Session check complete:', session ? 'Authenticated' : 'Not authenticated');
        setSession(session);

        if (session?.user) {
          // First create immediate fallback user to prevent undefined access
          const immediateUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || undefined,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at || new Date().toISOString(),
          };
          setUser(immediateUser);
          console.log('✅ Set immediate fallback user:', immediateUser.name);

          // Skip enhanced profile loading during initialization to prevent conflicts
          // The useUserProfile hook will handle this more robustly
          console.log('ℹ️ Skipping enhanced profile loading during init - will be handled by useUserProfile hook');
        }

        setLoading(false);
        setInitialLoad(false);
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
        // Only track significant errors, not routine timeouts
        if (!(error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout')))) {
          errorAnalytics.trackAuthError('session_load', error instanceof Error ? error.message : 'Unknown error', 'app_init').catch(err => {
            console.warn('Failed to track session init error:', err);
          });
        }
        
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);  
          setInitialLoad(false);
          setIsInitializing(false);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      console.log('🔄 Session details:', {
        accessToken: session?.access_token ? 'present' : 'missing',
        refreshToken: session?.refresh_token ? 'present' : 'missing',
        expiresAt: session?.expires_at,
        userId: session?.user?.id
      });
      
      if (!mounted) return;

      setSession(session);
      
      if (session?.user) {
        console.log('👤 User authenticated, setting immediate user data...');
        
        // Always set immediate fallback user first for UI responsiveness
        const immediateUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || 'User',
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || undefined,
          avatar_url: session.user.user_metadata?.avatar_url,
          created_at: session.user.created_at || new Date().toISOString(),
        };
        setUser(immediateUser);
        console.log('✅ Set immediate user for UI:', immediateUser.name);

        // Skip enhanced profile loading during auth changes to prevent conflicts
        // The useUserProfile hook will handle this more robustly
        console.log('ℹ️ Skipping enhanced profile loading - will be handled by useUserProfile hook');
      } else {
        console.log('👤 No user session, clearing user state');
        setUser(null);
      }
      
      // Only set loading to false if this isn't the initial load
      if (!initialLoad) {
        console.log('🔄 Setting loading to false (not initial load)');
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      
      // Clear any pending profile loading promises and failures
      setProfileLoadingPromises(new Map());
      setProfileLoadFailures(new Map());
    };
  }, [initialLoad]);

  // Simplified loadUserProfile - removed since useUserProfile hook handles this better
  const loadUserProfile = async (userId: string) => {
    console.log('ℹ️ Profile loading has been moved to useUserProfile hook for better reliability');
    // This function is now a no-op since useUserProfile handles profile loading
    return;
  };

  const signUp = async (email: string, password: string, name: string, username?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      console.log('🔐 Starting signup process for:', email);
      
      // Call server endpoint to create user with timeout
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/auth/signup`;
      console.log('📡 Calling signup endpoint:', serverUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for signup

      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          username,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('📡 Signup response status:', response.status);
      
      let result;
      try {
        result = await response.json();
        console.log('📄 Signup response data:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse signup response JSON:', parseError);
        const responseText = await response.text().catch(() => 'Unable to read response');
        console.error('📄 Raw response text:', responseText);
        return { success: false, error: 'Server returned invalid response' };
      }

      if (!response.ok) {
        // Log the full response for debugging
        console.log('📡 Full signup error response:', {
          status: response.status,
          statusText: response.statusText,
          result: result
        });
        
        // Handle specific error cases first - be more comprehensive in error detection
        if ((response.status === 400 || response.status === 422) && result.error && (
          result.error.includes('already been registered') ||
          result.error.includes('already exists') ||
          result.error.includes('email address has already been registered') ||
          result.error.includes('a user with this email address has already been registered') ||
          result.error.toLowerCase().includes('already registered') ||
          (result.error.toLowerCase().includes('email') && result.error.toLowerCase().includes('exist'))
        )) {
          console.log('ℹ️ User attempted signup with existing email:', email);
          // Return the exact message from server for consistent parsing
          return { 
            success: false, 
            error: result.error || 'A user with this email address has already been registered' 
          };
        }
        
        // Log other signup failures as errors
        console.error('❌ Signup failed with status:', response.status, 'Error:', result.error);
        
        // Track signup error for actual errors (not expected behavior)
        await errorAnalytics.trackAuthError('signup', result.error || `HTTP ${response.status}`, 'signup', undefined, {
          email_provided: !!email,
          name_provided: !!name,
          username_provided: !!username,
          status_code: response.status
        });
        
        // Handle username errors
        if (result.error && result.error.includes('username') && result.error.includes('taken')) {
          return { 
            success: false, 
            error: result.error 
          };
        }
        
        return { success: false, error: result.error || `Server error (${response.status})` };
      }

      console.log('✅ User created successfully, now signing in...');

      // Now sign in the user
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('❌ Sign in error after signup:', signInError);
        await errorAnalytics.trackAuthError('signin', signInError.message, 'post_signup', undefined, {
          context: 'automatic_signin_after_signup'
        });
        return { success: false, error: signInError.message };
      }

      console.log('🎉 Signup and signin completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error in signUp:', error);
      
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error && error.name === 'AbortError') {
        errorMessage = 'Request timeout - please try again';
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error - please check your connection';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Track signup error
      await errorAnalytics.trackAuthError('signup', errorMessage, 'signup', undefined, {
        error_type: error instanceof Error ? error.constructor.name : 'UnknownError',
        is_network_error: error instanceof TypeError && error.message.includes('fetch'),
        is_timeout: error instanceof Error && error.name === 'AbortError'
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (emailOrUsername: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      console.log('🔐 Starting signin process for:', emailOrUsername);
      console.log('🔐 Supabase client configured:', !!supabase);
      console.log('🔐 Project ID:', projectId);
      console.log('🔐 Public anon key length:', publicAnonKey?.length);
      
      // Determine if input is email or username
      const isEmail = emailOrUsername.includes('@');
      console.log('📧 Input type detected:', isEmail ? 'email' : 'username');
      
      let actualEmail = emailOrUsername;
      
      // If it's a username, we need to look up the email address
      if (!isEmail) {
        try {
          console.log('👤 Looking up email for username:', emailOrUsername);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout for username lookup
          
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/auth/lookup-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: emailOrUsername }),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const result = await response.json();
            actualEmail = result.email;
            console.log('✅ Email found for username');
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ Username lookup failed:', errorData);
            return { success: false, error: 'Invalid username or password' };
          }
        } catch (lookupError) {
          console.error('❌ Error looking up email for username:', lookupError);
          return { success: false, error: 'Invalid username or password' };
        }
      }
      
      console.log('🔐 Attempting Supabase auth signin with email:', actualEmail);
      
      // Add timeout to signin request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout for signin

      const signInPromise = supabase.auth.signInWithPassword({
        email: actualEmail,
        password,
      });

      console.log('🔐 Supabase signInWithPassword called, waiting for response...');

      const { data: { session }, error } = await Promise.race([
        signInPromise,
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('Request timeout'));
          });
        })
      ]) as any;

      clearTimeout(timeoutId);
      
      console.log('🔐 Supabase auth response received:');
      console.log('  - Session:', !!session);
      console.log('  - User:', session?.user?.email);
      console.log('  - Error:', error?.message);

      if (error) {
        console.error('❌ Sign in error:', error);
        console.error('❌ Full error object:', JSON.stringify(error, null, 2));
        
        await errorAnalytics.trackAuthError('signin', error.message, 'signin', undefined, {
          error_code: error.status,
          error_name: error.name,
          input_type: isEmail ? 'email' : 'username',
          full_error: JSON.stringify(error)
        });
        
        // Return user-friendly error message
        if (error.message.includes('Invalid login') || error.message.includes('Invalid credentials')) {
          return { success: false, error: isEmail ? 'Invalid email or password' : 'Invalid username or password' };
        }
        
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Please verify your email address before signing in' };
        }
        
        return { success: false, error: error.message };
      }

      console.log('✅ Sign in successful');
      console.log('🔄 Waiting for auth state change...');
      
      // Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error in signIn:', error);
      
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error && error.message.includes('timeout')) {
        errorMessage = 'Request timeout - please try again';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Track signin error
      await errorAnalytics.trackAuthError('signin', errorMessage, 'signin', undefined, {
        error_type: error instanceof Error ? error.constructor.name : 'UnknownError',
        is_timeout: error instanceof Error && error.message.includes('timeout')
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 Signing out...');
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      await errorAnalytics.trackAuthError('signout', error instanceof Error ? error.message : 'Unknown signout error', 'signout', user?.id);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = (updatedData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        ...updatedData
      };
    });
  };

  const updateUser = (updatedUser: User) => {
    console.log('🔄 Updating user in AuthContext:', updatedUser.email);
    setUser(updatedUser);
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    updateUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}