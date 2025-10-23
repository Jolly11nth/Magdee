import React, { useState, useEffect } from 'react';
import { usePythonBackend } from '../hooks/usePythonBackend';
import { pythonBackend } from '../services/pythonBackend';
import { useAuth } from './AuthContext';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  responseTime?: number;
  data?: any;
}

export function PythonBackendTestScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { status, isLoading, checkConnection } = usePythonBackend();
  const { user, getAccessToken } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runningTests, setRunningTests] = useState(false);

  const tests = [
    {
      name: 'Health Check',
      test: () => pythonBackend.checkHealth()
    },
    {
      name: 'API Status',
      test: () => pythonBackend.getApiStatus()
    },
    {
      name: 'User Profile (Auth Required)',
      test: async () => {
        if (!user) throw new Error('User not authenticated');
        const token = await getAccessToken();
        if (!token) throw new Error('No access token');
        return pythonBackend.getUserProfile(user.id, token);
      }
    },
    {
      name: 'User Books',
      test: async () => {
        if (!user) throw new Error('User not authenticated');
        const token = await getAccessToken();
        if (!token) throw new Error('No access token');
        return pythonBackend.getUserBooks(user.id, token);
      }
    },
    {
      name: 'Analytics Overview',
      test: async () => {
        if (!user) throw new Error('User not authenticated');
        const token = await getAccessToken();
        if (!token) throw new Error('No access token');
        return pythonBackend.getAnalyticsOverview(user.id, token);
      }
    }
  ];

  const runTests = async () => {
    setRunningTests(true);
    setTestResults([]);

    for (const testCase of tests) {
      const startTime = Date.now();
      
      // Add pending result
      setTestResults(prev => [...prev, {
        name: testCase.name,
        status: 'pending',
        message: 'Running...'
      }]);

      try {
        const result = await testCase.test();
        const responseTime = Date.now() - startTime;

        setTestResults(prev => prev.map(r => 
          r.name === testCase.name ? {
            ...r,
            status: result.success ? 'success' : 'error',
            message: result.success ? 'Success' : (result.error || 'Failed'),
            responseTime,
            data: result.data
          } : r
        ));
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        setTestResults(prev => prev.map(r => 
          r.name === testCase.name ? {
            ...r,
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
            responseTime
          } : r
        ));
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setRunningTests(false);
  };

  useEffect(() => {
    // Auto-run basic connection test on mount
    checkConnection();
  }, [checkConnection]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'pending': return '⏳';
      default: return '○';
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              margin: 0
            }}>
              Python Backend Test
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: '4px 0 0 0'
            }}>
              Test connection and functionality
            </p>
          </div>
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
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto'
      }}>
        {/* Backend Status Summary */}
        <div style={{
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 12px 0'
          }}>
            Connection Status
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>Backend Available:</span>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                color: status.available ? '#10b981' : '#ef4444'
              }}>
                {status.available ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>API Status:</span>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                color: status.apiStatus ? '#10b981' : '#ef4444'
              }}>
                {status.apiStatus ? '✓ Ready' : '✗ Error'}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>Database:</span>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '500',
                color: status.databaseConnected ? '#10b981' : '#ef4444'
              }}>
                {status.databaseConnected ? '✓ Connected' : '✗ Disconnected'}
              </span>
            </div>
            
            {status.responseTime && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>Response Time:</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  {status.responseTime < 1000 ? `${status.responseTime}ms` : `${(status.responseTime / 1000).toFixed(1)}s`}
                </span>
              </div>
            )}
          </div>

          {status.error && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#DC2626' }}>
                Error: {status.error}
              </div>
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <button
            onClick={runTests}
            disabled={runningTests || isLoading}
            style={{
              padding: '12px 20px',
              backgroundColor: runningTests ? '#9CA3AF' : '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: runningTests ? 'not-allowed' : 'pointer',
              flex: 1
            }}
          >
            {runningTests ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          <button
            onClick={checkConnection}
            disabled={isLoading}
            style={{
              padding: '12px 20px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Checking...' : 'Recheck'}
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB'
            }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>
                Test Results
              </h2>
            </div>
            
            <div style={{ padding: '0' }}>
              {testResults.map((result, index) => (
                <div
                  key={result.name}
                  style={{
                    padding: '16px',
                    borderBottom: index < testResults.length - 1 ? '1px solid #E5E7EB' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontSize: '16px',
                        color: getStatusColor(result.status)
                      }}>
                        {getStatusIcon(result.status)}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#111827'
                      }}>
                        {result.name}
                      </span>
                    </div>
                    
                    <div style={{
                      fontSize: '12px',
                      color: result.status === 'error' ? '#DC2626' : '#6B7280',
                      marginLeft: '24px'
                    }}>
                      {result.message}
                      {result.responseTime && (
                        <span style={{ marginLeft: '8px' }}>
                          ({result.responseTime}ms)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#F0F9FF',
          border: '1px solid #BFDBFE',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1E40AF',
            margin: '0 0 12px 0'
          }}>
            Quick Links
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <a
              href="http://localhost:8000"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '12px',
                color: '#1D4ED8',
                textDecoration: 'none'
              }}
            >
              → Backend Root (Health Check)
            </a>
            
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '12px',
                color: '#1D4ED8',
                textDecoration: 'none'
              }}
            >
              → API Documentation (Swagger)
            </a>
            
            <a
              href="http://localhost:8000/api/v1/status"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '12px',
                color: '#1D4ED8',
                textDecoration: 'none'
              }}
            >
              → API Status Endpoint
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PythonBackendTestScreen;