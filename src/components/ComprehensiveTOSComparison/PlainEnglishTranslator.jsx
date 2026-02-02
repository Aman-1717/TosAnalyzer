import React, { useState, useEffect } from 'react';
import { FiInfo, FiAlertTriangle, FiCheckCircle, FiHelpCircle, FiEye, FiEyeOff, FiZap, FiTrendingUp, FiMousePointer, FiBookOpen } from 'react-icons/fi';
import WordTranslator from './WordTranslator';

/**
 * AI-Powered Plain English Translator
 * Converts complex legal jargon into simple, understandable language
 */
const PlainEnglishTranslator = ({ analysis }) => {
  const [translatedSections, setTranslatedSections] = useState({});
  const [showTranslations, setShowTranslations] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedComplexity, setSelectedComplexity] = useState('simple'); // simple, detailed, expert
  const [userExplanations, setUserExplanations] = useState([]);

  if (!analysis?.comprehensiveAnalysis) return null;

  const { comprehensiveAnalysis, file1Name, file2Name } = analysis;

  /**
   * Handle user text selection and explanation
   */
  const handleUserTextExplanation = (selectedText, explanation) => {
    const newExplanation = {
      id: Date.now(),
      selectedText,
      explanation,
      timestamp: new Date().toLocaleTimeString()
    };

    setUserExplanations(prev => [newExplanation, ...prev.slice(0, 9)]); // Keep last 10 explanations
  };

  /**
   * Clear user explanations
   */
  const clearUserExplanations = () => {
    setUserExplanations([]);
  };

  /**
   * Legal jargon patterns and their plain English translations
   */
  const legalJargonDatabase = {
    // Liability and Disclaimers
    'disclaims all warranties': {
      simple: "We don't promise our service will work perfectly",
      detailed: "The company is saying they won't guarantee that their service will work without problems or meet your expectations",
      risk: 'high',
      impact: "If something goes wrong, you can't hold them responsible",
      category: 'liability'
    },
    'merchantability': {
      simple: "The service being good enough for normal use",
      detailed: "A legal term meaning the product/service should work as expected for its intended purpose",
      risk: 'medium',
      impact: "Without this guarantee, they don't promise the service will work properly",
      category: 'warranty'
    },
    'indemnify': {
      simple: "You'll pay for any legal problems you cause",
      detailed: "You agree to cover legal costs and damages if your actions cause the company to get sued",
      risk: 'high',
      impact: "You could end up paying thousands in legal fees if something goes wrong",
      category: 'liability'
    },
    'force majeure': {
      simple: "Uncontrollable events (like natural disasters)",
      detailed: "Events beyond anyone's control like earthquakes, wars, or pandemics that excuse non-performance",
      risk: 'low',
      impact: "The company isn't responsible if they can't provide service due to major disasters",
      category: 'exceptions'
    },
    'severability': {
      simple: "If one part is invalid, the rest still applies",
      detailed: "If a court says one part of the agreement is illegal, the other parts remain in effect",
      risk: 'low',
      impact: "The agreement stays mostly valid even if parts are found to be illegal",
      category: 'legal'
    },
    'liquidated damages': {
      simple: "Pre-agreed penalty amounts",
      detailed: "Specific dollar amounts you'll pay for breaking certain rules, decided in advance",
      risk: 'high',
      impact: "You know exactly how much you'll owe if you break specific rules",
      category: 'penalties'
    },
    'arbitration': {
      simple: "Private dispute resolution instead of court",
      detailed: "Disagreements are resolved by a private judge instead of going to public court",
      risk: 'medium',
      impact: "You give up your right to sue in court or join class action lawsuits",
      category: 'disputes'
    },
    'intellectual property': {
      simple: "Creative works and ideas owned by someone",
      detailed: "Things like copyrights, trademarks, patents, and trade secrets that belong to a person or company",
      risk: 'medium',
      impact: "You can't copy, use, or steal the company's creative content or ideas",
      category: 'ownership'
    }
  };

  /**
   * Analyze text complexity and provide translations
   */
  const analyzeAndTranslate = (text) => {
    const translations = [];
    const lowerText = text.toLowerCase();

    Object.entries(legalJargonDatabase).forEach(([term, translation]) => {
      if (lowerText.includes(term.toLowerCase())) {
        translations.push({
          originalTerm: term,
          translation: translation[selectedComplexity],
          risk: translation.risk,
          impact: translation.impact,
          category: translation.category,
          position: lowerText.indexOf(term.toLowerCase())
        });
      }
    });

    return translations.sort((a, b) => a.position - b.position);
  };

  /**
   * Get risk color based on level
   */
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-700';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-700';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-700';
    }
  };

  /**
   * Get risk icon
   */
  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'high': return FiAlertTriangle;
      case 'medium': return FiInfo;
      case 'low': return FiCheckCircle;
      default: return FiHelpCircle;
    }
  };

  /**
   * Calculate overall complexity score
   */
  const calculateComplexityScore = () => {
    const allClauses = [
      ...(comprehensiveAnalysis.clauseCategories?.['Privacy Policy']?.doc1Clauses || []),
      ...(comprehensiveAnalysis.clauseCategories?.['Privacy Policy']?.doc2Clauses || []),
      ...(comprehensiveAnalysis.clauseCategories?.['Terms of Service']?.doc1Clauses || []),
      ...(comprehensiveAnalysis.clauseCategories?.['Terms of Service']?.doc2Clauses || [])
    ];

    let totalComplexTerms = 0;
    let totalTerms = 0;

    allClauses.forEach(clause => {
      const translations = analyzeAndTranslate(clause);
      totalComplexTerms += translations.length;
      totalTerms += clause.split(' ').length;
    });

    return Math.min(100, Math.round((totalComplexTerms / Math.max(totalTerms, 1)) * 1000));
  };

  /**
   * Generate user-friendly summary
   */
  const generateUserFriendlySummary = () => {
    const complexityScore = calculateComplexityScore();
    
    let readabilityLevel = 'Graduate';
    let recommendation = 'Consider simplifying language for better user understanding';
    
    if (complexityScore < 30) {
      readabilityLevel = 'High School';
      recommendation = 'Good readability level for general users';
    } else if (complexityScore < 60) {
      readabilityLevel = 'College';
      recommendation = 'Moderate complexity - could be simplified';
    }

    return {
      complexityScore,
      readabilityLevel,
      recommendation
    };
  };

  const summary = generateUserFriendlySummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiZap className="h-6 w-6 text-purple-400 mr-3" />
            <h2 className="text-xl font-bold text-white">AI Plain English Translator</h2>
            <span className="ml-3 px-2 py-1 bg-purple-600 text-white text-xs rounded-full">REVOLUTIONARY</span>
          </div>
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            {showTranslations ? <FiEyeOff className="mr-2" /> : <FiEye className="mr-2" />}
            {showTranslations ? 'Hide' : 'Show'} Translations
          </button>
        </div>
        
        <p className="text-purple-200 mb-4">
          💡 <strong>How to use:</strong> Simply select any complex WORD (like "arbitration", "indemnification") to get instant plain English translation!
        </p>

        {/* Clear History Button */}
        {userExplanations.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={clearUserExplanations}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
            >
              Clear History ({userExplanations.length})
            </button>
          </div>
        )}

        {/* Complexity Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FiTrendingUp className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-sm font-medium text-gray-300">Complexity Score</span>
            </div>
            <div className="text-2xl font-bold text-white">{summary.complexityScore}/100</div>
            <div className="text-sm text-gray-400">Legal Complexity</div>
          </div>
          
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FiInfo className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-sm font-medium text-gray-300">Reading Level</span>
            </div>
            <div className="text-2xl font-bold text-white">{summary.readabilityLevel}</div>
            <div className="text-sm text-gray-400">Education Required</div>
          </div>
          
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FiCheckCircle className="h-5 w-5 text-purple-400 mr-2" />
              <span className="text-sm font-medium text-gray-300">User-Friendliness</span>
            </div>
            <div className="text-lg font-bold text-white">
              {summary.complexityScore < 30 ? 'Excellent' : 
               summary.complexityScore < 60 ? 'Good' : 'Needs Work'}
            </div>
            <div className="text-sm text-gray-400">Overall Rating</div>
          </div>
        </div>
      </div>

      {/* Translation Controls */}
      {showTranslations && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Translation Detail Level</h3>
            <div className="flex space-x-2">
              {[
                { key: 'simple', label: 'Simple', desc: 'Basic explanation' },
                { key: 'detailed', label: 'Detailed', desc: 'More context' },
                { key: 'expert', label: 'Expert', desc: 'Full legal context' }
              ].map(level => (
                <button
                  key={level.key}
                  onClick={() => setSelectedComplexity(level.key)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedComplexity === level.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title={level.desc}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Explanations History */}
      {showTranslations && userExplanations.length > 0 && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <FiBookOpen className="h-5 w-5 mr-2" />
            Your Explanation History
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {userExplanations.map((item) => (
              <div key={item.id} className="border border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">
                    Explained at {item.timestamp}
                  </span>
                </div>
                <div className="mb-3 p-3 bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Selected Text:</h4>
                  <p className="text-sm text-white italic">"{item.selectedText}"</p>
                </div>
                <div className="prose prose-invert max-w-none">
                  <div
                    className="text-gray-300 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: item.explanation.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Translations */}
      {showTranslations && (
        <div className="space-y-6">
          {/* Document 1 */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Document 1 ({file1Name}) - Select Words for Translation
            </h3>
            <WordDocumentContent
              clauses={comprehensiveAnalysis.clauseCategories}
              documentType="doc1"
              onWordExplain={handleUserTextExplanation}
            />
          </div>

          {/* Document 2 */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Document 2 ({file2Name}) - Select Words for Translation
            </h3>
            <WordDocumentContent
              clauses={comprehensiveAnalysis.clauseCategories}
              documentType="doc2"
              onWordExplain={handleUserTextExplanation}
            />
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">💡 Recommendations for Better User Understanding</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <FiCheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
            <div>
              <p className="text-white font-medium">Simplify Legal Language</p>
              <p className="text-gray-300 text-sm">{summary.recommendation}</p>
            </div>
          </div>
          <div className="flex items-start">
            <FiInfo className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
            <div>
              <p className="text-white font-medium">Add Plain English Summaries</p>
              <p className="text-gray-300 text-sm">Include simple explanations alongside complex legal terms</p>
            </div>
          </div>
          <div className="flex items-start">
            <FiAlertTriangle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
            <div>
              <p className="text-white font-medium">Highlight High-Risk Terms</p>
              <p className="text-gray-300 text-sm">Make important clauses more visible to users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Component to render translated content for a document
 */
const TranslatedContent = ({ 
  clauses, 
  documentType, 
  analyzeAndTranslate, 
  getRiskColor, 
  getRiskIcon, 
  selectedComplexity 
}) => {
  const documentClauses = [];
  
  // Collect all clauses for the document
  Object.entries(clauses || {}).forEach(([category, data]) => {
    const clauseList = documentType === 'doc1' ? data.doc1Clauses : data.doc2Clauses;
    clauseList?.forEach(clause => {
      documentClauses.push({ category, clause });
    });
  });

  if (documentClauses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FiInfo className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No complex legal terms found in this document</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documentClauses.slice(0, 5).map((item, index) => {
        const translations = analyzeAndTranslate(item.clause);
        
        if (translations.length === 0) return null;

        return (
          <div key={index} className="border border-gray-600 rounded-lg p-4">
            <div className="mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-wide">{item.category}</span>
              <p className="text-gray-300 text-sm mt-1" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {item.clause.substring(0, 150)}...
              </p>
            </div>
            
            <div className="space-y-2">
              {translations.map((translation, tIndex) => {
                const RiskIcon = getRiskIcon(translation.risk);
                return (
                  <div key={tIndex} className={`p-3 rounded-lg border ${getRiskColor(translation.risk)}`}>
                    <div className="flex items-start">
                      <RiskIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="font-medium text-sm">"{translation.originalTerm}"</span>
                          <span className="ml-2 px-2 py-0.5 bg-gray-700 text-xs rounded uppercase">
                            {translation.risk} risk
                          </span>
                        </div>
                        <p className="text-sm mb-2">
                          <strong>Plain English:</strong> {translation.translation}
                        </p>
                        <p className="text-xs opacity-80">
                          <strong>What this means for you:</strong> {translation.impact}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Word Document Content Component
 * Renders document content with word-by-word translation capability
 */
const WordDocumentContent = ({
  clauses,
  documentType,
  onWordExplain
}) => {
  const documentClauses = [];

  // Collect all clauses for the document
  Object.entries(clauses || {}).forEach(([category, data]) => {
    const clauseList = documentType === 'doc1' ? data.doc1Clauses : data.doc2Clauses;
    clauseList?.forEach(clause => {
      documentClauses.push({ category, clause });
    });
  });

  if (documentClauses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FiInfo className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No content found in this document</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mb-4">
        <p className="text-blue-200 text-sm">
          💡 <strong>Tip:</strong> Select any complex word (like "arbitration", "indemnification", "liability") to get instant plain English translation!
        </p>
      </div>

      {documentClauses.map((item, index) => (
        <div key={index} className="border border-gray-600 rounded-lg p-4">
          <div className="mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide">{item.category}</span>
          </div>

          <WordTranslator
            text={item.clause}
            className="text-gray-300 text-sm leading-relaxed"
            onWordExplain={onWordExplain}
          />
        </div>
      ))}
    </div>
  );
};

export default PlainEnglishTranslator;
