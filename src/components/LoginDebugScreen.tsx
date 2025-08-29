import React, { useState } from 'react';
import { useAuth } from './AuthContext';

interface LoginDebugScreenProps {
  onNavigate: (screen: string) => void;
}

export function LoginDebugScreen({ onNavigate }: LoginDebugScreenProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [debugOutput, setDebugOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const addDebugLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].substr(0, 8);
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    setDebugOutput(prev => [...prev, `${timestamp} ${emoji} ${message}`]);
    console.log(`[LoginDebug] ${message}`);
  };

  const handleDebugSignIn = async () => {
    setIsLoading(true);
    setDebugOutput([]); // Clear previous output
    
    try {
      addDebugLog('Starting debug sign-in process');
      addDebugLog(`Input: ${emailOrUsername} (${emailOrUsername.includes('@') ? 'email' : 'username'})`);
      addDebugLog(`Password length: ${password.length}`);

      // Call the signIn function with debug tracking
      const result = await signIn(emailOrUsername, password);
      
      addDebugLog(`Sign-in result: ${JSON.stringify(result)}`, result.success ? 'success' : 'error');
      
      if (result.success) {
        addDebugLog('Login successful! Redirecting...', 'success');
        setTimeout(() => onNavigate('home'), 1000);
      } else {
        addDebugLog(`Login failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addDebugLog(`Unexpected error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestServerConnection = async () => {
    try {
      addDebugLog('Testing server connection...');
      
      // Import the project info
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      addDebugLog(`Using project ID: ${projectId}`);
      
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/health`;
      addDebugLog(`Health check URL: ${healthUrl}`);
      
      const response = await fetch(healthUrl, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        addDebugLog(`Server health check passed: ${JSON.stringify(data)}`, 'success');
      } else {
        addDebugLog(`Server health check failed: ${response.status} - ${response.statusText}`, 'error');
        const text = await response.text().catch(() => 'Could not read response');
        addDebugLog(`Response body: ${text}`);
      }
    } catch (error) {
      addDebugLog(`Server connection failed: ${error.message}`, 'error');
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      padding: '1rem',
      fontFamily: 'Poppins, sans-serif',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <button
          onClick={() => onNavigate('login')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          ←
        </button>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#374151',
          margin: 0
        }}>
          Login Debug Tool
        </h1>
      </div>

      {/* Input Fields */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Email or Username
        </label>
        <input
          type="text"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          placeholder="Enter email or username"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #E5E7EB',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #E5E7EB',
            borderRadius: '0.5rem',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'grid',
        gap: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={handleDebugSignIn}
          disabled={isLoading || !emailOrUsername || !password}
          style={{
            padding: '0.75rem',
            backgroundColor: isLoading ? '#9CA3AF' : '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: isLoading ? 'default' : 'pointer'
          }}
        >
          {isLoading ? 'Testing Login...' : 'Debug Sign In'}
        </button>

        <button
          onClick={handleTestServerConnection}
          disabled={isLoading}
          style={{
            padding: '0.75rem',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: isLoading ? 'default' : 'pointer'
          }}
        >
          Test Server Connection
        </button>
      </div>

      {/* Debug Output */}
      <div style={{
        backgroundColor: '#1F2937',
        borderRadius: '0.5rem',
        padding: '1rem',
        minHeight: '300px',
        maxHeight: '400px',
        overflow: 'auto',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
      }}>
        <div style={{
          color: '#10B981',
          fontSize: '0.875rem',
          fontWeight: '600',
          marginBottom: '0.5rem'
        }}>
          Debug Output:
        </div>
        {debugOutput.length === 0 ? (
          <div style={{
            color: '#6B7280',
            fontSize: '0.875rem',
            fontStyle: 'italic'
          }}>
            Click "Debug Sign In" to see detailed login flow...
          </div>
        ) : (
          debugOutput.map((log, index) => (
            <div key={index} style={{
              color: '#F3F4F6',
              fontSize: '0.8rem',
              marginBottom: '0.25rem',
              wordBreak: 'break-word'
            }}>
              {log}
            </div>
          ))
        )}
      </div>

      {/* Quick Test Accounts */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#F9FAFB',
        borderRadius: '0.5rem',
        border: '1px solid #E5E7EB'
      }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Quick Test:
        </div>
        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
          Create a test account first using the signup screen, then come back here to debug login.
        </div>
      </div>
    </div>
  );
}