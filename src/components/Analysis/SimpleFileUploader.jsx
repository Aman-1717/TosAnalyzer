import { useState, useRef } from 'react';
import { FiUpload, FiAlertCircle } from 'react-icons/fi';

function SimpleFileUploader({ onFileProcessed, setIsLoading }) {
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Processing file:', file.name, file.type, file.size);
      
      // Simple text extraction
      let text = '';
      if (file.type === 'text/plain') {
        text = await file.text();
      } else {
        // For other file types, try to read as text
        text = await file.text();
      }
      
      console.log('Text extracted, length:', text.length);
      
      // Create mock analysis results
      const document = {
        fileName: file.name,
        originalText: text,
        simplifiedText: `Simplified version of ${file.name}:\n\n• Main terms and conditions\n• User responsibilities\n• Data usage policies\n• Liability limitations\n\n(This is a demo analysis)`,
        riskyClauses: [
          {
            clause: "Data Collection",
            risk: "Medium",
            explanation: "The document mentions data collection practices."
          },
          {
            clause: "Liability Limitation", 
            risk: "High",
            explanation: "Company limits its liability for damages."
          }
        ],
        summary: `Summary of ${file.name}: This document contains standard terms of service with data collection and liability clauses. (Demo analysis)`
      };
      
      console.log('Calling onFileProcessed with:', document);
      onFileProcessed(document);
      
    } catch (error) {
      console.error('File processing error:', error);
      setError(`Error processing file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (event) => {
    const files = event.target.files;
    console.log('File input changed:', files);
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    console.log('Upload area clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label className="cursor-pointer block">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept=".pdf,.txt,.doc,.docx"
          className="hidden"
        />
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
          <FiUpload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-1">
            Upload Terms of Service (Simple Version)
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click to browse for a file
          </p>
        </div>
      </label>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded flex items-start">
          <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default SimpleFileUploader;
