import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiAlertCircle, FiKey } from 'react-icons/fi';
import { extractTextFromPDF } from '../../services/pdfService';
import { 
  simplifyLegalText, 
  identifyRiskyClauses, 
  summarizeLegalDocument, 
  testGeminiAPI,
  resetMockDataFlag,
  setApiKey
} from '../../services/geminiService';
import ApiKeySetup from './ApiKeySetup';
import ApiKeyInput from './ApiKeyInput';

function CustomFileUploader({ onFileProcessed, setIsLoading, navigate, mode = 'full' }) {
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
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
    }
  }, []);

  // Handle API key submission
  const handleApiKeySubmit = (apiKey) => {
    localStorage.setItem('geminiApiKey', apiKey);
    setApiKey(apiKey);
    setShowApiKeyInput(false);
    setError(null);
  };

  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
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

  // Validate file type and size
  const validateFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    const allowedExtensions = ['.pdf', '.txt', '.docx', '.doc'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    // Check file size
    if (file.size > maxSize) {
      throw new Error('File is too large. Please upload a file smaller than 10MB.');
    }
    
    // Check file type
    const isValidType = allowedTypes.includes(file.type) || 
                       allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      throw new Error('Invalid file type. Please upload a PDF, TXT, DOC, or DOCX file.');
    }
    
    return true;
  };

  // Handle file processing
  const processFile = useCallback(async (file) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Processing file:', file.name);
      console.log('File type:', file.type);
      
      // Validate file
      validateFile(file);
      
      let extractedText = '';
      
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        console.log('Processing PDF file...');
        try {
          extractedText = await extractTextFromPDF(file);
          console.log('PDF text extraction result:', extractedText ? extractedText.length + ' characters' : 'No text extracted');
        } catch (pdfError) {
          console.error('PDF extraction failed:', pdfError);
          extractedText = 'Failed to extract text from PDF. Please try uploading a text file instead.';
        }
      } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        console.log('Processing text file...');
        try {
          extractedText = await readFileAsText(file);
          console.log('Text file extraction result:', extractedText ? extractedText.length + ' characters' : 'No text extracted');
        } catch (textError) {
          console.error('Text file extraction failed:', textError);
          extractedText = 'Failed to read text file. Please check if the file contains readable text.';
        }
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword' ||
        file.name.toLowerCase().endsWith('.docx') ||
        file.name.toLowerCase().endsWith('.doc')
      ) {
        console.log('Processing Word document...');
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
      const maxLength = 100000;
      const truncatedText = extractedText.length > maxLength 
        ? extractedText.substring(0, maxLength) + '... (text truncated due to length)'
        : extractedText;
      
      console.log('Processing document...');
      
      // Check if we're in Future Predictor mode (simple processing)
      if (mode === 'simple') {
        console.log('Simple text extraction for Future Predictor');
        const result = {
          file: file,
          content: extractedText
        };
        onFileProcessed(result);
      } else {
        // Full processing mode for other pages
        try {
          const storedApiKey = localStorage.getItem('geminiApiKey');
          const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
          
          let simplifiedTextResult, riskyClausesResult, summaryResult;
          
          if (storedApiKey || envApiKey) {
            console.log('Processing with Gemini API...');
            [simplifiedTextResult, riskyClausesResult, summaryResult] = await Promise.all([
              simplifyLegalText(truncatedText),
              identifyRiskyClauses(truncatedText),
              summarizeLegalDocument(truncatedText)
            ]);
          } else {
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
          console.log('Extracted text length:', extractedText ? extractedText.length : 0);
          console.log('Extracted text preview:', extractedText ? extractedText.substring(0, 200) + '...' : 'No text');

          const document = {
            fileName: file.name,
            originalText: extractedText || 'No text could be extracted from this document. Please try uploading a different file or check if the file contains readable text.',
            simplifiedText: simplifiedTextResult,
            riskyClauses: riskyClausesResult,
            summary: summaryResult
          };

          onFileProcessed(document);

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

  // Handle file selection
  const handleFileSelect = (files) => {
    console.log('handleFileSelect called with:', files);
    if (files && files.length > 0) {
      const file = files[0];
      console.log('File selected:', file.name, file.type, file.size);
      console.log('Mode:', mode);
      setError(null);
      processFile(file);
    } else {
      console.log('No files selected');
    }
  };

  // Handle file input change
  const handleFileInputChange = (event) => {
    console.log('File input changed:', event.target.files);
    handleFileSelect(event.target.files);
  };

  // Handle drag events
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    handleFileSelect(event.dataTransfer.files);
  };

  // Handle click to open file dialog
  const handleClick = () => {
    console.log('Upload area clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref is null');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {showApiKeySetup ? (
        <ApiKeySetup onClose={() => setShowApiKeySetup(false)} />
      ) : (
        <>
          <div 
            className="cursor-pointer"
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept=".pdf,.txt,.doc,.docx"
              style={{ display: 'none' }}
            />
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`relative border-2 border-dashed rounded-xl py-6 px-4 text-center transition-all duration-300 ${
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
              <div className="mb-3">
                <FiUpload className={`mx-auto h-10 w-10 transition-colors ${
                  isDragActive
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
              </div>

              {/* Main Text */}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                {isDragActive ? 'Drop the file here' : 'Upload Terms of Service'}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 max-w-sm mx-auto">
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

export default CustomFileUploader;
