import React, { useState, useRef, useEffect } from 'react';
import { FiHelpCircle, FiLoader, FiX, FiBookOpen } from 'react-icons/fi';
import { explainTextInPlainEnglish } from '../../services/geminiService';

/**
 * WordTranslator Component
 * Simple word-by-word translation for complex legal terms
 */
const WordTranslator = ({ 
  text, 
  className = '', 
  onWordExplain = null 
}) => {
  const [selectedWord, setSelectedWord] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState('');
  const textRef = useRef(null);

  /**
   * Handle word selection
   */
  const handleWordSelection = () => {
    const selection = window.getSelection();
    const selected = selection.toString().trim();
    
    // Only process single words or very short phrases (1-2 words max)
    const words = selected.split(/\s+/).filter(word => word.length > 0);
    
    if (selected && words.length >= 1 && words.length <= 2 && selected.length >= 3) {
      setSelectedWord(selected);
      setError('');
      
      // Get selection position for tooltip
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      
      // Auto-explain the word immediately
      explainWord(selected);
    } else {
      clearSelection();
    }
  };

  /**
   * Explain the selected word
   */
  const explainWord = async (word) => {
    setIsExplaining(true);
    setError('');
    
    try {
      // Create a simple prompt for word explanation
      const result = await explainTextInPlainEnglish(
        word, 
        `This is a legal term that needs simple explanation.`
      );
      
      setExplanation(result);
      setShowExplanation(true);
      
      // Call parent callback if provided
      if (onWordExplain) {
        onWordExplain(word, result);
      }
    } catch (err) {
      console.error('Error explaining word:', err);
      setError(`Could not explain "${word}". Please try again.`);
    } finally {
      setIsExplaining(false);
    }
  };

  /**
   * Clear selection and explanation
   */
  const clearSelection = () => {
    setSelectedWord('');
    setExplanation('');
    setShowExplanation(false);
    setError('');
    window.getSelection().removeAllRanges();
  };

  /**
   * Handle clicking outside to clear selection
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (textRef.current && !textRef.current.contains(event.target)) {
        clearSelection();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      {/* Selectable Text */}
      <div
        ref={textRef}
        className={`${className} select-text cursor-text relative hover:bg-gray-700/20 p-2 rounded transition-colors`}
        onMouseUp={handleWordSelection}
        onTouchEnd={handleWordSelection}
        title="Select any complex word to get instant explanation"
      >
        {text}
      </div>

      {/* Loading Tooltip */}
      {selectedWord && isExplaining && (
        <div
          className="fixed z-50 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="flex items-center space-x-2">
            <FiLoader className="h-4 w-4 animate-spin" />
            <span>Explaining "{selectedWord}"...</span>
          </div>
        </div>
      )}

      {/* Word Explanation Popup */}
      {showExplanation && explanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <div className="flex items-center space-x-2">
                <FiBookOpen className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-medium text-white">Word Translation</h3>
              </div>
              <button
                onClick={clearSelection}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Close"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Selected Word */}
              <div className="mb-4 text-center">
                <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <span className="text-lg font-medium">"{selectedWord}"</span>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Plain English:</h4>
                <div 
                  className="text-white leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: explanation.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }} 
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-600 bg-gray-750">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  💡 Select any complex word for instant translation
                </p>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-900 border border-red-700 rounded-lg p-3 max-w-sm">
          <div className="flex items-center space-x-2">
            <span className="text-red-300 text-sm">{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-300"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordTranslator;
