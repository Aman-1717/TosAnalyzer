import React, { useState, useEffect } from 'react';
import {
  FiTrendingUp,
  FiClock,
  FiCalendar,
  FiArrowRight,
  FiTarget,
  FiActivity,
  FiBarChart2,
  FiZap,
  FiGlobe,
  FiUsers,
  FiShield,
  FiDollarSign
} from 'react-icons/fi';

/**
 * Trend-based ToS Evolution Predictor Component
 * Predicts future ToS changes based on historical patterns and industry trends
 */
const TrendPredictor = ({ companyName, tosContent }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1year');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [trends, setTrends] = useState([]);

  /**
   * Mock trend data - in real implementation, this would come from AI analysis
   */
  useEffect(() => {
    const mockTrends = [
      {
        id: 1,
        category: 'privacy',
        title: 'Mandatory Ad Personalization',
        description: 'Introduction of mandatory ad personalization based on usage data and browsing patterns',
        timeframe: '6months',
        probability: 'High',
        impact: 'High',
        reasoning: 'Industry trend towards more aggressive data monetization',
        icon: FiTarget,
        color: 'text-red-400'
      },
      {
        id: 2,
        category: 'data',
        title: 'Biometric Data Collection',
        description: 'Expansion of data collection to include biometric information and behavioral patterns',
        timeframe: '1year',
        probability: 'Medium',
        impact: 'High',
        reasoning: 'Following patterns from similar tech companies',
        icon: FiShield,
        color: 'text-yellow-400'
      },
      {
        id: 3,
        category: 'billing',
        title: 'Dynamic Pricing Model',
        description: 'Implementation of usage-based pricing with real-time rate adjustments',
        timeframe: '1year',
        probability: 'Medium',
        impact: 'Medium',
        reasoning: 'Industry shift towards flexible pricing models',
        icon: FiDollarSign,
        color: 'text-blue-400'
      },
      {
        id: 4,
        category: 'legal',
        title: 'Expanded Arbitration Scope',
        description: 'Extension of mandatory arbitration to cover more types of disputes',
        timeframe: '2years',
        probability: 'High',
        impact: 'High',
        reasoning: 'Legal trend to limit class action lawsuits',
        icon: FiActivity,
        color: 'text-purple-400'
      },
      {
        id: 5,
        category: 'ai',
        title: 'AI Training Data Usage',
        description: 'Explicit rights to use user content for AI model training and development',
        timeframe: '6months',
        probability: 'High',
        impact: 'Medium',
        reasoning: 'Current AI industry developments',
        icon: FiZap,
        color: 'text-green-400'
      }
    ];

    setTrends(mockTrends);
  }, [companyName, tosContent]);

  /**
   * Filter trends based on selected criteria
   */
  const filteredTrends = trends.filter(trend => {
    const timeframeMatch = selectedTimeframe === 'all' || trend.timeframe === selectedTimeframe;
    const categoryMatch = selectedCategory === 'all' || trend.category === selectedCategory;
    return timeframeMatch && categoryMatch;
  });

  /**
   * Get probability color
   */
  const getProbabilityColor = (probability) => {
    switch (probability.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-800';
    }
  };

  /**
   * Get impact color
   */
  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  /**
   * Timeframe options
   */
  const timeframes = [
    { value: 'all', label: 'All Timeframes' },
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' },
    { value: '2years', label: '2 Years' }
  ];

  /**
   * Category options
   */
  const categories = [
    { value: 'all', label: 'All Categories', icon: FiGlobe },
    { value: 'privacy', label: 'Privacy', icon: FiShield },
    { value: 'data', label: 'Data Collection', icon: FiBarChart2 },
    { value: 'billing', label: 'Billing', icon: FiDollarSign },
    { value: 'legal', label: 'Legal Terms', icon: FiActivity },
    { value: 'ai', label: 'AI & Technology', icon: FiZap }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center mb-2">
          <FiTrendingUp className="h-7 w-7 mr-3 text-blue-400" />
          Future Trends Prediction
        </h2>
        <p className="text-gray-300">
          Predicted ToS evolution for {companyName || 'this service'} based on industry patterns and historical data
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Timeframe Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeframes.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <FiCalendar className="h-6 w-6 mr-2 text-purple-400" />
          Predicted Timeline
        </h3>

        {filteredTrends.length === 0 ? (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 text-center">
            <FiClock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">No Trends Found</h4>
            <p className="text-gray-400">No trends match your selected filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrends.map((trend, index) => {
              const Icon = trend.icon;
              return (
                <div key={trend.id} className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Icon className={`h-6 w-6 ${trend.color}`} />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-lg font-medium text-white mr-3">{trend.title}</h4>
                          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded uppercase">
                            {trend.category}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-3">{trend.description}</p>
                        <p className="text-gray-400 text-sm">
                          <strong>Reasoning:</strong> {trend.reasoning}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center text-sm">
                        <FiClock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-gray-300">
                          {trend.timeframe === '6months' ? '6 Months' : 
                           trend.timeframe === '1year' ? '1 Year' : '2 Years'}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getProbabilityColor(trend.probability)}`}>
                          {trend.probability} Probability
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium bg-gray-700 ${getImpactColor(trend.impact)}`}>
                          {trend.impact} Impact
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Indicator */}
                  <div className="flex items-center mt-4 pt-4 border-t border-gray-600">
                    <div className="flex items-center text-sm text-gray-400">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span>Current ToS</span>
                    </div>
                    <FiArrowRight className="h-4 w-4 text-gray-500 mx-4" />
                    <div className="flex items-center text-sm text-yellow-400">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span>Predicted Change</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Industry Trends Summary */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <FiUsers className="h-5 w-5 mr-2 text-green-400" />
          Industry Trend Analysis
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-2">Current Industry Patterns:</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Increased data monetization across platforms
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Expansion of AI training data usage rights
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Stricter arbitration and dispute resolution
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Dynamic pricing model adoption
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">Prediction Confidence:</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">6 Month Predictions</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-700 rounded-full mr-2">
                    <div className="w-4/5 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-green-400 text-sm">85%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">1 Year Predictions</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-700 rounded-full mr-2">
                    <div className="w-3/5 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <span className="text-yellow-400 text-sm">70%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">2 Year Predictions</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-700 rounded-full mr-2">
                    <div className="w-2/5 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-red-400 text-sm">55%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendPredictor;
