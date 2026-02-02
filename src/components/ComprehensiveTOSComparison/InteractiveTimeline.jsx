import React, { useState } from 'react';
import { FiClock, FiGitBranch, FiFileText, FiAlertTriangle, FiTrendingUp, FiCalendar } from 'react-icons/fi';

/**
 * Interactive Timeline Component
 * Shows document evolution and version tracking over time
 */
const InteractiveTimeline = ({ analysis }) => {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [timelineView, setTimelineView] = useState('changes'); // changes, risks, metrics

  if (!analysis?.comprehensiveAnalysis) return null;

  const { comprehensiveAnalysis, file1Name, file2Name } = analysis;

  /**
   * Generate timeline data based on analysis
   */
  const generateTimelineData = () => {
    const baseDate = new Date('2024-01-01');
    const updateDate = new Date('2024-06-01');

    return [
      {
        id: 'v1',
        date: baseDate,
        version: '1.0',
        title: 'Document 1 - Initial Terms of Service',
        fileName: file1Name,
        type: 'creation',
        changes: [],
        metrics: {
          wordCount: comprehensiveAnalysis.structuralAnalysis?.doc1?.wordCount || 0,
          riskLevel: comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc1 || 'medium',
          readabilityScore: comprehensiveAnalysis.readabilityAnalysis?.doc1?.fleschScore || 50
        },
        description: 'Original terms of service document created'
      },
      {
        id: 'v2',
        date: updateDate,
        version: '2.0',
        title: 'Document 2 - Updated Terms of Service',
        fileName: file2Name,
        type: 'update',
        changes: [
          { type: 'added', count: comprehensiveAnalysis.contentMatching?.uniqueToDoc2 || 0, description: 'New clauses added' },
          { type: 'removed', count: comprehensiveAnalysis.contentMatching?.uniqueToDoc1 || 0, description: 'Clauses removed' },
          { type: 'modified', count: comprehensiveAnalysis.contentMatching?.partialMatches || 0, description: 'Clauses modified' }
        ],
        metrics: {
          wordCount: comprehensiveAnalysis.structuralAnalysis?.doc2?.wordCount || 0,
          riskLevel: comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 || 'medium',
          readabilityScore: comprehensiveAnalysis.readabilityAnalysis?.doc2?.fleschScore || 45
        },
        description: 'Major update with significant changes to terms and conditions'
      }
    ];
  };

  const timelineData = generateTimelineData();

  /**
   * Get color for change type
   */
  const getChangeColor = (type) => {
    switch (type) {
      case 'added': return 'text-green-400 bg-green-900/20 border-green-700';
      case 'removed': return 'text-red-400 bg-red-900/20 border-red-700';
      case 'modified': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      default: return 'text-blue-400 bg-blue-900/20 border-blue-700';
    }
  };

  /**
   * Get risk level color
   */
  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  /**
   * Render timeline item
   */
  const renderTimelineItem = (item, index) => {
    const isSelected = selectedVersion === item.id;
    const isLast = index === timelineData.length - 1;

    return (
      <div key={item.id} className="relative">
        {/* Timeline line */}
        {!isLast && (
          <div className="absolute left-6 top-12 w-0.5 h-20 bg-gray-600"></div>
        )}

        {/* Timeline node */}
        <div className="flex items-start space-x-4">
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center
            ${isSelected ? 'border-purple-500 bg-purple-900/20' : 'border-gray-600 bg-gray-800'}
          `}>
            {item.type === 'creation' ? (
              <FiFileText className={`h-5 w-5 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
            ) : (
              <FiGitBranch className={`h-5 w-5 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
            )}
          </div>

          {/* Timeline content */}
          <div 
            className={`
              flex-1 p-4 rounded-lg border cursor-pointer transition-all
              ${isSelected 
                ? 'border-purple-500 bg-purple-900/10' 
                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
              }
            `}
            onClick={() => setSelectedVersion(isSelected ? null : item.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">{item.date.toLocaleDateString()}</span>
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                  v{item.version}
                </span>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-3">{item.description}</p>

            {/* Quick metrics */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-blue-400 font-medium">{item.metrics.wordCount.toLocaleString()}</div>
                <div className="text-gray-400 text-xs">Words</div>
              </div>
              <div className="text-center">
                <div className={`font-medium ${getRiskColor(item.metrics.riskLevel)}`}>
                  {item.metrics.riskLevel?.toUpperCase()}
                </div>
                <div className="text-gray-400 text-xs">Risk Level</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-medium">{item.metrics.readabilityScore}</div>
                <div className="text-gray-400 text-xs">Readability</div>
              </div>
            </div>

            {/* Changes summary */}
            {item.changes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="flex flex-wrap gap-2">
                  {item.changes.map((change, idx) => (
                    <span key={idx} className={`px-2 py-1 rounded text-xs border ${getChangeColor(change.type)}`}>
                      {change.count} {change.type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Expanded details */}
            {isSelected && (
              <div className="mt-4 pt-4 border-t border-gray-600 space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Document Metrics</h4>
                    <div className="space-y-1 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>File Name:</span>
                        <span className="text-blue-400">{item.fileName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Word Count:</span>
                        <span>{item.metrics.wordCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <span className={getRiskColor(item.metrics.riskLevel)}>
                          {item.metrics.riskLevel?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Readability Score:</span>
                        <span>{item.metrics.readabilityScore}</span>
                      </div>
                    </div>
                  </div>

                  {item.changes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Change Details</h4>
                      <div className="space-y-1">
                        {item.changes.map((change, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-300">{change.description}:</span>
                            <span className={getChangeColor(change.type).split(' ')[0]}>{change.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render timeline view selector
   */
  const renderViewSelector = () => {
    const views = [
      { id: 'changes', label: 'Changes', icon: FiGitBranch },
      { id: 'risks', label: 'Risk Evolution', icon: FiAlertTriangle },
      { id: 'metrics', label: 'Metrics Trend', icon: FiTrendingUp }
    ];

    return (
      <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg mb-6">
        {views.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTimelineView(id)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${timelineView === id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    );
  };

  /**
   * Render comparison metrics
   */
  const renderComparisonMetrics = () => {
    const v1 = timelineData[0];
    const v2 = timelineData[1];

    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Version Comparison</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {((v2.metrics.wordCount - v1.metrics.wordCount) / v1.metrics.wordCount * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-300">Length Change</div>
            <div className="text-xs text-gray-400 mt-1">
              {v1.metrics.wordCount.toLocaleString()} → {v2.metrics.wordCount.toLocaleString()} words
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {v2.metrics.readabilityScore - v1.metrics.readabilityScore > 0 ? '+' : ''}
              {v2.metrics.readabilityScore - v1.metrics.readabilityScore}
            </div>
            <div className="text-sm text-gray-300">Readability Change</div>
            <div className="text-xs text-gray-400 mt-1">
              {v1.metrics.readabilityScore} → {v2.metrics.readabilityScore} score
            </div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 ${
              v1.metrics.riskLevel === v2.metrics.riskLevel ? 'text-gray-400' :
              v2.metrics.riskLevel === 'high' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {v1.metrics.riskLevel === v2.metrics.riskLevel ? 'Same' : 'Changed'}
            </div>
            <div className="text-sm text-gray-300">Risk Level</div>
            <div className="text-xs text-gray-400 mt-1">
              {v1.metrics.riskLevel} → {v2.metrics.riskLevel}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-700 rounded-lg p-6">
        <div className="flex items-center mb-2">
          <FiClock className="h-6 w-6 text-blue-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">Document Evolution Timeline</h2>
        </div>
        <p className="text-gray-300">
          Track changes, metrics, and evolution of your Terms of Service documents over time
        </p>
      </div>

      {/* View Selector */}
      {renderViewSelector()}

      {/* Timeline */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Version History</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <FiCalendar className="h-4 w-4" />
                <span>Jan 2024 - Jun 2024</span>
              </div>
            </div>

            <div className="space-y-6">
              {timelineData.map((item, index) => renderTimelineItem(item, index))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Comparison Metrics */}
          {renderComparisonMetrics()}

          {/* Quick Stats */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Versions</span>
                <span className="text-blue-400 font-medium">{timelineData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Time Span</span>
                <span className="text-blue-400 font-medium">5 months</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Changes</span>
                <span className="text-blue-400 font-medium">
                  {(comprehensiveAnalysis.contentMatching?.uniqueToDoc1 || 0) + 
                   (comprehensiveAnalysis.contentMatching?.uniqueToDoc2 || 0) + 
                   (comprehensiveAnalysis.contentMatching?.partialMatches || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Risk Trend</span>
                <span className="text-red-400 font-medium flex items-center">
                  <FiTrendingUp className="h-4 w-4 mr-1" />
                  Increasing
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Added Content</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-300">Removed Content</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">Modified Content</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiFileText className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300">Document Creation</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiGitBranch className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300">Document Update</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveTimeline;
