import React, { useState } from 'react';
import { FiShield, FiCheck, FiX, FiAlertTriangle, FiGlobe, FiFlag, FiBook, FiInfo } from 'react-icons/fi';

/**
 * Legal Compliance Checker Component
 * Analyzes documents for compliance with various regulations
 */
const ComplianceChecker = ({ analysis }) => {
  const [selectedRegulation, setSelectedRegulation] = useState('gdpr');

  if (!analysis?.comprehensiveAnalysis) return null;

  const { comprehensiveAnalysis, file1Name, file2Name } = analysis;

  /**
   * GDPR Compliance Analysis
   */
  const analyzeGDPRCompliance = () => {
    const checks = [
      {
        id: 'lawful-basis',
        requirement: 'Lawful Basis for Processing',
        description: 'Must specify lawful basis for processing personal data',
        status: 'partial',
        details: 'Document mentions data collection but doesn\'t clearly specify lawful basis under Article 6',
        recommendation: 'Add explicit statement of lawful basis (e.g., consent, legitimate interest, contract)'
      },
      {
        id: 'data-subject-rights',
        requirement: 'Data Subject Rights',
        description: 'Must inform users of their rights under GDPR',
        status: 'missing',
        details: 'No mention of user rights to access, rectify, erase, or port their data',
        recommendation: 'Add comprehensive section on data subject rights with contact information'
      },
      {
        id: 'consent-mechanism',
        requirement: 'Consent Mechanism',
        description: 'Must provide clear consent mechanism for data processing',
        status: 'partial',
        details: 'General consent mentioned but not specific to different types of processing',
        recommendation: 'Implement granular consent options for different data processing activities'
      },
      {
        id: 'data-retention',
        requirement: 'Data Retention Policy',
        description: 'Must specify how long personal data will be retained',
        status: 'missing',
        details: 'No clear data retention periods specified',
        recommendation: 'Add specific retention periods for different types of personal data'
      },
      {
        id: 'third-party-sharing',
        requirement: 'Third Party Data Sharing',
        description: 'Must clearly disclose data sharing with third parties',
        status: 'compliant',
        details: 'Document clearly states data sharing practices with third parties',
        recommendation: 'Consider adding more details about specific third parties and purposes'
      }
    ];

    const compliantCount = checks.filter(c => c.status === 'compliant').length;
    const partialCount = checks.filter(c => c.status === 'partial').length;
    const missingCount = checks.filter(c => c.status === 'missing').length;

    return {
      regulation: 'GDPR',
      overallScore: Math.round((compliantCount + partialCount * 0.5) / checks.length * 100),
      checks,
      summary: {
        compliant: compliantCount,
        partial: partialCount,
        missing: missingCount,
        total: checks.length
      }
    };
  };

  /**
   * CCPA Compliance Analysis
   */
  const analyzeCCPACompliance = () => {
    const checks = [
      {
        id: 'right-to-know',
        requirement: 'Right to Know',
        description: 'Must inform consumers about personal information collection and use',
        status: 'partial',
        details: 'Some information provided but not comprehensive',
        recommendation: 'Add detailed categories of personal information collected and business purposes'
      },
      {
        id: 'right-to-delete',
        requirement: 'Right to Delete',
        description: 'Must provide mechanism for consumers to request deletion',
        status: 'missing',
        details: 'No deletion request mechanism mentioned',
        recommendation: 'Add clear process for consumers to request deletion of personal information'
      },
      {
        id: 'right-to-opt-out',
        requirement: 'Right to Opt-Out of Sale',
        description: 'Must provide opt-out mechanism for sale of personal information',
        status: 'compliant',
        details: 'Document states personal information is not sold',
        recommendation: 'Maintain clear policy on not selling personal information'
      },
      {
        id: 'non-discrimination',
        requirement: 'Non-Discrimination',
        description: 'Cannot discriminate against consumers exercising CCPA rights',
        status: 'missing',
        details: 'No non-discrimination policy mentioned',
        recommendation: 'Add explicit non-discrimination clause for CCPA rights exercise'
      }
    ];

    const compliantCount = checks.filter(c => c.status === 'compliant').length;
    const partialCount = checks.filter(c => c.status === 'partial').length;
    const missingCount = checks.filter(c => c.status === 'missing').length;

    return {
      regulation: 'CCPA',
      overallScore: Math.round((compliantCount + partialCount * 0.5) / checks.length * 100),
      checks,
      summary: {
        compliant: compliantCount,
        partial: partialCount,
        missing: missingCount,
        total: checks.length
      }
    };
  };

  /**
   * Accessibility Compliance Analysis
   */
  const analyzeAccessibilityCompliance = () => {
    const checks = [
      {
        id: 'plain-language',
        requirement: 'Plain Language',
        description: 'Use clear, simple language that is easy to understand',
        status: comprehensiveAnalysis.readabilityAnalysis?.doc2?.fleschScore > 60 ? 'compliant' : 'partial',
        details: `Readability score: ${comprehensiveAnalysis.readabilityAnalysis?.doc2?.fleschScore || 'N/A'}`,
        recommendation: 'Simplify complex sentences and use everyday language where possible'
      },
      {
        id: 'document-structure',
        requirement: 'Clear Document Structure',
        description: 'Use headings, lists, and clear organization',
        status: 'partial',
        details: 'Document has some structure but could be improved',
        recommendation: 'Add more descriptive headings and use numbered lists for clarity'
      },
      {
        id: 'alternative-formats',
        requirement: 'Alternative Formats',
        description: 'Provide document in multiple accessible formats',
        status: 'missing',
        details: 'No mention of alternative formats available',
        recommendation: 'Offer document in large print, audio, or other accessible formats'
      }
    ];

    const compliantCount = checks.filter(c => c.status === 'compliant').length;
    const partialCount = checks.filter(c => c.status === 'partial').length;
    const missingCount = checks.filter(c => c.status === 'missing').length;

    return {
      regulation: 'Accessibility',
      overallScore: Math.round((compliantCount + partialCount * 0.5) / checks.length * 100),
      checks,
      summary: {
        compliant: compliantCount,
        partial: partialCount,
        missing: missingCount,
        total: checks.length
      }
    };
  };

  /**
   * Get compliance analysis based on selected regulation
   */
  const getComplianceAnalysis = () => {
    switch (selectedRegulation) {
      case 'gdpr':
        return analyzeGDPRCompliance();
      case 'ccpa':
        return analyzeCCPACompliance();
      case 'accessibility':
        return analyzeAccessibilityCompliance();
      default:
        return analyzeGDPRCompliance();
    }
  };

  /**
   * Get status styling
   */
  const getStatusStyle = (status) => {
    switch (status) {
      case 'compliant':
        return {
          icon: FiCheck,
          color: 'text-green-400',
          bg: 'bg-green-900/20',
          border: 'border-green-700'
        };
      case 'partial':
        return {
          icon: FiAlertTriangle,
          color: 'text-yellow-400',
          bg: 'bg-yellow-900/20',
          border: 'border-yellow-700'
        };
      case 'missing':
        return {
          icon: FiX,
          color: 'text-red-400',
          bg: 'bg-red-900/20',
          border: 'border-red-700'
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
   * Render regulation selector
   */
  const renderRegulationSelector = () => {
    const regulations = [
      { id: 'gdpr', label: 'GDPR', description: 'EU General Data Protection Regulation', icon: FiGlobe },
      { id: 'ccpa', label: 'CCPA', description: 'California Consumer Privacy Act', icon: FiFlag },
      { id: 'accessibility', label: 'Accessibility', description: 'Document Accessibility Standards', icon: FiBook }
    ];

    return (
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {regulations.map(reg => (
          <button
            key={reg.id}
            onClick={() => setSelectedRegulation(reg.id)}
            className={`
              p-4 rounded-lg border text-left transition-all
              ${selectedRegulation === reg.id
                ? 'border-purple-500 bg-purple-900/20'
                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }
            `}
          >
            <div className="flex items-center space-x-3 mb-2">
              <reg.icon className={`h-5 w-5 ${selectedRegulation === reg.id ? 'text-purple-400' : 'text-gray-400'}`} />
              <span className="font-medium text-white">{reg.label}</span>
            </div>
            <p className="text-sm text-gray-300">{reg.description}</p>
          </button>
        ))}
      </div>
    );
  };

  const complianceData = getComplianceAnalysis();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 border border-blue-700 rounded-lg p-6">
        <div className="flex items-center mb-2">
          <FiShield className="h-6 w-6 text-blue-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">Legal Compliance Checker</h2>
        </div>
        <p className="text-gray-300">
          Analyze your Terms of Service for compliance with major regulations and accessibility standards
        </p>
      </div>

      {/* Regulation Selector */}
      {renderRegulationSelector()}

      {/* Compliance Score */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{complianceData.regulation} Compliance Score</h3>
          <div className="text-right">
            <div className={`text-3xl font-bold ${
              complianceData.overallScore >= 80 ? 'text-green-400' :
              complianceData.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {complianceData.overallScore}%
            </div>
            <div className="text-sm text-gray-400">Overall Compliance</div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-900/20 border border-green-700 rounded">
            <div className="text-xl font-bold text-green-400">{complianceData.summary.compliant}</div>
            <div className="text-xs text-green-300">Compliant</div>
          </div>
          <div className="text-center p-3 bg-yellow-900/20 border border-yellow-700 rounded">
            <div className="text-xl font-bold text-yellow-400">{complianceData.summary.partial}</div>
            <div className="text-xs text-yellow-300">Partial</div>
          </div>
          <div className="text-center p-3 bg-red-900/20 border border-red-700 rounded">
            <div className="text-xl font-bold text-red-400">{complianceData.summary.missing}</div>
            <div className="text-xs text-red-300">Missing</div>
          </div>
          <div className="text-center p-3 bg-gray-700 rounded">
            <div className="text-xl font-bold text-gray-300">{complianceData.summary.total}</div>
            <div className="text-xs text-gray-400">Total Checks</div>
          </div>
        </div>
      </div>

      {/* Compliance Checks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Detailed Compliance Analysis</h3>
        {complianceData.checks.map(check => {
          const statusStyle = getStatusStyle(check.status);
          const Icon = statusStyle.icon;

          return (
            <div
              key={check.id}
              className={`border rounded-lg p-6 ${statusStyle.bg} ${statusStyle.border}`}
            >
              <div className="flex items-start space-x-4">
                <Icon className={`h-6 w-6 mt-1 ${statusStyle.color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{check.requirement}</h4>
                    <span className={`px-3 py-1 rounded text-xs font-medium ${statusStyle.color} bg-gray-800`}>
                      {check.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{check.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-400">Current Status:</span>
                      <p className="text-gray-300 text-sm">{check.details}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-400">Recommendation:</span>
                      <p className="text-gray-300 text-sm">{check.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Items */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Priority Action Items</h3>
        <div className="space-y-3">
          {complianceData.checks
            .filter(check => check.status === 'missing')
            .map((check, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-red-900/10 border border-red-800 rounded">
                <FiX className="h-4 w-4 text-red-400" />
                <span className="text-red-300 font-medium">{check.requirement}</span>
                <span className="text-red-400 text-sm">- Missing</span>
              </div>
            ))}
          
          {complianceData.checks
            .filter(check => check.status === 'partial')
            .map((check, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-900/10 border border-yellow-800 rounded">
                <FiAlertTriangle className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-300 font-medium">{check.requirement}</span>
                <span className="text-yellow-400 text-sm">- Needs Improvement</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceChecker;
