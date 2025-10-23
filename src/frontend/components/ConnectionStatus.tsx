import React, { useState, useEffect } from 'react';
import { DatabaseService } from '../services/database';
import { useUserProfile } from '../hooks/useUserProfile';

interface ConnectionStatusProps {
  showDetails?: boolean;
}

export function ConnectionStatus({ showDetails = false }: ConnectionStatusProps) {
  const [serverHealth, setServerHealth] = useState({ healthy: true, lastCheck: 0 });
  const { connectionStatus } = useUserProfile();
  
  useEffect(() => {
    const checkStatus = () => {
      const health = DatabaseService.getServerHealthStatus();
      setServerHealth(health);
    };
    
    // Check immediately
    checkStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't show anything if everything is working fine
  if (connectionStatus === 'connected' && serverHealth.healthy) {
    return null;
  }

  // Don't show if user doesn't want details and we're just offline
  if (!showDetails && connectionStatus === 'offline') {
    return null;
  }

  const getStatusInfo = () => {
    if (connectionStatus === 'disabled') {
      return {
        color: '#6B7280',
        text: 'Offline Mode',
        detail: 'Using cached data'
      };
    }
    
    if (connectionStatus === 'timeout' || !serverHealth.healthy) {
      return {
        color: '#F59E0B',
        text: 'Slow Connection',
        detail: 'Some features may be limited'
      };
    }
    
    if (connectionStatus === 'connecting') {
      return {
        color: '#4A90E2',
        text: 'Connecting',
        detail: 'Please wait...'
      };
    }
    
    return {
      color: '#6B7280',
      text: 'Offline',
      detail: 'Using cached data'
    };
  };

  const status = getStatusInfo();

  if (!showDetails) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: status.color,
        zIndex: 1000,
        opacity: 0.7
      }} />
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: '#ffffff',
      padding: '8px 12px',
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${status.color}`,
      zIndex: 1000,
      fontSize: '12px',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: status.color
        }} />
        <div>
          <div style={{ fontWeight: '500', color: '#374151' }}>
            {status.text}
          </div>
          <div style={{ color: '#6B7280', fontSize: '11px' }}>
            {status.detail}
          </div>
        </div>
      </div>
    </div>
  );
}