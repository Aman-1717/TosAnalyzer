import { useState } from 'react';
import AccessibilityControls from '../AccessibilityControls/AccessibilityControls';

function TextDisplay({ originalText, simplifiedText, riskyClauses }) {
  const [fontSize, setFontSize] = useState('text-base');
  const [contrastMode, setContrastMode] = useState('normal');
  const [isReading, setIsReading] = useState(false);

  if (!originalText) {
    return null;
  }

  const getContrastClasses = () => {
    return contrastMode === 'high-contrast' 
      ? 'bg-black text-white border-gray-600' 
      : 'bg-white text-gray-800 border-gray-200';
  };

  return (
    <div className="w-full mt-8">
      <AccessibilityControls 
        onFontSizeChange={setFontSize}
        onContrastChange={setContrastMode}
        onTextToSpeech={setIsReading}
        text={simplifiedText}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg shadow-md ${getContrastClasses()}`}>
          <h2 className="text-xl font-semibold mb-4">Original Text</h2>
          <div className={`h-96 overflow-y-auto border p-4 rounded ${getContrastClasses()}`}>
            <p className={`whitespace-pre-line ${fontSize}`}>{originalText}</p>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-md ${getContrastClasses()}`}>
          <h2 className="text-xl font-semibold mb-4">Simplified Text</h2>
          <div className={`h-96 overflow-y-auto border p-4 rounded ${getContrastClasses()} ${isReading ? 'bg-blue-50' : ''}`}>
            <p className={`whitespace-pre-line ${fontSize}`}>{simplifiedText || "Simplified text will appear here."}</p>
          </div>
        </div>
        
        {riskyClauses && riskyClauses.length > 0 && (
          <div className={`col-span-1 md:col-span-2 p-6 rounded-lg shadow-md ${getContrastClasses()}`}>
            <h2 className="text-xl font-semibold mb-4">Risky Clauses Detected</h2>
            <ul className="divide-y divide-gray-200">
              {riskyClauses.map((clause, index) => (
                <li key={index} className="py-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-500">
                        !
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className={`font-medium ${fontSize} ${contrastMode === 'high-contrast' ? 'text-yellow-300' : 'text-gray-900'}`}>
                        {clause.type}
                      </p>
                      <p className={`${fontSize} ${contrastMode === 'high-contrast' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {clause.explanation}
                      </p>
                      <p className={`mt-1 italic p-2 rounded ${fontSize} ${
                        contrastMode === 'high-contrast' 
                          ? 'bg-gray-800 text-white' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {clause.text}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default TextDisplay;
