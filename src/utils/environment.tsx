/**
 * Environment Utilities
 * Handles environment variable access across different build systems
 */

export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  debugMode: boolean;
}

/**
 * Safely get environment variable from various sources
 */
export const getEnvVar = (name: string, defaultValue: string = ''): string => {
  try {
    // Check for Vite environment variables first
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const value = import.meta.env[name];
      if (value !== undefined) return String(value);
    }
  } catch (error) {
    // Ignore import.meta errors
  }
  
  try {
    // Check for Create React App environment variables
    if (typeof window !== 'undefined' && (window as any).__ENV__) {
      const value = (window as any).__ENV__[name];
      if (value !== undefined) return String(value);
    }
  } catch (error) {
    // Ignore window access errors
  }
  
  try {
    // Check for global process if available (Node.js environments)
    if (typeof global !== 'undefined' && global.process && global.process.env) {
      const value = global.process.env[name];
      if (value !== undefined) return String(value);
    }
  } catch (error) {
    // Ignore global access errors
  }
  
  // Fallback to default
  return defaultValue;
};

/**
 * Check if we're in development mode
 */
export const isDevelopmentMode = (): boolean => {
  try {
    // Check for Vite environment
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.MODE === 'development' || import.meta.env.DEV === true;
    }
  } catch (error) {
    // Ignore import.meta errors
  }
  
  // Check for Create React App environment
  const nodeEnv = getEnvVar('NODE_ENV', 'development');
  if (nodeEnv === 'development') return true;
  
  // Check for debug mode flag
  const debugMode = getEnvVar('REACT_APP_DEBUG_MODE', 'false');
  if (debugMode.toLowerCase() === 'true') return true;
  
  // Check hostname for development indicators
  try {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || 
          hostname === '127.0.0.1' || 
          hostname.includes('dev') ||
          hostname.includes('staging')) {
        return true;
      }
    }
  } catch (error) {
    // Ignore window access errors
  }
  
  // Default to false for production safety
  return false;
};

/**
 * Check if we're in production mode
 */
export const isProductionMode = (): boolean => {
  return !isDevelopmentMode();
};

/**
 * Get current environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDev = isDevelopmentMode();
  
  return {
    isDevelopment: isDev,
    isProduction: !isDev,
    supabaseUrl: getEnvVar('REACT_APP_SUPABASE_URL', ''),
    supabaseAnonKey: getEnvVar('REACT_APP_SUPABASE_ANON_KEY', ''),
    debugMode: getEnvVar('REACT_APP_DEBUG_MODE', 'false').toLowerCase() === 'true'
  };
};

/**
 * Log environment configuration (for debugging)
 */
export const logEnvironmentConfig = (): void => {
  try {
    const config = getEnvironmentConfig();
    console.log('🔧 Environment Configuration:', {
      ...config,
      // Mask sensitive values
      supabaseUrl: config.supabaseUrl ? `${config.supabaseUrl.substring(0, 20)}...` : 'Not set',
      supabaseAnonKey: config.supabaseAnonKey ? `${config.supabaseAnonKey.substring(0, 10)}...` : 'Not set'
    });
  } catch (error) {
    console.warn('Could not log environment configuration:', error);
  }
};

/**
 * Validate required environment variables
 */
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  try {
    const errors: string[] = [];
    const config = getEnvironmentConfig();
    
    // Check required Supabase configuration
    if (!config.supabaseUrl) {
      errors.push('REACT_APP_SUPABASE_URL is required');
    }
    
    if (!config.supabaseAnonKey) {
      errors.push('REACT_APP_SUPABASE_ANON_KEY is required');
    }

    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Environment validation error:', error);
    return {
      isValid: false,
      errors: ['Environment validation failed']
    };
  }
  
};

/**
 * Initialize environment and log configuration
 */
export const initializeEnvironment = (): EnvironmentConfig => {
  try {
    const config = getEnvironmentConfig();
    
    // Log configuration in development
    if (config.isDevelopment || config.debugMode) {
      logEnvironmentConfig();
    }
    
    // Validate required environment variables
    const validation = validateEnvironment();
    if (!validation.isValid) {
      console.error('❌ Environment validation failed:', validation.errors);
      validation.errors.forEach(error => console.error(`  - ${error}`));
    }
    
    return config;
  } catch (error) {
    console.error('Environment initialization error:', error);
    // Return safe defaults
    return {
      isDevelopment: true,
      isProduction: false,
      supabaseUrl: '',
      supabaseAnonKey: '',
      debugMode: false
    };
  }
};

// Export the configuration for immediate use
let ENV_CONFIG: EnvironmentConfig;
try {
  ENV_CONFIG = getEnvironmentConfig();
} catch (error) {
  console.warn('Failed to get environment config, using defaults:', error);
  ENV_CONFIG = {
    isDevelopment: true,
    isProduction: false,
    supabaseUrl: '',
    supabaseAnonKey: '',
    debugMode: false
  };
}

export { ENV_CONFIG };

// Initialize environment on module load (safely)
try {
  if (ENV_CONFIG.isDevelopment) {
    console.log('🌍 Environment utilities loaded');
  }
} catch (error) {
  // Ignore initialization errors
}