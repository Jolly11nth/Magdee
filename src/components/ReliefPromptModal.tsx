import React from 'react';

export function ReliefPromptModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        padding: '2rem',
        maxWidth: '300px',
        width: '90%'
      }}>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#333333',
          marginBottom: '1rem'
        }}>
          Relief Prompt
        </div>
        <div style={{
          color: '#666666',
          marginBottom: '2rem'
        }}>
          Take a moment to breathe and relax.
        </div>
        <button 
          onClick={onClose}
          style={{
            backgroundColor: '#4A90E2',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}