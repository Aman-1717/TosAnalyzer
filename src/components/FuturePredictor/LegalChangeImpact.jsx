import React, { useState } from 'react';
import { FiGlobe, FiCalendar, FiAlertTriangle, FiShield, FiInfo } from 'react-icons/fi';

const LegalChangeImpact = ({ legalChanges, tosContent }) => {
  const [selectedRegion, setSelectedRegion] = useState('all');

  const mockLegalChanges = [
    {
      law: 'GDPR',
      region: 'EU',
      impact: 'Current data collection practices may need to be restricted',
      timeline: 'Next 2 years',
      probability: 'High'
    },
    {
      law: 'CCPA',
      region: 'California',
      impact: 'Enhanced user data rights may require ToS updates',
      timeline: 'Next 1 year',
      probability: 'Medium'
    }
  ];

  const changes = legalChanges || mockLegalChanges;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-700/50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center mb-2">
          <FiGlobe className="h-7 w-7 mr-3 text-blue-400" />
          Legal Change Impact
        </h2>
        <p className="text-gray-300">
          How upcoming legal changes could affect current ToS terms
        </p>
      </div>

      <div className="space-y-4">
        {changes.map((change, index) => (
          <div key={index} className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-white">{change.law}</h3>
                <p className="text-gray-400">{change.region}</p>
              </div>
              <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                {change.probability} Probability
              </span>
            </div>
            
            <p className="text-gray-300 mb-3">{change.impact}</p>
            
            <div className="flex items-center text-sm text-gray-400">
              <FiCalendar className="h-4 w-4 mr-1" />
              Expected: {change.timeline}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegalChangeImpact;
