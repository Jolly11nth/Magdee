import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { DatabaseService } from '../services/database';
import { useAuth } from './AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';

interface ConnectionDebugScreenProps {
  onNavigate: (screen: string) => void;
}

export function ConnectionDebugScreen({ onNavigate }: ConnectionDebugScreenProps) {
  const { user } = useAuth();
  const { connectionStatus } = useUserProfile();
  const [serverHealth, setServerHealth] = useState({ healthy: true, lastCheck: 0 });
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);
  
  useEffect(() => {
    const checkStatus = () => {
      const health = DatabaseService.getServerHealthStatus();
      setServerHealth(health);
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Server Health Check',
        test: async () => {
          const healthy = await DatabaseService.forceHealthCheck();
          const status = DatabaseService.getServerHealthStatus();
          return { 
            healthy,
            lastCheck: new Date(status.lastCheck).toLocaleTimeString(),
            checkResult: healthy ? 'Server responding' : 'Server unavailable'
          };
        }
      },
      {
        name: 'Authentication Status',
        test: async () => {
          return {
            hasUser: !!user,
            userId: user?.id ? user.id.substring(0, 8) + '...' : 'none',
            email: user?.email || 'none',
            name: user?.name || 'none'
          };
        }
      },
      {
        name: 'Profile Connection Status',
        test: async () => {
          return {
            status: connectionStatus,
            serverHealthy: serverHealth.healthy,
            lastHealthCheck: serverHealth.lastCheck ? new Date(serverHealth.lastCheck).toLocaleTimeString() : 'Never',
            timeSinceCheck: serverHealth.lastCheck ? `${Date.now() - serverHealth.lastCheck}ms ago` : 'N/A'
          };
        }
      },
      {
        name: 'Manual Server Reset',
        test: async () => {
          DatabaseService.resetServerHealth();
          return {
            action: 'Server health reset to healthy',
            newStatus: 'healthy',
            timestamp: new Date().toLocaleTimeString()
          };
        }
      }
    ];

    const results = [];
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({
          name: test.name,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    setTestResults(results);
    setTesting(false);
  };

  return (
    <div style={{
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
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #F3F4F6'
      }}>
        <button
          onClick={() => onNavigate('back')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem'
          }}
        >
          <ArrowLeft size={24} color="#374151" />
        </button>
        
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F2937', margin: 0 }}>
            Connection Debug
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
            Diagnose connection issues
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '1.5rem' }}>
        {/* Current Status */}
        <div style={{
          backgroundColor: '#F9FAFB',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Current Status
          </h2>
          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            <div>Profile Status: <span style={{ fontWeight: '500' }}>{connectionStatus}</span></div>
            <div>Server Health: <span style={{ fontWeight: '500' }}>{serverHealth.healthy ? 'Healthy' : 'Unhealthy'}</span></div>
            <div>Last Check: <span style={{ fontWeight: '500' }}>
              {serverHealth.lastCheck ? new Date(serverHealth.lastCheck).toLocaleTimeString() : 'Never'}
            </span></div>
          </div>
        </div>

        {/* Test Button */}
        <button
          onClick={runTests}
          disabled={testing}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: testing ? '#9CA3AF' : '#4A90E2',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: testing ? 'not-allowed' : 'pointer',
            marginBottom: '1.5rem'
          }}
        >
          {testing ? 'Running Tests...' : 'Run Connection Tests'}
        </button>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
              Test Results
            </h2>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: result.success ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${result.success ? '#BBF7D0' : '#FECACA'}`,
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '0.75rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: result.success ? '#10B981' : '#EF4444',
                    marginRight: '0.5rem'
                  }} />
                  <span style={{ fontWeight: '500', color: '#374151' }}>
                    {result.name}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>
                  {result.success ? (
                    <pre>{JSON.stringify(result.result, null, 2)}</pre>
                  ) : (
                    <div style={{ color: '#DC2626' }}>{result.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Text */}
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1.5rem'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E40AF', marginBottom: '0.5rem' }}>
            About Connection Issues
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#1E40AF', lineHeight: '1.4', margin: 0 }}>
            If you're seeing connection timeouts, the app will automatically switch to offline mode using cached data. 
            This is normal and doesn't affect core functionality. Your data is safe and the app will reconnect when possible.
          </p>
        </div>
      </div>
    </div>
  );
}