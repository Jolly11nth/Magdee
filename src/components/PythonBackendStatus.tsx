import React, { useState } from 'react';
import { usePythonBackend } from '../hooks/usePythonBackend';

interface PythonBackendStatusProps {
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

function PythonBackendStatusComponent({ showDetails = false, onToggleDetails }: PythonBackendStatusProps) {
  const { status, isLoading, checkConnection } = usePythonBackend();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = () => {
    if (isLoading) return '#fbbf24'; // yellow
    if (status.available && status.apiStatus && status.databaseConnected) return '#10b981'; // green
    if (status.available || status.apiStatus) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (status.available && status.apiStatus && status.databaseConnected) return 'Python Backend Online';
    if (status.available || status.apiStatus) return 'Python Backend Partial';
    return 'Python Backend Offline';
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggleDetails?.();
  };

  const formatResponseTime = (time: number | null) => {
    if (time === null) return 'N/A';
    return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(1)}s`;
  };

  const formatLastChecked = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      
      if (diffSecs < 60) return `${diffSecs}s ago`;
      if (diffMins < 60) return `${diffMins}m ago`;
      return date.toLocaleTimeString();
    } catch (error) {
      return 'Invalid time';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      minWidth: '200px',
      maxWidth: '300px'
    }}>
      {/* Status Header */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: showDetails ? 'pointer' : 'default'
        }}
        onClick={showDetails ? handleToggle : undefined}
      >
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          flexShrink: 0,
          animation: isLoading ? 'pulse 2s infinite' : 'none'
        }} />
        <span style={{
          fontSize: '12px',
          fontWeight: '500',
          color: '#374151',
          flex: 1
        }}>
          {getStatusText()}
        </span>
        {showDetails && (
          <span style={{
            fontSize: '12px',
            color: '#6B7280',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        )}
      </div>

      {/* Quick Stats */}
      {!isExpanded && status.responseTime !== null && (
        <div style={{
          fontSize: '10px',
          color: '#6B7280',
          marginTop: '4px'
        }}>
          Response: {formatResponseTime(status.responseTime)}
        </div>
      )}

      {/* Expanded Details */}
      {(isExpanded || showDetails) && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #E5E7EB',
          fontSize: '11px',
          lineHeight: '1.4'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Service Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>API Server:</span>
              <span style={{ 
                color: status.available ? '#10b981' : '#ef4444',
                fontWeight: '500'
              }}>
                {status.available ? '✓ Online' : '✗ Offline'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>API Endpoints:</span>
              <span style={{ 
                color: status.apiStatus ? '#10b981' : '#ef4444',
                fontWeight: '500'
              }}>
                {status.apiStatus ? '✓ Ready' : '✗ Error'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Database:</span>
              <span style={{ 
                color: status.databaseConnected ? '#10b981' : '#ef4444',
                fontWeight: '500'
              }}>
                {status.databaseConnected ? '✓ Connected' : '✗ Disconnected'}
              </span>
            </div>

            {/* Performance */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Response Time:</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>
                {formatResponseTime(status.responseTime)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Last Checked:</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>
                {formatLastChecked(status.lastChecked)}
              </span>
            </div>

            {/* Error Message */}
            {status.error && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#fef2f2',
                borderRadius: '6px',
                border: '1px solid #fecaca'
              }}>
                <div style={{ color: '#dc2626', fontSize: '10px', fontWeight: '500' }}>
                  Error:
                </div>
                <div style={{ color: '#7f1d1d', fontSize: '10px', marginTop: '2px' }}>
                  {status.error.length > 50 ? `${status.error.substring(0, 50)}...` : status.error}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{
              marginTop: '8px',
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  checkConnection();
                }}
                disabled={isLoading}
                style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  backgroundColor: '#4A90E2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Checking...' : 'Recheck'}
              </button>

              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  backgroundColor: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                API Docs
              </a>
            </div>

            {/* Helpful Info */}
            {!status.available && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f0f9ff',
                borderRadius: '6px',
                border: '1px solid #bfdbfe'
              }}>
                <div style={{ color: '#1e40af', fontSize: '10px', fontWeight: '500' }}>
                  To start Python backend:
                </div>
                <div style={{ color: '#1d4ed8', fontSize: '9px', marginTop: '2px', fontFamily: 'monospace' }}>
                  python start.py --mode dev
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Add displayName for debugging
PythonBackendStatusComponent.displayName = 'PythonBackendStatus';

export { PythonBackendStatusComponent as PythonBackendStatus };
export default PythonBackendStatusComponent;