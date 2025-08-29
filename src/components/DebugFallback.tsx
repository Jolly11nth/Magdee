import React from 'react';

interface DebugFallbackProps {
  screenName: string;
  onNavigate: (screen: string) => void;
}

function DebugFallbackComponent({ screenName, onNavigate }: DebugFallbackProps) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#ffffff',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827'
        }}>
          {screenName}
        </h1>
        <button
          onClick={() => onNavigate('back')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#F3F4F6',
            color: '#374151',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Back
        </button>
      </div>

      {/* Content */}
      <div style={{
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          🚧
        </div>
        
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '12px'
        }}>
          Debug Screen Not Available
        </h2>
        
        <p style={{
          fontSize: '14px',
          color: '#6B7280',
          lineHeight: '1.5',
          marginBottom: '20px'
        }}>
          The {screenName} debug screen is not currently implemented or available in this build.
        </p>

        <div style={{
          backgroundColor: '#F0F9FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#1E40AF',
            margin: 0
          }}>
            💡 This is a development feature that may be added in future updates.
          </p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          style={{
            padding: '12px 20px',
            backgroundColor: '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

// Add displayName for debugging
DebugFallbackComponent.displayName = 'DebugFallback';

export { DebugFallbackComponent as DebugFallback };
export default DebugFallbackComponent;