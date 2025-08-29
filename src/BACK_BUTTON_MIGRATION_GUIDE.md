# Back Button Standardization Guide

## Overview
All back buttons in the Magdee app must use the standardized `BackButton` component with the **ArrowLeft** icon from Lucide React.

## Standard Icon
- **Icon**: `ArrowLeft` from `lucide-react`
- **Component**: `/components/BackButton.tsx`
- **Colors**: Magdee brand blue (#4A90E2)

## DO NOT USE
❌ **Never use these icons for back buttons:**
- `ChevronLeft`
- Text arrows like `←` or `‹`
- Custom SVG arrows
- Different arrow icons
- Unicode arrow characters

## ✅ CORRECT USAGE

### Import the Component
```tsx
import { BackButton } from './BackButton';
// OR for specific variants
import { BackButtonDefault, BackButtonMinimal, BackButtonFilled } from './BackButton';
```

### Basic Implementation
```tsx
// Standard back button (recommended)
<BackButton onClick={() => onNavigate('back')} />

// With custom title and accessibility
<BackButton 
  onClick={handleBack}
  title="Return to profile"
  aria-label="Go back to profile screen"
/>

// With loading state
<BackButton 
  onClick={handleBack} 
  disabled={isLoading}
  title={isLoading ? "Please wait..." : "Go back"}
/>
```

### Variants for Different Contexts
```tsx
// Default: Light background with border (most common)
<BackButtonDefault onClick={handleBack} />

// Minimal: Transparent background (for colored headers)
<BackButtonMinimal onClick={handleBack} />

// Filled: Solid blue background (for emphasis)
<BackButtonFilled onClick={handleBack} />
```

### Size Options
```tsx
// Small: Compact layouts
<BackButton size="small" onClick={handleBack} />

// Medium: Default size (recommended)
<BackButton size="medium" onClick={handleBack} />

// Large: Main headers, important navigation
<BackButton size="large" onClick={handleBack} />
```

## Migration Steps for Existing Screens

### Step 1: Update Imports
Replace any custom back button imports with:
```tsx
import { BackButton } from './BackButton';
```

### Step 2: Replace Custom Back Buttons
**❌ OLD CODE:**
```tsx
<button onClick={() => onNavigate('back')}>
  <ArrowLeft size={18} />
</button>

// OR
<button onClick={() => onNavigate('back')}>
  ← Back
</button>

// OR  
<button onClick={() => onNavigate('back')}>
  <ChevronLeft size={20} />
</button>
```

**✅ NEW CODE:**
```tsx
<BackButton onClick={() => onNavigate('back')} />
```

### Step 3: Update Header Layouts
For consistent header layouts across screens:

```tsx
{/* Header */}
<div style={{
  padding: '24px 20px',
  borderBottom: '1px solid #F3F4F6',
  backgroundColor: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <BackButton onClick={() => onNavigate('back')} />
    
    <div>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: '700', 
        color: '#1F2937',
        fontFamily: 'Poppins, sans-serif'
      }}>
        Screen Title
      </h1>
    </div>
  </div>
  
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <NotificationBell onNavigate={onNavigate} />
  </div>
</div>
```

## Screens That Need Updates

### Priority 1 (High Traffic)
- [ ] `HomeScreen.tsx` - Check if using custom back buttons
- [ ] `ProfileScreen.tsx` - Update to use BackButton component
- [ ] `NotificationsScreen.tsx` - Already using correct pattern
- [ ] `MyLibraryScreen.tsx` - Check implementation

### Priority 2 (Secondary Screens)
- [ ] `AudioPlayerScreen.tsx` - Check navigation buttons
- [ ] `BookCoverScreen.tsx` - Update back button
- [ ] `UploadPDFScreen.tsx` - Check header implementation
- [ ] `AuthScreen.tsx` - Ensure consistent back button

### Priority 3 (Settings & Utility)
- [ ] `LanguageSettingsScreen.tsx` - Update if needed
- [ ] `PrivacyPolicyScreen.tsx` - Check header
- [ ] `TermsOfServiceScreen.tsx` - Check header
- [ ] All other screens with navigation

## Quality Assurance Checklist

For each updated screen, verify:
- [ ] Uses `BackButton` component (not custom implementation)
- [ ] ArrowLeft icon is displayed correctly
- [ ] Proper hover and focus states work
- [ ] Disabled state works during loading
- [ ] Accessibility attributes are present
- [ ] Visual consistency with other screens
- [ ] Touch interactions work on mobile

## Testing Guidelines

### Manual Testing
1. **Visual Consistency**: All back buttons should look identical
2. **Hover Effects**: Blue hover state with slight lift animation
3. **Focus States**: Keyboard navigation shows focus ring
4. **Loading States**: Button becomes disabled and grayed out
5. **Accessibility**: Screen readers announce button properly

### Automated Testing
```tsx
// Example test
it('renders back button with ArrowLeft icon', () => {
  render(<BackButton onClick={mockOnClick} />);
  expect(screen.getByTestId('back-button')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
});
```

## Brand Guidelines Compliance

The BackButton component ensures:
- **Color Consistency**: Uses Magdee brand blue (#4A90E2)
- **Typography**: Poppins font family
- **Spacing**: Standard 10px border radius
- **Animation**: Consistent hover and focus effects
- **Accessibility**: WCAG compliant interactions

## Support

If you encounter issues while migrating:
1. Check the BackButton component documentation
2. Verify import paths are correct
3. Ensure props are passed correctly
4. Test on multiple screen sizes

Remember: **One icon, one component, consistent experience across the entire Magdee app.**