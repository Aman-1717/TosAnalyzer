import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiToggleLeft, FiToggleRight, FiLoader, FiUser, FiShield, FiInfo } from 'react-icons/fi';
import { analyzeUserRights } from '../../services/geminiService';

function UserRightsHighlighter({ originalText }) {
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [rightsAnalysis, setRightsAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const analyzeRights = async () => {
    if (!originalText) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisComplete(false);

    try {
      console.log('Starting user rights analysis...');
      const analysis = await analyzeUserRights(originalText);
      console.log('User rights analysis result:', analysis);
      setRightsAnalysis(analysis);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Error analyzing user rights:', error);
      console.log('Error details:', error);
      setError(`Analysis failed: ${error.message}. Showing demo data instead.`);

      // Show mock data as fallback
      console.log('Showing mock user rights data as fallback...');
      const mockAnalysis = {
        analysis: [
          {text: "You may cancel your account at any time", type: "user-rights", explanation: "Gives users control over their account and the right to leave the service"},
          {text: "You have the right to access and download your personal data", type: "user-rights", explanation: "Provides data portability and transparency rights to users"},
          {text: "We will notify you 30 days before any changes to these terms", type: "user-rights", explanation: "Gives users advance notice and time to respond to changes"},
          {text: "We may terminate your account at our sole discretion", type: "company-rights", explanation: "Gives company unilateral power to end user accounts without specific cause"},
          {text: "We reserve the right to modify these Terms at any time", type: "company-rights", explanation: "Allows company to change rules without user consent"},
          {text: "You agree not to use BigSocial for any unlawful or prohibited activities", type: "neutral", explanation: "Standard legal compliance requirement"},
          {text: "All disputes shall be resolved through binding arbitration", type: "company-rights", explanation: "Limits user's legal options and favors the company"},
          {text: "You retain ownership of the content you post", type: "user-rights", explanation: "Protects user intellectual property rights"}
        ],
        summary: {
          userRightsPercentage: 35,
          companyRightsPercentage: 40,
          neutralPercentage: 25
        }
      };

      setRightsAnalysis(mockAnalysis);
      setAnalysisComplete(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to show demo data immediately
  const showDemoData = () => {
    console.log('Showing demo user rights data...');
    const mockAnalysis = {
      analysis: [
        {text: "You may cancel your account at any time", type: "user-rights", explanation: "Gives users control over their account and the right to leave the service"},
        {text: "You have the right to access and download your personal data", type: "user-rights", explanation: "Provides data portability and transparency rights to users"},
        {text: "We will notify you 30 days before any changes to these terms", type: "user-rights", explanation: "Gives users advance notice and time to respond to changes"},
        {text: "We may terminate your account at our sole discretion", type: "company-rights", explanation: "Gives company unilateral power to end user accounts without specific cause"},
        {text: "We reserve the right to modify these Terms at any time", type: "company-rights", explanation: "Allows company to change rules without user consent"},
        {text: "You agree not to use BigSocial for any unlawful or prohibited activities", type: "neutral", explanation: "Standard legal compliance requirement"},
        {text: "All disputes shall be resolved through binding arbitration", type: "company-rights", explanation: "Limits user's legal options and favors the company"},
        {text: "You retain ownership of the content you post", type: "user-rights", explanation: "Protects user intellectual property rights"}
      ],
      summary: {
        userRightsPercentage: 35,
        companyRightsPercentage: 40,
        neutralPercentage: 25
      }
    };

    setRightsAnalysis(mockAnalysis);
    setAnalysisComplete(true);
    setError(null);
  };

  // Don't auto-analyze, let user click the button
  // useEffect(() => {
  //   if (originalText && !analysisComplete && !isAnalyzing) {
  //     analyzeRights();
  //   }
  // }, [originalText]);

  const highlightText = (text) => {
    if (!isHighlightMode || !rightsAnalysis || !rightsAnalysis.analysis) {
      console.log('Highlighting disabled or no analysis data:', { isHighlightMode, hasAnalysis: !!rightsAnalysis?.analysis });
      return text;
    }

    console.log('Starting text highlighting with', rightsAnalysis.analysis.length, 'analysis items');
    let highlightedText = text;

    // Sort analysis by text length (longest first) to avoid partial replacements
    const sortedAnalysis = [...rightsAnalysis.analysis].sort((a, b) => b.text.length - a.text.length);

    sortedAnalysis.forEach((item, index) => {
      const className = item.type === 'user-rights'
        ? 'bg-green-200 dark:bg-green-800/40 text-green-900 dark:text-green-100 px-1 rounded'
        : item.type === 'company-rights'
        ? 'bg-red-200 dark:bg-red-800/40 text-red-900 dark:text-red-100 px-1 rounded'
        : 'bg-gray-200 dark:bg-gray-600/40 text-gray-900 dark:text-gray-100 px-1 rounded';

      const tooltip = `title="${item.explanation.replace(/"/g, '&quot;')}"`;
      const highlightedSpan = `<span class="${className}" ${tooltip}>${item.text}</span>`;

      // Use a more precise replacement to avoid replacing partial matches
      try {
        const escapedText = item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedText, 'gi');
        const matches = highlightedText.match(regex);
        if (matches) {
          console.log(`Highlighting "${item.text}" (${item.type}) - found ${matches.length} matches`);
          highlightedText = highlightedText.replace(regex, highlightedSpan);
        } else {
          console.log(`No matches found for "${item.text}"`);
        }
      } catch (regexError) {
        console.error('Regex error for text:', item.text, regexError);
      }
    });

    console.log('Text highlighting completed');
    return highlightedText;
  };

  if (!originalText) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiUser className="h-6 w-6 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">User Rights Analysis</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Upload a document to see user rights analysis.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FiUser className="h-6 w-6 text-green-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">User Rights Analysis</h3>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={analyzeRights}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors"
              >
                {isAnalyzing ? (
                  <FiLoader className="h-4 w-4 animate-spin" />
                ) : (
                  <FiUser className="h-4 w-4" />
                )}
                {isAnalyzing ? 'Analyzing...' : analysisComplete ? 'Re-analyze' : 'Analyze Rights'}
              </button>

              <button
                onClick={showDemoData}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-md transition-colors"
              >
                <FiInfo className="h-4 w-4" />
                Show Demo Data
              </button>
            </div>
            
            {analysisComplete && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Highlight Mode</span>
                <button
                  onClick={() => setIsHighlightMode(!isHighlightMode)}
                  className="flex items-center"
                >
                  {isHighlightMode ? (
                    <FiToggleRight className="h-6 w-6 text-blue-500" />
                  ) : (
                    <FiToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        {isHighlightMode && (
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 dark:bg-green-800/40 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">User Rights/Protections</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 dark:bg-red-800/40 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Company Power/Limitations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600/40 rounded"></div>
              <span className="text-gray-700 dark:text-gray-300">Neutral Clauses</span>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        {rightsAnalysis && rightsAnalysis.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <FiUser className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-700 dark:text-green-300">User Rights</span>
              </div>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                {rightsAnalysis.summary.userRightsPercentage}%
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Clauses protecting users
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <FiShield className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-700 dark:text-red-300">Company Rights</span>
              </div>
              <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                {rightsAnalysis.summary.companyRightsPercentage}%
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Clauses favoring company
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <FiInfo className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Neutral</span>
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {rightsAnalysis.summary.neutralPercentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Neutral clauses
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-6">
        {isAnalyzing && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <FiLoader className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Analyzing user rights...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <FiInfo className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={analyzeRights}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        )}

        {analysisComplete && originalText && (
          <div className="prose dark:prose-invert max-w-none">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Document Text {isHighlightMode && '(Highlighted)'}
            </h4>
            <div 
              className="text-gray-800 dark:text-gray-200 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: isHighlightMode ? highlightText(originalText) : originalText.replace(/\n/g, '<br>')
              }}
            />
          </div>
        )}

        {!analysisComplete && !isAnalyzing && !error && (
          <div className="text-center py-8">
            <FiUser className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Click "Analyze Rights" to start the analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserRightsHighlighter;
