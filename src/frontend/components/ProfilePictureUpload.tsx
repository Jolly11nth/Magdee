import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useProfilePictureUpload, ProfileUploadProgress } from '../services/profilePictureService';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onImageUpdate?: (newImageUrl: string) => void;
  onUploadStart?: () => void;
  onUploadComplete?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
}

export function ProfilePictureUpload({
  currentImageUrl,
  onImageUpdate,
  onUploadStart,
  onUploadComplete,
  onUploadError,
  size = 'lg',
  className = '',
  disabled = false
}: ProfilePictureUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<ProfileUploadProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadProfilePicture, validateFile, getStatusIcon, getStatusColor, isAuthenticated } = useProfilePictureUpload();

  // Size configurations
  const sizeConfig = {
    sm: { size: 60, iconSize: 20, uploadSize: 16 },
    md: { size: 80, iconSize: 24, uploadSize: 18 },
    lg: { size: 120, iconSize: 32, uploadSize: 20 },
    xl: { size: 160, iconSize: 40, uploadSize: 24 }
  };

  const config = sizeConfig[size];

  const handleFileSelect = async (file: File) => {
    if (!file || disabled) return;

    // Validate file
    const validation = await validateFile(file);
    if (!validation.valid) {
      onUploadError?.(validation.error || 'Invalid file');
      return;
    }

    if (!isAuthenticated) {
      onUploadError?.('Please sign in to upload a profile picture');
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Start upload
    onUploadStart?.();

    try {
      const result = await uploadProfilePicture(
        { file },
        (progress) => {
          setUploadProgress(progress);
          if (progress.status === 'completed' && progress.finalUrl) {
            onImageUpdate?.(progress.finalUrl);
            onUploadComplete?.(progress.finalUrl);
            // Clean up preview after successful upload
            setTimeout(() => {
              setPreviewUrl(null);
              URL.revokeObjectURL(preview);
            }, 2000);
          }
        }
      );

      if (!result.success) {
        onUploadError?.(result.error || 'Upload failed');
        setPreviewUrl(null);
        URL.revokeObjectURL(preview);
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
      setPreviewUrl(null);
      URL.revokeObjectURL(preview);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && uploadProgress.status !== 'uploading' && uploadProgress.status !== 'processing') {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const isUploading = uploadProgress.status === 'uploading' || uploadProgress.status === 'processing';
  const hasError = uploadProgress.status === 'error';
  const isCompleted = uploadProgress.status === 'completed';

  // Use preview URL during upload, then current image, then fallback
  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: `${config.size}px`,
          height: `${config.size}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: isDragOver ? '3px dashed #4A90E2' : '3px solid #E5E7EB',
          backgroundColor: '#F9FAFB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Image */}
        {displayImageUrl ? (
          <ImageWithFallback
            src={displayImageUrl}
            alt="Profile picture"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            fontSize: `${config.iconSize}px`,
            color: '#9CA3AF'
          }}>
            👤
          </div>
        )}

        {/* Upload overlay */}
        {!disabled && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: isUploading ? 'rgba(74, 144, 226, 0.8)' : 
                             hasError ? 'rgba(239, 68, 68, 0.8)' :
                             isCompleted ? 'rgba(16, 185, 129, 0.8)' :
                             'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isUploading || hasError || isCompleted ? 1 : 0,
              transition: 'opacity 0.2s ease',
              borderRadius: '50%'
            }}
            className="hover:opacity-100"
          >
            {isUploading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: 'white'
              }}>
                <div
                  style={{
                    width: `${config.uploadSize}px`,
                    height: `${config.uploadSize}px`,
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '4px'
                  }}
                />
                <span style={{ fontSize: '10px' }}>{uploadProgress.progress}%</span>
              </div>
            ) : hasError ? (
              <AlertCircle size={config.uploadSize} color="white" />
            ) : isCompleted ? (
              <Check size={config.uploadSize} color="white" />
            ) : (
              <Camera size={config.uploadSize} color="white" />
            )}
          </div>
        )}

        {/* Upload button */}
        {!disabled && !isUploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#4A90E2',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = '#357ABD';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = '#4A90E2';
            }}
          >
            <Upload size={16} color="white" />
          </button>
        )}
      </div>

      {/* Status message */}
      {uploadProgress.message && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px',
          padding: '4px 8px',
          backgroundColor: getStatusColor(uploadProgress.status),
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 10
        }}>
          {uploadProgress.message}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled || isUploading}
      />
    </div>
  );
}

// Simplified version for smaller use cases
export function ProfilePictureButton({
  currentImageUrl,
  onImageUpdate,
  size = 'md',
  disabled = false
}: {
  currentImageUrl?: string;
  onImageUpdate?: (newImageUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}) {
  return (
    <ProfilePictureUpload
      currentImageUrl={currentImageUrl}
      onImageUpdate={onImageUpdate}
      size={size}
      disabled={disabled}
    />
  );
}