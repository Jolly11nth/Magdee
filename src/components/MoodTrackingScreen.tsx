import React from 'react';
import { BackButton } from './BackButton';

export function MoodTrackingScreen({ onNavigate }) {
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
        Mood Tracking
      </div>
      <BackButton 
        onClick={() => onNavigate('back')}
        title="Go back to previous screen"
        aria-label="Return to previous screen"
      />
    </div>
  );
}