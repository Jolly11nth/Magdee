import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  timeout?: number;
}

export function LoadingScreen({ 
  message = 'Loading your experience...', 
  showProgress = true,
  timeout = 5000 
}: LoadingScreenProps = {}) {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  useEffect(() => {
    // Animated dots effect
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Progress animation
    let progressInterval: NodeJS.Timeout;
    if (showProgress) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // Don't go to 100% unless actually done
          return prev + Math.random() * 3; // Random increments for more natural feel
        });
      }, 200);
    }

    // Timeout warning
    const timeoutTimer = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, timeout);

    return () => {
      clearInterval(dotsInterval);
      if (progressInterval) clearInterval(progressInterval);
      clearTimeout(timeoutTimer);
    };
  }, [showProgress, timeout]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      flexDirection: 'column',
      gap: '2rem',
      padding: '2rem'
    }}>
      {/* Magdee Logo */}
      <div style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: '#4A90E2',
        fontFamily: 'Poppins, sans-serif',
        letterSpacing: '-0.025em',
        marginBottom: '1rem'
      }}>
        Magdee
      </div>

      {/* Spinner */}
      <div style={{
        position: 'relative',
        width: '48px',
        height: '48px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #E5E7EB',
          borderTop: '4px solid #4A90E2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        
        {/* Inner pulse effect */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '24px',
          height: '24px',
          backgroundColor: '#4A90E2',
          borderRadius: '50%',
          opacity: 0.3,
          animation: 'pulse 2s infinite'
        }} />
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div style={{
          width: '200px',
          height: '4px',
          backgroundColor: '#E5E7EB',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#4A90E2',
            borderRadius: '2px',
            transition: 'width 0.3s ease',
            background: 'linear-gradient(90deg, #4A90E2, #357ABD, #4A90E2)',
            backgroundSize: '200% 100%',
            animation: 'gradient-slide 2s linear infinite'
          }} />
        </div>
      )}

      {/* Loading Message */}
      <div style={{
        textAlign: 'center',
        maxWidth: '280px'
      }}>
        <p style={{
          color: '#374151',
          fontSize: '1rem',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '500',
          marginBottom: '0.5rem'
        }}>
          {message}{dots}
        </p>
        
        {showProgress && (
          <p style={{
            color: '#6B7280',
            fontSize: '0.875rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {Math.round(progress)}% complete
          </p>
        )}
      </div>

      {/* Timeout Warning */}
      {showTimeoutWarning && (
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '0.5rem',
          padding: '1rem',
          maxWidth: '300px',
          textAlign: 'center',
          animation: 'slideDown 0.3s ease'
        }}>
          <p style={{
            color: '#92400E',
            fontSize: '0.875rem',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            Taking longer than expected
          </p>
          <p style={{
            color: '#B45309',
            fontSize: '0.75rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Please check your internet connection or try refreshing the page.
          </p>
        </div>
      )}

      {/* Loading Tips */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        opacity: 0.7
      }}>
        <p style={{
          color: '#9CA3AF',
          fontSize: '0.75rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          🎧 Get ready for an amazing audio experience
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.1; }
        }
        
        @keyframes gradient-slide {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        @keyframes slideDown {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Add displayName to the main component
LoadingScreen.displayName = 'LoadingScreen';

// Specialized loading screens for different contexts
export function AuthLoadingScreen() {
  return (
    <LoadingScreen 
      message="Checking your authentication"
      showProgress={true}
      timeout={8000}
    />
  );
}

// Add displayName
AuthLoadingScreen.displayName = 'AuthLoadingScreen';

export function AppInitLoadingScreen() {
  return (
    <LoadingScreen 
      message="Initializing your library"
      showProgress={true}
      timeout={4000}
    />
  );
}

// Add displayName
AppInitLoadingScreen.displayName = 'AppInitLoadingScreen';

export function BookLoadingScreen() {
  return (
    <LoadingScreen 
      message="Preparing your audiobook"
      showProgress={true}
      timeout={6000}
    />
  );
}

// Add displayName
BookLoadingScreen.displayName = 'BookLoadingScreen';