import React from 'react';
import { FiTarget, FiShield, FiDollarSign, FiActivity, FiShare2 } from 'react-icons/fi';

const VisualRiskMap = ({ riskData, companyName }) => {
  // Mock data for visualization
  const riskBreakdown = {
    'Data Privacy': 35,
    'Financial': 25,
    'Legal': 30,
    'Other': 10
  };

  const colors = {
    'Data Privacy': 'text-red-400 bg-red-900/20',
    'Financial': 'text-yellow-400 bg-yellow-900/20',
    'Legal': 'text-blue-400 bg-blue-900/20',
    'Other': 'text-gray-400 bg-gray-800'
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-900/20 to-purple-900/20 border border-red-700/50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center mb-2">
          <FiTarget className="h-7 w-7 mr-3 text-red-400" />
          Visual Risk Map
        </h2>
        <p className="text-gray-300">
          Risk distribution analysis for {companyName || 'this service'}
        </p>
      </div>

      {/* Risk Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Risk Distribution</h3>
          <div className="space-y-4">
            {Object.entries(riskBreakdown).map(([category, percentage]) => (
              <div key={category}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">{category}</span>
                  <span className="text-white font-medium">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${colors[category].split(' ')[1]}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Risk Categories</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(riskBreakdown).map(([category, percentage]) => (
              <div key={category} className={`${colors[category]} border rounded-lg p-4 text-center`}>
                <div className="text-2xl font-bold">{percentage}%</div>
                <div className="text-sm">{category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualRiskMap;
