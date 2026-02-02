import React, { useState, useRef, useEffect } from 'react';
import { FiHelpCircle, FiLoader, FiX, FiBookOpen, FiAlertCircle } from 'react-icons/fi';
import { explainTextInPlainEnglish } from '../../services/geminiService';

/**
 * SelectableText Component
 * Allows users to select any text and get plain English explanations
 */
const SelectableText = ({ 
  text, 
  className = '', 
  context = '',
  onSelectionExplain = null 
}) => {
  const [selectedText, setSelectedText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState('');
  const textRef = useRef(null);
  const explanationRef = useRef(null);

  /**
   * Handle text selection - only for single words or short phrases
   */
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selected = selection.toString().trim();

    // Only process single words or short phrases (max 3 words)
    const wordCount = selected.split(/\s+/).length;

    if (selected && selected.length > 2 && wordCount <= 3) {
      setSelectedText(selected);
      setError('');

      // Get selection position for tooltip placement
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });

      // Clear any existing explanation
      setExplanation('');
      setShowExplanation(false);
    } else {
      setSelectedText('');
      setShowExplanation(false);
    }
  };

  /**
   * Handle explaining selected text
   */
  const handleExplainText = async () => {
    if (!selectedText) return;
    
    setIsExplaining(true);
    setError('');
    
    try {
      const result = await explainTextInPlainEnglish(selectedText, context);
      setExplanation(result);
      setShowExplanation(true);
      
      // Call parent callback if provided
      if (onSelectionExplain) {
        onSelectionExplain(selectedText, result);
      }
    } catch (err) {
      console.error('Error explaining text:', err);
      setError(err.message || 'Failed to explain the selected text');
    } finally {
      setIsExplaining(false);
    }
  };

  /**
   * Clear selection and explanation
   */
  const clearSelection = () => {
    setSelectedText('');
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
      if (
        textRef.current && 
        !textRef.current.contains(event.target) &&
        explanationRef.current &&
        !explanationRef.current.contains(event.target)
      ) {
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
        className={`${className} select-text cursor-text relative`}
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
      >
        {text}
        
        {/* Selection Highlight Overlay */}
        {selectedText && (
          <div className="absolute inset-0 pointer-events-none">
            <style jsx>{`
              ::selection {
                background-color: rgba(59, 130, 246, 0.3);
                color: inherit;
              }
              ::-moz-selection {
                background-color: rgba(59, 130, 246, 0.3);
                color: inherit;
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Selection Tooltip */}
      {selectedText && !showExplanation && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-3"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExplainText}
              disabled={isExplaining}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-md transition-colors"
            >
              {isExplaining ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" />
                  <span>Explaining...</span>
                </>
              ) : (
                <>
                  <FiHelpCircle className="h-4 w-4" />
                  <span>Explain in Plain English</span>
                </>
              )}
            </button>
            <button
              onClick={clearSelection}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Clear selection"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
          
          {/* Selected text preview */}
          <div className="mt-2 text-xs text-gray-300 max-w-xs">
            Selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanation && explanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            ref={explanationRef}
            className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <div className="flex items-center space-x-2">
                <FiBookOpen className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-medium text-white">Plain English Explanation</h3>
              </div>
              <button
                onClick={clearSelection}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Close explanation"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Selected Text */}
              <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Text:</h4>
                <p className="text-sm text-white italic">"{selectedText}"</p>
              </div>

              {/* Explanation */}
              <div className="prose prose-invert max-w-none">
                <div 
                  className="text-gray-300 leading-relaxed whitespace-pre-wrap"
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
                  💡 Tip: Select any complex text to get instant explanations
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
        <div className="fixed bottom-4 right-4 z-50 bg-red-900 border border-red-700 rounded-lg p-4 max-w-sm">
          <div className="flex items-start space-x-2">
            <FiAlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-300">Explanation Failed</h4>
              <p className="text-xs text-red-200 mt-1">{error}</p>
            </div>
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

export default SelectableText;
