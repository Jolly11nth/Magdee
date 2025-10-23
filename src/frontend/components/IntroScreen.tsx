import React from 'react';

export function IntroScreen({ onNavigate }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: '2rem'
      }}>
        Welcome to MagSee
      </div>
      <button 
        onClick={() => onNavigate('welcome')}
        style={{
          backgroundColor: '#4A90E2',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '0.5rem',
          border: 'none',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Get Started
      </button>
    </div>
  );
}