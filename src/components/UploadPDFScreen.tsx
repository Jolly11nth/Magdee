import React, { useState, useRef } from 'react';
import { useNotificationHelpers } from './NotificationHelpers';
import { usePDFUpload, UploadProgress, PDFUploadData } from '../services/pdfUploadService';
import { useAuth } from './AuthContext';

export function UploadPDFScreen({ onNavigate }) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    author: '',
    category: 'General',
    description: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notifyPDFUpload, notifyConversionComplete, notifyConversionError } = useNotificationHelpers();
  const { uploadPDF, validateFile, getStatusIcon, getStatusColor, isAuthenticated } = usePDFUpload();
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setSelectedFile(file);
    // Auto-populate title from filename if not set
    if (!uploadForm.title) {
      setUploadForm(prev => ({
        ...prev,
        title: file.name.replace('.pdf', '').replace(/[_-]/g, ' ')
      }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file first');
      return;
    }

    if (!isAuthenticated) {
      alert('Please sign in to upload PDFs');
      onNavigate('login');
      return;
    }

    if (!uploadForm.title.trim()) {
      alert('Please enter a title for your book');
      return;
    }

    const uploadData: PDFUploadData = {
      title: uploadForm.title.trim(),
      author: uploadForm.author.trim() || 'Unknown Author',
      file: selectedFile,
      category: uploadForm.category,
      description: uploadForm.description.trim()
    };

    try {
      const result = await uploadPDF(uploadData, setUploadProgress);
      
      if (result.success) {
        console.log('Upload successful, book ID:', result.bookId);
        // The success notification is handled by the service
      } else {
        console.error('Upload failed:', result.error);
        // The error notification is handled by the service
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Upload failed',
        fileName: selectedFile.name
      });
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setUploadProgress({ status: 'idle', progress: 0, message: '' });
    setSelectedFile(null);
    setUploadForm({ title: '', author: '', category: 'General', description: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusText = () => {
    if (uploadProgress.message) return uploadProgress.message;
    
    switch (uploadProgress.status) {
      case 'uploading':
        return 'Uploading PDF...';
      case 'processing':
        return 'Converting to audio...';
      case 'completed':
        return 'Conversion complete!';
      case 'error':
        return 'Upload failed';
      default:
        return '';
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Poppins, sans-serif',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #F3F4F6'
      }}>
        <button 
          onClick={() => onNavigate('back')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#374151'
          }}
        >
          ←
        </button>
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#374151',
          margin: 0
        }}>
          Upload PDF
        </h2>
        <div style={{ width: '24px' }}></div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        paddingBottom: '8rem'
      }}>
        {uploadProgress.status === 'idle' && (
          <div>
            {/* File Upload Section */}
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                backgroundColor: selectedFile ? '#E3F2FD' : '#F3F4F6',
                borderRadius: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '3rem',
                border: selectedFile ? '2px solid #4A90E2' : '2px dashed #D1D5DB',
                cursor: 'pointer'
              }}
              onClick={handleChooseFile}
              >
                {selectedFile ? '📄' : '📤'}
              </div>
              
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                {selectedFile ? selectedFile.name : 'Choose PDF File'}
              </h3>
              
              {selectedFile && (
                <p style={{
                  color: '#4A90E2',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}>
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <button 
                onClick={handleChooseFile}
                style={{
                  backgroundColor: '#4A90E2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '1rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
                  marginBottom: '1rem'
                }}
              >
                {selectedFile ? 'Choose Different File' : 'Choose PDF File'}
              </button>
            </div>

            {/* Book Information Form */}
            {selectedFile && (
              <div style={{
                backgroundColor: '#F9FAFB',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '1rem'
                }}>
                  Book Information
                </h4>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter book title"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      fontFamily: 'Poppins, sans-serif',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Author
                  </label>
                  <input
                    type="text"
                    value={uploadForm.author}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Enter author name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      fontFamily: 'Poppins, sans-serif',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Category
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      fontFamily: 'Poppins, sans-serif',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="General">General</option>
                    <option value="Self-Help">Self-Help</option>
                    <option value="Business">Business</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Educational">Educational</option>
                    <option value="Biography">Biography</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the book"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      fontFamily: 'Poppins, sans-serif',
                      backgroundColor: '#ffffff',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && (
              <button 
                onClick={handleUpload}
                disabled={!uploadForm.title.trim()}
                style={{
                  width: '100%',
                  height: '52px',
                  backgroundColor: uploadForm.title.trim() ? '#4A90E2' : '#9CA3AF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '1rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: uploadForm.title.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: uploadForm.title.trim() ? '0 4px 12px rgba(74, 144, 226, 0.3)' : 'none'
                }}
              >
                🚀 Start Upload & Conversion
              </button>
            )}

            {/* Supported Features */}
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '0.75rem'
            }}>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                What happens next:
              </h4>
              <ul style={{
                fontSize: '0.8rem',
                color: '#6B7280',
                textAlign: 'left',
                paddingLeft: '1rem',
                lineHeight: '1.6',
                margin: 0
              }}>
                <li>PDF text will be extracted</li>
                <li>High-quality audio will be generated</li>
                <li>Book will be added to your library</li>
                <li>You'll get notified when ready</li>
              </ul>
            </div>
          </div>
        )}

        {uploadProgress.status !== 'idle' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '120px',
              height: '120px',
              backgroundColor: getStatusColor(uploadProgress.status),
              borderRadius: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              fontSize: '3rem',
              color: 'white'
            }}>
              {getStatusIcon(uploadProgress.status)}
            </div>
            
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem'
            }}>
              {getStatusText()}
            </h3>
            
            {uploadProgress.fileName && (
              <p style={{
                color: '#6B7280',
                fontSize: '1rem',
                marginBottom: '2rem'
              }}>
                {uploadProgress.fileName}
              </p>
            )}
            
            {uploadProgress.status !== 'completed' && uploadProgress.status !== 'error' && (
              <div style={{
                width: '100%',
                maxWidth: '300px',
                margin: '0 auto 2rem'
              }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{
                      height: '100%',
                      backgroundColor: '#4A90E2',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease',
                      width: `${uploadProgress.progress}%`
                    }}
                  ></div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  marginTop: '0.5rem'
                }}>
                  <span>Processing...</span>
                  <span>{uploadProgress.progress}%</span>
                </div>
              </div>
            )}
            
            {(uploadProgress.status === 'completed' || uploadProgress.status === 'error') && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                width: '100%',
                maxWidth: '280px',
                margin: '0 auto'
              }}>
                {uploadProgress.status === 'completed' ? (
                  <button 
                    onClick={() => onNavigate('library')}
                    style={{
                      width: '100%',
                      height: '52px',
                      backgroundColor: '#4A90E2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '1rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
                    }}
                  >
                    Go to Library
                  </button>
                ) : (
                  <button 
                    onClick={handleReset}
                    style={{
                      width: '100%',
                      height: '52px',
                      backgroundColor: '#EF4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '1rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    Try Again
                  </button>
                )}
                <button 
                  onClick={handleReset}
                  style={{
                    width: '100%',
                    height: '48px',
                    backgroundColor: 'white',
                    color: '#6B7280',
                    border: '1px solid #E5E7EB',
                    borderRadius: '1rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  {uploadProgress.status === 'completed' ? 'Upload Another' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}