import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAccessibility } from '../contexts/AccessibilityContext';
import {
  FiEye, FiVolume2, FiType, FiSun, FiMoon, FiMonitor, FiSettings, FiGlobe,
FiZoomIn, FiMessageCircle, FiRotateCcw, FiPlay,
FiPause, FiSkipForward, FiSkipBack, FiRefreshCw, FiSave, FiHelpCircle,
FiUser, FiTarget, FiMaximize2, FiMinus, FiPlus,
FiArrowRight, FiMic, FiEdit3, FiUpload, FiFile, FiX
} from 'react-icons/fi';

import CustomFileUploader from '../components/Analysis/CustomFileUploader';

function AccessibilityPage() {
  // Use global accessibility context
  const {
    fontSize, setFontSize,
    fontFamily, setFontFamily,
    lineSpacing, setLineSpacing,
    letterSpacing, setLetterSpacing,
    theme, setTheme,
    contrastMode, setContrastMode,
    isSpeaking, setIsSpeaking,
    speechRate, setSpeechRate,
    highlightReading, setHighlightReading,
    currentReadingIndex, setCurrentReadingIndex,
    language, setLanguage,
    magnificationEnabled, setMagnificationEnabled,
    onScreenKeyboard, setOnScreenKeyboard,
    guidedReading, setGuidedReading,
    animationsDisabled, setAnimationsDisabled,
    settingsSaved,
    saveSettings,
    resetSettings,
    getContrastClasses,
    getThemeClasses,
    getTextClasses,
    getAnimationClasses,
    languages,
    fontFamilies,
    t // Translation function
  } = useAccessibility();

  // Local state for UI
  const [activeSection, setActiveSection] = useState('text');
  // Get the analyzed document from localStorage
  const [analyzedDocument, setAnalyzedDocument] = useState(null);
  // File upload state
  const [isProcessing, setIsProcessing] = useState(false);
  // Refs for functionality
  const textRef = useRef(null);
  const speechUtterance = useRef(null);
  useEffect(() => {
    // Try to get the analyzed document from localStorage
    const storedDocument = localStorage.getItem('analyzedDocument');
    console.log('=== ACCESSIBILITY PAGE DEBUG ===');
    console.log('Raw stored document:', storedDocument);
    console.log('localStorage keys:', Object.keys(localStorage));

    if (storedDocument) {
      try {
        const parsedDocument = JSON.parse(storedDocument);
        console.log('Parsed document structure:', {
          fileName: parsedDocument.fileName,
          hasOriginalText: !!parsedDocument.originalText,
          hasSimplifiedText: !!parsedDocument.simplifiedText,
          hasSummary: !!parsedDocument.summary,
          hasComparisonData: !!parsedDocument.comparisonData,
          keys: Object.keys(parsedDocument)
        });
        setAnalyzedDocument(parsedDocument);
      } catch (error) {
        console.error('Error parsing stored document:', error);
      }
    } else {
      console.log('No document found in localStorage');
    }

    // Settings are loaded automatically by the context
    return () => {
      if (speechUtterance.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  // Use the document text from the analyzed document, or fall back to sample text
  const textToDisplay = analyzedDocument ? (
    analyzedDocument.originalText ||
    analyzedDocument.simplifiedText ||
    analyzedDocument.summary ||
    "Document uploaded but no text available"
  ) : "No document uploaded. Please upload your TOS document above to use accessibility features with your own content.";

  // Debug logging
  console.log('Accessibility Page - analyzedDocument:', analyzedDocument);
  console.log('Accessibility Page - textToDisplay length:', textToDisplay.length);

  // Define a sample text for the preview section
  const sampleText = textToDisplay;

  // Document info for display
  const documentInfo = analyzedDocument ? {
    fileName: analyzedDocument.fileName || "Uploaded Document",
    hasDocument: true,
    documentType: analyzedDocument.source === 'accessibility-upload' ? "Uploaded Document" :
                  analyzedDocument.comparisonData ? "Document Comparison" : "Single Document"
  } : {
    fileName: "No Document",
    hasDocument: false,
    documentType: "Please Upload"
  };



  // Enhanced text-to-speech with highlighting
  const handleTextToSpeech = () => {
    console.log('handleTextToSpeech called, isSpeaking:', isSpeaking);
    console.log('textToDisplay:', textToDisplay);

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentReadingIndex(-1);
      return;
    }

    if (!textToDisplay || textToDisplay.trim() === '') {
      console.error('No text to speak');
      return;
    }

    const sentences = textToDisplay.split(/[.!?]+/).filter(s => s.trim());
    console.log('Sentences to speak:', sentences.length);

    let currentIndex = 0;
    const speakSentence = () => {
      if (currentIndex >= sentences.length) {
        setIsSpeaking(false);
        setCurrentReadingIndex(-1);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentences[currentIndex].trim());
      utterance.rate = speechRate;

      if (highlightReading) {
        setCurrentReadingIndex(currentIndex);
      }

      utterance.onend = () => {
        currentIndex++;
        speakSentence();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setCurrentReadingIndex(-1);
      };

      speechUtterance.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    setIsSpeaking(true);
    speakSentence();
  };

  // Handler functions for buttons
  const handleSendFeedback = () => {
    const feedback = prompt('Please share your accessibility feedback or report any issues:');
    if (feedback) {
      console.log('Accessibility feedback:', feedback);
      alert('Thank you for your feedback! We appreciate your input to improve accessibility.');
    }
  };

  const handleViewGuide = () => {
    alert('Accessibility Guide:\n\n' +
          '• Use Tab to navigate between elements\n' +
          '• Use Space or Enter to activate buttons\n' +
          '• Use arrow keys to adjust sliders\n' +
          '• Screen readers are supported with ARIA labels\n' +
          '• All features work with keyboard navigation');
  };

  const handleVoiceSupport = () => {
    const message = 'Voice support activated. You can use the following voice commands: ' +
                   'Read text, Stop reading, Increase font size, Decrease font size, ' +
                   'Toggle high contrast, Save settings.';
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  };

  // File upload handling for CustomFileUploader
  const handleFileProcessed = (document) => {
    console.log('handleFileProcessed called with:', document);
    console.log('Original text length:', document.originalText ? document.originalText.length : 0);

    // Add accessibility-specific properties
    const accessibilityDocument = {
      ...document,
      source: 'accessibility-upload',
      uploadedAt: new Date().toISOString()
    };

    // Store in state and localStorage
    setAnalyzedDocument(accessibilityDocument);
    localStorage.setItem('analyzedDocument', JSON.stringify(accessibilityDocument));

    console.log('Document uploaded and processed successfully:', accessibilityDocument.fileName);
    console.log('Stored document originalText length:', accessibilityDocument.originalText ? accessibilityDocument.originalText.length : 0);
  };

  const removeUploadedFile = () => {
    setAnalyzedDocument(null);
    localStorage.removeItem('analyzedDocument');
  };




  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`py-12 ${getThemeClasses()} ${getAnimationClasses()}`}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className={`text-4xl font-bold text-gray-900 dark:text-white ${getTextClasses()}`}
            id="main-content"
            tabIndex={-1}
          >
            <FiUser className="inline-block mr-3 text-blue-600" />
            {t('accessibilityCenter')}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`mt-4 text-lg text-gray-600 dark:text-gray-300 ${getTextClasses()}`}
          >
            Customize your experience with comprehensive accessibility tools and settings
          </motion.p>
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <button
              onClick={saveSettings}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500"
              aria-label="Save current accessibility settings"
            >
              <FiSave className="mr-2" />
              {settingsSaved ? 'Saved!' : 'Save Settings'}
            </button>
            <button
              onClick={resetSettings}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
              aria-label="Reset all settings to default"
            >
              <FiRotateCcw className="mr-2" />
              Reset to Default
            </button>
          </div>
        </div>

        {/* File Upload Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          {!analyzedDocument || analyzedDocument.source !== 'accessibility-upload' ? (
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-8">
              <div className="text-center mb-6">
                <FiUpload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Upload Terms of Service
                </h2>
                <p className="text-gray-300">
                  Upload a ToS document to analyze future risks and predict changes
                </p>
              </div>

              <CustomFileUploader
                onFileProcessed={handleFileProcessed}
                setIsLoading={setIsProcessing}
                mode="simple"
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center">
                  <FiFile className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className={`font-medium ${getTextClasses()}`}>{analyzedDocument.fileName}</p>
                    <p className={`text-sm ${getTextClasses()} opacity-60`}>
                      Document uploaded • Ready for accessibility features
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeUploadedFile}
                  className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 focus:ring-2 focus:ring-red-500 rounded"
                  aria-label="Remove uploaded file"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-wrap justify-center gap-2" role="tablist">
            {[
              { id: 'text', label: t('textCustomization'), icon: FiType },
              { id: 'contrast', label: t('contrast'), icon: FiEye },
              { id: 'audio', label: t('audioSpeech'), icon: FiVolume2 },
              { id: 'language', label: t('languageTools'), icon: FiGlobe },
              { id: 'advanced', label: t('advanced'), icon: FiSettings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeSection === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                role="tab"
                aria-selected={activeSection === tab.id}
                aria-controls={`${tab.id}-panel`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <div className="p-6">
                {/* Text Customization Panel */}
                {activeSection === 'text' && (
                  <div id="text-panel" role="tabpanel" aria-labelledby="text-tab">
                    <div className="flex items-center mb-6">
                      <FiType className="h-6 w-6 text-blue-500 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('textCustomization')}</h2>
                    </div>

                    <div className="space-y-6">
                      {/* Font Size */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('fontSize')}
                        </label>
                        <div className="flex items-center space-x-2">
                          <FiMinus className="text-gray-400" />
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={fontSize === 'text-xs' ? 1 : fontSize === 'text-sm' ? 2 : fontSize === 'text-base' ? 3 : fontSize === 'text-lg' ? 4 : 5}
                            onChange={(e) => {
                              const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];
                              setFontSize(sizes[parseInt(e.target.value) - 1]);
                            }}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            aria-label="Adjust font size"
                          />
                          <FiPlus className="text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400 text-sm w-20">
                            {fontSize === 'text-xs' ? 'X-Small' :
                             fontSize === 'text-sm' ? 'Small' :
                             fontSize === 'text-base' ? 'Medium' :
                             fontSize === 'text-lg' ? 'Large' : 'X-Large'}
                          </span>
                        </div>
                      </div>
                      {/* Font Family */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Font Style
                        </label>
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          aria-label="Select font family"
                        >
                          {fontFamilies.map((font) => (
                            <option key={font.value} value={font.value}>
                              {font.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Line Spacing */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Line Spacing
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'leading-tight', label: 'Tight' },
                            { value: 'leading-normal', label: 'Normal' },
                            { value: 'leading-loose', label: 'Loose' }
                          ].map((spacing) => (
                            <button
                              key={spacing.value}
                              onClick={() => setLineSpacing(spacing.value)}
                              className={`py-2 px-3 rounded-md text-sm font-medium ${
                                lineSpacing === spacing.value
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}
                              aria-pressed={lineSpacing === spacing.value}
                            >
                              {spacing.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Letter Spacing */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Letter Spacing
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'tracking-tight', label: 'Tight' },
                            { value: 'tracking-normal', label: 'Normal' },
                            { value: 'tracking-wide', label: 'Wide' }
                          ].map((spacing) => (
                            <button
                              key={spacing.value}
                              onClick={() => setLetterSpacing(spacing.value)}
                              className={`py-2 px-3 rounded-md text-sm font-medium ${
                                letterSpacing === spacing.value
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}
                              aria-pressed={letterSpacing === spacing.value}
                            >
                              {spacing.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contrast Panel */}
                {activeSection === 'contrast' && (
                  <div id="contrast-panel" role="tabpanel" aria-labelledby="contrast-tab">
                    <div className="flex items-center mb-6">
                      <FiEye className="h-6 w-6 text-blue-500 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contrast Settings</h2>
                    </div>

                    <div className="space-y-6">
                      {/* Theme Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FiSun className="inline mr-2" /> Theme
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'light', label: 'Light', icon: FiSun },
                            { value: 'dark', label: 'Dark', icon: FiMoon },
                            { value: 'system', label: 'System', icon: FiMonitor }
                          ].map((themeOption) => (
                            <button
                              key={themeOption.value}
                              onClick={() => setTheme(themeOption.value)}
                              className={`py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center ${
                                theme === themeOption.value
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}
                              aria-pressed={theme === themeOption.value}
                            >
                              <themeOption.icon className="mr-1" />
                              {themeOption.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Contrast Mode */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FiMonitor className="inline mr-2" /> Contrast Mode
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'normal', label: 'Normal' },
                            { value: 'high-contrast', label: 'High' },
                            { value: 'low-contrast', label: 'Low' }
                          ].map((contrast) => (
                            <button
                              key={contrast.value}
                              onClick={() => setContrastMode(contrast.value)}
                              className={`py-2 px-3 rounded-md text-sm font-medium ${
                                contrastMode === contrast.value
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}
                              aria-pressed={contrastMode === contrast.value}
                            >
                              {contrast.label}
                            </button>
                          ))}
                        </div>
                      </div>




                    </div>
                  </div>
                )}
                {/* Audio and Speech Panel */}
                {activeSection === 'audio' && (
                  <div id="audio-panel" role="tabpanel" aria-labelledby="audio-tab">
                    <div className="flex items-center mb-6">
                      <FiVolume2 className="h-6 w-6 text-blue-500 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Audio & Speech</h2>
                    </div>
                    <div className="space-y-6">
                      {/* Text-to-Speech Controls */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Text-to-Speech
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={handleTextToSpeech}
                            className={`flex-1 py-2 px-4 rounded-md text-white flex items-center justify-center ${
                              isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                            aria-label={isSpeaking ? 'Stop reading text' : 'Start reading text'}
                          >
                            {isSpeaking ? <FiPause className="mr-2" /> : <FiPlay className="mr-2" />}
                            {isSpeaking ? 'Stop Reading' : 'Read Text'}
                          </button>
                        </div>
                      </div>
                      {/* Speech Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Speech Rate: {speechRate}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={speechRate}
                          onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          aria-label="Adjust speech rate"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Slow</span>
                          <span>Normal</span>
                          <span>Fast</span>
                        </div>
                      </div>

                      {/* Reading Highlight */}
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={highlightReading}
                            onChange={(e) => setHighlightReading(e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Highlight text while reading
                          </span>
                        </label>
                      </div>
                      {/* ARIA Landmarks Info */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                          <FiTarget className="inline mr-2" />
                          Screen Reader Support
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          This page includes ARIA landmarks, proper heading structure, and semantic HTML for optimal screen reader navigation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Language and Tools Panel */}
                {activeSection === 'language' && (
                  <div id="language-panel" role="tabpanel" aria-labelledby="language-tab">
                    <div className="flex items-center mb-6">
                      <FiGlobe className="h-6 w-6 text-blue-500 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Language & Tools</h2>
                    </div>

                    <div className="space-y-6">
                      {/* Language Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('interfaceLanguage')}
                        </label>
                        <select
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value);
                            console.log('Language changed to:', e.target.value);
                            // Show feedback to user
                            const selectedLang = languages.find(lang => lang.code === e.target.value);
                            if (selectedLang) {
                              alert(`${t('languageChangedTo') || 'Language changed to'}: ${selectedLang.name}`);
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                          aria-label="Select interface language"
                        >
                          {languages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Magnification */}
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={magnificationEnabled}
                            onChange={(e) => {
                              setMagnificationEnabled(e.target.checked);
                              console.log('Magnification enabled:', e.target.checked);
                              // Show feedback to user
                              if (e.target.checked) {
                                alert('Text magnification enabled! Hover over text to see the effect.');
                              } else {
                                alert('Text magnification disabled.');
                              }
                            }}
                            className="mr-2 focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            <FiZoomIn className="inline mr-2" />
                            Enable text magnification on hover
                          </span>
                        </label>
                        {magnificationEnabled && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-6">
                            Hover over text in the preview section to see magnification effect
                          </p>
                        )}
                      </div>

                      {/* Feedback Form */}
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                          <FiMessageCircle className="inline mr-2" />
                          Accessibility Feedback
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                          Help us improve accessibility. Share your experience or report issues.
                        </p>
                        <button
                          onClick={handleSendFeedback}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                        >
                          Send Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Panel */}
                {activeSection === 'advanced' && (
                  <div id="advanced-panel" role="tabpanel" aria-labelledby="advanced-tab">
                    <div className="flex items-center mb-6">
                      <FiSettings className="h-6 w-6 text-blue-500 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Advanced Settings</h2>
                    </div>

                    <div className="space-y-6">
                      {/* Disable Animations */}
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={animationsDisabled}
                            onChange={(e) => setAnimationsDisabled(e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Disable animations and transitions
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 ml-6">
                          Reduces motion for users sensitive to movement
                        </p>
                      </div>

                      {/* Help Section */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                          <FiHelpCircle className="inline mr-2" />
                          Need Help?
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                          Access our comprehensive accessibility guide and support resources.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleViewGuide}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                          >
                            View Guide
                          </button>
                          <button
                            onClick={handleVoiceSupport}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                          >
                            <FiMic className="inline mr-1" />
                            Voice Support
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          {/* Preview Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className={`rounded-lg shadow-xl overflow-hidden ${getThemeClasses()}`}>
              <div className="p-6">
                <h2 className={`text-2xl font-bold mb-6 ${getTextClasses()}`}>
                  <FiEye className="inline mr-2" />
                  {t('livePreview')}
                </h2>

                {/* Document Content with Applied Settings */}
                <div className={`p-6 rounded-lg border ${getContrastClasses()} ${magnificationEnabled ? 'hover:scale-105 transition-transform' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-semibold ${getTextClasses()}`}>
                      {documentInfo.fileName}
                    </h3>
                    <span className={`text-sm px-2 py-1 rounded ${documentInfo.hasDocument ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                      {documentInfo.documentType}
                    </span>
                  </div>
                  <div ref={textRef}>
                    {!documentInfo.hasDocument ? (
                      <div className="text-center py-8">
                        <FiUpload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className={`text-lg ${getTextClasses()} mb-2`}>
                          {t('noDocumentUploaded')}
                        </p>
                        <p className={`text-sm ${getTextClasses()} opacity-60`}>
                          {t('uploadDocumentAbove')}
                        </p>
                      </div>
                    ) : (
                      sampleText.split(/[.!?]+/).filter(s => s.trim()).map((sentence, index) => (
                        <span
                          key={index}
                          className={`${getTextClasses()} ${
                            highlightReading && currentReadingIndex === index
                              ? 'bg-yellow-200 dark:bg-yellow-800'
                              : ''
                          } ${guidedReading && index !== 0 ? 'opacity-50' : ''}`}
                        >
                          {sentence.trim()}.{' '}
                        </span>
                      ))
                    )}
                  </div>

                  {documentInfo.hasDocument && analyzedDocument?.riskyClauses?.length > 0 && (
                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <h4 className={`font-medium ${getTextClasses()}`}>
                        <FiTarget className="inline mr-2" />
                        Risky Clauses Detected
                      </h4>
                      {analyzedDocument.riskyClauses.slice(0, 2).map((clause, index) => (
                        <p key={index} className={`mt-2 ${getTextClasses()} text-gray-600 dark:text-gray-400`}>
                          <strong>{clause.clause}:</strong> {clause.explanation}
                        </p>
                      ))}
                      {analyzedDocument.riskyClauses.length > 2 && (
                        <p className={`mt-2 text-sm ${getTextClasses()} opacity-60`}>
                          +{analyzedDocument.riskyClauses.length - 2} more risky clauses detected
                        </p>
                      )}
                    </div>
                  )}

                  {documentInfo.hasDocument && (!analyzedDocument?.riskyClauses || analyzedDocument.riskyClauses.length === 0) && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className={`font-medium ${getTextClasses()}`}>
                        <FiTarget className="inline mr-2" />
                        Document Analysis
                      </h4>
                      <p className={`mt-2 ${getTextClasses()} text-gray-600 dark:text-gray-400`}>
                        Your document has been uploaded successfully. Use the accessibility features above to customize your reading experience.
                      </p>
                    </div>
                  )}
                </div>

                {/* Accessibility Features Guide */}
                <div className="mt-8">
                  <h3 className={`text-lg font-medium mb-4 ${getTextClasses()}`}>
                    <FiHelpCircle className="inline mr-2" />
                    Accessibility Features Guide
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        icon: FiType,
                        title: 'Text Customization',
                        description: 'Adjust font size, style, spacing for comfortable reading'
                      },
                      {
                        icon: FiEye,
                        title: 'Contrast Settings',
                        description: 'High contrast modes and theme selection for better visibility'
                      },
                      {
                        icon: FiVolume2,
                        title: 'Audio Support',
                        description: 'Text-to-speech with highlighting and speed control'
                      },
                      {
                        icon: FiGlobe,
                        title: 'Multi-language',
                        description: 'Interface translation and content localization'
                      },
                      {
                        icon: FiZoomIn,
                        title: 'Magnification',
                        description: 'Hover to magnify text and interactive elements'
                      }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <feature.icon className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{feature.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>


              </div>
            </div>
          </motion.div>
        </div>
        {/* On-Screen Keyboard */}
        {onScreenKeyboard && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border z-50">
            <div className="text-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">On-Screen Keyboard</span>
              <button
                onClick={() => setOnScreenKeyboard(false)}
                className="ml-2 text-gray-500 hover:text-gray-700"
                aria-label="Close on-screen keyboard"
              >
              </button>
            </div>
            <div className="grid grid-cols-10 gap-1 text-xs">
              {['Q','W','E','R','T','Y','U','I','O','P'].map(key => (
                <button key={key} className="p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
export default AccessibilityPage;