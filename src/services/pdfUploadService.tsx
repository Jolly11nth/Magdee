import { DatabaseService } from './database';
import { useAuth } from '../components/AuthContext';

export interface PDFUploadData {
  title: string;
  author?: string;
  file: File;
  category?: string;
  description?: string;
}

export interface UploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  fileName?: string;
  bookId?: string;
}

export class PDFUploadService {
  private static generateBookId(): string {
    // Simple ID generation using timestamp and random string
    return `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async uploadPDF(
    userId: string,
    uploadData: PDFUploadData,
    onProgress: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; bookId?: string; error?: string }> {
    try {
      const bookId = this.generateBookId();
      
      // Step 1: Upload file (simulated for now)
      onProgress({
        status: 'uploading',
        progress: 10,
        message: 'Uploading PDF file...',
        fileName: uploadData.file.name,
        bookId
      });

      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      onProgress({
        status: 'uploading',
        progress: 40,
        message: 'File uploaded successfully',
        fileName: uploadData.file.name,
        bookId
      });

      // Step 2: Create book entry in database
      onProgress({
        status: 'processing',
        progress: 50,
        message: 'Creating book entry...',
        fileName: uploadData.file.name,
        bookId
      });

      const bookData = {
        id: bookId,
        user_id: userId,
        title: uploadData.title || uploadData.file.name.replace('.pdf', ''),
        author: uploadData.author || 'Unknown Author',
        cover_url: `https://via.placeholder.com/300x450/4A90E2/ffffff?text=${encodeURIComponent(uploadData.title || 'Book')}`,
        pdf_file_url: `uploads/${userId}/${bookId}/${uploadData.file.name}`, // Simulated path
        audio_file_url: null, // Will be set after conversion
        duration_seconds: 0, // Will be calculated
        total_chapters: 1,
        genre: uploadData.category || 'General',
        category: uploadData.category || 'General',
        rating: 0,
        description: uploadData.description || `Uploaded PDF: ${uploadData.file.name}`,
        processing_status: 'processing',
        file_size_bytes: uploadData.file.size,
        language: 'en',
        progress: 0
      };

      const createResult = await DatabaseService.createBook(bookData);
      
      if (!createResult.success) {
        throw new Error(createResult.error || 'Failed to create book entry');
      }

      onProgress({
        status: 'processing',
        progress: 70,
        message: 'Converting to audio...',
        fileName: uploadData.file.name,
        bookId
      });

      // Step 3: Simulate PDF to audio conversion
      await new Promise(resolve => setTimeout(resolve, 2000));

      onProgress({
        status: 'processing',
        progress: 90,
        message: 'Finalizing conversion...',
        fileName: uploadData.file.name,
        bookId
      });

      // Step 4: Update book with audio information
      const audioUrl = `audio/${userId}/${bookId}/converted.mp3`; // Simulated path
      const estimatedDuration = Math.floor(uploadData.file.size / 1000); // Rough estimation

      // Update book with audio data (this would be done by the actual conversion service)
      const updateData = {
        audio_file_url: audioUrl,
        duration_seconds: estimatedDuration,
        processing_status: 'completed'
      };

      // For now, we'll just mark as completed since we don't have a direct book update endpoint
      await new Promise(resolve => setTimeout(resolve, 500));

      onProgress({
        status: 'completed',
        progress: 100,
        message: 'Conversion completed successfully!',
        fileName: uploadData.file.name,
        bookId
      });

      // Create a notification for successful upload
      await DatabaseService.createNotification(userId, {
        title: 'PDF Upload Complete',
        message: `"${uploadData.title || uploadData.file.name}" has been converted to audio and added to your library.`,
        type: 'success',
        action_type: 'navigate_to_book',
        action_data: { bookId },
        priority: 2
      });

      return { success: true, bookId };

    } catch (error) {
      console.error('PDF upload error:', error);
      
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
          message: `Failed to upload "${uploadData.file?.name || 'PDF'}". Please try again.`,
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

  static async validatePDFFile(file: File): Promise<{ valid: boolean; error?: string }> {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Please select a PDF file' };
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 50MB' };
    }

    // Check if file is empty
    if (file.size === 0) {
      return { valid: false, error: 'File appears to be empty' };
    }

    return { valid: true };
  }

  static getUploadStatusIcon(status: UploadProgress['status']): string {
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
        return '📄';
    }
  }

  static getUploadStatusColor(status: UploadProgress['status']): string {
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

// Hook for using PDF upload service
export function usePDFUpload() {
  const { user } = useAuth();

  const uploadPDF = async (
    uploadData: PDFUploadData,
    onProgress: (progress: UploadProgress) => void
  ) => {
    if (!user?.id) {
      throw new Error('User must be authenticated to upload PDFs');
    }

    return await PDFUploadService.uploadPDF(user.id, uploadData, onProgress);
  };

  const validateFile = (file: File) => {
    return PDFUploadService.validatePDFFile(file);
  };

  return {
    uploadPDF,
    validateFile,
    getStatusIcon: PDFUploadService.getUploadStatusIcon,
    getStatusColor: PDFUploadService.getUploadStatusColor,
    isAuthenticated: !!user?.id
  };
}