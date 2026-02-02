import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiAlertTriangle, 
  FiTrendingDown,
  FiEye,
  FiArrowRight,
  FiClock,
  FiTarget,
  FiShield,
  FiDollarSign,
  FiInfo,
  FiSearch,
  FiFilter
} from 'react-icons/fi';

/**
 * Company Pattern Matcher Component
 * Compares current ToS with similar companies and warns about potential risks
 */
const CompanyPatternMatcher = ({ patterns, companyName }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedPattern, setExpandedPattern] = useState(null);
  const [companyPatterns, setCompanyPatterns] = useState([]);

  /**
   * Mock company pattern data - in real implementation, this would come from AI analysis
   */
  useEffect(() => {
    const mockPatterns = [
      {
        id: 1,
        similarCompany: 'Facebook/Meta',
        category: 'privacy',
        pattern: 'Started with basic friend data sharing, gradually expanded to comprehensive behavioral tracking',
        warning: 'This ToS resembles early Facebook terms that later allowed extensive data profiling',
        riskLevel: 'High',
        timeline: '2019-2023',
        specificChanges: [
          'Added facial recognition data collection',
          'Expanded third-party data sharing',
          'Introduced cross-platform tracking',
          'Added AI training data usage rights'
        ],
        currentSimilarity: 85,
        icon: FiShield
      },
      {
        id: 2,
        similarCompany: 'Netflix',
        category: 'billing',
        pattern: 'Introduced auto-renewal with difficult cancellation, then added price increase clauses',
        warning: 'Similar billing patterns that led to subscription trap complaints',
        riskLevel: 'Medium',
        timeline: '2020-2024',
        specificChanges: [
          'Made cancellation process more complex',
          'Added automatic price increase acceptance',
          'Introduced family plan restrictions',
          'Added content-based pricing tiers'
        ],
        currentSimilarity: 72,
        icon: FiDollarSign
      },
      {
        id: 3,
        similarCompany: 'Uber',
        category: 'legal',
        pattern: 'Expanded arbitration clauses to cover more dispute types and limit class actions',
        warning: 'This arbitration language matches patterns that later restricted user legal rights',
        riskLevel: 'High',
        timeline: '2018-2022',
        specificChanges: [
          'Mandatory arbitration for all disputes',
          'Eliminated class action rights',
          'Added confidentiality requirements',
          'Shortened dispute filing windows'
        ],
        currentSimilarity: 91,
        icon: FiTarget
      },
      {
        id: 4,
        similarCompany: 'TikTok',
        category: 'data',
        pattern: 'Started with basic usage analytics, evolved to comprehensive behavioral and biometric data collection',
        warning: 'Data collection scope resembles TikTok\'s expansion into invasive tracking',
        riskLevel: 'High',
        timeline: '2019-2024',
        specificChanges: [
          'Added keystroke pattern tracking',
          'Introduced voice print collection',
          'Expanded location data usage',
          'Added device fingerprinting'
        ],
        currentSimilarity: 78,
        icon: FiEye
      }
    ];

    // Combine with any patterns from props
    const allPatterns = [...mockPatterns];
    if (patterns && patterns.length > 0) {
      patterns.forEach((pattern, index) => {
        allPatterns.push({
          id: `prop-${index}`,
          similarCompany: pattern.similarCompany,
          category: 'general',
          pattern: pattern.pattern,
          warning: pattern.warning,
          riskLevel: 'Medium',
          timeline: 'Recent',
          specificChanges: ['Pattern detected in current analysis'],
          currentSimilarity: 65,
          icon: FiInfo
        });
      });
    }

    setCompanyPatterns(allPatterns);
  }, [patterns]);

  /**
   * Filter patterns by category
   */
  const filteredPatterns = companyPatterns.filter(pattern => 
    selectedCategory === 'all' || pattern.category === selectedCategory
  );

  /**
   * Get risk level styling
   */
  const getRiskStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return { color: 'text-red-400', bg: 'bg-red-900/20 border-red-700' };
      case 'medium':
        return { color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-700' };
      case 'low':
        return { color: 'text-green-400', bg: 'bg-green-900/20 border-green-700' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-800 border-gray-600' };
    }
  };

  /**
   * Get similarity color
   */
  const getSimilarityColor = (similarity) => {
    if (similarity >= 80) return 'text-red-400';
    if (similarity >= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  /**
   * Category options
   */
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'privacy', label: 'Privacy' },
    { value: 'billing', label: 'Billing' },
    { value: 'legal', label: 'Legal Terms' },
    { value: 'data', label: 'Data Collection' },
    { value: 'general', label: 'General' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-700/50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center mb-2">
          <FiUsers className="h-7 w-7 mr-3 text-orange-400" />
          Company Pattern Analysis
        </h2>
        <p className="text-gray-300">
          Comparing {companyName || 'this ToS'} with patterns from similar companies that later introduced risky practices
        </p>
      </div>

      {/* Filter */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <FiFilter className="h-5 w-5 text-gray-400" />
          <label className="text-sm font-medium text-gray-300">Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {categories.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pattern Cards */}
      <div className="space-y-4">
        {filteredPatterns.length === 0 ? (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 text-center">
            <FiSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Patterns Found</h3>
            <p className="text-gray-400">No company patterns match your selected category.</p>
          </div>
        ) : (
          filteredPatterns.map((pattern) => {
            const riskStyle = getRiskStyle(pattern.riskLevel);
            const Icon = pattern.icon;
            const isExpanded = expandedPattern === pattern.id;

            return (
              <div key={pattern.id} className={`${riskStyle.bg} border rounded-lg p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Icon className={`h-6 w-6 ${riskStyle.color}`} />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-white mr-3">
                          Similar to {pattern.similarCompany}
                        </h3>
                        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded uppercase">
                          {pattern.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{pattern.pattern}</p>
                      
                      <div className={`p-3 rounded-lg border-l-4 border-orange-500 bg-orange-900/10`}>
                        <div className="flex items-start">
                          <FiAlertTriangle className="h-5 w-5 text-orange-400 mr-2 mt-0.5" />
                          <div>
                            <h4 className="text-orange-400 font-medium mb-1">Warning:</h4>
                            <p className="text-orange-200 text-sm">{pattern.warning}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${riskStyle.bg} ${riskStyle.color}`}>
                      {pattern.riskLevel} Risk
                    </span>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Similarity</div>
                      <div className={`text-lg font-bold ${getSimilarityColor(pattern.currentSimilarity)}`}>
                        {pattern.currentSimilarity}%
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setExpandedPattern(isExpanded ? null : pattern.id)}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-600">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-medium mb-3 flex items-center">
                          <FiClock className="h-4 w-4 mr-2 text-blue-400" />
                          Evolution Timeline ({pattern.timeline})
                        </h4>
                        <div className="space-y-2">
                          {pattern.specificChanges.map((change, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                              <span className="text-gray-300">{change}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-3 flex items-center">
                          <FiTrendingDown className="h-4 w-4 mr-2 text-red-400" />
                          Potential Future Path
                        </h4>
                        <div className="bg-gray-900/50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <span className="text-gray-300 text-sm">Current ToS</span>
                            <FiArrowRight className="h-4 w-4 text-gray-500 mx-2" />
                            <span className="text-yellow-400 text-sm">Likely Changes</span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            Based on {pattern.similarCompany}'s pattern, expect similar expansions 
                            in scope and restrictions over the next 1-2 years.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Pattern Analysis Summary</h3>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {companyPatterns.filter(p => p.riskLevel === 'High').length}
            </div>
            <div className="text-sm text-gray-400">High Risk Patterns</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {companyPatterns.filter(p => p.currentSimilarity >= 80).length}
            </div>
            <div className="text-sm text-gray-400">High Similarity (80%+)</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {companyPatterns.length}
            </div>
            <div className="text-sm text-gray-400">Total Patterns Found</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {Math.round(companyPatterns.reduce((sum, p) => sum + p.currentSimilarity, 0) / companyPatterns.length)}%
            </div>
            <div className="text-sm text-gray-400">Average Similarity</div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <div className="flex items-start">
            <FiInfo className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-medium mb-1">How Pattern Matching Works:</h4>
              <p className="text-blue-200 text-sm">
                We analyze the current ToS language and structure against historical patterns from similar companies. 
                High similarity scores indicate that this ToS resembles early versions that later became more restrictive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPatternMatcher;
