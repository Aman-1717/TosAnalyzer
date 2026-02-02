import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUpload, FiAlertCircle, FiKey } from 'react-icons/fi';
import { extractTextFromPDF } from '../../services/pdfService';
import {
  simplifyLegalText,
  identifyRiskyClauses,
  summarizeLegalDocument,
  testApiConnection,
  resetMockDataFlag,
  setApiKey
} from '../../services/geminiService';
import ApiKeySetup from './ApiKeySetup';
import ApiKeyInput from './ApiKeyInput';

function FileUploader({ onFileProcessed, setIsLoading, navigate, fullProcessing = false }) {
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  // Auto-set API key from environment on component mount
  useEffect(() => {
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('Environment API key:', envApiKey ? 'Found' : 'Not found');

    if (envApiKey) {
      setApiKey(envApiKey);
      setShowApiKeyInput(false);
      console.log('Using environment API key');
    } else {
      const storedApiKey = localStorage.getItem('geminiApiKey');
      console.log('Stored API key:', storedApiKey ? 'Found' : 'Not found');

      // Temporarily disable API key requirement for testing
      console.log('Temporarily skipping API key requirement for testing');
      setShowApiKeyInput(false);
      setWarning('Running in demo mode - API key not required for testing');

      // if (!storedApiKey) {
      //   console.log('No API key found, showing input');
      //   setShowApiKeyInput(true);
      // } else {
      //   console.log('Using stored API key');
      //   setApiKey(storedApiKey);
      //   setShowApiKeyInput(false);
      // }
    }
  }, []);

  // Handle API key submission
  const handleApiKeySubmit = (apiKey) => {
    // Store API key in localStorage
    localStorage.setItem('geminiApiKey', apiKey);
    // Update the API key in the service
    setApiKey(apiKey);
    // Hide the API key input
    setShowApiKeyInput(false);
    // Reset any errors
    setError(null);
  };

  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      // Check if file is a valid Blob
      if (!(file instanceof Blob)) {
        console.error('Invalid file object:', file);
        reject(new Error('Invalid file object. Expected a Blob or File.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Error reading file: ' + (error.message || 'Unknown error')));
      };
      reader.readAsText(file);
    });
  };

  // Handle file processing
  const processFile = useCallback(async (file) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Processing file:', file.name);
      console.log('File type:', file.type);
      
      let extractedText = '';
      
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        console.log('Processing PDF file...');
        extractedText = await extractTextFromPDF(file);
      } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        console.log('Processing text file...');
        extractedText = await readFileAsText(file);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword' ||
        file.name.toLowerCase().endsWith('.docx') ||
        file.name.toLowerCase().endsWith('.doc')
      ) {
        console.log('Processing Word document...');
        // For now, try to read as text (this is a limitation - proper DOCX parsing would need a library)
        try {
          extractedText = await readFileAsText(file);
          if (!extractedText || extractedText.trim() === '') {
            throw new Error('Could not extract text from Word document. Please save as PDF or TXT format for better results.');
          }
        } catch (readError) {
          throw new Error('Word document processing failed. Please convert to PDF or TXT format.');
        }
      } else {
        throw new Error(`Unsupported file type: ${file.type || 'unknown'}. Please upload a PDF, TXT, DOC, or DOCX file.`);
      }
      
      if (!extractedText || extractedText.trim() === '') {
        throw new Error('Could not extract text from the file. The file may be empty or corrupted.');
      }
      
      console.log('Text extracted successfully, length:', extractedText.length);
      
      // Truncate text if it's too long
      const maxLength = 100000; // Adjust based on Gemini's limits
      const truncatedText = extractedText.length > maxLength 
        ? extractedText.substring(0, maxLength) + '... (text truncated due to length)'
        : extractedText;
      
      console.log('Processing document with Gemini API...');
      
      // Check if we're in simple mode (Future Predictor) or full processing mode (Analyze page)
      if (!navigate && !fullProcessing) {
        // Simple mode: just extract text for Future Predictor
        console.log('Simple text extraction for Future Predictor');

        const result = {
          file: file,
          content: extractedText
        };

        onFileProcessed(result);
      } else {
        // Full processing mode for other pages
        try {
          // Check if we have an API key, if not use mock data
          const storedApiKey = localStorage.getItem('geminiApiKey');
          const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;

          let simplifiedTextResult, riskyClausesResult, summaryResult;

          if (storedApiKey || envApiKey) {
            // Process with real Gemini service
            console.log('Processing with Gemini API...');
            console.log('Environment API key available:', !!envApiKey);
            console.log('Stored API key available:', !!storedApiKey);

            try {
              [simplifiedTextResult, riskyClausesResult, summaryResult] = await Promise.all([
                simplifyLegalText(truncatedText),
                identifyRiskyClauses(truncatedText),
                summarizeLegalDocument(truncatedText)
              ]);
              console.log('Gemini API processing completed successfully');
            } catch (error) {
              console.error('Gemini API processing failed:', error);
              throw error; // Re-throw to trigger fallback
            }
          } else {
            // Use mock data for demonstration
            console.log('Using mock data for demonstration...');
            simplifiedTextResult = `This is a simplified version of your Terms of Service document:\n\n• You agree to use our service responsibly\n• We may collect and use your data as described\n• Our liability is limited\n• We can terminate your account if needed\n• These terms may change over time\n\nThis is a demo version. For full AI analysis, please provide an API key.`;

            riskyClausesResult = [
              {
                clause: "Limitation of Liability",
                risk: "High",
                explanation: "This clause limits the company's responsibility for damages. (Demo analysis)"
              },
              {
                clause: "Data Collection",
                risk: "Medium",
                explanation: "The company may collect personal information. (Demo analysis)"
              }
            ];

            summaryResult = "This Terms of Service document contains standard clauses about user responsibilities, data usage, and liability limitations. This is a demo analysis - for detailed AI-powered insights, please provide an API key.";
          }

          console.log('Document processed successfully');

          // Create document object
          const document = {
            fileName: file.name,
            originalText: extractedText,
            simplifiedText: simplifiedTextResult,
            riskyClauses: riskyClausesResult,
            summary: summaryResult
          };

          // Pass the processed document to the parent component
          onFileProcessed(document);

          // Navigate to the results page (only if navigate function is provided)
          if (navigate) {
            navigate('/results');
          }
        } catch (apiError) {
          console.error('API processing error:', apiError);
          setError(`API processing failed: ${apiError.message}. Please check your API key and try again.`);
        }
      }
    } catch (error) {
      console.error('File processing error:', error);
      setError(`Error processing file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, onFileProcessed, navigate]);
  
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: useCallback((acceptedFiles, rejectedFiles) => {
      console.log('onDrop called with:', { acceptedFiles, rejectedFiles });

      // Handle rejected files
      if (rejectedFiles && rejectedFiles.length > 0) {
        console.log('Rejected files:', rejectedFiles);
        const rejectedFile = rejectedFiles[0];
        const errors = rejectedFile.errors || [];
        console.log('Rejection errors:', errors);

        if (errors.some(e => e.code === 'file-invalid-type')) {
          setError('Invalid file type. Please upload a PDF, TXT, DOC, or DOCX file.');
        } else if (errors.some(e => e.code === 'file-too-large')) {
          setError('File is too large. Please upload a file smaller than 10MB.');
        } else {
          setError('File upload failed. Please try again.');
        }
        return;
      }

      // Handle accepted files
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        console.log('File accepted:', file.name, file.type, file.size);
        setError(null); // Clear any previous errors
        processFile(file);
      } else {
        console.log('No files accepted');
      }
    }, [processFile]),
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    noClick: false, // Ensure clicking is enabled
    noKeyboard: false, // Ensure keyboard access is enabled
    onDropRejected: (rejectedFiles) => {
      console.log('Files rejected in onDropRejected:', rejectedFiles);
    },
    onError: (error) => {
      console.error('Dropzone error:', error);
      setError('File upload error. Please try again.');
    },
    onFileDialogCancel: () => {
      console.log('File dialog cancelled');
    },
    onFileDialogOpen: () => {
      console.log('File dialog opened');
    }
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {showApiKeySetup ? (
        <ApiKeySetup onClose={() => setShowApiKeySetup(false)} />
      ) : (
        <>
          <div
            {...getRootProps()}
            className="cursor-pointer"
            onClick={(e) => {
              console.log('Dropzone area clicked');
              // Fallback: manually trigger file dialog if dropzone doesn't work
              if (!isDragActive) {
                open();
              }
            }}
          >
            <input {...getInputProps()} />
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragActive
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 shadow-lg'
                  : 'border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
              }`}
              style={{
                borderStyle: 'dashed',
                borderWidth: '2px'
              }}
            >
              {/* Upload Icon */}
              <div className="mb-6">
                <FiUpload className={`mx-auto h-16 w-16 transition-colors ${
                  isDragActive
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
              </div>

              {/* Main Text */}
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                {isDragActive ? 'Drop the file here' : 'Upload Terms of Service'}
              </h3>

              {/* Description */}
              <p className="text-base text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                Drag and drop a PDF, TXT, DOC, or DOCX file, or click to browse
              </p>

              {/* File Size Info */}
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Maximum file size: 10MB
              </p>

              {/* Visual Enhancement */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-blue-50/20 dark:to-blue-900/10 pointer-events-none"></div>
            </motion.div>
          </div>

          {/* API key input */}
          {showApiKeyInput && (
            <div className="mt-4">
              <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
              <div className="mt-2 text-center">
                <button
                  onClick={() => {
                    setShowApiKeyInput(false);
                    setWarning('API key not provided. Using mock data for demonstration.');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Skip for now (use demo mode)
                </button>
              </div>
            </div>
          )}

          {/* Display any errors */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Display any warnings */}
          {warning && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded flex items-start">
              <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FileUploader;
