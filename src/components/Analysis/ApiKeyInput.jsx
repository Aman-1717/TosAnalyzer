import React, { useState } from 'react';
import { FiKey, FiEye, FiEyeOff } from 'react-icons/fi';

function ApiKeyInput({ onApiKeySubmit }) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };
  
  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <FiKey className="mr-2" /> Enter your Gemini API Key
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AI..."
            className="w-full p-2 pr-10 border rounded dark:bg-gray-800 dark:border-gray-600"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showApiKey ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Your API key will be stored locally in your browser and not sent to our servers.
        </div>
        
        <button
          type="submit"
          disabled={!apiKey.trim()}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Save API Key
        </button>
      </form>
    </div>
  );
}

export default ApiKeyInput;