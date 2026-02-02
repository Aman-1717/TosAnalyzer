import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX, FiLoader } from 'react-icons/fi';
import { compareDocuments, validateFile, formatFileSize, getFileTypeDisplay } from '../../services/tosComparisonApi';
import DiffVisualization from './DiffVisualization';

/**
 * TOS Comparison Component
 * Allows users to upload two documents and compare them
 */
const TOSComparison = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Handle file drop for first document
   */
  const onDrop1 = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Please upload only PDF or TXT files');
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }
      setFile1(file);
      setError(null);
    }
  };

  /**
   * Handle file drop for second document
   */
  const onDrop2 = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Please upload only PDF or TXT files');
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }
      setFile2(file);
      setError(null);
    }
  };

  // Configure dropzones
  const dropzone1 = useDropzone({
    onDrop: onDrop1,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    multiple: false
  });

  const dropzone2 = useDropzone({
    onDrop: onDrop2,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    multiple: false
  });

  /**
   * Remove selected file
   */
  const removeFile = (fileNumber) => {
    if (fileNumber === 1) {
      setFile1(null);
    } else {
      setFile2(null);
    }
    setError(null);
  };

  /**
   * Handle document comparison
   */
  const handleCompare = async () => {
    if (!file1 || !file2) {
      setError('Please upload both documents before comparing');
      return;
    }

    setIsComparing(true);
    setError(null);
    setComparisonResult(null);

    try {
      const result = await compareDocuments(file1, file2);
      setComparisonResult(result);
    } catch (err) {
      setError(err.message || 'Failed to compare documents');
    } finally {
      setIsComparing(false);
    }
  };

  /**
   * Reset the comparison
   */
  const resetComparison = () => {
    setFile1(null);
    setFile2(null);
    setComparisonResult(null);
    setError(null);
  };

  /**
   * Render file upload area
   */
  const renderFileUpload = (dropzone, file, fileNumber, title) => {
    const { getRootProps, getInputProps, isDragActive } = dropzone;

    return (
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        
        {!file ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">or click to select</p>
            <p className="text-xs text-gray-400">
              Supports PDF and TXT files (max 10MB)
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiFile className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getFileTypeDisplay(file.type)} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(fileNumber)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                title="Remove file"
              >
                <FiX className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Terms of Service Comparison
          </h1>
          <p className="text-gray-600">
            Upload two documents to see what has changed between versions
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {renderFileUpload(dropzone1, file1, 1, "Original Document")}
            {renderFileUpload(dropzone2, file2, 2, "Updated Document")}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCompare}
              disabled={!file1 || !file2 || isComparing}
              className={`
                px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2
                ${file1 && file2 && !isComparing
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isComparing ? (
                <>
                  <FiLoader className="h-5 w-5 animate-spin" />
                  <span>Comparing...</span>
                </>
              ) : (
                <span>Compare Documents</span>
              )}
            </button>

            {(file1 || file2 || comparisonResult) && (
              <button
                onClick={resetComparison}
                className="px-6 py-3 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Comparison Results */}
        {comparisonResult && (
          <DiffVisualization 
            comparisonResult={comparisonResult}
          />
        )}
      </div>
    </div>
  );
};

export default TOSComparison;
