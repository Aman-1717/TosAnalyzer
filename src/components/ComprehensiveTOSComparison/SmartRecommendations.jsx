import React, { useState } from 'react';
import { FiZap, FiShield, FiUsers, FiTrendingUp, FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo, FiStar } from 'react-icons/fi';

/**
 * Smart Recommendations Engine Component
 * Provides AI-powered suggestions for clause improvements and compliance
 */
const SmartRecommendations = ({ analysis }) => {
  const [recommendationType, setRecommendationType] = useState('all'); // all, legal, user-friendly, compliance
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, high, medium, low

  if (!analysis?.comprehensiveAnalysis) return null;

  const { comprehensiveAnalysis, file1Name, file2Name } = analysis;

  /**
   * Generate comprehensive recommendations
   */
  const generateRecommendations = () => {
    const recommendations = [];

    // Legal Risk Recommendations
    if (comprehensiveAnalysis.riskAssessment?.doc2Risks) {
      comprehensiveAnalysis.riskAssessment.doc2Risks.forEach(risk => {
        if (risk.riskLevel === 'high') {
          recommendations.push({
            id: `risk-${risk.type}`,
            type: 'legal',
            priority: 'high',
            title: `Address ${risk.type}`,
            description: `High-risk clause detected: ${risk.description}`,
            suggestion: getLegalSuggestion(risk.type),
            impact: 'Reduces legal liability and user concerns',
            effort: 'Medium',
            category: 'Risk Mitigation'
          });
        }
      });
    }

    // Readability Recommendations
    if (comprehensiveAnalysis.readabilityAnalysis?.doc2?.fleschScore < 50) {
      recommendations.push({
        id: 'readability-improvement',
        type: 'user-friendly',
        priority: 'medium',
        title: 'Improve Document Readability',
        description: 'The document has poor readability scores, making it difficult for users to understand.',
        suggestion: 'Break down complex sentences, use simpler vocabulary, and add explanatory sections.',
        impact: 'Increases user understanding and reduces support queries',
        effort: 'High',
        category: 'User Experience'
      });
    }

    // Length Recommendations
    const lengthChange = comprehensiveAnalysis.structuralAnalysis?.comparison?.lengthChangePercentage || 0;
    if (lengthChange > 50) {
      recommendations.push({
        id: 'document-length',
        type: 'user-friendly',
        priority: 'medium',
        title: 'Consider Document Length',
        description: `Document has grown by ${lengthChange}%, which may overwhelm users.`,
        suggestion: 'Consider creating a summary section or breaking into multiple documents.',
        impact: 'Improves user engagement and comprehension',
        effort: 'Medium',
        category: 'Document Structure'
      });
    }

    // Compliance Recommendations
    recommendations.push({
      id: 'gdpr-compliance',
      type: 'compliance',
      priority: 'high',
      title: 'GDPR Compliance Review',
      description: 'Ensure all data processing activities comply with GDPR requirements.',
      suggestion: 'Add explicit consent mechanisms, data subject rights, and lawful basis for processing.',
      impact: 'Ensures regulatory compliance and avoids penalties',
      effort: 'High',
      category: 'Data Protection'
    });

    recommendations.push({
      id: 'accessibility-compliance',
      type: 'compliance',
      priority: 'medium',
      title: 'Accessibility Improvements',
      description: 'Make terms more accessible to users with disabilities.',
      suggestion: 'Provide alternative formats, use clear headings, and ensure screen reader compatibility.',
      impact: 'Improves accessibility and legal compliance',
      effort: 'Medium',
      category: 'Accessibility'
    });

    // User-Friendly Recommendations
    recommendations.push({
      id: 'plain-language',
      type: 'user-friendly',
      priority: 'medium',
      title: 'Use Plain Language',
      description: 'Replace legal jargon with user-friendly language where possible.',
      suggestion: 'Create a glossary of terms and use everyday language in explanations.',
      impact: 'Increases user trust and understanding',
      effort: 'Medium',
      category: 'Communication'
    });

    recommendations.push({
      id: 'visual-improvements',
      type: 'user-friendly',
      priority: 'low',
      title: 'Add Visual Elements',
      description: 'Consider adding diagrams, flowcharts, or infographics to explain complex concepts.',
      suggestion: 'Create visual summaries of key sections and user rights.',
      impact: 'Enhances user comprehension and engagement',
      effort: 'High',
      category: 'Visual Design'
    });

    return recommendations;
  };

  /**
   * Get legal suggestion based on risk type
   */
  const getLegalSuggestion = (riskType) => {
    const suggestions = {
      'Unlimited Liability': 'Add reasonable liability limitations to protect your business while maintaining user trust.',
      'Mandatory Arbitration': 'Consider making arbitration optional or providing alternative dispute resolution methods.',
      'Arbitrary Termination': 'Specify clear termination conditions and provide reasonable notice periods.',
      'Data Sharing': 'Clearly explain data sharing practices and obtain explicit user consent.',
      'No Warranty': 'Provide limited warranties for core services while disclaiming others.',
      'Unilateral Changes': 'Implement a fair notice period and grandfathering policy for existing users.',
      'Content Rights': 'Clarify user content ownership and limit your rights to what\'s necessary for service provision.',
      'Class Action Waiver': 'Consider the enforceability and user perception of class action waivers.'
    };

    return suggestions[riskType] || 'Review this clause with legal counsel to ensure it\'s fair and enforceable.';
  };

  /**
   * Filter recommendations based on type and priority
   */
  const getFilteredRecommendations = () => {
    let filtered = generateRecommendations();

    if (recommendationType !== 'all') {
      filtered = filtered.filter(rec => rec.type === recommendationType);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(rec => rec.priority === priorityFilter);
    }

    return filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  /**
   * Get priority styling
   */
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return {
          icon: FiXCircle,
          color: 'text-red-400',
          bg: 'bg-red-900/20',
          border: 'border-red-700'
        };
      case 'medium':
        return {
          icon: FiAlertTriangle,
          color: 'text-yellow-400',
          bg: 'bg-yellow-900/20',
          border: 'border-yellow-700'
        };
      case 'low':
        return {
          icon: FiInfo,
          color: 'text-blue-400',
          bg: 'bg-blue-900/20',
          border: 'border-blue-700'
        };
      default:
        return {
          icon: FiInfo,
          color: 'text-gray-400',
          bg: 'bg-gray-800',
          border: 'border-gray-600'
        };
    }
  };

  /**
   * Get effort styling
   */
  const getEffortColor = (effort) => {
    switch (effort) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  /**
   * Render filter controls
   */
  const renderFilters = () => (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Recommendation Type</label>
        <select
          value={recommendationType}
          onChange={(e) => setRecommendationType(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Recommendations</option>
          <option value="legal">Legal & Risk</option>
          <option value="user-friendly">User-Friendly</option>
          <option value="compliance">Compliance</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Priority Level</label>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>
    </div>
  );

  /**
   * Render recommendation card
   */
  const renderRecommendationCard = (recommendation) => {
    const priorityStyle = getPriorityStyle(recommendation.priority);
    const Icon = priorityStyle.icon;

    return (
      <div
        key={recommendation.id}
        className={`border rounded-lg p-6 ${priorityStyle.bg} ${priorityStyle.border}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon className={`h-5 w-5 ${priorityStyle.color}`} />
            <div>
              <h3 className="text-lg font-semibold text-white">{recommendation.title}</h3>
              <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                {recommendation.category}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded ${priorityStyle.color} bg-gray-800`}>
              {recommendation.priority.toUpperCase()}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${getEffortColor(recommendation.effort)} bg-gray-800`}>
              {recommendation.effort} Effort
            </span>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4">{recommendation.description}</p>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-white mb-1">💡 Suggestion:</h4>
            <p className="text-gray-300 text-sm">{recommendation.suggestion}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white mb-1">📈 Expected Impact:</h4>
            <p className="text-gray-300 text-sm">{recommendation.impact}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>Type: {recommendation.type}</span>
              <span>•</span>
              <span>Effort: {recommendation.effort}</span>
            </div>
            <button className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors">
              <FiStar className="h-3 w-3" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredRecommendations = getFilteredRecommendations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-700 rounded-lg p-6">
        <div className="flex items-center mb-2">
          <FiZap className="h-6 w-6 text-purple-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">Smart Recommendations</h2>
        </div>
        <p className="text-gray-300">
          AI-powered suggestions to improve your Terms of Service for legal compliance, user-friendliness, and risk mitigation
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {filteredRecommendations.filter(r => r.priority === 'high').length}
          </div>
          <div className="text-sm text-red-300">High Priority</div>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {filteredRecommendations.filter(r => r.priority === 'medium').length}
          </div>
          <div className="text-sm text-yellow-300">Medium Priority</div>
        </div>
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {filteredRecommendations.filter(r => r.priority === 'low').length}
          </div>
          <div className="text-sm text-blue-300">Low Priority</div>
        </div>
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {filteredRecommendations.length}
          </div>
          <div className="text-sm text-green-300">Total Recommendations</div>
        </div>
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Recommendations */}
      <div className="space-y-4">
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map(renderRecommendationCard)
        ) : (
          <div className="text-center py-12 text-gray-400">
            <FiCheckCircle className="h-12 w-12 mx-auto mb-4" />
            <p>No recommendations match your current filters.</p>
            <p className="text-sm mt-2">Try adjusting the filters above.</p>
          </div>
        )}
      </div>

      {/* Action Summary */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Implementation Roadmap</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-900/10 border border-red-800 rounded">
            <span className="text-red-300">🚨 Immediate Action (High Priority)</span>
            <span className="text-red-400 font-medium">
              {filteredRecommendations.filter(r => r.priority === 'high').length} items
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-900/10 border border-yellow-800 rounded">
            <span className="text-yellow-300">⚠️ Short Term (Medium Priority)</span>
            <span className="text-yellow-400 font-medium">
              {filteredRecommendations.filter(r => r.priority === 'medium').length} items
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-900/10 border border-blue-800 rounded">
            <span className="text-blue-300">💡 Long Term (Low Priority)</span>
            <span className="text-blue-400 font-medium">
              {filteredRecommendations.filter(r => r.priority === 'low').length} items
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRecommendations;
