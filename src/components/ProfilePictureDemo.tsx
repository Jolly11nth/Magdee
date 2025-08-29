import React, { useState } from 'react';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { useAuth } from './AuthContext';

export function ProfilePictureDemo() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleImageUpdate = (newImageUrl: string) => {
    // Update user context with new image
    if (updateUser) {
      updateUser({ ...user, avatar_url: newImageUrl });
    }
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleUploadStart = () => {
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handleUploadComplete = (imageUrl: string) => {
    setUploading(false);
    console.log('Profile picture uploaded successfully:', imageUrl);
  };

  const handleUploadError = (error: string) => {
    setUploading(false);
    setUploadError(error);
    setTimeout(() => setUploadError(null), 5000);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        Upload Profile Picture
      </h2>

      <p style={{
        color: '#6B7280',
        fontSize: '0.875rem',
        textAlign: 'center',
        marginBottom: '2rem',
        maxWidth: '300px'
      }}>
        Click on your profile picture or drag and drop an image to update it. 
        Supports JPEG, PNG, and WebP files up to 5MB.
      </p>

      <ProfilePictureUpload
        currentImageUrl={user?.avatar_url || user?.profileImage || user?.avatar}
        onImageUpdate={handleImageUpdate}
        onUploadStart={handleUploadStart}
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        size="xl"
        disabled={!user}
      />

      {/* Status messages */}
      {uploading && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#E3F2FD',
          border: '1px solid #4A90E2',
          borderRadius: '0.5rem',
          color: '#1565C0',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          📤 Uploading your profile picture...
        </div>
      )}

      {uploadError && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#FEF2F2',
          border: '1px solid #EF4444',
          borderRadius: '0.5rem',
          color: '#DC2626',
          fontSize: '0.875rem',
          textAlign: 'center',
          maxWidth: '300px'
        }}>
          ❌ {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#F0FDF4',
          border: '1px solid #10B981',
          borderRadius: '0.5rem',
          color: '#059669',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          ✅ Profile picture updated successfully!
        </div>
      )}

      {!user && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '0.5rem',
          color: '#92400E',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          ⚠️ Please sign in to upload a profile picture
        </div>
      )}

      {/* Different size examples */}
      <div style={{
        marginTop: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '1rem'
        }}>
          Different Sizes
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <ProfilePictureUpload
              currentImageUrl={user?.avatar_url}
              size="sm"
              disabled={!user}
            />
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>Small</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <ProfilePictureUpload
              currentImageUrl={user?.avatar_url}
              size="md"
              disabled={!user}
            />
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>Medium</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <ProfilePictureUpload
              currentImageUrl={user?.avatar_url}
              size="lg"
              disabled={!user}
            />
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>Large</p>
          </div>
        </div>
      </div>
    </div>
  );
}