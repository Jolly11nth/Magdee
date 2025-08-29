import React, { useEffect, useState } from 'react';
import { validateSupabaseConfig, projectId, publicAnonKey } from '../utils/supabase/info';

interface EnvironmentValidatorProps {
  children: React.ReactNode;
}

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checking: boolean;
  configurationNeeded: boolean;
}

export function EnvironmentValidator({ children }: EnvironmentValidatorProps) {
  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    errors: [],
    warnings: [],
    checking: true,
    configurationNeeded: false
  });

  useEffect(() => {
    const validateEnvironment = async () => {
      try {
        // Validate Supabase configuration
        const supabaseValidation = validateSupabaseConfig();
        const errors = [...supabaseValidation.errors];
        const warnings: string[] = [];

        // Check if we're using fallback/example values
        const usingFallbackUrl = projectId === 'djsjlwgtyfzhcnbvoubo';
        const usingFallbackKey = publicAnonKey && publicAnonKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqc2psd2d0eWZ6aGNuYnZvdWJvIiwicm9sZSI6ImFub24i');

        // Check for placeholder values
        const hasPlaceholderValues = 
          projectId.includes('your-project') || 
          publicAnonKey.includes('your_') ||
          !projectId ||
          !publicAnonKey;

        // Determine if this is a critical configuration issue
        const configurationNeeded = hasPlaceholderValues || (usingFallbackUrl && usingFallbackKey);

        if (configurationNeeded) {
          if (hasPlaceholderValues) {
            errors.push('Supabase configuration contains placeholder values');
          } else if (usingFallbackUrl && usingFallbackKey) {
            // This is less critical - using demo credentials
            warnings.push('Using demo Supabase configuration for development');
          }
        }

        // Only show fallback warning in development mode
        const isDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1';

        if (isDevelopment && (usingFallbackUrl || usingFallbackKey) && !hasPlaceholderValues) {
          console.log('🔧 Development Mode: Using fallback Supabase configuration');
          console.log('📝 To use your own Supabase project:');
          console.log('   1. Create .env file in project root');
          console.log('   2. Add your Supabase credentials:');
          console.log('      REACT_APP_SUPABASE_URL=https://your-project.supabase.co');
          console.log('      REACT_APP_SUPABASE_ANON_KEY=your_anon_key');
          console.log('   3. Restart the development server');
          console.log('📚 See ENVIRONMENT_SETUP_GUIDE.md for detailed instructions');
        }

        // Test basic connectivity only if configuration looks valid
        if (!configurationNeeded && isDevelopment && supabaseValidation.isValid) {
          try {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 2000);

            const response = await fetch(`https://${projectId}.supabase.co/rest/v1/`, {
              method: 'GET',
              headers: {
                'apikey': publicAnonKey,
                'Authorization': `Bearer ${publicAnonKey}`
              },
              signal: controller.signal
            });

            if (!response.ok && response.status !== 404) {
              warnings.push(`Supabase connectivity test failed (Status: ${response.status})`);
            }
          } catch (error) {
            // Silent connectivity failure in development
            if (isDevelopment) {
              console.log('🔗 Supabase connectivity test failed (this is normal if offline)');
            }
          }
        }

        setValidation({
          isValid: errors.length === 0,
          errors,
          warnings,
          checking: false,
          configurationNeeded
        });

      } catch (error) {
        console.error('Environment validation error:', error);
        setValidation({
          isValid: false,
          errors: ['Environment validation failed'],
          warnings: [],
          checking: false,
          configurationNeeded: false
        });
      }
    };

    validateEnvironment();
  }, []);

  // Don't block the app if validation is still checking
  if (validation.checking) {
    return <>{children}</>;
  }

  // Only show configuration screen for critical issues
  if (validation.configurationNeeded && validation.errors.some(error => 
    error.includes('placeholder values') || 
    error.includes('not configured')
  )) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        fontFamily: 'Poppins, sans-serif',
        padding: '2rem'
      }}>
        <div style={{
          maxWidth: '600px',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '1rem'
          }}>
            🛠️
          </div>
          
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '1rem'
          }}>
            Setup Required
          </h1>
          
          <p style={{
            color: '#6b7280',
            marginBottom: '1.5rem',
            lineHeight: '1.6'
          }}>
            To get started with Magdee, you need to configure your Supabase project credentials.
          </p>

          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#0369a1',
              marginBottom: '1rem'
            }}>
              Quick Setup (5 minutes):
            </h3>
            <ol style={{
              color: '#075985',
              fontSize: '0.875rem',
              paddingLeft: '1rem',
              lineHeight: '1.6'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                Create a free Supabase project at{' '}
                <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" 
                   style={{ color: '#4A90E2', textDecoration: 'underline' }}>
                  app.supabase.com
                </a>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                Go to Settings → API and copy your credentials
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                Create a <code style={{ backgroundColor: '#e5e7eb', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>.env</code> file in your project root
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                Add your credentials (see example below)
              </li>
              <li>
                Restart your development server
              </li>
            </ol>
          </div>

          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            textAlign: 'left',
            marginBottom: '1.5rem'
          }}>
            <div style={{ marginBottom: '0.75rem', fontWeight: '600', fontFamily: 'Poppins, sans-serif' }}>
              .env file example:
            </div>
            <div style={{ color: '#374151' }}>
              REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co<br/>
              REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...<br/>
              REACT_APP_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href="https://app.supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#4A90E2',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                fontFamily: 'Poppins, sans-serif',
                display: 'inline-block'
              }}
            >
              Create Supabase Project
            </a>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              I've Added My Credentials
            </button>
          </div>

          <p style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            marginTop: '1rem'
          }}>
            Need help? Check <code>ENVIRONMENT_SETUP_GUIDE.md</code> for detailed instructions.
          </p>
        </div>
      </div>
    );
  }

  // Log warnings but don't block the app
  if (validation.warnings.length > 0) {
    validation.warnings.forEach(warning => {
      console.log(`🔧 ${warning}`);
    });
  }

  // Log any non-critical errors
  if (validation.errors.length > 0) {
    validation.errors.forEach(error => {
      console.warn(`⚠️ Environment: ${error}`);
    });
  }

  return <>{children}</>;
}

EnvironmentValidator.displayName = 'EnvironmentValidator';