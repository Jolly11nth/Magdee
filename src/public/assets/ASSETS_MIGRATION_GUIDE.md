# Assets Migration Guide

This guide explains how to migrate images from Figma imports to local assets for production deployment.

## Overview

The app previously used `figma:asset/` imports which are not compatible with production builds. All images have been migrated to use local assets in the `/public/assets/` folder.

## Required Images

You need to manually add these images to the `/public/assets/images/` folder:

### 1. **magdee-logo.png**
- **Original Figma asset ID**: `f82a941c409d8064bd2a0c4bcb7ad4befc1175e2.png`
- **Used in**: WelcomeScreen, LoginScreen, SignupScreen, PrivacyPolicyScreen, TermsOfServiceScreen
- **Description**: Main Magdee logo
- **Recommended size**: 200x200px (or larger, will be scaled automatically)
- **Format**: PNG with transparent background preferred

### 2. **magdee-logo-variant.png**
- **Original Figma asset ID**: `a4e7b1eba86d0b36e2f5b88f6b59e9b62b4ebb0e.png`
- **Used in**: BookCoverScreen
- **Description**: Alternative Magdee logo variant
- **Recommended size**: 200x200px (or larger, will be scaled automatically)
- **Format**: PNG with transparent background preferred
- **Note**: If this is the same as the main logo, you can duplicate `magdee-logo.png`

### 3. **empty-state.png**
- **Original Figma asset ID**: `7604a65f79f91ff4a16258b69c691402e454d9ce.png`
- **Used in**: HomeScreen (when no books are available)
- **Description**: Empty state illustration for "No books available"
- **Recommended size**: 400x300px (or larger, will be scaled automatically)
- **Format**: PNG or JPG

## How to Export from Figma

1. Open your Figma design file
2. Select each image/logo element
3. In the right panel, click "Export"
4. Choose PNG format (2x or 3x for better quality)
5. Click "Export" and save to your computer
6. Rename the files according to the names above
7. Place them in `/public/assets/images/` folder

## Folder Structure

```
/public/
  └── assets/
      └── images/
          ├── magdee-logo.png
          ├── magdee-logo-variant.png
          └── empty-state.png
```

## What's Been Changed

All import statements have been updated from:
```typescript
import magdeeLogo from 'figma:asset/f82a941c409d8064bd2a0c4bcb7ad4befc1175e2.png';
```

To:
```typescript
import magdeeLogo from '/assets/images/magdee-logo.png';
```

## Files Modified

- ✅ WelcomeScreen.tsx
- ✅ LoginScreen.tsx
- ✅ SignupScreen.tsx
- ✅ PrivacyPolicyScreen.tsx
- ✅ TermsOfServiceScreen.tsx
- ✅ BookCoverScreen.tsx
- ✅ HomeScreen.tsx

## Fallback Images

Temporary placeholder images from Unsplash are configured as fallbacks in the ImageWithFallback component. Once you add your actual Magdee assets, they will be used automatically.

## Testing After Migration

1. Add your images to `/public/assets/images/`
2. Run `npm run dev` locally
3. Visit each screen to verify images load correctly:
   - Welcome Screen
   - Login Screen
   - Signup Screen
   - Home Screen (empty state)
   - Book Cover Screen
   - Privacy Policy Screen
   - Terms of Service Screen

## Production Deployment

The `/public` folder is automatically included in production builds. Your images will be served from `/assets/images/` on your deployed frontend.

## Notes

- The `/public` folder is static and served as-is
- Images in `/public/assets/` are accessible at `/assets/` in production
- No import bundling is needed for files in `/public`
- This approach is fully compatible with Vite and all deployment platforms (Vercel, Netlify, Railway, etc.)
