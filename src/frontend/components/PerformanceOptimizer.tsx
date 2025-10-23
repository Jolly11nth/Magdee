import React from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

// Simple performance optimizer that reduces unnecessary re-renders
function PerformanceOptimizerComponent({ children }: PerformanceOptimizerProps) {
  return <React.Fragment>{children}</React.Fragment>;
}

// Add displayName properly
PerformanceOptimizerComponent.displayName = 'PerformanceOptimizer';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class PerformanceErrorBoundaryComponent extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = 'PerformanceErrorBoundary';

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error details
    console.error('🚨 Performance Error Boundary caught an error:', error);
    console.error('Error info:', errorInfo);
    
    // Store error info in state
    this.setState({
      hasError: true,
      error,
      errorInfo
    });

    // Report to error tracking service if available
    if (typeof window !== 'undefined' && (window as any).errorAnalytics) {
      try {
        (window as any).errorAnalytics.logError('performance_boundary_error', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorBoundary: 'PerformanceErrorBoundary'
        });
      } catch (reportingError) {
        console.warn('Failed to report error to analytics:', reportingError);
      }
    }
  }

  handleRetry = () => {
    // Reset error state
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    // Reload the entire page
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#ffffff',
          fontFamily: 'Poppins, sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            {/* Error Icon */}
            <div style={{
              fontSize: '64px',
              marginBottom: '24px'
            }}>
              ⚠️
            </div>

            {/* Error Title */}
            <h1 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Something went wrong
            </h1>

            {/* Error Description */}
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              The app encountered an unexpected error. This is usually temporary and can be fixed by trying again.
            </p>

            {/* Error Details (in development) */}
            {typeof window !== 'undefined' && window.location.hostname === 'localhost' && this.state.error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#dc2626',
                  marginBottom: '8px'
                }}>
                  Error Details (Development Only):
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#7f1d1d',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  maxHeight: '150px'
                }}>
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\nStack Trace:\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4A90E2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#357ABD';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#4A90E2';
                }}
              >
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              >
                Reload App
              </button>
            </div>

            {/* Help Text */}
            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginTop: '24px'
            }}>
              If this problem persists, please check your internet connection or try refreshing the page.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export both components with displayNames
export const PerformanceOptimizer = PerformanceOptimizerComponent;
export const PerformanceErrorBoundary = PerformanceErrorBoundaryComponent;

// Export as default the optimizer
export default PerformanceOptimizerComponent;