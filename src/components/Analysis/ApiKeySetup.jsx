import React, { useState } from 'react';
import { FiKey, FiInfo, FiExternalLink } from 'react-icons/fi';

function ApiKeySetup({ onClose }) {
  const [copied, setCopied] = useState(false);
  
  const copyEnvExample = () => {
    navigator.clipboard.writeText('VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <FiKey className="mr-2" /> Set Up Your Gemini API Key
      </h2>
      
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <FiInfo className="mr-2" /> Why do I need an API key?
        </h3>
        <p className="mb-2">
          This application uses Google's Gemini AI to analyze legal documents. You need your own API key to:
        </p>
        <ul className="list-disc pl-5 mb-2">
          <li>Ensure your documents are processed securely under your own account</li>
          <li>Get the most accurate and up-to-date AI analysis</li>
          <li>Avoid using generic mock data for your important documents</li>
        </ul>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">How to get your API key:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Go to <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">Google AI Studio <FiExternalLink className="ml-1" /></a></li>
          <li>Sign in with your Google account</li>
          <li>Click on "Get API key" or go to the API keys section</li>
          <li>Create a new API key and copy it</li>
        </ol>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">How to add your API key to this app:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Create a <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code> file in the root of the project</li>
          <li>
            Add the following line to the file:
            <div className="flex items-center mt-1">
              <code className="bg-gray-100 dark:bg-gray-700 p-2 rounded flex-grow">
                VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
              </code>
              <button 
                onClick={copyEnvExample}
                className="ml-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </li>
          <li>Replace <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">YOUR_API_KEY_HERE</code> with your actual API key</li>
          <li>Restart the development server</li>
        </ol>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export default ApiKeySetup;