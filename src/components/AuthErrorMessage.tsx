import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface AuthErrorMessageProps {
  error: string;
  messageType?: 'error' | 'info' | 'success' | 'warning';
  onDismiss?: () => void;
  onActionClick?: () => void;
  actionLabel?: string;
  autoRedirect?: boolean;
  redirectDelay?: number;
}

export function AuthErrorMessage({ 
  error, 
  messageType = 'error', 
  onDismiss,
  onActionClick,
  actionLabel,
  autoRedirect = false,
  redirectDelay = 3000
}: AuthErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Handle auto redirect countdown
  useEffect(() => {
    if (autoRedirect && redirectDelay > 0) {
      setCountdown(Math.ceil(redirectDelay / 1000));
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (onActionClick) {
              onActionClick();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [autoRedirect, redirectDelay, onActionClick]);

  // Enhanced error parsing for better user experience
  const parseError = (errorMessage: string) => {
    const lowerError = errorMessage.toLowerCase();
    
    // Check for email already exists patterns
    if (
      lowerError.includes('already been registered') ||
      lowerError.includes('user already registered') ||
      lowerError.includes('email address has already been registered') ||
      lowerError.includes('a user with this email address has already been registered') ||
      lowerError.includes('already exists') ||
      lowerError.includes('email_exists') ||
      (lowerError.includes('email') && lowerError.includes('exist')) ||
      (lowerError.includes('user') && lowerError.includes('email') && lowerError.includes('already'))
    ) {
      return {
        type: 'info' as const,
        icon: CheckCircle,
        title: '✨ Welcome Back!',
        message: "You already have a Magdee account with this email address. Let's sign you in instead!",
        actionLabel: 'Sign In Now',
        showCountdown: true,
        bgColor: '#EBF8FF',
        borderColor: '#BAE6FD',
        textColor: '#0369A1',
        iconColor: '#4A90E2'
      };
    }
    
    // Check for username taken
    if (lowerError.includes('username') && (lowerError.includes('taken') || lowerError.includes('exist'))) {
      return {
        type: 'error' as const,
        icon: AlertCircle,
        title: 'Username Unavailable',
        message: 'This username is already taken. Please choose a different one.',
        bgColor: '#FEF2F2',
        borderColor: '#FECACA',
        textColor: '#DC2626',
        iconColor: '#EF4444'
      };
    }
    
    // Check for network errors
    if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return {
        type: 'error' as const,
        icon: AlertCircle,
        title: 'Connection Issue',
        message: 'Please check your internet connection and try again.',
        bgColor: '#FEF2F2',
        borderColor: '#FECACA',
        textColor: '#DC2626',
        iconColor: '#EF4444'
      };
    }
    
    // Check for validation errors
    if (lowerError.includes('invalid email')) {
      return {
        type: 'error' as const,
        icon: AlertCircle,
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        bgColor: '#FEF2F2',
        borderColor: '#FECACA',
        textColor: '#DC2626',
        iconColor: '#EF4444'
      };
    }
    
    if (lowerError.includes('password') && lowerError.includes('6')) {
      return {
        type: 'error' as const,
        icon: AlertCircle,
        title: 'Password Too Short',
        message: 'Password must be at least 6 characters long.',
        bgColor: '#FEF2F2',
        borderColor: '#FECACA',
        textColor: '#DC2626',
        iconColor: '#EF4444'
      };
    }
    
    // Default error styling
    return {
      type: messageType,
      icon: messageType === 'error' ? AlertCircle : messageType === 'success' ? CheckCircle : Info,
      title: messageType === 'error' ? 'Error' : messageType === 'success' ? 'Success' : 'Info',
      message: errorMessage,
      bgColor: messageType === 'info' ? '#EBF8FF' : messageType === 'success' ? '#F0FDF4' : '#FEF2F2',
      borderColor: messageType === 'info' ? '#BAE6FD' : messageType === 'success' ? '#BBF7D0' : '#FECACA',
      textColor: messageType === 'info' ? '#0369A1' : messageType === 'success' ? '#047857' : '#DC2626',
      iconColor: messageType === 'info' ? '#4A90E2' : messageType === 'success' ? '#10B981' : '#EF4444'
    };
  };

  const errorConfig = parseError(error);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  };

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'relative',
        backgroundColor: errorConfig.bgColor,
        border: `1px solid ${errorConfig.borderColor}`,
        borderRadius: '0.875rem',
        padding: '1rem',
        marginBottom: '1.5rem',
        animation: 'slideInFromTop 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: errorConfig.textColor,
            opacity: 0.6,
            padding: '0.25rem',
            borderRadius: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>
      )}

      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {/* Icon */}
        <div style={{
          flexShrink: 0,
          marginTop: '0.125rem'
        }}>
          <errorConfig.icon 
            size={20} 
            style={{ color: errorConfig.iconColor }}
          />
        </div>

        {/* Message content */}
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '0.95rem',
            fontWeight: '600',
            color: errorConfig.textColor,
            margin: '0 0 0.25rem 0',
            lineHeight: '1.25'
          }}>
            {errorConfig.title}
          </h4>
          
          <p style={{
            fontSize: '0.875rem',
            color: errorConfig.textColor,
            margin: '0',
            lineHeight: '1.4',
            opacity: 0.9
          }}>
            {errorConfig.message}
          </p>

          {/* Action button and countdown */}
          {(actionLabel || errorConfig.actionLabel) && (
            <div style={{
              marginTop: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <button
                onClick={handleActionClick}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4A90E2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: '0 2px 4px rgba(74, 144, 226, 0.2)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#357ABD';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(74, 144, 226, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4A90E2';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(74, 144, 226, 0.2)';
                }}
              >
                {actionLabel || errorConfig.actionLabel}
                {errorConfig.showCountdown && countdown > 0 && (
                  <span style={{
                    fontSize: '0.75rem',
                    opacity: 0.8,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    minWidth: '1.25rem',
                    textAlign: 'center'
                  }}>
                    {countdown}
                  </span>
                )}
              </button>
              
              {errorConfig.showCountdown && countdown > 0 && (
                <span style={{
                  fontSize: '0.75rem',
                  color: errorConfig.textColor,
                  opacity: 0.7
                }}>
                  Redirecting automatically...
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}