import React from 'react';

export function Slider({ value, onValueChange, max = 100, step = 1, className = '' }) {
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    if (onValueChange) {
      onValueChange([newValue]);
    }
  };

  return (
    <input
      type="range"
      min="0"
      max={max}
      step={step}
      value={Array.isArray(value) ? value[0] : value}
      onChange={handleChange}
      style={{
        width: '100%',
        height: '4px',
        borderRadius: '2px',
        outline: 'none',
        cursor: 'pointer'
      }}
    />
  );
}