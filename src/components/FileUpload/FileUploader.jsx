import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

function FileUploader({ onFileProcessed, setIsLoading }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('pdfFile', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Server responded with an error');
      }
      
      const data = await response.json();
      // Add the filename to the response data
      data.fileName = file.name;
      onFileProcessed(data);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to process file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-lg'
            : 'border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
        }`}
        style={{
          borderStyle: 'dashed',
          borderWidth: '2px'
        }}
      >
        <input {...getInputProps()} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center"
        >
          {/* Upload Icon */}
          <div className="mb-6">
            <FiUploadCloud className={`h-16 w-16 transition-colors ${
              isDragActive
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`} />
          </div>

          {/* Main Text */}
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            {isDragActive ? 'Drop the PDF here' : 'Upload Terms of Service'}
          </h3>

          {/* Description */}
          <p className="text-base text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
            Drag and drop a PDF file, or click to browse
          </p>

          {/* File Size Info */}
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Maximum file size: 10MB
          </p>

          {/* Visual Enhancement */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-blue-50/20 dark:to-blue-900/10 pointer-events-none"></div>
        </motion.div>
      </div>

      {file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center">
            <FiFile className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs sm:max-w-sm md:max-w-md">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFile();
            }}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <FiX className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={!file}
        className={`mt-6 w-full py-3 px-4 rounded-md font-medium text-white ${
          file
            ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
            : 'bg-gray-400 cursor-not-allowed'
        } transition-all duration-200`}
      >
        Analyze Document
      </motion.button>
    </div>
  );
}

export default FileUploader;