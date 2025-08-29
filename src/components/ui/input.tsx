import React from 'react';

export function Input({ 
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  ...props 
}) {
  const styles = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #E5E5E5',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={styles}
      {...props}
    />
  );
}