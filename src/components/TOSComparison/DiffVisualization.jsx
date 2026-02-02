import React, { useState } from 'react';
import { FiPlus, FiMinus, FiInfo, FiEye, FiEyeOff } from 'react-icons/fi';

/**
 * Diff Visualization Component
 * Displays the comparison results with added, removed, and unchanged lines
 */
const DiffVisualization = ({ comparisonResult }) => {
  const [viewMode, setViewMode] = useState('unified'); // 'unified' or 'split'
  const [showUnchanged, setShowUnchanged] = useState(false);
  const [contextLines, setContextLines] = useState(3);

  if (!comparisonResult || !comparisonResult.comparison) {
    return null;
  }

  const { comparison, file1Name, file2Name, metadata } = comparisonResult;
  const { lineDiff, statistics, summary } = comparison;

  /**
   * Filter diff lines based on current settings
   */
  const getFilteredDiff = () => {
    if (showUnchanged) {
      return lineDiff;
    }

    // Show only changed lines with context
    const filtered = [];
    const changedIndices = lineDiff
      .map((line, index) => line.type !== 'unchanged' ? index : -1)
      .filter(index => index !== -1);

    if (changedIndices.length === 0) {
      return lineDiff;
    }

    const includedIndices = new Set();

    // Add context around changed lines
    changedIndices.forEach(index => {
      const start = Math.max(0, index - contextLines);
      const end = Math.min(lineDiff.length - 1, index + contextLines);
      
      for (let i = start; i <= end; i++) {
        includedIndices.add(i);
      }
    });

    // Convert to sorted array and build filtered diff
    const sortedIndices = Array.from(includedIndices).sort((a, b) => a - b);
    let lastIndex = -1;

    sortedIndices.forEach(index => {
      // Add separator if there's a gap
      if (lastIndex !== -1 && index > lastIndex + 1) {
        filtered.push({
          type: 'separator',
          content: `... ${index - lastIndex - 1} unchanged lines ...`,
          lineNumber1: null,
          lineNumber2: null
        });
      }
      
      filtered.push(lineDiff[index]);
      lastIndex = index;
    });

    return filtered;
  };

  /**
   * Render statistics summary
   */
  const renderStatistics = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <FiInfo className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-blue-900">Comparison Summary</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">+{statistics.addedLines}</div>
          <div className="text-sm text-gray-600">Added Lines</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">-{statistics.removedLines}</div>
          <div className="text-sm text-gray-600">Removed Lines</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{statistics.unchangedLines}</div>
          <div className="text-sm text-gray-600">Unchanged Lines</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{statistics.changePercentage}%</div>
          <div className="text-sm text-gray-600">Changed</div>
        </div>
      </div>
      
      <p className="text-blue-800">{summary}</p>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Original:</strong> {file1Name} ({metadata.file1Length} characters)</p>
        <p><strong>Updated:</strong> {file2Name} ({metadata.file2Length} characters)</p>
      </div>
    </div>
  );

  /**
   * Render control panel
   */
  const renderControls = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showUnchanged}
              onChange={(e) => setShowUnchanged(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Show unchanged lines</span>
          </label>
          
          {!showUnchanged && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Context lines:</label>
              <select
                value={contextLines}
                onChange={(e) => setContextLines(parseInt(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={1}>1</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * Render a single diff line
   */
  const renderDiffLine = (line, index) => {
    if (line.type === 'separator') {
      return (
        <div key={`separator-${index}`} className="bg-gray-100 border-l-4 border-gray-300 px-4 py-2">
          <span className="text-gray-500 italic text-sm">{line.content}</span>
        </div>
      );
    }

    const getLineStyle = () => {
      switch (line.type) {
        case 'added':
          return 'bg-green-50 border-l-4 border-green-400';
        case 'removed':
          return 'bg-red-50 border-l-4 border-red-400';
        default:
          return 'bg-white border-l-4 border-gray-200';
      }
    };

    const getLineIcon = () => {
      switch (line.type) {
        case 'added':
          return <FiPlus className="h-4 w-4 text-green-600" />;
        case 'removed':
          return <FiMinus className="h-4 w-4 text-red-600" />;
        default:
          return null;
      }
    };

    return (
      <div key={index} className={`${getLineStyle()} px-4 py-2 font-mono text-sm`}>
        <div className="flex items-start space-x-3">
          <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
            {getLineIcon()}
            <span className="text-gray-500 text-xs min-w-[3rem]">
              {line.lineNumber1 || line.lineNumber2 || ''}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <pre className="whitespace-pre-wrap break-words">{line.content || ' '}</pre>
          </div>
        </div>
      </div>
    );
  };

  const filteredDiff = getFilteredDiff();

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparison Results</h2>
      
      {renderStatistics()}
      {renderControls()}
      
      {/* Diff Display */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Document Changes</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredDiff.length > 0 ? (
            filteredDiff.map((line, index) => renderDiffLine(line, index))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No differences found. The documents are identical.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <FiPlus className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">Added lines</span>
        </div>
        <div className="flex items-center space-x-2">
          <FiMinus className="h-4 w-4 text-red-600" />
          <span className="text-gray-600">Removed lines</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span className="text-gray-600">Unchanged lines</span>
        </div>
      </div>
    </div>
  );
};

export default DiffVisualization;
