import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AuthErrorMessage } from './AuthErrorMessage';
import { useErrorAnalytics } from '../services/errorAnalytics';

export function AuthDebugScreen({ onNavigate }) {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorAnalyticsSummary, setErrorAnalyticsSummary] = useState(null);
  const { trackServerError, getErrorSummary, syncLocalErrors } = useErrorAnalytics();

  const testServerHealth = async () => {
    setLoading(true);
    setError('');
    setDebugInfo(null);

    try {
      console.log('Testing server health...');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/health`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Health check response:', data);
      
      setDebugInfo({
        healthCheck: {
          status: response.status,
          data
        }
      });
    } catch (err) {
      console.error('Health check error:', err);
      const errorMessage = 'Health check failed: ' + err.message;
      setError(errorMessage);
      await trackServerError('/health', errorMessage, 'auth_debug');
    } finally {
      setLoading(false);
    }
  };

  const testEnvironmentVariables = async () => {
    setLoading(true);
    setError('');
    setDebugInfo(null);

    try {
      console.log('Testing environment variables...');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/debug/env`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Environment check response:', data);
      
      setDebugInfo({
        environmentCheck: {
          status: response.status,
          data
        }
      });
    } catch (err) {
      console.error('Environment check error:', err);
      const errorMessage = 'Environment check failed: ' + err.message;
      setError(errorMessage);
      await trackServerError('/debug/env', errorMessage, 'auth_debug');
    } finally {
      setLoading(false);
    }
  };

  const loadErrorAnalytics = async () => {
    setLoading(true);
    setError('');
    setErrorAnalyticsSummary(null);

    try {
      console.log('Loading error analytics summary...');
      const summary = await getErrorSummary(7); // Last 7 days
      console.log('Error analytics summary:', summary);
      
      setErrorAnalyticsSummary(summary);
    } catch (err) {
      console.error('Error analytics loading error:', err);
      const errorMessage = 'Failed to load error analytics: ' + err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const syncErrors = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Syncing local errors to server...');
      await syncLocalErrors();
      setDebugInfo({
        syncResult: {
          status: 'success',
          message: 'Local errors synced successfully'
        }
      });
    } catch (err) {
      console.error('Error sync failed:', err);
      setError('Error sync failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSignup = async () => {
    setLoading(true);
    setError('');
    setDebugInfo(null);

    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testName = 'Test User';

    try {
      console.log('Testing signup with:', testEmail);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/auth/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: testName,
        }),
      });

      const responseText = await response.text();
      console.log('Signup response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        data = { rawResponse: responseText };
      }
      
      setDebugInfo({
        signupTest: {
          status: response.status,
          data,
          testCredentials: {
            email: testEmail,
            password: testPassword,
            name: testName
          }
        }
      });
    } catch (err) {
      console.error('Signup test error:', err);
      const errorMessage = 'Signup test failed: ' + err.message;
      setError(errorMessage);
      await trackServerError('/auth/signup', errorMessage, 'auth_debug');
    } finally {
      setLoading(false);
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
      fontFamily: 'Poppins, sans-serif',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => onNavigate('welcome')}
          style={{
            padding: '0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem'
          }}
        >
          ←
        </button>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#374151'
        }}>
          Auth Debug
        </h1>
        <div style={{ width: '2rem' }} />
      </div>

      {/* Test Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={testServerHealth}
          disabled={loading}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {loading ? 'Testing...' : 'Test Server Health'}
        </button>

        <button
          onClick={testEnvironmentVariables}
          disabled={loading}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {loading ? 'Testing...' : 'Test Environment Variables'}
        </button>

        <button
          onClick={testSignup}
          disabled={loading}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#F59E0B',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {loading ? 'Testing...' : 'Test Signup Endpoint'}
        </button>

        <button
          onClick={loadErrorAnalytics}
          disabled={loading}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#8B5CF6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {loading ? 'Loading...' : 'Load Error Analytics'}
        </button>

        <button
          onClick={syncErrors}
          disabled={loading}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          {loading ? 'Syncing...' : 'Sync Local Errors'}
        </button>
      </div>

      {/* Enhanced Error Display */}
      {error && (
        <AuthErrorMessage
          error={error}
          messageType="error"
          onDismiss={() => setError('')}
        />
      )}

      {/* Debug Info Display */}
      {debugInfo && (
        <div style={{
          backgroundColor: '#F3F4F6',
          border: '1px solid #D1D5DB',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflowX: 'auto',
          marginBottom: '1rem'
        }}>
          <strong>Debug Information:</strong>
          <br />
          {JSON.stringify(debugInfo, null, 2)}
        </div>
      )}

      {/* Error Analytics Summary */}
      {errorAnalyticsSummary && (
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #FCD34D',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <strong style={{ color: '#92400E', marginBottom: '0.5rem', display: 'block' }}>
            Error Analytics Summary (Last 7 Days)
          </strong>
          {errorAnalyticsSummary.length === 0 ? (
            <div style={{ color: '#065F46' }}>No errors recorded in the last 7 days! 🎉</div>
          ) : (
            errorAnalyticsSummary.map((errorType, index) => (
              <div key={index} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                marginBottom: '0.5rem',
                fontSize: '0.75rem'
              }}>
                <div style={{ fontWeight: '600', color: '#92400E' }}>
                  {errorType.error_type}: {errorType.count} occurrences
                </div>
                <div style={{ color: '#6B7280', fontSize: '0.6875rem' }}>
                  Latest: {new Date(errorType.latest_occurrence).toLocaleString()}
                </div>
                {errorType.common_messages.length > 0 && (
                  <div style={{ color: '#374151', fontSize: '0.6875rem', marginTop: '0.25rem' }}>
                    Common messages: {errorType.common_messages.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Configuration Info */}
      <div style={{
        backgroundColor: '#F0F9FF',
        border: '1px solid #BAE6FD',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginTop: '1rem',
        fontSize: '0.875rem'
      }}>
        <strong>Current Configuration:</strong>
        <br />
        Project ID: {projectId}
        <br />
        Anon Key Length: {publicAnonKey?.length || 0}
        <br />
        Server URL: https://{projectId}.supabase.co/functions/v1/make-server-989ff5a9/
      </div>
    </div>
  );
}