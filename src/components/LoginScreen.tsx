import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import { AuthErrorMessage } from './AuthErrorMessage';
import { useErrorAnalytics } from '../services/errorAnalytics';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function LoginScreen({ onNavigate }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const { trackValidationError, trackUIError } = useErrorAnalytics();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!emailOrUsername || !password) {
      const errorMessage = 'Please enter both email/username and password';
      setError(errorMessage);
      setIsLoading(false);
      
      // Track validation error
      try {
        if (!emailOrUsername && !password) {
          await trackValidationError('email_password', 'Both email/username and password required', 'login', { email: !!emailOrUsername, password: !!password });
        } else if (!emailOrUsername) {
          await trackValidationError('email', 'Email or username required', 'login', { password: !!password });
        } else if (!password) {
          await trackValidationError('password', 'Password required', 'login', { email: !!emailOrUsername });
        }
      } catch (trackingError) {
        console.warn('Failed to track validation error:', trackingError);
      }
      
      return;
    }

    try {
      const result = await signIn(emailOrUsername, password);
      
      if (result.success) {
        onNavigate('home');
      } else {
        // Set the raw error - let AuthErrorMessage component handle parsing and display
        setError(result.error || 'Failed to sign in');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await trackUIError('google_signin_button', 'Google OAuth not yet implemented', 'login');
      setError('Google sign-in will be available soon');
    } catch (trackingError) {
      console.warn('Failed to track UI error:', trackingError);
      setError('Google sign-in will be available soon');
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '2rem',
        paddingTop: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <ImageWithFallback
            src="/assets/images/magdee-logo.png"
            alt="Magdee Logo"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain'
            }}
          />
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#4A90E2'
          }}>
            Magdee
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        marginBottom: '1.5rem',
        backgroundColor: '#F8F9FA',
        borderRadius: '1rem',
        padding: '4px'
      }}>
        <div style={{ flex: 1 }}>
          <button
            onClick={() => onNavigate('signup')}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6B7280',
              fontWeight: '500',
              cursor: 'pointer',
              borderRadius: '0.75rem',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Sign up
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            padding: '0.75rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'white',
            color: '#4A90E2',
            fontWeight: '600',
            borderRadius: '0.75rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Sign in
          </div>
        </div>
      </div>

      {/* Enhanced Error Message */}
      {error && (
        <AuthErrorMessage
          error={error}
          messageType="error"
          onDismiss={() => setError('')}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ flex: 1 }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            color: '#374151',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Email or Username
          </label>
          <input
            type="text"
            placeholder="Enter your email or username"
            value={emailOrUsername}
            onChange={(e) => {
              setEmailOrUsername(e.target.value);
              setError('');
            }}
            disabled={isLoading}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: isLoading ? '#F3F4F6' : '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '0.75rem',
              padding: '0 1rem',
              fontSize: '1rem',
              color: '#374151',
              fontFamily: 'Poppins, sans-serif',
              opacity: isLoading ? 0.6 : 1
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            color: '#374151',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: isLoading ? '#F3F4F6' : '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
                padding: '0 1rem',
                paddingRight: '3rem',
                fontSize: '1rem',
                color: '#374151',
                fontFamily: 'Poppins, sans-serif',
                opacity: isLoading ? 0.6 : 1
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: isLoading ? 'default' : 'pointer',
                color: '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: '#6B7280',
            cursor: isLoading ? 'default' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}>
            <input 
              type="checkbox" 
              disabled={isLoading}
              style={{ marginRight: '0.5rem' }} 
            />
            Remember me
          </label>
          <button 
            type="button"
            disabled={isLoading}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#4A90E2',
              fontSize: '0.875rem',
              cursor: isLoading ? 'default' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            Forgot password?
          </button>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            height: '52px',
            backgroundColor: isLoading ? '#9CA3AF' : '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isLoading ? 'default' : 'pointer',
            marginBottom: '1rem',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: isLoading ? 'none' : '0 4px 12px rgba(74, 144, 226, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {isLoading && (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #ffffff40',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        <div style={{
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          <span style={{
            color: '#9CA3AF',
            fontSize: '0.875rem'
          }}>or continue with</span>
        </div>

        <button 
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          style={{
            width: '100%',
            height: '52px',
            backgroundColor: 'white',
            color: '#374151',
            border: '1px solid #E5E7EB',
            borderRadius: '1rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: isLoading ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            fontFamily: 'Poppins, sans-serif',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>G</span>
          Google
        </button>
      </form>

      <p style={{
        textAlign: 'center',
        color: '#6B7280',
        fontSize: '0.875rem',
        marginTop: '1rem'
      }}>
        Don't have an account?{' '}
        <button
          onClick={() => onNavigate('signup')}
          disabled={isLoading}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#4A90E2',
            fontWeight: '500',
            cursor: isLoading ? 'default' : 'pointer',
            fontFamily: 'Poppins, sans-serif',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          Sign up
        </button>
      </p>

      {/* Debug Buttons - Only show in development */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '0.5rem'
      }}>
        <button
          onClick={() => onNavigate('login-debug')}
          disabled={isLoading}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #E5E7EB',
            color: '#6B7280',
            fontSize: '0.75rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '0.375rem',
            cursor: isLoading ? 'default' : 'pointer',
            fontFamily: 'Poppins, sans-serif',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          🔧 Debug Login
        </button>
        <button
          onClick={() => onNavigate('login-test')}
          disabled={isLoading}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #10B981',
            color: '#10B981',
            fontSize: '0.75rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '0.375rem',
            cursor: isLoading ? 'default' : 'pointer',
            fontFamily: 'Poppins, sans-serif',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          🧪 Test Login
        </button>
      </div>
    </div>
  );
}