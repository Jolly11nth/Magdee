import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * Standard Back Button Component for Magdee App
 * 
 * ICON STANDARD: Uses ArrowLeft from Lucide React for consistency across the entire app.
 * This is the ONLY back button icon that should be used throughout the application.
 * 
 * DO NOT use other icons like:
 * - ChevronLeft
 * - Arrow symbols (←)
 * - Custom SVG arrows
 * - Other arrow icons
 * 
 * ALWAYS use this BackButton component instead of creating custom back buttons.
 */

interface BackButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal' | 'filled';
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  'aria-label'?: string;
}

// Standard back button icon - DO NOT CHANGE
const BACK_BUTTON_ICON = ArrowLeft;

export function BackButton({
  onClick,
  disabled = false,
  size = 'medium',
  variant = 'default',
  className = '',
  style = {},
  title = 'Go back',
  'aria-label': ariaLabel = 'Go back to previous screen',
  ...props
}: BackButtonProps) {
  // Size configurations
  const sizeConfig = {
    small: {
      width: '28px',
      height: '28px',
      iconSize: 16,
      fontSize: '14px'
    },
    medium: {
      width: '32px',
      height: '32px',
      iconSize: 18,
      fontSize: '16px'
    },
    large: {
      width: '40px',
      height: '40px',
      iconSize: 20,
      fontSize: '18px'
    }
  };

  // Variant configurations - Magdee brand colors
  const variantConfig = {
    default: {
      backgroundColor: '#F8FAFC',
      border: '1px solid #E2E8F0',
      color: '#4A90E2', // Magdee primary blue
      hoverBackgroundColor: '#4A90E2',
      hoverColor: '#ffffff'
    },
    minimal: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#4A90E2', // Magdee primary blue
      hoverBackgroundColor: 'rgba(74, 144, 226, 0.1)',
      hoverColor: '#357ABD' // Magdee dark blue
    },
    filled: {
      backgroundColor: '#4A90E2', // Magdee primary blue
      border: '1px solid #4A90E2',
      color: '#ffffff',
      hoverBackgroundColor: '#357ABD', // Magdee dark blue
      hoverColor: '#ffffff'
    }
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  const baseStyle: React.CSSProperties = {
    width: currentSize.width,
    height: currentSize.height,
    backgroundColor: disabled ? '#E5E7EB' : currentVariant.backgroundColor,
    border: currentVariant.border,
    borderRadius: '10px', // Magdee standard border radius
    color: disabled ? '#9CA3AF' : currentVariant.color,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: currentSize.fontSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    fontFamily: 'Poppins, sans-serif', // Magdee brand font
    opacity: disabled ? 0.6 : 1,
    outline: 'none',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    // Ensure consistent touch interaction
    touchAction: 'manipulation',
    // Improve accessibility
    WebkitTapHighlightColor: 'transparent',
    ...style
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      const target = e.target as HTMLButtonElement;
      target.style.backgroundColor = currentVariant.hoverBackgroundColor;
      target.style.color = currentVariant.hoverColor;
      target.style.transform = 'translateY(-1px)';
      target.style.boxShadow = '0 4px 8px rgba(74, 144, 226, 0.2)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      const target = e.target as HTMLButtonElement;
      target.style.backgroundColor = currentVariant.backgroundColor;
      target.style.color = currentVariant.color;
      target.style.transform = 'translateY(0)';
      target.style.boxShadow = 'none';
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (!disabled) {
      const target = e.target as HTMLButtonElement;
      target.style.outline = 'none';
      target.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.15)';
      target.style.borderColor = '#4A90E2';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (!disabled) {
      const target = e.target as HTMLButtonElement;
      target.style.boxShadow = 'none';
      target.style.borderColor = variant === 'default' ? '#E2E8F0' : 'transparent';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Handle Enter and Space key activation
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`magdee-back-button ${className}`} // Updated class name for consistency
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      title={title}
      aria-label={ariaLabel}
      data-testid="back-button" // For testing purposes
      {...props}
    >
      {/* 
        STANDARD MAGDEE BACK BUTTON ICON
        This ArrowLeft icon is the official back button icon for the Magdee app.
        Do not replace with other icons for consistency.
      */}
      <BACK_BUTTON_ICON size={currentSize.iconSize} />
    </button>
  );
}

// Export with different preset configurations for common use cases
export const BackButtonDefault = (props: Omit<BackButtonProps, 'variant'>) => (
  <BackButton variant="default" {...props} />
);

export const BackButtonMinimal = (props: Omit<BackButtonProps, 'variant'>) => (
  <BackButton variant="minimal" {...props} />
);

export const BackButtonFilled = (props: Omit<BackButtonProps, 'variant'>) => (
  <BackButton variant="filled" {...props} />
);

// Export size presets
export const BackButtonSmall = (props: Omit<BackButtonProps, 'size'>) => (
  <BackButton size="small" {...props} />
);

export const BackButtonLarge = (props: Omit<BackButtonProps, 'size'>) => (
  <BackButton size="large" {...props} />
);

/**
 * USAGE GUIDELINES FOR DEVELOPERS:
 * 
 * 1. ALWAYS use this BackButton component instead of creating custom back buttons
 * 2. NEVER use different arrow icons (ChevronLeft, custom SVGs, etc.)
 * 3. Choose appropriate variant based on context:
 *    - 'default': Most common use case (light background with border)
 *    - 'minimal': For headers with colored backgrounds
 *    - 'filled': For primary actions or dark themes
 * 
 * 4. Choose appropriate size based on context:
 *    - 'small': Compact layouts, secondary headers
 *    - 'medium': Default for most screens
 *    - 'large': Important navigation, main headers
 * 
 * EXAMPLES:
 * 
 * // Basic usage (recommended for most screens)
 * <BackButton onClick={() => onNavigate('back')} />
 * 
 * // With loading state
 * <BackButton onClick={handleBack} disabled={isLoading} />
 * 
 * // Different variants
 * <BackButtonMinimal onClick={handleBack} />
 * <BackButtonFilled onClick={handleBack} />
 * 
 * // Custom sizing
 * <BackButtonSmall onClick={handleBack} />
 * <BackButtonLarge onClick={handleBack} />
 */