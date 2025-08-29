# Full Name vs Username Field Separation

## Overview
The Magdee application maintains a clear separation between **Full Name** and **Username** as distinct data fields throughout the entire system. This document outlines how these fields are handled separately at every level.

## Field Definitions

### Full Name (`name`)
- **Purpose**: User's real full name for display and identification
- **Type**: `string` (required)
- **Format**: Any valid name (e.g., "John Smith", "María García")
- **Usage**: Profile display, welcome messages, formal identification
- **Storage**: Stored in both Supabase Auth `user_metadata.name` and KV store `user:${userId}:profile.name`

### Username (`username`)
- **Purpose**: Unique handle for login and @mentions
- **Type**: `string | null` (optional)
- **Format**: 3+ characters, alphanumeric + underscores only (e.g., "johnsmith123", "maria_g")
- **Usage**: Login alternative to email, social features, URL slugs
- **Storage**: Stored in both Supabase Auth `user_metadata.username` and KV store `user:${userId}:profile.username`

## Implementation Details

### 1. Database Schema
```typescript
interface User {
  id: string;
  email: string;
  name: string; // Full name (e.g., "John Smith") - REQUIRED
  username?: string; // Username handle (e.g., "johnsmith123") - OPTIONAL
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  preferences: UserPreferences;
}
```

### 2. Signup Form (SignupScreen.tsx)
- **Separate Form Fields**:
  - `fullName` input → mapped to `name` field
  - `username` input → mapped to `username` field
- **Independent Validation**:
  - Full name: Required, minimum 2 characters
  - Username: Optional, but if provided must be 3+ chars, alphanumeric + underscore
- **Separate Error Handling**: Each field has its own validation rules and error messages

### 3. Backend Storage (auth.tsx)
```typescript
// Signup endpoint stores both separately
const userProfile = {
  id: data.user.id,
  email: data.user.email,
  name,           // Full name from form
  username: username || null,  // Username from form (can be null)
  // ... other fields
};

// Username mapping for login (separate from profile)
if (username) {
  await kv.set(`username:${username}`, { 
    email: data.user.email, 
    userId: data.user.id 
  });
}
```

### 4. Profile Update (handleUpdateUser)
- **Independent Updates**: Each field can be updated separately
- **Username Uniqueness**: Validates username doesn't conflict with other users
- **Mapping Updates**: Updates username→email mappings when username changes
- **Fallback Handling**: Username can be set to null (removed)

### 5. Authentication System (AuthContext.tsx)
- **Login Support**: Users can login with either email OR username
- **Profile Loading**: Retrieves both fields independently from database
- **Fallback Logic**: Falls back to user_metadata if KV store fails

### 6. UI Display Components

#### ProfileScreen
```tsx
<div>{user?.name || 'User Name'}</div>  {/* Full name */}
{user?.username && (
  <div>@{user.username}</div>  {/* Username with @ prefix */}
)}
```

#### EditProfileScreen
- **Separate Input Fields**:
  - "Full Name *" (required)
  - "Username (optional)" (optional)
- **Independent Validation**: Each field validates separately
- **Clear Labels**: Different labels clearly distinguish the purpose

### 7. HomeScreen Display
```tsx
<div>Welcome back, {user?.name || 'there'}!</div>  {/* Uses full name */}
```

## Key Separation Features

### ✅ Storage Separation
- Full name stored in `profile.name`
- Username stored in `profile.username`
- Username mapping stored separately in `username:${username}`
- Both stored in Supabase Auth `user_metadata` as fallback

### ✅ Validation Separation
- Full name: Required, any characters, 2+ length
- Username: Optional, alphanumeric + underscore, 3+ length
- Independent error messages and validation rules

### ✅ UI Separation
- Different form fields with different labels
- Different display contexts (name for welcome, username for handle)
- Clear visual distinction in profile display

### ✅ Database Separation
- Separate database columns/fields
- Different access patterns (username for login lookup)
- Independent update capabilities

### ✅ Functional Separation
- Full name: Display, personalization, identification
- Username: Login, social features, uniqueness

## Usage Examples

### Signup
```typescript
// User enters:
fullName: "Jane Doe"
username: "janedoe123"

// Stored as:
profile.name: "Jane Doe"      // Full name
profile.username: "janedoe123" // Username
```

### Login Options
```typescript
// User can login with either:
email: "jane@example.com"
// OR
username: "janedoe123"  // Looks up email automatically
```

### Profile Update
```typescript
// User can update independently:
{
  name: "Jane Smith",        // Changed full name
  username: "janesmith",     // Changed username
  email: "jane@example.com"
}
```

### Display Context
- **Welcome Message**: "Welcome back, Jane Smith!" (uses full name)
- **Profile Handle**: "@janesmith" (uses username)
- **Settings**: Shows both fields separately with clear labels

## Benefits of Separation

1. **Flexibility**: Users can have different display names and handles
2. **Privacy**: Full name can be private while username is public
3. **Login Options**: Users can login with memorable username instead of email
4. **Social Features**: Username enables @mentions and social interactions
5. **Internationalization**: Full name supports all character sets, username is URL-safe
6. **Migration**: Users can update either field without affecting the other

This clear separation ensures that Full Name and Username serve their distinct purposes while maintaining data integrity and user experience consistency throughout the Magdee application.