import React, { useState } from 'react';
import {
  FiShield,
  FiAlertTriangle,
  FiAlertCircle,
  FiCheckCircle,
  FiShare2,
  FiRefreshCw,
  FiActivity,
  FiDollarSign,
  FiClock,
  FiInfo,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

/**
 * Risk Forecast Component
 * Analyzes and displays future risks in ToS clauses
 */
const RiskForecast = ({ riskData, companyName }) => {
  const [expandedRisk, setExpandedRisk] = useState(null);
  const [showDetails, setShowDetails] = useState(true);

  /**
   * Get risk level color and icon
   */
  const getRiskStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return {
          color: 'text-red-400',
          bg: 'bg-red-900/20 border-red-700',
          icon: FiAlertTriangle
        };
      case 'medium':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-900/20 border-yellow-700',
          icon: FiAlertCircle
        };
      case 'low':
        return {
          color: 'text-green-400',
          bg: 'bg-green-900/20 border-green-700',
          icon: FiCheckCircle
        };
      default:
        return {
          color: 'text-gray-400',
          bg: 'bg-gray-800 border-gray-600',
          icon: FiInfo
        };
    }
  };

  /**
   * Risk categories with icons and descriptions
   */
  const riskCategories = [
    {
      key: 'dataSharing',
      title: 'Data Sharing Risks',
      icon: FiShare2,
      description: 'How your personal data might be shared with third parties'
    },
    {
      key: 'autoRenewal',
      title: 'Auto-Renewal Traps',
      icon: FiRefreshCw,
      description: 'Subscription and billing practices that could trap users'
    },
    {
      key: 'arbitration',
      title: 'Legal Action Limits',
      icon: FiActivity,
      description: 'Arbitration clauses that restrict your legal rights'
    },
    {
      key: 'pricing',
      title: 'Pricing & Fee Risks',
      icon: FiDollarSign,
      description: 'Hidden fees and pricing change policies'
    }
  ];

  if (!riskData) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 text-center">
        <FiShield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Risk Data Available</h3>
        <p className="text-gray-400">Risk analysis data is not available for this document.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/20 to-yellow-900/20 border border-red-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FiShield className="h-7 w-7 mr-3 text-red-400" />
              Risk Forecast
            </h2>
            <p className="text-gray-300 mt-1">
              Future risk analysis for {companyName || 'this Terms of Service'}
            </p>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {showDetails ? <FiEyeOff className="h-4 w-4 mr-2" /> : <FiEye className="h-4 w-4 mr-2" />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {riskCategories.map((category) => {
          const risk = riskData[category.key];
          const style = getRiskStyle(risk?.level);
          const Icon = category.icon;
          const RiskIcon = style.icon;

          return (
            <div
              key={category.key}
              className={`${style.bg} border rounded-lg p-4 cursor-pointer transition-all hover:scale-105`}
              onClick={() => setExpandedRisk(expandedRisk === category.key ? null : category.key)}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="h-6 w-6 text-gray-300" />
                <div className="flex items-center">
                  <RiskIcon className={`h-5 w-5 ${style.color} mr-2`} />
                  <span className={`text-sm font-medium ${style.color} uppercase`}>
                    {risk?.level || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <h3 className="text-white font-medium mb-2">{category.title}</h3>
              <p className="text-gray-400 text-sm">{category.description}</p>
              
              {expandedRisk === category.key && showDetails && risk && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-1">Analysis:</h4>
                      <p className="text-gray-400 text-sm">{risk.description}</p>
                    </div>
                    
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-yellow-400 mb-1 flex items-center">
                        <FiClock className="h-4 w-4 mr-1" />
                        Possible Future Outcome:
                      </h4>
                      <p className="text-yellow-200 text-sm italic">"{risk.futureOutcome}"</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Risk Analysis */}
      {showDetails && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FiAlertTriangle className="h-6 w-6 mr-2 text-yellow-400" />
            Detailed Risk Analysis
          </h3>
          
          {riskCategories.map((category) => {
            const risk = riskData[category.key];
            if (!risk) return null;
            
            const style = getRiskStyle(risk.level);
            const Icon = category.icon;
            const RiskIcon = style.icon;

            return (
              <div key={category.key} className={`${style.bg} border rounded-lg p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Icon className="h-6 w-6 text-gray-300 mr-3" />
                    <div>
                      <h4 className="text-lg font-medium text-white">{category.title}</h4>
                      <p className="text-gray-400 text-sm">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <RiskIcon className={`h-5 w-5 ${style.color} mr-2`} />
                    <span className={`text-sm font-medium ${style.color} uppercase px-2 py-1 rounded`}>
                      {risk.level} Risk
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Current Analysis:</h5>
                    <p className="text-gray-400 text-sm leading-relaxed">{risk.description}</p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-yellow-400 mb-2 flex items-center">
                      <FiClock className="h-4 w-4 mr-1" />
                      Future Prediction:
                    </h5>
                    <p className="text-yellow-200 text-sm leading-relaxed italic">
                      "{risk.futureOutcome}"
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Risk Summary */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Risk Summary</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {['high', 'medium', 'low'].map((level) => {
            const count = riskCategories.filter(cat => 
              riskData[cat.key]?.level?.toLowerCase() === level
            ).length;
            const style = getRiskStyle(level);
            const Icon = style.icon;
            
            return (
              <div key={level} className={`${style.bg} border rounded-lg p-4 text-center`}>
                <Icon className={`h-8 w-8 ${style.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className={`text-sm ${style.color} uppercase font-medium`}>
                  {level} Risk{count !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
          <div className="flex items-start">
            <FiInfo className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-medium mb-1">What This Means:</h4>
              <p className="text-blue-200 text-sm">
                These predictions are based on analysis of the Terms of Service clauses and industry patterns. 
                Higher risk levels indicate clauses that could have significant negative impacts on users in the future.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskForecast;
