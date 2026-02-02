import React, { useState } from 'react';
import { FiBarChart2, FiCircle, FiTrendingUp, FiActivity, FiCloud } from 'react-icons/fi';
import WordCloudVisualization from './WordCloudVisualization';

/**
 * Visualization Dashboard Component
 * Displays charts and graphs for TOS comparison data
 */
const VisualizationDashboard = ({ analysis }) => {
  const [visualizationType, setVisualizationType] = useState('charts'); // charts, wordcloud

  if (!analysis?.comprehensiveAnalysis) return null;

  const { comprehensiveAnalysis, file1Name, file2Name } = analysis;

  /**
   * Render a simple bar chart
   */
  const renderBarChart = (data, title) => {
    const maxValue = Math.max(...data.map(item => Math.max(item.value1 || 0, item.value2 || 0)));
    
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FiBarChart2 className="h-5 w-5 mr-2" />
          {title}
        </h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{item.label}</span>
                <span className="text-gray-400">{item.value1} → {item.value2}</span>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <div className="bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(item.value1 / maxValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(item.value2 / maxValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-400">Document 1 ({file1Name})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span className="text-gray-400">Document 2 ({file2Name})</span>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render a simple pie chart representation
   */
  const renderPieChart = (data, title) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <FiCircle className="h-5 w-5 mr-2" />
          {title}
        </h3>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded ${item.color}`}
                  ></div>
                  <span className="text-gray-300">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">{item.value}</div>
                  <div className="text-xs text-gray-400">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Render content matching visualization
   */
  const renderContentMatchingChart = () => {
    const { contentMatching } = comprehensiveAnalysis;
    if (!contentMatching) return null;

    const data = [
      { label: 'Exact Matches', value: contentMatching.exactMatches, color: 'bg-green-500' },
      { label: 'Partial Matches', value: contentMatching.partialMatches, color: 'bg-yellow-500' },
      { label: 'Unique to Doc 1', value: contentMatching.uniqueToDoc1, color: 'bg-red-500' },
      { label: 'Unique to Doc 2', value: contentMatching.uniqueToDoc2, color: 'bg-blue-500' }
    ];

    return renderPieChart(data, 'Content Matching Distribution');
  };

  /**
   * Render key terms comparison chart
   */
  const renderKeyTermsChart = () => {
    const { keyTermsAnalysis } = comprehensiveAnalysis;
    if (!keyTermsAnalysis?.termComparison) return null;

    const data = Object.entries(keyTermsAnalysis.termComparison)
      .filter(([term, data]) => data.doc1Count > 0 || data.doc2Count > 0)
      .slice(0, 10)
      .map(([term, termData]) => ({
        label: term,
        value1: termData.doc1Count,
        value2: termData.doc2Count
      }));

    return renderBarChart(data, 'Key Terms Frequency Comparison');
  };

  /**
   * Render clause categories chart
   */
  const renderClauseCategoriesChart = () => {
    const { clauseCategories } = comprehensiveAnalysis;
    if (!clauseCategories) return null;

    const data = Object.entries(clauseCategories).map(([category, categoryData]) => ({
      label: category,
      value1: categoryData.doc1Count,
      value2: categoryData.doc2Count
    }));

    return renderBarChart(data, 'Clause Categories Comparison');
  };

  /**
   * Render risk assessment chart
   */
  const renderRiskAssessmentChart = () => {
    const { riskAssessment } = comprehensiveAnalysis;
    if (!riskAssessment) return null;

    const riskLevels = { high: 3, medium: 2, low: 1 };
    
    const doc1RiskScore = riskAssessment.doc1Risks?.reduce((sum, risk) => 
      sum + (riskLevels[risk.riskLevel] || 0), 0) || 0;
    
    const doc2RiskScore = riskAssessment.doc2Risks?.reduce((sum, risk) => 
      sum + (riskLevels[risk.riskLevel] || 0), 0) || 0;

    const doc1RiskCounts = {
      high: riskAssessment.doc1Risks?.filter(r => r.riskLevel === 'high').length || 0,
      medium: riskAssessment.doc1Risks?.filter(r => r.riskLevel === 'medium').length || 0,
      low: riskAssessment.doc1Risks?.filter(r => r.riskLevel === 'low').length || 0
    };

    const doc2RiskCounts = {
      high: riskAssessment.doc2Risks?.filter(r => r.riskLevel === 'high').length || 0,
      medium: riskAssessment.doc2Risks?.filter(r => r.riskLevel === 'medium').length || 0,
      low: riskAssessment.doc2Risks?.filter(r => r.riskLevel === 'low').length || 0
    };

    return (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FiActivity className="h-5 w-5 mr-2" />
            Risk Score Comparison
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Document 1 ({file1Name})</span>
              <span className="text-2xl font-bold text-red-400">{doc1RiskScore}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Document 2 ({file2Name})</span>
              <span className="text-2xl font-bold text-red-400">{doc2RiskScore}</span>
            </div>
            <div className="pt-4 border-t border-gray-600">
              <p className="text-sm text-gray-400">
                {doc2RiskScore > doc1RiskScore ?
                  `Document 2 has ${doc2RiskScore - doc1RiskScore} more risk points` :
                  doc1RiskScore > doc2RiskScore ?
                  `Document 1 has ${doc1RiskScore - doc2RiskScore} more risk points` :
                  'Both documents have equal risk scores'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Level Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-red-400">High Risk</span>
              <span className="text-gray-300">{doc1RiskCounts.high} → {doc2RiskCounts.high}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-400">Medium Risk</span>
              <span className="text-gray-300">{doc1RiskCounts.medium} → {doc2RiskCounts.medium}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-400">Low Risk</span>
              <span className="text-gray-300">{doc1RiskCounts.low} → {doc2RiskCounts.low}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render readability comparison chart
   */
  const renderReadabilityChart = () => {
    const { readabilityAnalysis } = comprehensiveAnalysis;
    if (!readabilityAnalysis) return null;

    const data = [
      {
        label: 'Flesch Score',
        value1: readabilityAnalysis.doc1?.fleschScore || 0,
        value2: readabilityAnalysis.doc2?.fleschScore || 0
      },
      {
        label: 'Avg Words/Sentence',
        value1: readabilityAnalysis.doc1?.averageWordsPerSentence || 0,
        value2: readabilityAnalysis.doc2?.averageWordsPerSentence || 0
      },
      {
        label: 'Avg Syllables/Word',
        value1: Math.round((readabilityAnalysis.doc1?.averageSyllablesPerWord || 0) * 10),
        value2: Math.round((readabilityAnalysis.doc2?.averageSyllablesPerWord || 0) * 10)
      }
    ];

    return renderBarChart(data, 'Readability Metrics Comparison');
  };

  /**
   * Render structural comparison chart
   */
  const renderStructuralChart = () => {
    const { structuralAnalysis } = comprehensiveAnalysis;
    if (!structuralAnalysis) return null;

    const data = [
      {
        label: 'Word Count',
        value1: structuralAnalysis.doc1?.wordCount || 0,
        value2: structuralAnalysis.doc2?.wordCount || 0
      },
      {
        label: 'Sentence Count',
        value1: structuralAnalysis.doc1?.sentenceCount || 0,
        value2: structuralAnalysis.doc2?.sentenceCount || 0
      },
      {
        label: 'Paragraph Count',
        value1: structuralAnalysis.doc1?.paragraphCount || 0,
        value2: structuralAnalysis.doc2?.paragraphCount || 0
      }
    ];

    return renderBarChart(data, 'Document Structure Comparison');
  };

  /**
   * Render visualization type selector
   */
  const renderVisualizationSelector = () => {
    const types = [
      { id: 'charts', label: 'Charts & Graphs', icon: FiBarChart2 },
      { id: 'wordcloud', label: 'Word Clouds', icon: FiCloud }
    ];

    return (
      <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg mb-6">
        {types.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setVisualizationType(id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${visualizationType === id
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    );
  };

  if (visualizationType === 'wordcloud') {
    return <WordCloudVisualization analysis={analysis} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <FiTrendingUp className="h-6 w-6 text-purple-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">Visualization Dashboard</h2>
        </div>
        <p className="text-gray-300">
          Interactive charts and graphs showing comprehensive comparison metrics
        </p>
      </div>

      {/* Visualization Type Selector */}
      {renderVisualizationSelector()}

      {/* Content Matching Visualization */}
      <div className="grid md:grid-cols-2 gap-6">
        {renderContentMatchingChart()}
        
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Overall Similarity</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray={`${comprehensiveAnalysis.contentMatching?.overallSimilarity || 0}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {comprehensiveAnalysis.contentMatching?.overallSimilarity || 0}%
                </span>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-300 mt-4">
            Documents are {comprehensiveAnalysis.contentMatching?.overallSimilarity || 0}% similar
          </p>
        </div>
      </div>

      {/* Key Terms and Clause Categories */}
      <div className="grid md:grid-cols-2 gap-6">
        {renderKeyTermsChart()}
        {renderClauseCategoriesChart()}
      </div>

      {/* Risk Assessment */}
      {renderRiskAssessmentChart()}

      {/* Readability and Structure */}
      <div className="grid md:grid-cols-2 gap-6">
        {renderReadabilityChart()}
        {renderStructuralChart()}
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Summary Statistics</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-blue-400">
              {comprehensiveAnalysis.contentMatching?.overallSimilarity || 0}%
            </div>
            <div className="text-sm text-gray-300">Overall Similarity</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-green-400">
              {comprehensiveAnalysis.structuralAnalysis?.comparison?.lengthChangePercentage || 0}%
            </div>
            <div className="text-sm text-gray-300">Length Change</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-yellow-400">
              {(comprehensiveAnalysis.riskAssessment?.doc1Risks?.length || 0) + 
               (comprehensiveAnalysis.riskAssessment?.doc2Risks?.length || 0)}
            </div>
            <div className="text-sm text-gray-300">Total Risks</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-purple-400">
              {Object.keys(comprehensiveAnalysis.clauseCategories || {}).length}
            </div>
            <div className="text-sm text-gray-300">Clause Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationDashboard;
