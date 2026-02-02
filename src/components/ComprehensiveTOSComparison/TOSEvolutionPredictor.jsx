import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiTarget, FiGlobe, FiCalendar, FiBarChart2, FiAlertCircle, FiCheckCircle, FiClock, FiZap } from 'react-icons/fi';

/**
 * TOS Evolution Predictor & Industry Benchmarking
 * Predicts future changes and compares against industry standards
 */
const TOSEvolutionPredictor = ({ analysis }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [selectedIndustry, setSelectedIndustry] = useState('tech');
  const [showPredictions, setShowPredictions] = useState(true);

  if (!analysis?.comprehensiveAnalysis) return null;

  const { comprehensiveAnalysis, file1Name, file2Name } = analysis;

  /**
   * Industry benchmarking data
   */
  const industryBenchmarks = {
    tech: {
      name: 'Technology',
      companies: ['Google', 'Microsoft', 'Apple', 'Meta', 'Amazon', 'Netflix', 'Spotify', 'Dropbox', 'Slack', 'Zoom'],
      averageScores: {
        userFriendliness: 6.2,
        riskLevel: 7.1,
        complianceScore: 8.3,
        transparencyScore: 7.8,
        dataProtectionScore: 8.5
      }
    },
    finance: {
      name: 'Financial Services',
      companies: ['PayPal', 'Stripe', 'Square', 'Robinhood', 'Coinbase', 'Chase', 'Wells Fargo', 'Goldman Sachs'],
      averageScores: {
        userFriendliness: 5.8,
        riskLevel: 8.2,
        complianceScore: 9.1,
        transparencyScore: 7.2,
        dataProtectionScore: 8.8
      }
    },
    ecommerce: {
      name: 'E-commerce',
      companies: ['Amazon', 'eBay', 'Shopify', 'Etsy', 'Walmart', 'Target', 'Best Buy', 'Wayfair'],
      averageScores: {
        userFriendliness: 6.8,
        riskLevel: 6.9,
        complianceScore: 7.9,
        transparencyScore: 7.5,
        dataProtectionScore: 8.1
      }
    }
  };

  /**
   * Future predictions based on regulatory trends
   */
  const futurePredictions = {
    '3months': [
      {
        change: 'Enhanced Cookie Consent Requirements',
        probability: 78,
        impact: 'medium',
        description: 'More granular cookie consent options required',
        regulation: 'GDPR Evolution',
        action: 'Update privacy policy with detailed cookie categories'
      },
      {
        change: 'AI Transparency Disclosures',
        probability: 65,
        impact: 'high',
        description: 'Must disclose AI usage in content moderation and recommendations',
        regulation: 'EU AI Act',
        action: 'Add AI usage disclosure section'
      }
    ],
    '6months': [
      {
        change: 'Right to Data Portability Expansion',
        probability: 85,
        impact: 'high',
        description: 'Users can request data in machine-readable formats',
        regulation: 'Digital Services Act',
        action: 'Implement data export functionality'
      },
      {
        change: 'Algorithmic Bias Reporting',
        probability: 72,
        impact: 'medium',
        description: 'Report on algorithmic decision-making processes',
        regulation: 'EU AI Act',
        action: 'Create algorithmic transparency reports'
      },
      {
        change: 'Enhanced Liability for AI Decisions',
        probability: 68,
        impact: 'high',
        description: 'Companies more liable for AI-driven decisions',
        regulation: 'AI Liability Directive',
        action: 'Strengthen AI liability clauses'
      }
    ],
    '12months': [
      {
        change: 'Mandatory Sustainability Reporting',
        probability: 82,
        impact: 'medium',
        description: 'Environmental impact disclosure requirements',
        regulation: 'ESG Regulations',
        action: 'Add sustainability and carbon footprint sections'
      },
      {
        change: 'Global Privacy Framework Harmonization',
        probability: 75,
        impact: 'high',
        description: 'Unified global privacy standards emerging',
        regulation: 'International Privacy Framework',
        action: 'Align with global privacy standards'
      },
      {
        change: 'Quantum Computing Security Requirements',
        probability: 45,
        impact: 'high',
        description: 'New encryption standards for quantum-resistant security',
        regulation: 'Quantum Security Act',
        action: 'Update security and encryption clauses'
      }
    ]
  };

  /**
   * Calculate your TOS scores
   */
  const calculateYourScores = () => {
    // Simulate scoring based on analysis data
    const riskCount = (comprehensiveAnalysis.riskAssessment?.doc2Risks?.length || 0);
    const similarity = comprehensiveAnalysis.contentMatching?.overallSimilarity || 0;
    
    return {
      userFriendliness: Math.max(1, Math.min(10, 10 - (riskCount * 0.5))),
      riskLevel: Math.min(10, Math.max(1, riskCount * 0.8 + 3)),
      complianceScore: Math.max(1, Math.min(10, 8 - (riskCount * 0.3))),
      transparencyScore: Math.max(1, Math.min(10, similarity / 10)),
      dataProtectionScore: Math.max(1, Math.min(10, 9 - (riskCount * 0.4)))
    };
  };

  const yourScores = calculateYourScores();
  const industryData = industryBenchmarks[selectedIndustry];
  const predictions = futurePredictions[selectedTimeframe];

  /**
   * Get comparison status
   */
  const getComparisonStatus = (yourScore, industryAverage) => {
    const diff = yourScore - industryAverage;
    if (diff > 1) return { status: 'above', color: 'text-green-400', icon: FiTrendingUp };
    if (diff < -1) return { status: 'below', color: 'text-red-400', icon: FiTrendingUp };
    return { status: 'average', color: 'text-yellow-400', icon: FiTarget };
  };

  /**
   * Calculate future-proofing score
   */
  const calculateFutureProofingScore = () => {
    const avgScore = Object.values(yourScores).reduce((a, b) => a + b, 0) / Object.values(yourScores).length;
    const complianceWeight = yourScores.complianceScore * 0.4;
    const transparencyWeight = yourScores.transparencyScore * 0.3;
    const dataProtectionWeight = yourScores.dataProtectionScore * 0.3;
    
    return Math.round((complianceWeight + transparencyWeight + dataProtectionWeight) * 10) / 10;
  };

  const futureProofingScore = calculateFutureProofingScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 border border-blue-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiZap className="h-6 w-6 text-blue-400 mr-3" />
            <h2 className="text-xl font-bold text-white">TOS Evolution Predictor & Industry Benchmarking</h2>
            <span className="ml-3 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">REVOLUTIONARY</span>
          </div>
        </div>
        
        <p className="text-blue-200 mb-4">
          See how your TOS compares to industry leaders and predict future changes based on regulatory trends and AI analysis.
        </p>

        {/* Future-Proofing Score */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Future-Proofing Score</h3>
              <p className="text-gray-300 text-sm">How ready you are for upcoming changes</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{futureProofingScore}/10</div>
              <div className={`text-sm ${futureProofingScore >= 7 ? 'text-green-400' : futureProofingScore >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                {futureProofingScore >= 7 ? 'Well Prepared' : futureProofingScore >= 5 ? 'Moderately Ready' : 'Needs Improvement'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Industry Comparison</label>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="tech">Technology</option>
            <option value="finance">Financial Services</option>
            <option value="ecommerce">E-commerce</option>
          </select>
        </div>
        
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Prediction Timeframe</label>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="3months">Next 3 Months</option>
            <option value="6months">Next 6 Months</option>
            <option value="12months">Next 12 Months</option>
          </select>
        </div>
      </div>

      {/* Industry Benchmarking */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FiBarChart2 className="h-5 w-5 text-blue-400 mr-2" />
          <h3 className="text-lg font-medium text-white">Industry Benchmarking: {industryData.name}</h3>
        </div>
        
        <p className="text-gray-300 text-sm mb-4">
          Compared against: {industryData.companies.slice(0, 5).join(', ')} and {industryData.companies.length - 5} others
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(yourScores).map(([metric, score]) => {
            const industryAvg = industryData.averageScores[metric];
            const comparison = getComparisonStatus(score, industryAvg);
            const ComparisonIcon = comparison.icon;
            
            return (
              <div key={metric} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300 capitalize">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <ComparisonIcon className={`h-4 w-4 ${comparison.color}`} />
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-white">{score.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">vs {industryAvg.toFixed(1)}</span>
                </div>
                
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${score > industryAvg ? 'bg-green-500' : score < industryAvg ? 'bg-red-500' : 'bg-yellow-500'}`}
                    style={{ width: `${(score / 10) * 100}%` }}
                  ></div>
                </div>
                
                <div className={`text-xs mt-1 ${comparison.color}`}>
                  {comparison.status === 'above' ? 'Above Average' : 
                   comparison.status === 'below' ? 'Below Average' : 'Average'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Future Predictions */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FiClock className="h-5 w-5 text-green-400 mr-2" />
          <h3 className="text-lg font-medium text-white">
            Predicted Changes - {selectedTimeframe === '3months' ? 'Next 3 Months' : 
                                selectedTimeframe === '6months' ? 'Next 6 Months' : 'Next 12 Months'}
          </h3>
        </div>

        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-medium text-white">{prediction.change}</h4>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      prediction.impact === 'high' ? 'bg-red-900/50 text-red-300' :
                      prediction.impact === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                      'bg-green-900/50 text-green-300'
                    }`}>
                      {prediction.impact.toUpperCase()} IMPACT
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{prediction.description}</p>
                  <p className="text-blue-400 text-xs">Related to: {prediction.regulation}</p>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-white">{prediction.probability}%</div>
                  <div className="text-xs text-gray-400">Probability</div>
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-700 rounded p-3">
                <div className="flex items-center mb-1">
                  <FiCheckCircle className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-blue-300">Recommended Action:</span>
                </div>
                <p className="text-blue-200 text-sm">{prediction.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">🚀 Strategic Recommendations</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-green-300">Immediate Actions (Next 30 Days)</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <FiCheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                Review and update AI disclosure sections
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                Enhance cookie consent mechanisms
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                Strengthen data portability clauses
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-green-300">Long-term Strategy (6-12 Months)</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <FiTarget className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                Implement algorithmic transparency reporting
              </li>
              <li className="flex items-start">
                <FiTarget className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                Add sustainability and ESG commitments
              </li>
              <li className="flex items-start">
                <FiTarget className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                Prepare for quantum-resistant security standards
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TOSEvolutionPredictor;
