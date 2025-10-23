import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import { AuthErrorMessage } from './AuthErrorMessage';
import { useErrorAnalytics } from '../services/errorAnalytics';
import { BackButton } from './BackButton';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function SignupScreen({ onNavigate, onSignupSuccess }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { signup } = useAuth();
  const { logError } = useErrorAnalytics();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setFieldErrors({});

    // Validation
    const newFieldErrors = {};
    
    if (!fullName.trim()) {
      newFieldErrors.fullName = 'Full name is required';
    }
    
    if (!username.trim()) {
      newFieldErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newFieldErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newFieldErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!email.trim()) {
      newFieldErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newFieldErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newFieldErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newFieldErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newFieldErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newFieldErrors.terms = 'You must agree to the Privacy Policy and Terms of Service';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Starting signup process for:', { fullName, username, email });
      
      const result = await signup(fullName, username, email, password);
      
      if (result.success) {
        console.log('✅ Signup successful:', result);
        
        // Call the success callback
        if (onSignupSuccess) {
          onSignupSuccess(result.user);
        }
        
        // Navigate to home or appropriate screen
        onNavigate('home');
      } else {
        console.error('❌ Signup failed:', result.error);
        setError(result.error || 'Signup failed. Please try again.');
        
        // Log the error for analytics
        await logError(new Error(result.error || 'Signup failed'), {
          context: 'signup_form',
          userEmail: email,
          errorType: 'signup_failure'
        });
      }
    } catch (err) {
      console.error('💥 Signup error:', err);
      const errorMessage = err.message || 'An unexpected error occurred during signup';
      setError(errorMessage);
      
      // Log the error for analytics
      await logError(err, {
        context: 'signup_form',
        userEmail: email,
        errorType: 'signup_exception'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPrivacyPolicy = () => {
    onNavigate('privacy-policy');
  };

  const handleOpenTermsOfService = () => {
    onNavigate('terms-of-service');
  };

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
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #F3F4F6'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <BackButton 
            onClick={() => onNavigate('auth')}
            disabled={isLoading}
            title="Go back to auth screen"
            aria-label="Return to auth screen"
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <ImageWithFallback 
              src="/assets/images/magdee-logo.png" 
              alt="Magdee" 
              style={{
                width: '32px',
                height: '32px'
              }}
            />
            <h1 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#4A90E2',
              margin: 0
            }}>
              Magdee
            </h1>
          </div>
          <div style={{ width: '1.5rem' }} />
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '400px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Create Account
          </h2>
          <p style={{
            color: '#6B7280',
            fontSize: '1rem'
          }}>
            Join Magdee to start your audio journey
          </p>
        </div>

        {/* Error Messages */}
        {error && (
          <AuthErrorMessage 
            message={error} 
            onDismiss={() => setError('')}
          />
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Full Name Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: isLoading ? '#F9FAFB' : '#ffffff',
                border: `1px solid ${fieldErrors.fullName ? '#EF4444' : '#E5E7EB'}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'text'
              }}
              placeholder="Enter your full name"
            />
            {fieldErrors.fullName && (
              <p style={{
                color: '#EF4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: isLoading ? '#F9FAFB' : '#ffffff',
                border: `1px solid ${fieldErrors.username ? '#EF4444' : '#E5E7EB'}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'text'
              }}
              placeholder="Choose a username"
            />
            {fieldErrors.username && (
              <p style={{
                color: '#EF4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                {fieldErrors.username}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: isLoading ? '#F9FAFB' : '#ffffff',
                border: `1px solid ${fieldErrors.email ? '#EF4444' : '#E5E7EB'}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif',
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'text'
              }}
              placeholder="Enter your email"
            />
            {fieldErrors.email && (
              <p style={{
                color: '#EF4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                  backgroundColor: isLoading ? '#F9FAFB' : '#ffffff',
                  border: `1px solid ${fieldErrors.password ? '#EF4444' : '#E5E7EB'}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontFamily: 'Poppins, sans-serif',
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? 'not-allowed' : 'text'
                }}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  color: '#6B7280',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p style={{
                color: '#EF4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                  backgroundColor: isLoading ? '#F9FAFB' : '#ffffff',
                  border: `1px solid ${fieldErrors.confirmPassword ? '#EF4444' : '#E5E7EB'}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontFamily: 'Poppins, sans-serif',
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? 'not-allowed' : 'text'
                }}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  color: '#6B7280',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p style={{
                color: '#EF4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms and Privacy Policy Agreement */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              fontSize: '0.875rem',
              color: '#6B7280',
              cursor: isLoading ? 'default' : 'pointer',
              lineHeight: '1.5',
              opacity: isLoading ? 0.6 : 1
            }}>
              <input 
                type="checkbox" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={isLoading}
                style={{ marginRight: '0.75rem', marginTop: '0.125rem' }} 
              />
              <span>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={handleOpenPrivacyPolicy}
                  disabled={isLoading}
                  style={{
                    color: '#4A90E2',
                    textDecoration: 'underline',
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  Privacy Policy
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={handleOpenTermsOfService}
                  disabled={isLoading}
                  style={{
                    color: '#4A90E2',
                    textDecoration: 'underline',
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  Terms of Service
                </button>
              </span>
            </label>
            {fieldErrors.terms && (
              <p style={{
                color: '#EF4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                {fieldErrors.terms}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#9CA3AF' : '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.2s ease',
              marginTop: '0.5rem'
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1rem 0'
        }}>
          <p style={{
            color: '#6B7280',
            fontSize: '0.875rem'
          }}>
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              disabled={isLoading}
              style={{
                color: '#4A90E2',
                textDecoration: 'underline',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '0.875rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}