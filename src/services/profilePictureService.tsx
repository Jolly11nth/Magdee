import { DatabaseService } from './database';
import { useAuth } from '../components/AuthContext';

export interface ProfilePictureUploadData {
  file: File;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ProfileUploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  fileName?: string;
  previewUrl?: string;
  finalUrl?: string;
}

export class ProfilePictureService {
  private static generateImageId(): string {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async uploadProfilePicture(
    userId: string,
    uploadData: ProfilePictureUploadData,
    onProgress: (progress: ProfileUploadProgress) => void
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
      const imageId = this.generateImageId();
      
      // Step 1: Validate and prepare file
      onProgress({
        status: 'uploading',
        progress: 10,
        message: 'Validating image...',
        fileName: uploadData.file.name,
        previewUrl: URL.createObjectURL(uploadData.file)
      });

      // Create preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(uploadData.file);

      // Step 2: Get current user profile to preserve existing data
      onProgress({
        status: 'uploading',
        progress: 20,
        message: 'Getting current profile...',
        fileName: uploadData.file.name,
        previewUrl
      });

      const currentUserResult = await DatabaseService.getUser(userId);
      if (!currentUserResult.success || !currentUserResult.data) {
        throw new Error('Failed to get current user profile');
      }

      const currentUser = currentUserResult.data;

      // Step 3: Upload file (simulated for now - in real implementation this would go to Supabase Storage)
      onProgress({
        status: 'uploading',
        progress: 40,
        message: 'Uploading image...',
        fileName: uploadData.file.name,
        previewUrl
      });

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      onProgress({
        status: 'processing',
        progress: 60,
        message: 'Processing image...',
        fileName: uploadData.file.name,
        previewUrl
      });

      // Step 4: Process image (resize, optimize, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 5: Generate final URL (in real implementation, this would be the Supabase Storage URL)
      const finalImageUrl = `https://via.placeholder.com/200x200/4A90E2/ffffff?text=${encodeURIComponent(userId.substring(0, 2).toUpperCase())}`;

      onProgress({
        status: 'processing',
        progress: 80,
        message: 'Updating profile...',
        fileName: uploadData.file.name,
        previewUrl,
        finalUrl: finalImageUrl
      });

      // Step 6: Update user profile picture using dedicated endpoint
      const updateResult = await DatabaseService.updateProfilePicture(userId, finalImageUrl);

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update profile');
      }

      onProgress({
        status: 'completed',
        progress: 100,
        message: 'Profile picture updated successfully!',
        fileName: uploadData.file.name,
        previewUrl,
        finalUrl: finalImageUrl
      });

      // Clean up preview URL
      setTimeout(() => URL.revokeObjectURL(previewUrl), 5000);

      // Create success notification
      await DatabaseService.createNotification(userId, {
        title: 'Profile Updated',
        message: 'Your profile picture has been updated successfully.',
        type: 'success',
        action_type: 'navigate_to_profile',
        priority: 1
      });

      return { success: true, imageUrl: finalImageUrl };

    } catch (error) {
      console.error('Profile picture upload error:', error);
      
      onProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Upload failed',
        fileName: uploadData.file?.name
      });

      // Create error notification
      if (userId) {
        await DatabaseService.createNotification(userId, {
          title: 'Upload Failed',
          message: `Failed to update profile picture. Please try again.`,
          type: 'warning',
          priority: 2
        });
      }

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }

  static async validateImageFile(file: File): Promise<{ valid: boolean; error?: string }> {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please select a JPEG, PNG, or WebP image' };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }

    // Check if file is empty
    if (file.size === 0) {
      return { valid: false, error: 'Image file appears to be empty' };
    }

    // Basic image dimension check
    try {
      const dimensions = await this.getImageDimensions(file);
      if (dimensions.width < 100 || dimensions.height < 100) {
        return { valid: false, error: 'Image must be at least 100x100 pixels' };
      }
      if (dimensions.width > 4000 || dimensions.height > 4000) {
        return { valid: false, error: 'Image must be less than 4000x4000 pixels' };
      }
    } catch (error) {
      console.warn('Could not validate image dimensions:', error);
      // Continue anyway as this is not critical
    }

    return { valid: true };
  }

  private static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
        URL.revokeObjectURL(url);
        resolve(dimensions);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  static getUploadStatusIcon(status: ProfileUploadProgress['status']): string {
    switch (status) {
      case 'uploading':
        return '📤';
      case 'processing':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📷';
    }
  }

  static getUploadStatusColor(status: ProfileUploadProgress['status']): string {
    switch (status) {
      case 'uploading':
      case 'processing':
        return '#4A90E2';
      case 'completed':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }
}

// Hook for using profile picture upload service
export function useProfilePictureUpload() {
  const { user } = useAuth();

  const uploadProfilePicture = async (
    uploadData: ProfilePictureUploadData,
    onProgress: (progress: ProfileUploadProgress) => void
  ) => {
    if (!user?.id) {
      throw new Error('User must be authenticated to upload profile pictures');
    }

    return await ProfilePictureService.uploadProfilePicture(user.id, uploadData, onProgress);
  };

  const validateFile = (file: File) => {
    return ProfilePictureService.validateImageFile(file);
  };

  return {
    uploadProfilePicture,
    validateFile,
    getStatusIcon: ProfilePictureService.getUploadStatusIcon,
    getStatusColor: ProfilePictureService.getUploadStatusColor,
    isAuthenticated: !!user?.id
  };
}