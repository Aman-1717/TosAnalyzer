/**
 * TOS Comparison API Service
 * Handles API calls to the backend for document comparison
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Compare two TOS documents
 * @param {File} file1 - First document (PDF or TXT)
 * @param {File} file2 - Second document (PDF or TXT)
 * @returns {Promise<Object>} Comparison results
 */
export const compareDocuments = async (file1, file2) => {
  try {
    // Validate files
    if (!file1 || !file2) {
      throw new Error('Both files are required for comparison');
    }

    // Validate file types
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file1.type) || !allowedTypes.includes(file2.type)) {
      throw new Error('Only PDF and TXT files are supported');
    }

    // Validate file sizes (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file1.size > maxSize || file2.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    // Make API request
    const response = await fetch(`${API_BASE_URL}/api/compare`, {
      method: 'POST',
      body: formData,
    });

    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Comparison failed');
    }

    return result;

  } catch (error) {
    console.error('Error comparing documents:', error);
    throw error;
  }
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export const validateFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }

  // Check file type
  const allowedTypes = ['application/pdf', 'text/plain'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Only PDF and TXT files are supported');
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB');
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push('File cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type display name
 * @param {string} mimeType - File MIME type
 * @returns {string} Display name
 */
export const getFileTypeDisplay = (mimeType) => {
  switch (mimeType) {
    case 'application/pdf':
      return 'PDF';
    case 'text/plain':
      return 'TXT';
    default:
      return 'Unknown';
  }
};
