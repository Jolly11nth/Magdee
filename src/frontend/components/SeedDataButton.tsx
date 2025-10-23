import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { DatabaseService } from '../services/database';

export function SeedDataButton() {
  const { user } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeedData = async (force = false) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsSeeding(true);
    setError(null);
    setMessage(null);

    try {
      const result = await DatabaseService.seedSampleData(user.id, force);
      
      if (result.success) {
        setMessage(result.data?.message || 'Sample data created successfully!');
        setTimeout(() => setMessage(null), 5000);
      } else {
        setError(result.error || 'Failed to seed data');
        setTimeout(() => setError(null), 5000);
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      setError(error instanceof Error ? error.message : 'Failed to seed data');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSeeding(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      alignItems: 'flex-end'
    }}>
      {/* Status Messages */}
      {message && (
        <div style={{
          backgroundColor: '#10B981',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          maxWidth: '250px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          ✅ {message}
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#EF4444',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          maxWidth: '250px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => handleSeedData(false)}
          disabled={isSeeding}
          style={{
            backgroundColor: '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: isSeeding ? 'not-allowed' : 'pointer',
            opacity: isSeeding ? 0.6 : 1,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)',
            fontFamily: 'Poppins, sans-serif'
          }}
          onMouseEnter={(e) => {
            if (!isSeeding) {
              e.target.style.backgroundColor = '#357ABD';
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#4A90E2';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {isSeeding ? '📚 Creating...' : '📚 Add Sample Books'}
        </button>

        <button
          onClick={() => handleSeedData(true)}
          disabled={isSeeding}
          style={{
            backgroundColor: '#F59E0B',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: isSeeding ? 'not-allowed' : 'pointer',
            opacity: isSeeding ? 0.6 : 1,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
            fontFamily: 'Poppins, sans-serif'
          }}
          onMouseEnter={(e) => {
            if (!isSeeding) {
              e.target.style.backgroundColor = '#D97706';
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#F59E0B';
            e.target.style.transform = 'translateY(0)';
          }}
          title="Force add more sample books"
        >
          {isSeeding ? '🔄 Adding...' : '🔄 Force Add'}
        </button>
      </div>

      {/* Info text */}
      <div style={{
        fontSize: '0.75rem',
        color: '#6B7280',
        textAlign: 'right',
        maxWidth: '200px'
      }}>
        Add sample books to test the recent books feature
      </div>
    </div>
  );
}