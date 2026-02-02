import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from PDF file
 * @param {File} file - PDF file to extract text from
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the file is not corrupted or password-protected.');
  }
};

/**
 * Read text from plain text file
 * @param {File} file - Text file to read
 * @returns {Promise<string>} - File content as text
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        if (!text || text.trim() === '') {
          reject(new Error('File appears to be empty or contains no readable text.'));
          return;
        }
        resolve(text);
      } catch (error) {
        reject(new Error('Failed to read file content.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file. Please try again.'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * Validate file type and size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default: 10)
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateFile = (file, maxSizeMB = 10) => {
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  const allowedExtensions = ['.pdf', '.txt', '.docx', '.doc'];
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }
  
  // Check file type
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
  
  if (!isValidType) {
    return {
      isValid: false,
      error: 'Unsupported file type. Please upload PDF, TXT, DOC, or DOCX files.'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Get file type description
 * @param {File} file - File to get description for
 * @returns {string} - Human-readable file type description
 */
export const getFileTypeDescription = (file) => {
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  
  switch (extension) {
    case '.pdf':
      return 'PDF Document';
    case '.txt':
      return 'Text Document';
    case '.docx':
      return 'Word Document (DOCX)';
    case '.doc':
      return 'Word Document (DOC)';
    default:
      return 'Document';
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
