import { useState } from 'react';

function FileUpload({ onFileProcessed, setIsLoading }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    
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
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Terms of Service</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Select PDF file:
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Upload and Process
        </button>
      </form>
    </div>
  );
}

export default FileUpload;


