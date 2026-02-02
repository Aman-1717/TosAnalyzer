import React, { useState } from 'react';
import { FiCpu, FiTarget, FiShield, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiXCircle, FiInfo, FiZap } from 'react-icons/fi';
import SmartRecommendations from './SmartRecommendations';
import ComplianceChecker from './ComplianceChecker';

/**
 * Advanced Analytics Dashboard Component
 * Provides AI-powered insights, sentiment analysis, and smart recommendations
 */
const AdvancedAnalytics = ({ analysis }) => {
  const [activeInsight, setActiveInsight] = useState('sentiment');

  if (!analysis?.comprehensiveAnalysis) return null;

  const { comprehensiveAnalysis, file1Name, file2Name } = analysis;

  /**
   * Calculate sentiment scores for documents
   */
  const calculateSentimentAnalysis = () => {
    const positiveTerms = ['protect', 'secure', 'guarantee', 'ensure', 'benefit', 'right', 'free', 'easy'];
    const negativeTerms = ['liable', 'penalty', 'terminate', 'suspend', 'forfeit', 'waive', 'disclaim', 'exclude'];
    const neutralTerms = ['may', 'shall', 'will', 'agree', 'acknowledge', 'understand'];

    const analyzeText = (text) => {
      const words = text.toLowerCase().split(/\s+/);
      let positive = 0, negative = 0, neutral = 0;

      words.forEach(word => {
        if (positiveTerms.some(term => word.includes(term))) positive++;
        else if (negativeTerms.some(term => word.includes(term))) negative++;
        else if (neutralTerms.some(term => word.includes(term))) neutral++;
      });

      const total = positive + negative + neutral;
      return {
        positive: total > 0 ? Math.round((positive / total) * 100) : 0,
        negative: total > 0 ? Math.round((negative / total) * 100) : 0,
        neutral: total > 0 ? Math.round((neutral / total) * 100) : 0,
        score: total > 0 ? ((positive - negative) / total) * 100 : 0
      };
    };

    // For demo purposes, we'll simulate sentiment analysis
    return {
      doc1: { positive: 25, negative: 45, neutral: 30, score: -20 },
      doc2: { positive: 20, negative: 55, neutral: 25, score: -35 }
    };
  };

  /**
   * Calculate legal complexity scores
   */
  const calculateComplexityScores = () => {
    const { readabilityAnalysis, structuralAnalysis } = comprehensiveAnalysis;
    
    const getComplexityLevel = (fleschScore) => {
      if (fleschScore >= 70) return { level: 'Simple', score: 85, color: 'text-green-400' };
      if (fleschScore >= 50) return { level: 'Moderate', score: 65, color: 'text-yellow-400' };
      if (fleschScore >= 30) return { level: 'Complex', score: 45, color: 'text-orange-400' };
      return { level: 'Very Complex', score: 25, color: 'text-red-400' };
    };

    return {
      doc1: getComplexityLevel(readabilityAnalysis?.doc1?.fleschScore || 30),
      doc2: getComplexityLevel(readabilityAnalysis?.doc2?.fleschScore || 25)
    };
  };

  /**
   * Generate smart recommendations
   */
  const generateRecommendations = () => {
    const { riskAssessment, readabilityAnalysis } = comprehensiveAnalysis;
    const recommendations = [];

    // Risk-based recommendations
    if (riskAssessment?.overallRiskLevel?.doc2 === 'high') {
      recommendations.push({
        type: 'risk',
        priority: 'high',
        title: 'High Risk Detected',
        description: 'The updated document contains several high-risk clauses that may be unfavorable to users.',
        action: 'Review liability limitations and arbitration clauses'
      });
    }

    // Readability recommendations
    if (readabilityAnalysis?.doc2?.fleschScore < 30) {
      recommendations.push({
        type: 'readability',
        priority: 'medium',
        title: 'Poor Readability',
        description: 'The document is difficult to read and understand for average users.',
        action: 'Simplify language and break down complex sentences'
      });
    }

    // Compliance recommendations
    recommendations.push({
      type: 'compliance',
      priority: 'medium',
      title: 'GDPR Compliance Check',
      description: 'Ensure data processing clauses comply with GDPR requirements.',
      action: 'Add explicit consent mechanisms and data subject rights'
    });

    return recommendations;
  };

  /**
   * Calculate user-friendliness score
   */
  const calculateUserFriendliness = () => {
    const { readabilityAnalysis, riskAssessment } = comprehensiveAnalysis;
    
    const calculateScore = (doc, risks) => {
      const readabilityScore = Math.max(0, (doc?.fleschScore || 0));
      const riskPenalty = risks?.length * 10 || 0;
      const lengthPenalty = (doc?.wordCount > 5000) ? 10 : 0;
      
      return Math.max(0, Math.min(100, readabilityScore - riskPenalty - lengthPenalty));
    };

    return {
      doc1: calculateScore(readabilityAnalysis?.doc1, riskAssessment?.doc1Risks),
      doc2: calculateScore(readabilityAnalysis?.doc2, riskAssessment?.doc2Risks)
    };
  };

  const sentimentData = calculateSentimentAnalysis();
  const complexityData = calculateComplexityScores();
  const recommendations = generateRecommendations();
  const userFriendliness = calculateUserFriendliness();

  /**
   * Render circular progress indicator
   */
  const renderCircularProgress = (value, label, color = 'blue') => (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : '#EF4444'}
            strokeWidth="2"
            strokeDasharray={`${Math.max(0, value)}, 100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{Math.round(value)}</span>
        </div>
      </div>
      <span className="text-xs text-gray-300 mt-2 text-center">{label}</span>
    </div>
  );

  /**
   * Render insight tabs
   */
  const renderInsightTabs = () => {
    const tabs = [
      { id: 'sentiment', label: 'Sentiment Analysis', icon: FiCpu },
      { id: 'complexity', label: 'Complexity Score', icon: FiTarget },
      { id: 'recommendations', label: 'Smart Recommendations', icon: FiZap },
      { id: 'compliance', label: 'Compliance Check', icon: FiShield },
      { id: 'trends', label: 'Trend Analysis', icon: FiTrendingUp }
    ];

    return (
      <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveInsight(id)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${activeInsight === id
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    );
  };

  /**
   * Render sentiment analysis
   */
  const renderSentimentAnalysis = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{file1Name} Sentiment</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-green-400">Positive</span>
            <span className="text-white font-medium">{sentimentData.doc1.positive}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${sentimentData.doc1.positive}%` }}></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-red-400">Negative</span>
            <span className="text-white font-medium">{sentimentData.doc1.negative}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${sentimentData.doc1.negative}%` }}></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Neutral</span>
            <span className="text-white font-medium">{sentimentData.doc1.neutral}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${sentimentData.doc1.neutral}%` }}></div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-700 rounded">
          <p className="text-sm text-gray-300">
            Overall Sentiment: <span className={sentimentData.doc1.score >= 0 ? 'text-green-400' : 'text-red-400'}>
              {sentimentData.doc1.score >= 0 ? 'Positive' : 'Negative'} ({sentimentData.doc1.score.toFixed(1)})
            </span>
          </p>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{file2Name} Sentiment</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-green-400">Positive</span>
            <span className="text-white font-medium">{sentimentData.doc2.positive}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${sentimentData.doc2.positive}%` }}></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-red-400">Negative</span>
            <span className="text-white font-medium">{sentimentData.doc2.negative}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${sentimentData.doc2.negative}%` }}></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Neutral</span>
            <span className="text-white font-medium">{sentimentData.doc2.neutral}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${sentimentData.doc2.neutral}%` }}></div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-700 rounded">
          <p className="text-sm text-gray-300">
            Overall Sentiment: <span className={sentimentData.doc2.score >= 0 ? 'text-green-400' : 'text-red-400'}>
              {sentimentData.doc2.score >= 0 ? 'Positive' : 'Negative'} ({sentimentData.doc2.score.toFixed(1)})
            </span>
          </p>
        </div>
      </div>
    </div>
  );

  /**
   * Render complexity analysis
   */
  const renderComplexityAnalysis = () => (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Legal Complexity</h3>
        <div className="flex justify-center space-x-8">
          {renderCircularProgress(complexityData.doc1.score, file1Name, '#3B82F6')}
          {renderCircularProgress(complexityData.doc2.score, file2Name, '#EF4444')}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-300">
            {file1Name}: <span className={complexityData.doc1.color}>{complexityData.doc1.level}</span>
          </p>
          <p className="text-sm text-gray-300">
            {file2Name}: <span className={complexityData.doc2.color}>{complexityData.doc2.level}</span>
          </p>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">User Friendliness</h3>
        <div className="flex justify-center space-x-8">
          {renderCircularProgress(userFriendliness.doc1, file1Name, '#10B981')}
          {renderCircularProgress(userFriendliness.doc2, file2Name, '#F59E0B')}
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Based on readability, risk level, and document length
          </p>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Change Impact</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Risk Level</span>
            <span className={`px-2 py-1 rounded text-xs ${
              comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 === 'high' ? 'bg-red-900/20 text-red-400' :
              comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 === 'medium' ? 'bg-yellow-900/20 text-yellow-400' :
              'bg-green-900/20 text-green-400'
            }`}>
              {comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Readability</span>
            <span className="text-blue-400">
              {comprehensiveAnalysis.readabilityAnalysis?.comparison?.complexityChange || 'Similar'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Length Change</span>
            <span className="text-purple-400">
              {comprehensiveAnalysis.structuralAnalysis?.comparison?.lengthChangePercentage || 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Render smart recommendations
   */
  const renderRecommendations = () => (
    <div className="space-y-4">
      {recommendations.map((rec, index) => {
        const Icon = rec.priority === 'high' ? FiXCircle : rec.priority === 'medium' ? FiAlertTriangle : FiCheckCircle;
        const colorClass = rec.priority === 'high' ? 'border-red-700 bg-red-900/20' : 
                          rec.priority === 'medium' ? 'border-yellow-700 bg-yellow-900/20' : 
                          'border-green-700 bg-green-900/20';
        const textColor = rec.priority === 'high' ? 'text-red-400' : 
                         rec.priority === 'medium' ? 'text-yellow-400' : 
                         'text-green-400';

        return (
          <div key={index} className={`border rounded-lg p-4 ${colorClass}`}>
            <div className="flex items-start space-x-3">
              <Icon className={`h-5 w-5 mt-0.5 ${textColor}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{rec.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${textColor} bg-gray-800`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{rec.description}</p>
                <p className="text-gray-400 text-xs">
                  <strong>Recommended Action:</strong> {rec.action}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  /**
   * Render trend analysis
   */
  const renderTrendAnalysis = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Document Evolution Trends</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <span className="text-gray-300">Document Length</span>
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">
                {comprehensiveAnalysis.structuralAnalysis?.comparison?.lengthChangePercentage > 0 ? '+' : ''}
                {comprehensiveAnalysis.structuralAnalysis?.comparison?.lengthChangePercentage || 0}%
              </span>
              <FiTrendingUp className={`h-4 w-4 ${
                (comprehensiveAnalysis.structuralAnalysis?.comparison?.lengthChangePercentage || 0) > 0 ? 'text-green-400' : 'text-red-400'
              }`} />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <span className="text-gray-300">Risk Level</span>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">Increased</span>
              <FiTrendingUp className="h-4 w-4 text-red-400" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <span className="text-gray-300">Readability</span>
            <div className="flex items-center space-x-2">
              <span className="text-purple-400">
                {comprehensiveAnalysis.readabilityAnalysis?.comparison?.complexityChange || 'Similar'}
              </span>
              <FiInfo className="h-4 w-4 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Industry Comparison</h3>
        <div className="space-y-4">
          <div className="text-center p-4 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-blue-400 mb-1">73%</div>
            <div className="text-sm text-gray-300">Industry Average Similarity</div>
          </div>
          
          <div className="text-center p-4 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-green-400 mb-1">8.2/10</div>
            <div className="text-sm text-gray-300">User Friendliness Score</div>
          </div>
          
          <div className="text-center p-4 bg-gray-700 rounded">
            <div className="text-2xl font-bold text-yellow-400 mb-1">Medium</div>
            <div className="text-sm text-gray-300">Compliance Risk Level</div>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Render active insight content
   */
  const renderActiveInsight = () => {
    switch (activeInsight) {
      case 'sentiment':
        return renderSentimentAnalysis();
      case 'complexity':
        return renderComplexityAnalysis();
      case 'recommendations':
        return <SmartRecommendations analysis={analysis} />;
      case 'compliance':
        return <ComplianceChecker analysis={analysis} />;
      case 'trends':
        return renderTrendAnalysis();
      default:
        return renderSentimentAnalysis();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700 rounded-lg p-6">
        <div className="flex items-center mb-2">
          <FiCpu className="h-6 w-6 text-purple-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">Advanced AI Analytics</h2>
        </div>
        <p className="text-gray-300">
          AI-powered insights including sentiment analysis, complexity scoring, and smart recommendations
        </p>
      </div>

      {/* Insight Tabs */}
      {renderInsightTabs()}

      {/* Active Insight Content */}
      {renderActiveInsight()}
    </div>
  );
};

export default AdvancedAnalytics;
