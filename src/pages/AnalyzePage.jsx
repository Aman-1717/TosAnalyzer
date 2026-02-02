import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiInfo } from 'react-icons/fi';
import FileUploader from '../components/Analysis/FileUploader';
import TextDisplay from '../components/Analysis/TextDisplay';
import DataSharingMap from '../components/Analysis/DataSharingMap';
import UserRightsHighlighter from '../components/Analysis/UserRightsHighlighter';

function AnalyzePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileName, setFileName] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [riskyClauses, setRiskyClauses] = useState([]);
  const [summary, setSummary] = useState('');
  
  const resultsRef = useRef(null);
  
  const handleFileProcessed = (data) => {
    // Add timestamp and unique ID
    const documentData = {
      ...data,
      id: Date.now(),
      timestamp: Date.now()
    };
    // Store the analyzed document in localStorage for the AccessibilityPage
    setFileName(documentData.fileName);
    setOriginalText(documentData.originalText);
    setSimplifiedText(documentData.simplifiedText);
    setRiskyClauses(documentData.riskyClauses);
    setSummary(documentData.summary);
    setUploadSuccess(true);
    
    try {
      // Create a smaller version for localStorage
      const storageData = {
        id: documentData.id,
        fileName: documentData.fileName,
        timestamp: documentData.timestamp,
        summary: documentData.summary || '',
        // Truncate large text fields
        originalText: (documentData.originalText || '').substring(0, 10000),
        simplifiedText: (documentData.simplifiedText || '').substring(0, 10000),
        riskyClauses: (documentData.riskyClauses || []).slice(0, 10) // Limit number of risky clauses
      };
      
      // Store the analyzed document in localStorage for the AccessibilityPage
      localStorage.setItem('analyzedDocument', JSON.stringify(storageData));
      
      // Add to document history
      const storedHistory = localStorage.getItem('documentHistory');
      let history = [];
      
      if (storedHistory) {
        try {
          history = JSON.parse(storedHistory);
        } catch (error) {
          console.error('Error parsing document history:', error);
        }
      }
      
      // Add current document to history (limit to 10 most recent)
      history = [storageData, ...history.slice(0, 9)];
      localStorage.setItem('documentHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error storing document in localStorage:', error);
    }
    
    // Scroll to results after a short delay
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Analyze Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Upload a Terms of Service document to get a simplified version and risk analysis
          </p>
        </div>
        
        <FileUploader
          onFileProcessed={handleFileProcessed}
          setIsLoading={setIsLoading}
          fullProcessing={true}
        />
        
        {isLoading && (
          <div className="text-center mt-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Analyzing document...</p>
          </div>
        )}

        {originalText && !isLoading && (
          <motion.div
            ref={resultsRef}
            id="results-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            {summary && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg"
              >
                <div className="flex items-center mb-4">
                  <FiInfo className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Key Points Summary</h3>
                </div>
                <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200" 
                     dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
              </motion.div>
            )}
            
            <TextDisplay
              originalText={originalText}
              simplifiedText={simplifiedText}
              riskyClauses={riskyClauses}
            />

            {/* New Enhanced Features */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 space-y-8"
            >
              <DataSharingMap originalText={originalText} />
              <UserRightsHighlighter originalText={originalText} />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default AnalyzePage;






