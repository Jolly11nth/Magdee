import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Clock, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { useErrorAnalytics } from '../services/errorAnalytics';
import { BackButton } from './BackButton';

interface ErrorAnalyticsDashboardProps {
  onNavigate?: (screen: string) => void;
}

export function ErrorAnalyticsDashboard({ onNavigate }: ErrorAnalyticsDashboardProps) {
  const [errorSummary, setErrorSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDays, setSelectedDays] = useState(7);
  const [lastSync, setLastSync] = useState(null);
  
  const { 
    getErrorSummary, 
    syncLocalErrors, 
    isAnalyticsEnabled, 
    setEnabled 
  } = useErrorAnalytics();

  useEffect(() => {
    loadErrorSummary();
  }, [selectedDays]);

  const loadErrorSummary = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log(`Loading error summary for last ${selectedDays} days...`);
      const summary = await getErrorSummary(selectedDays);
      setErrorSummary(summary);
      console.log('Error summary loaded:', summary.length, 'error types');
    } catch (err) {
      console.error('Failed to load error summary:', err);
      setError('Failed to load error analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncErrors = async () => {
    setLoading(true);
    try {
      await syncLocalErrors();
      setLastSync(new Date());
      await loadErrorSummary(); // Reload after sync
    } catch (err) {
      console.error('Failed to sync errors:', err);
      setError('Failed to sync local errors');
    } finally {
      setLoading(false);
    }
  };

  const exportErrorData = () => {
    const exportData = {
      generated_at: new Date().toISOString(),
      period_days: selectedDays,
      error_summary: errorSummary,
      analytics_enabled: isAnalyticsEnabled()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `magdee-error-analytics-${selectedDays}d-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getErrorTypeIcon = (errorType) => {
    if (errorType.includes('auth')) return <AlertTriangle size={16} color="#F59E0B" />;
    if (errorType.includes('network')) return <TrendingUp size={16} color="#EF4444" />;
    if (errorType.includes('validation')) return <AlertCircle size={16} color="#8B5CF6" />;
    if (errorType.includes('ui')) return <Clock size={16} color="#10B981" />;
    return <AlertTriangle size={16} color="#6B7280" />;
  };

  const getErrorTypeColor = (errorType) => {
    if (errorType.includes('auth')) return '#F59E0B';
    if (errorType.includes('network')) return '#EF4444';
    if (errorType.includes('validation')) return '#8B5CF6';
    if (errorType.includes('ui')) return '#10B981';
    return '#6B7280';
  };

  const totalErrors = errorSummary.reduce((sum, error) => sum + error.count, 0);

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
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BackButton
            onClick={() => onNavigate?.('settings')}
            title="Go back to settings"
            aria-label="Return to settings screen"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="#4A90E2" />
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#374151'
            }}>
              Error Analytics
            </h1>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleSyncErrors}
            disabled={loading}
            style={{
              padding: '0.5rem',
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              opacity: loading ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} color="#6B7280" />
          </button>
          
          <button
            onClick={exportErrorData}
            disabled={loading || errorSummary.length === 0}
            style={{
              padding: '0.5rem',
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '0.5rem',
              cursor: (loading || errorSummary.length === 0) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              opacity: (loading || errorSummary.length === 0) ? 0.6 : 1
            }}
          >
            <Download size={16} color="#6B7280" />
          </button>
        </div>
      </div>

      {/* Analytics Toggle */}
      <div style={{
        backgroundColor: '#F0F9FF',
        border: '1px solid #BAE6FD',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: '600', color: '#0C4A6E', marginBottom: '0.25rem' }}>
              Error Analytics
            </div>
            <div style={{ fontSize: '0.875rem', color: '#075985' }}>
              {isAnalyticsEnabled() ? 'Currently tracking errors for debugging' : 'Analytics disabled'}
            </div>
          </div>
          <button
            onClick={() => setEnabled(!isAnalyticsEnabled())}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isAnalyticsEnabled() ? '#EF4444' : '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            {isAnalyticsEnabled() ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Time Period Selector */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        backgroundColor: '#F8F9FA',
        borderRadius: '0.75rem',
        padding: '0.25rem'
      }}>
        {[1, 7, 30].map((days) => (
          <button
            key={days}
            onClick={() => setSelectedDays(days)}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              backgroundColor: selectedDays === days ? 'white' : 'transparent',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: selectedDays === days ? '600' : '400',
              color: selectedDays === days ? '#4A90E2' : '#6B7280',
              fontSize: '0.875rem',
              boxShadow: selectedDays === days ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              opacity: loading ? 0.6 : 1
            }}
          >
            {days === 1 ? 'Today' : `${days} Days`}
          </button>
        ))}
      </div>

      {/* Error Summary Cards */}
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          color: '#6B7280'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #E5E7EB',
              borderTop: '2px solid #4A90E2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Loading analytics...
          </div>
        </div>
      ) : error ? (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          color: '#DC2626',
          textAlign: 'center'
        }}>
          {error}
        </div>
      ) : errorSummary.length === 0 ? (
        <div style={{
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center',
          color: '#15803D'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
            No errors in the last {selectedDays} {selectedDays === 1 ? 'day' : 'days'}!
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            Your app is running smoothly.
          </div>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '0.75rem',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#DC2626',
                marginBottom: '0.25rem'
              }}>
                {totalErrors}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#7F1D1D' }}>
                Total Errors
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '0.75rem',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#D97706',
                marginBottom: '0.25rem'
              }}>
                {errorSummary.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#92400E' }}>
                Error Types
              </div>
            </div>
          </div>

          {/* Error Type List */}
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '0.75rem',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: 'white',
              borderBottom: '1px solid #E5E7EB',
              fontWeight: '600',
              color: '#374151'
            }}>
              Error Types Breakdown
            </div>
            
            {errorSummary.map((errorType, index) => (
              <div
                key={index}
                style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderBottom: index < errorSummary.length - 1 ? '1px solid #E5E7EB' : 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                <div style={{ marginTop: '0.125rem' }}>
                  {getErrorTypeIcon(errorType.error_type)}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '0.875rem'
                    }}>
                      {errorType.error_type.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div style={{
                      backgroundColor: getErrorTypeColor(errorType.error_type),
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.375rem'
                    }}>
                      {errorType.count}
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6B7280',
                    marginBottom: '0.5rem'
                  }}>
                    Latest: {new Date(errorType.latest_occurrence).toLocaleString()}
                  </div>
                  
                  {errorType.common_messages.length > 0 && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#374151'
                    }}>
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                        Common messages:
                      </div>
                      {errorType.common_messages.slice(0, 2).map((message, msgIndex) => (
                        <div
                          key={msgIndex}
                          style={{
                            backgroundColor: '#F3F4F6',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            marginBottom: '0.25rem',
                            fontFamily: 'monospace',
                            fontSize: '0.6875rem',
                            wordBreak: 'break-word'
                          }}
                        >
                          {message.length > 80 ? `${message.substring(0, 80)}...` : message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Last Sync Info */}
      {lastSync && (
        <div style={{
          marginTop: '1rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#6B7280'
        }}>
          Last synced: {lastSync.toLocaleString()}
        </div>
      )}
    </div>
  );
}