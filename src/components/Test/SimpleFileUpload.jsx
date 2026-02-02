import React, { useState } from 'react';

function SimpleFileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log('File selected:', file);
    setSelectedFile(file);
    alert(`File selected: ${file ? file.name : 'None'}`);
  };

  const handleClick = () => {
    console.log('Simple upload clicked');
    alert('Simple upload clicked!');
  };

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h3 className="text-lg font-bold mb-4">Simple File Upload Test</h3>
      
      <div 
        onClick={handleClick}
        className="p-4 border-2 border-dashed border-blue-500 rounded cursor-pointer mb-4"
      >
        <input 
          type="file" 
          onChange={handleFileChange}
          accept=".pdf,.txt,.doc,.docx"
          className="w-full"
        />
        <p>Click to select a file</p>
      </div>
      
      {selectedFile && (
        <div className="mt-4 p-2 bg-green-100 rounded">
          <p>Selected: {selectedFile.name}</p>
          <p>Type: {selectedFile.type}</p>
          <p>Size: {selectedFile.size} bytes</p>
        </div>
      )}
    </div>
  );
}

export default SimpleFileUpload;
