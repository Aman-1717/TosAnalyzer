import React, { useState, useEffect } from 'react';
import { 
  FiClock, 
  FiAlertTriangle, 
  FiTrendingUp,
  FiCalendar,
  FiTarget,
  FiZap,
  FiShield,
  FiDollarSign,
  FiEye,
  FiUsers,
  FiGlobe,
  FiActivity
} from 'react-icons/fi';

/**
 * Future Scenarios Component
 * Displays realistic future consequences and scenarios as cards/timeline
 */
const FutureScenarios = ({ scenarios, companyName }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');
  const [futureScenarios, setFutureScenarios] = useState([]);

  /**
   * Mock scenario data - in real implementation, this would come from AI analysis
   */
  useEffect(() => {
    const mockScenarios = [
      {
        id: 1,
        title: 'Comprehensive Data Profiling',
        description: 'Your browsing habits, purchase history, and social interactions could be combined to create detailed behavioral profiles for targeted advertising.',
        timeframe: '6months',
        probability: 'High',
        impact: 'High',
        category: 'privacy',
        icon: FiEye,
        consequences: [
          'Highly personalized but invasive advertising',
          'Potential data breaches affecting detailed profiles',
          'Difficulty opting out of data collection',
          'Cross-platform tracking becomes standard'
        ],
        userImpact: 'Your online privacy could be significantly reduced'
      },
      {
        id: 2,
        title: 'Indefinite Auto-Billing',
        description: 'Auto-billing could continue even after account inactivity, with increasingly complex cancellation processes.',
        timeframe: '1year',
        probability: 'High',
        impact: 'Medium',
        category: 'billing',
        icon: FiDollarSign,
        consequences: [
          'Charges continue during periods of non-use',
          'Multiple steps required to cancel subscriptions',
          'Hidden fees for "premium" cancellation',
          'Automatic plan upgrades without clear consent'
        ],
        userImpact: 'You could face unexpected charges and billing complications'
      },
      {
        id: 3,
        title: 'AI Training Data Expansion',
        description: 'Your content, messages, and interactions could be used to train AI models without additional compensation or clear consent.',
        timeframe: '6months',
        probability: 'High',
        impact: 'Medium',
        category: 'ai',
        icon: FiZap,
        consequences: [
          'Personal content used in AI training datasets',
          'No compensation for data contribution',
          'Difficulty removing data from AI models',
          'Potential misuse of personal information in AI outputs'
        ],
        userImpact: 'Your creative content could be used commercially without benefit to you'
      },
      {
        id: 4,
        title: 'Restricted Legal Recourse',
        description: 'Arbitration clauses could expand to cover all disputes, eliminating your right to participate in class action lawsuits.',
        timeframe: '1year',
        probability: 'Medium',
        impact: 'High',
        category: 'legal',
        icon: FiShield,
        consequences: [
          'No access to class action lawsuits',
          'Expensive individual arbitration required',
          'Limited discovery rights in disputes',
          'Confidentiality requirements prevent sharing experiences'
        ],
        userImpact: 'Your ability to seek legal remedy could be severely limited'
      },
      {
        id: 5,
        title: 'Dynamic Pricing Implementation',
        description: 'Service costs could fluctuate based on usage patterns, location, and demand, similar to surge pricing models.',
        timeframe: '2years',
        probability: 'Medium',
        impact: 'Medium',
        category: 'pricing',
        icon: FiActivity,
        consequences: [
          'Unpredictable monthly costs',
          'Higher prices during peak usage',
          'Location-based pricing discrimination',
          'Complex pricing tiers difficult to understand'
        ],
        userImpact: 'Your service costs could become unpredictable and potentially much higher'
      },
      {
        id: 6,
        title: 'Biometric Data Collection',
        description: 'Voice patterns, typing rhythms, and other biometric identifiers could be collected and stored permanently.',
        timeframe: '2years',
        probability: 'Medium',
        impact: 'High',
        category: 'biometric',
        icon: FiTarget,
        consequences: [
          'Permanent biometric profiles created',
          'Voice and typing pattern recognition',
          'Potential identity theft risks',
          'Difficulty changing biometric identifiers'
        ],
        userImpact: 'Your unique biological characteristics could be permanently tracked'
      }
    ];

    // Combine with scenarios from props if available
    const allScenarios = [...mockScenarios];
    if (scenarios && scenarios.length > 0) {
      scenarios.forEach((scenario, index) => {
        allScenarios.push({
          id: `prop-${index}`,
          title: scenario.scenario || 'Future Scenario',
          description: scenario.scenario || 'Scenario description not available',
          timeframe: scenario.timeframe || '1year',
          probability: scenario.probability || 'Medium',
          impact: 'Medium',
          category: 'general',
          icon: FiGlobe,
          consequences: ['Scenario detected in analysis'],
          userImpact: 'Impact analysis not available'
        });
      });
    }

    setFutureScenarios(allScenarios);
  }, [scenarios]);

  /**
   * Filter scenarios
   */
  const filteredScenarios = futureScenarios.filter(scenario => {
    const timeframeMatch = selectedTimeframe === 'all' || scenario.timeframe === selectedTimeframe;
    const impactMatch = selectedImpact === 'all' || scenario.impact.toLowerCase() === selectedImpact;
    return timeframeMatch && impactMatch;
  });

  /**
   * Get probability styling
   */
  const getProbabilityStyle = (probability) => {
    switch (probability?.toLowerCase()) {
      case 'high':
        return { color: 'text-red-400', bg: 'bg-red-900/20' };
      case 'medium':
        return { color: 'text-yellow-400', bg: 'bg-yellow-900/20' };
      case 'low':
        return { color: 'text-green-400', bg: 'bg-green-900/20' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-800' };
    }
  };

  /**
   * Get impact styling
   */
  const getImpactStyle = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  /**
   * Get timeframe label
   */
  const getTimeframeLabel = (timeframe) => {
    switch (timeframe) {
      case '6months': return '6 Months';
      case '1year': return '1 Year';
      case '2years': return '2 Years';
      default: return timeframe;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center mb-2">
          <FiClock className="h-7 w-7 mr-3 text-purple-400" />
          Future Scenarios
        </h2>
        <p className="text-gray-300">
          Realistic future consequences and scenarios for {companyName || 'this service'} based on current ToS terms
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Timeframes</option>
              <option value="6months">6 Months</option>
              <option value="1year">1 Year</option>
              <option value="2years">2 Years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Impact Level</label>
            <select
              value={selectedImpact}
              onChange={(e) => setSelectedImpact(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Impact Levels</option>
              <option value="high">High Impact</option>
              <option value="medium">Medium Impact</option>
              <option value="low">Low Impact</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredScenarios.map((scenario) => {
          const probabilityStyle = getProbabilityStyle(scenario.probability);
          const Icon = scenario.icon;

          return (
            <div key={scenario.id} className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:border-purple-500 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">{scenario.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                        {getTimeframeLabel(scenario.timeframe)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${probabilityStyle.bg} ${probabilityStyle.color}`}>
                        {scenario.probability} Probability
                      </span>
                      <span className={`text-xs px-2 py-1 rounded bg-gray-700 ${getImpactStyle(scenario.impact)}`}>
                        {scenario.impact} Impact
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-4 leading-relaxed">{scenario.description}</p>

              {/* User Impact */}
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mb-4">
                <div className="flex items-start">
                  <FiAlertTriangle className="h-4 w-4 text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-400 font-medium text-sm mb-1">Impact on You:</h4>
                    <p className="text-yellow-200 text-sm">{scenario.userImpact}</p>
                  </div>
                </div>
              </div>

              {/* Consequences */}
              {scenario.consequences && scenario.consequences.length > 0 && (
                <div>
                  <h4 className="text-white font-medium text-sm mb-2">Potential Consequences:</h4>
                  <ul className="space-y-1">
                    {scenario.consequences.slice(0, 3).map((consequence, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 mt-2"></div>
                        {consequence}
                      </li>
                    ))}
                  </ul>
                  {scenario.consequences.length > 3 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{scenario.consequences.length - 3} more consequences
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timeline View */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <FiCalendar className="h-5 w-5 mr-2 text-blue-400" />
          Scenario Timeline
        </h3>

        <div className="space-y-6">
          {['6months', '1year', '2years'].map((timeframe) => {
            const timeframeScenarios = futureScenarios.filter(s => s.timeframe === timeframe);
            
            return (
              <div key={timeframe} className="flex items-start">
                <div className="flex-shrink-0 w-24 text-right mr-6">
                  <div className="text-white font-medium">{getTimeframeLabel(timeframe)}</div>
                  <div className="text-gray-400 text-sm">
                    {timeframeScenarios.length} scenario{timeframeScenarios.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="flex-1 border-l-2 border-gray-600 pl-6 pb-6">
                  <div className="space-y-3">
                    {timeframeScenarios.map((scenario) => (
                      <div key={scenario.id} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium text-sm">{scenario.title}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${getProbabilityStyle(scenario.probability).bg} ${getProbabilityStyle(scenario.probability).color}`}>
                              {scenario.probability}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{scenario.description.substring(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FutureScenarios;
