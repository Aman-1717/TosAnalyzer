import { useState } from 'react';

function AccessibilityControls({ onFontSizeChange, onContrastChange, onTextToSpeech, text }) {
  const [speaking, setSpeaking] = useState(false);

  const handleTextToSpeech = () => {
    if (!text) return;
    
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    onTextToSpeech(speaking);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-3">Accessibility Options</h2>
      <div className="flex flex-wrap gap-4">
        <div>
          <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 mb-1">
            Font Size
          </label>
          <select 
            id="fontSize" 
            className="border border-gray-300 rounded-md p-2"
            onChange={(e) => onFontSizeChange(e.target.value)}
          >
            <option value="text-sm">Small</option>
            <option value="text-base" selected>Medium</option>
            <option value="text-lg">Large</option>
            <option value="text-xl">Extra Large</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="contrast" className="block text-sm font-medium text-gray-700 mb-1">
            Contrast Mode
          </label>
          <select 
            id="contrast" 
            className="border border-gray-300 rounded-md p-2"
            onChange={(e) => onContrastChange(e.target.value)}
          >
            <option value="normal" selected>Normal</option>
            <option value="high-contrast">High Contrast</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={handleTextToSpeech}
            className={`px-4 py-2 rounded-md ${speaking ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            disabled={!text}
          >
            {speaking ? 'Stop Reading' : 'Read Aloud'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccessibilityControls;