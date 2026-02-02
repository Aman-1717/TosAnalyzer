import React, { useState, useEffect } from 'react';
import { FiCloud, FiRefreshCw, FiSettings, FiEye, FiEyeOff } from 'react-icons/fi';

/**
 * Word Cloud Visualization Component
 * Creates interactive word clouds for legal terms and key phrases
 */
const WordCloudVisualization = ({ analysis }) => {
  const [cloudType, setCloudType] = useState('legal'); // legal, changes, risks
  const [showComparison, setShowComparison] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(true);

  if (!analysis?.comprehensiveAnalysis) return null;

  const { comprehensiveAnalysis, file1Name, file2Name } = analysis;

  /**
   * Generate word cloud data for legal terms
   */
  const generateLegalTermsCloud = () => {
    const { keyTermsAnalysis } = comprehensiveAnalysis;
    if (!keyTermsAnalysis?.termComparison) return { doc1: [], doc2: [] };

    const doc1Words = [];
    const doc2Words = [];

    Object.entries(keyTermsAnalysis.termComparison).forEach(([term, data]) => {
      if (data.doc1Count > 0) {
        doc1Words.push({
          text: term,
          size: Math.max(12, Math.min(48, data.doc1Count * 8)),
          count: data.doc1Count,
          color: getTermColor(term)
        });
      }
      if (data.doc2Count > 0) {
        doc2Words.push({
          text: term,
          size: Math.max(12, Math.min(48, data.doc2Count * 8)),
          count: data.doc2Count,
          color: getTermColor(term)
        });
      }
    });

    return {
      doc1: doc1Words.sort((a, b) => b.count - a.count).slice(0, 20),
      doc2: doc2Words.sort((a, b) => b.count - a.count).slice(0, 20)
    };
  };

  /**
   * Generate word cloud for changes
   */
  const generateChangesCloud = () => {
    const changeWords = [
      { text: 'Added Clauses', size: 32, count: comprehensiveAnalysis.contentMatching?.uniqueToDoc2 || 0, color: '#10B981' },
      { text: 'Removed Clauses', size: 28, count: comprehensiveAnalysis.contentMatching?.uniqueToDoc1 || 0, color: '#EF4444' },
      { text: 'Modified Clauses', size: 24, count: comprehensiveAnalysis.contentMatching?.partialMatches || 0, color: '#F59E0B' },
      { text: 'Exact Matches', size: 20, count: comprehensiveAnalysis.contentMatching?.exactMatches || 0, color: '#3B82F6' }
    ];

    return { doc1: [], doc2: changeWords.filter(w => w.count > 0) };
  };

  /**
   * Generate word cloud for risks
   */
  const generateRisksCloud = () => {
    const { riskAssessment } = comprehensiveAnalysis;
    const riskWords = [];

    if (riskAssessment?.doc2Risks) {
      riskAssessment.doc2Risks.forEach(risk => {
        riskWords.push({
          text: risk.type,
          size: risk.riskLevel === 'high' ? 36 : risk.riskLevel === 'medium' ? 28 : 20,
          count: risk.matches || 1,
          color: risk.riskLevel === 'high' ? '#EF4444' : risk.riskLevel === 'medium' ? '#F59E0B' : '#10B981'
        });
      });
    }

    return { doc1: [], doc2: riskWords };
  };

  /**
   * Get color for legal terms based on category
   */
  const getTermColor = (term) => {
    const termCategories = {
      privacy: ['privacy', 'data', 'personal', 'information', 'cookies'],
      liability: ['liability', 'damages', 'limitation', 'indemnification'],
      dispute: ['arbitration', 'jurisdiction', 'governing', 'law', 'dispute'],
      termination: ['termination', 'suspension', 'cancellation', 'breach'],
      intellectual: ['intellectual', 'property', 'copyright', 'trademark'],
      payment: ['payment', 'billing', 'subscription', 'fee', 'refund']
    };

    const colors = {
      privacy: '#8B5CF6',
      liability: '#EF4444',
      dispute: '#F59E0B',
      termination: '#EC4899',
      intellectual: '#10B981',
      payment: '#3B82F6'
    };

    for (const [category, terms] of Object.entries(termCategories)) {
      if (terms.some(t => term.toLowerCase().includes(t))) {
        return colors[category];
      }
    }

    return '#6B7280'; // Default gray
  };

  /**
   * Get word cloud data based on type
   */
  const getWordCloudData = () => {
    switch (cloudType) {
      case 'legal':
        return generateLegalTermsCloud();
      case 'changes':
        return generateChangesCloud();
      case 'risks':
        return generateRisksCloud();
      default:
        return generateLegalTermsCloud();
    }
  };

  const wordCloudData = getWordCloudData();

  /**
   * Render word cloud
   */
  const renderWordCloud = (words, title) => {
    if (!words || words.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <FiCloud className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-64 overflow-hidden">
        <h3 className="text-lg font-medium text-white mb-4 text-center">{title}</h3>
        <div className="flex flex-wrap items-center justify-center h-48 p-4">
          {words.map((word, index) => (
            <span
              key={index}
              className={`
                inline-block m-1 px-2 py-1 rounded cursor-pointer transition-all duration-300 hover:scale-110
                ${animationEnabled ? 'animate-pulse' : ''}
              `}
              style={{
                fontSize: `${word.size}px`,
                color: word.color,
                fontWeight: word.size > 24 ? 'bold' : 'normal',
                animationDelay: `${index * 0.1}s`
              }}
              title={`${word.text}: ${word.count} occurrences`}
            >
              {word.text}
            </span>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render cloud type selector
   */
  const renderCloudTypeSelector = () => {
    const types = [
      { id: 'legal', label: 'Legal Terms', description: 'Key legal terminology' },
      { id: 'changes', label: 'Changes', description: 'Document modifications' },
      { id: 'risks', label: 'Risk Factors', description: 'Identified risks' }
    ];

    return (
      <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg mb-6">
        {types.map(type => (
          <button
            key={type.id}
            onClick={() => setCloudType(type.id)}
            className={`
              flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${cloudType === type.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }
            `}
            title={type.description}
          >
            {type.label}
          </button>
        ))}
      </div>
    );
  };

  /**
   * Render controls
   */
  const renderControls = () => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors"
        >
          {showComparison ? <FiEye className="h-4 w-4" /> : <FiEyeOff className="h-4 w-4" />}
          <span>{showComparison ? 'Hide' : 'Show'} Comparison</span>
        </button>

        <button
          onClick={() => setAnimationEnabled(!animationEnabled)}
          className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors"
        >
          <FiSettings className="h-4 w-4" />
          <span>{animationEnabled ? 'Disable' : 'Enable'} Animation</span>
        </button>
      </div>

      <button
        onClick={() => {
          // Trigger re-render with animation
          setAnimationEnabled(false);
          setTimeout(() => setAnimationEnabled(true), 100);
        }}
        className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
      >
        <FiRefreshCw className="h-4 w-4" />
        <span>Refresh</span>
      </button>
    </div>
  );

  /**
   * Render legend
   */
  const renderLegend = () => {
    if (cloudType !== 'legal') return null;

    const categories = [
      { name: 'Privacy & Data', color: '#8B5CF6' },
      { name: 'Liability', color: '#EF4444' },
      { name: 'Dispute Resolution', color: '#F59E0B' },
      { name: 'Termination', color: '#EC4899' },
      { name: 'Intellectual Property', color: '#10B981' },
      { name: 'Payment', color: '#3B82F6' }
    ];

    return (
      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-3">Color Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {categories.map(category => (
            <div key={category.name} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="text-gray-300">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700 rounded-lg p-6">
        <div className="flex items-center mb-2">
          <FiCloud className="h-6 w-6 text-purple-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">Word Cloud Visualization</h2>
        </div>
        <p className="text-gray-300">
          Visual representation of key terms, changes, and risk factors in your documents
        </p>
      </div>

      {/* Cloud Type Selector */}
      {renderCloudTypeSelector()}

      {/* Controls */}
      {renderControls()}

      {/* Word Clouds */}
      <div className={`grid ${showComparison && wordCloudData.doc1.length > 0 ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {showComparison && wordCloudData.doc1.length > 0 && (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            {renderWordCloud(wordCloudData.doc1, `Document 1 (${file1Name})`)}
          </div>
        )}

        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          {renderWordCloud(
            wordCloudData.doc2, 
            showComparison && wordCloudData.doc1.length > 0 ? `Document 2 (${file2Name})` : 'Document Analysis'
          )}
        </div>
      </div>

      {/* Legend */}
      {renderLegend()}

      {/* Statistics */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Word Cloud Statistics</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {cloudType === 'legal' ? Object.keys(comprehensiveAnalysis.keyTermsAnalysis?.termComparison || {}).length :
               cloudType === 'changes' ? 4 :
               comprehensiveAnalysis.riskAssessment?.doc2Risks?.length || 0}
            </div>
            <div className="text-sm text-gray-300">
              {cloudType === 'legal' ? 'Legal Terms' :
               cloudType === 'changes' ? 'Change Types' :
               'Risk Factors'}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {wordCloudData.doc2.reduce((sum, word) => sum + (word.count || 0), 0)}
            </div>
            <div className="text-sm text-gray-300">Total Occurrences</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(wordCloudData.doc2.reduce((sum, word) => sum + word.size, 0) / wordCloudData.doc2.length) || 0}
            </div>
            <div className="text-sm text-gray-300">Avg Importance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCloudVisualization;
