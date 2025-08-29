import React, { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

interface LoginTestScreenProps {
  onNavigate: (screen: string) => void;
}

export function LoginTestScreen({ onNavigate }: LoginTestScreenProps) {
  const [debugOutput, setDebugOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testCredentials, setTestCredentials] = useState({
    email: '',
    password: ''
  });

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].substr(0, 8);
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    const newLog = `${timestamp} ${emoji} ${message}`;
    setDebugOutput(prev => [...prev, newLog]);
    console.log(`[LoginTest] ${message}`);
  };

  const createTestAccount = async () => {
    try {
      addLog('Creating test account for login testing...');
      
      const email = `test-login-${Date.now()}@example.com`;
      const password = 'testpassword123';
      const name = 'Test Login User';
      const username = `testuser${Date.now()}`;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/auth/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          username
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addLog(`Test account created successfully: ${email}`, 'success');
        addLog(`User ID: ${data.user.id}`);
        addLog(`Username: ${data.user.username}`);
        
        setTestCredentials({ email, password });
        
        return { email, password, username, userId: data.user.id };
      } else {
        const errorData = await response.json();
        addLog(`Failed to create test account: ${errorData.error}`, 'error');
        return null;
      }
    } catch (error) {
      addLog(`Error creating test account: ${error.message}`, 'error');
      return null;
    }
  };

  const testSupabaseDirectLogin = async (email: string, password: string) => {
    try {
      addLog('Testing direct Supabase login...');
      addLog(`Using email: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        addLog(`Supabase login error: ${error.message}`, 'error');
        addLog(`Error code: ${error.status}`);
        return false;
      }
      
      if (data.session) {
        addLog('Supabase login successful!', 'success');
        addLog(`Access token: ${data.session.access_token ? 'present' : 'missing'}`);
        addLog(`User ID: ${data.user?.id}`);
        addLog(`User email: ${data.user?.email}`);
        
        // Sign out immediately to not interfere with normal flow
        await supabase.auth.signOut();
        addLog('Signed out test session');
        
        return true;
      } else {
        addLog('No session returned from Supabase', 'error');
        return false;
      }
    } catch (error) {
      addLog(`Direct login test error: ${error.message}`, 'error');
      return false;
    }
  };

  const testUsernameLookup = async (username: string) => {
    try {
      addLog(`Testing username lookup for: ${username}`);
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/auth/lookup-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      
      addLog(`Lookup response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog(`Username lookup successful: ${data.email}`, 'success');
        return data.email;
      } else {
        const errorData = await response.json();
        addLog(`Username lookup failed: ${errorData.error}`, 'error');
        addLog(`Response status: ${response.status}`);
        return null;
      }
    } catch (error) {
      addLog(`Username lookup error: ${error.message}`, 'error');
      return null;
    }
  };

  const debugKVStoreStructure = async (userId: string) => {
    try {
      addLog('Debugging KV store structure...');
      
      // This would require a debug endpoint - let's add that to the server
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/debug/kv-structure`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        addLog(`KV structure debug: ${JSON.stringify(data)}`, 'success');
      } else {
        addLog('KV debug endpoint not available', 'error');
      }
    } catch (error) {
      addLog(`KV debug error: ${error.message}`, 'error');
    }
  };

  const testUserProfileLoad = async (userId: string, email: string, password: string) => {
    try {
      addLog('Testing user profile loading...');
      
      // First sign in to get access token
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error || !data.session) {
        addLog(`Failed to get session for profile test: ${error?.message}`, 'error');
        return;
      }
      
      // Now test the profile endpoint
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-989ff5a9/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const profile = await response.json();
        addLog(`Profile loaded: name=${profile.name}, username=${profile.username}`, 'success');
        
        if (profile.username) {
          addLog(`✅ Username correctly stored and retrieved: ${profile.username}`, 'success');
        } else {
          addLog(`⚠️ Username is missing from profile`, 'error');
        }
      } else {
        const errorData = await response.json();
        addLog(`Profile load failed: ${errorData.error}`, 'error');
      }
      
      // Sign out after test
      await supabase.auth.signOut();
      
    } catch (error) {
      addLog(`Profile test error: ${error.message}`, 'error');
    }
  };

  const runFullLoginTest = async () => {
    setIsRunning(true);
    setDebugOutput([]);
    
    try {
      addLog('🚀 Starting comprehensive login test...');
      
      // Step 1: Create test account
      const testAccount = await createTestAccount();
      if (!testAccount) {
        addLog('❌ Cannot proceed without test account', 'error');
        return;
      }
      
      // Wait a moment for account to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Test direct email login
      addLog('📧 Testing email login...');
      const emailLoginSuccess = await testSupabaseDirectLogin(testAccount.email, testAccount.password);
      
      // Step 3: Debug KV store structure
      addLog('🗄️ Debugging KV store structure...');
      await debugKVStoreStructure(testAccount.userId);
      
      // Step 4: Test username lookup
      addLog('👤 Testing username lookup...');
      const lookedUpEmail = await testUsernameLookup(testAccount.username);
      
      // Step 5: Test username-based login
      if (lookedUpEmail) {
        addLog('🔄 Testing login with looked-up email...');
        const usernameLoginSuccess = await testSupabaseDirectLogin(lookedUpEmail, testAccount.password);
        
        if (usernameLoginSuccess) {
          addLog('✅ Username-based login flow works!', 'success');
        } else {
          addLog('❌ Username-based login failed', 'error');
        }
      }
      
      // Step 6: Test user profile loading
      addLog('👤 Testing user profile loading...');
      await testUserProfileLoad(testAccount.userId, testAccount.email, testAccount.password);
      
      // Summary
      addLog('📊 TEST SUMMARY:');
      addLog(`✅ Account creation: Success`);
      addLog(`${emailLoginSuccess ? '✅' : '❌'} Email login: ${emailLoginSuccess ? 'Success' : 'Failed'}`);
      addLog(`${lookedUpEmail ? '✅' : '❌'} Username lookup: ${lookedUpEmail ? 'Success' : 'Failed'}`);
      
      if (emailLoginSuccess && lookedUpEmail) {
        addLog('🎉 All login components are working! The issue may be in the AuthContext integration.', 'success');
      } else {
        addLog('🔧 Found issues that need to be fixed.', 'error');
      }
      
    } finally {
      setIsRunning(false);
    }
  };

  const testWithExistingCredentials = async () => {
    if (!testCredentials.email || !testCredentials.password) {
      addLog('No test credentials available. Run full test first.', 'error');
      return;
    }
    
    setIsRunning(true);
    addLog('Testing with existing credentials...');
    
    const success = await testSupabaseDirectLogin(testCredentials.email, testCredentials.password);
    addLog(`Login test result: ${success ? 'SUCCESS' : 'FAILED'}`, success ? 'success' : 'error');
    
    setIsRunning(false);
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
          Login Flow Test
        </h1>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'grid',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={runFullLoginTest}
          disabled={isRunning}
          style={{
            padding: '1rem',
            backgroundColor: isRunning ? '#9CA3AF' : '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isRunning ? 'default' : 'pointer'
          }}
        >
          {isRunning ? '🧪 Running Tests...' : '🧪 Run Full Login Test'}
        </button>

        <button
          onClick={testWithExistingCredentials}
          disabled={isRunning || !testCredentials.email}
          style={{
            padding: '0.75rem',
            backgroundColor: !testCredentials.email ? '#E5E7EB' : '#10B981',
            color: !testCredentials.email ? '#9CA3AF' : 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: (!testCredentials.email || isRunning) ? 'default' : 'pointer'
          }}
        >
          🔄 Test Existing Credentials
        </button>
      </div>

      {/* Current Test Credentials */}
      {testCredentials.email && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#F3F4F6',
          borderRadius: '0.5rem',
          fontSize: '0.8rem',
          color: '#374151'
        }}>
          <strong>Test Credentials:</strong><br />
          Email: {testCredentials.email}<br />
          Password: {testCredentials.password}
        </div>
      )}

      {/* Debug Output */}
      <div style={{
        backgroundColor: '#1F2937',
        borderRadius: '0.75rem',
        padding: '1rem',
        minHeight: '400px',
        maxHeight: '450px',
        overflow: 'auto',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
      }}>
        <div style={{
          color: '#10B981',
          fontSize: '0.875rem',
          fontWeight: '600',
          marginBottom: '0.75rem'
        }}>
          Test Output:
        </div>
        {debugOutput.length === 0 ? (
          <div style={{
            color: '#6B7280',
            fontSize: '0.875rem',
            fontStyle: 'italic'
          }}>
            Click "Run Full Login Test" to start comprehensive testing...
          </div>
        ) : (
          debugOutput.map((log, index) => (
            <div key={index} style={{
              color: '#F3F4F6',
              fontSize: '0.75rem',
              marginBottom: '0.25rem',
              wordBreak: 'break-word',
              lineHeight: '1.4'
            }}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}