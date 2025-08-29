import React from 'react';

export function SpeakToTherapistScreen({ onNavigate }) {
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
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: '2rem'
      }}>
        Speak to Therapist
      </div>
      <button 
        onClick={() => onNavigate('back')}
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
        Back to Home
      </button>
    </div>
  );
}