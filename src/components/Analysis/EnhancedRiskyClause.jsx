import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiEdit3, FiCopy, FiCheck, FiLoader } from 'react-icons/fi';
import { rewriteClause, detectHiddenTraps } from '../../services/geminiService';

function EnhancedRiskyClause({ clause, index }) {
  const [rewrittenVersion, setRewrittenVersion] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [showRewritten, setShowRewritten] = useState(false);
  const [hiddenTraps, setHiddenTraps] = useState([]);
  const [isAnalyzingTraps, setIsAnalyzingTraps] = useState(false);
  const [trapsAnalyzed, setTrapsAnalyzed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRewriteClause = async () => {
    if (rewrittenVersion) {
      setShowRewritten(!showRewritten);
      return;
    }

    setIsRewriting(true);
    try {
      console.log('Starting clause rewrite...');
      const rewritten = await rewriteClause(clause.clause || clause.text);
      console.log('Clause rewrite result:', rewritten);
      setRewrittenVersion(rewritten);
      setShowRewritten(true);
    } catch (error) {
      console.error('Error rewriting clause:', error);
      alert('Failed to rewrite clause. Please try again.');
    } finally {
      setIsRewriting(false);
    }
  };

  const analyzeForHiddenTraps = async () => {
    if (trapsAnalyzed) return;
    
    setIsAnalyzingTraps(true);
    try {
      const traps = await detectHiddenTraps(clause.clause || clause.text);
      setHiddenTraps(traps);
      setTrapsAnalyzed(true);
    } catch (error) {
      console.error('Error analyzing hidden traps:', error);
    } finally {
      setIsAnalyzingTraps(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Check for hidden trap patterns
  const hiddenTrapPatterns = [
    'at sole discretion',
    'may change at any time',
    'without notice',
    'non-refundable',
    'as we see fit',
    'in our judgment',
    'at our option'
  ];

  const clauseText = clause.clause || clause.text || '';
  const hasHiddenTrap = hiddenTrapPatterns.some(pattern => 
    clauseText.toLowerCase().includes(pattern.toLowerCase())
  );

  return (
    <div 
      className={`p-4 rounded-lg border ${
        clause.riskLevel === 'High' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
        clause.riskLevel === 'Medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
        'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      }`}
    >
      <div className="flex items-start">
        <div className={`p-1 rounded-full mr-3 mt-1 ${
          clause.riskLevel === 'High' ? 'bg-red-100 dark:bg-red-800' :
          clause.riskLevel === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-800' :
          'bg-blue-100 dark:bg-blue-800'
        }`}>
          <FiAlertTriangle className={`h-4 w-4 ${
            clause.riskLevel === 'High' ? 'text-red-600 dark:text-red-300' :
            clause.riskLevel === 'Medium' ? 'text-yellow-600 dark:text-yellow-300' :
            'text-blue-600 dark:text-blue-300'
          }`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-semibold text-gray-900 dark:text-white ${
              clause.riskLevel === 'High' ? 'text-red-700 dark:text-red-300' :
              clause.riskLevel === 'Medium' ? 'text-yellow-700 dark:text-yellow-300' :
              'text-blue-700 dark:text-blue-300'
            }`}>
              {clause.type || clause.category || 'Risk Detected'}
              {hasHiddenTrap && (
                <span 
                  className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-full cursor-pointer"
                  title="This clause contains hidden trap patterns"
                  onClick={analyzeForHiddenTraps}
                >
                  ⚠️ Hidden Trap
                </span>
              )}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handleRewriteClause}
                disabled={isRewriting}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors"
                title="Rewrite this clause to be more user-friendly"
              >
                {isRewriting ? (
                  <FiLoader className="h-3 w-3 animate-spin" />
                ) : (
                  <FiEdit3 className="h-3 w-3" />
                )}
                {rewrittenVersion ? (showRewritten ? 'Hide' : 'Show') + ' Rewrite' : 'Rewrite'}
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{clause.explanation}</p>
          
          <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200">
            {clauseText}
          </div>

          {/* Hidden Traps Analysis */}
          <AnimatePresence>
            {isAnalyzingTraps && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded"
              >
                <div className="flex items-center gap-2">
                  <FiLoader className="h-4 w-4 animate-spin text-orange-600" />
                  <span className="text-sm text-orange-700 dark:text-orange-300">Analyzing for hidden traps...</span>
                </div>
              </motion.div>
            )}
            
            {hiddenTraps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded"
              >
                <h5 className="font-medium text-orange-700 dark:text-orange-300 mb-2">Hidden Traps Detected:</h5>
                {hiddenTraps.map((trap, trapIndex) => (
                  <div key={trapIndex} className="mb-2 last:mb-0">
                    <span className="font-mono text-xs bg-orange-100 dark:bg-orange-800/30 px-2 py-1 rounded">
                      "{trap.phrase}"
                    </span>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{trap.explanation}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rewritten Version */}
          <AnimatePresence>
            {showRewritten && rewrittenVersion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-green-700 dark:text-green-300">Suggested Safer Version:</h5>
                  <button
                    onClick={() => copyToClipboard(rewrittenVersion)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                    title="Copy rewritten version"
                  >
                    {copied ? <FiCheck className="h-3 w-3" /> : <FiCopy className="h-3 w-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-white dark:bg-gray-700 p-3 rounded border border-green-200 dark:border-green-600 text-sm text-gray-800 dark:text-gray-200">
                  {rewrittenVersion}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default EnhancedRiskyClause;
