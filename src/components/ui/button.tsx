import React from 'react';

export function Button({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  ...props 
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const variantStyles = {
    default: {
      backgroundColor: '#4A90E2',
      color: '#ffffff',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#4A90E2',
      border: '1px solid #4A90E2',
    },
  };

  const sizeStyles = {
    default: {
      height: '2.25rem',
      padding: '0 1rem',
    },
    sm: {
      height: '2rem',
      padding: '0 0.75rem',
    },
    lg: {
      height: '2.5rem',
      padding: '0 1.5rem',
    },
  };

  const styles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  return (
    <button
      style={styles}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}