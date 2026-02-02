import React, { useState, useMemo } from 'react';
import { FiEye, FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiMousePointer } from 'react-icons/fi';
import { containsSearchTerm } from './searchUtils';
import HighlightedText from './HighlightedText';
import WordTranslator from './WordTranslator';

/**
 * Side-by-Side View Component
 * Displays documents in parallel columns with highlighting of differences
 */
const SideBySideView = ({ analysis, searchTerm, selectedCategory }) => {
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());

  if (!analysis?.comprehensiveAnalysis) return null;

  const { comprehensiveAnalysis, file1Name, file2Name } = analysis;

  /**
   * Filter and highlight content based on search and category
   */
  const filteredContent = useMemo(() => {
    const { contentMatching } = comprehensiveAnalysis;
    if (!contentMatching?.matchDetails) return { doc1: [], doc2: [] };

    let doc1Content = [];
    let doc2Content = [];

    // Add exact matches
    contentMatching.matchDetails.exact?.forEach(match => {
      doc1Content.push({
        type: 'exact',
        content: match.text,
        index: match.doc1Index,
        matchIndex: match.doc2Index
      });
      doc2Content.push({
        type: 'exact',
        content: match.text,
        index: match.doc2Index,
        matchIndex: match.doc1Index
      });
    });

    // Add partial matches
    contentMatching.matchDetails.partial?.forEach(match => {
      doc1Content.push({
        type: 'partial',
        content: match.doc1Text,
        index: match.doc1Index,
        matchIndex: match.doc2Index,
        similarity: match.similarity
      });
      doc2Content.push({
        type: 'partial',
        content: match.doc2Text,
        index: match.doc2Index,
        matchIndex: match.doc1Index,
        similarity: match.similarity
      });
    });

    // Add unique content
    contentMatching.matchDetails.unique1?.forEach(unique => {
      doc1Content.push({
        type: 'unique',
        content: unique.text,
        index: unique.index
      });
    });

    contentMatching.matchDetails.unique2?.forEach(unique => {
      doc2Content.push({
        type: 'unique',
        content: unique.text,
        index: unique.index
      });
    });

    // Sort by index
    doc1Content.sort((a, b) => a.index - b.index);
    doc2Content.sort((a, b) => a.index - b.index);

    // Filter by search term
    if (searchTerm) {
      doc1Content = doc1Content.filter(item => containsSearchTerm(item.content, searchTerm));
      doc2Content = doc2Content.filter(item => containsSearchTerm(item.content, searchTerm));
    }

    // Filter by differences only
    if (showOnlyDifferences) {
      doc1Content = doc1Content.filter(item => item.type !== 'exact');
      doc2Content = doc2Content.filter(item => item.type !== 'exact');
    }

    return { doc1: doc1Content, doc2: doc2Content };
  }, [comprehensiveAnalysis, searchTerm, showOnlyDifferences]);

  /**
   * Get styling for content type
   */
  const getContentStyling = (type, similarity) => {
    switch (type) {
      case 'exact':
        return 'bg-green-900/20 border-l-4 border-green-500 text-green-100';
      case 'partial':
        const intensity = similarity > 0.8 ? '30' : '20';
        return `bg-yellow-900/${intensity} border-l-4 border-yellow-500 text-yellow-100`;
      case 'unique':
        return 'bg-red-900/20 border-l-4 border-red-500 text-red-100';
      default:
        return 'bg-gray-800 border-l-4 border-gray-600 text-gray-300';
    }
  };

  // highlightSearchTerm is now imported from searchUtils

  /**
   * Toggle section expansion
   */
  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  /**
   * Render clause category section
   */
  const renderClauseSection = (category, data) => {
    const isExpanded = expandedSections.has(category);
    
    return (
      <div key={category} className="mb-6">
        <button
          onClick={() => toggleSection(category)}
          className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <h3 className="text-lg font-medium text-white">{category}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">
              {data.doc1Count} → {data.doc2Count}
            </span>
            {isExpanded ? (
              <FiChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <FiChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </button>
        
        {isExpanded && (
          <div className="mt-3 grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Document 1 ({file1Name}) - {data.doc1Count} clauses
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {data.doc1Clauses?.map((clause, index) => (
                  <div key={index} className="p-3 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300">
                    <WordTranslator
                      text={clause}
                      className="text-gray-300 text-sm leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Document 2 ({file2Name}) - {data.doc2Count} clauses
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {data.doc2Clauses?.map((clause, index) => (
                  <div key={index} className="p-3 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300">
                    <WordTranslator
                      text={clause}
                      className="text-gray-300 text-sm leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center space-x-4">
          <FiEye className="h-5 w-5 text-gray-400" />
          <span className="text-white font-medium">Side-by-Side Comparison</span>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showOnlyDifferences}
              onChange={(e) => setShowOnlyDifferences(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Show only differences</span>
          </label>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <FiMousePointer className="h-4 w-4" />
            <span>Select any complex word for instant translation</span>
          </div>
        </div>
      </div>

      {/* Content Matching View */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Content Comparison</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Document 1 */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3 sticky top-0 bg-gray-800 py-2">
              {file1Name}
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredContent.doc1.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded ${getContentStyling(item.type, item.similarity)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {item.type} {item.similarity && `(${Math.round(item.similarity * 100)}% match)`}
                    </span>
                    <span className="text-xs opacity-75">#{item.index}</span>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <WordTranslator
                      text={item.content}
                      className="text-gray-300 text-sm leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document 2 */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3 sticky top-0 bg-gray-800 py-2">
              {file2Name}
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredContent.doc2.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded ${getContentStyling(item.type, item.similarity)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {item.type} {item.similarity && `(${Math.round(item.similarity * 100)}% match)`}
                    </span>
                    <span className="text-xs opacity-75">#{item.index}</span>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <WordTranslator
                      text={item.content}
                      className="text-gray-300 text-sm leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-300">Exact Match</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-300">Partial Match</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-300">Unique Content</span>
          </div>
        </div>
      </div>

      {/* Clause Categories Side-by-Side */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Clause Categories Comparison</h2>
        
        <div className="space-y-4">
          {Object.entries(comprehensiveAnalysis.clauseCategories || {}).map(([category, data]) => 
            renderClauseSection(category, data)
          )}
        </div>
      </div>

      {/* Key Terms Side-by-Side */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Key Terms Comparison</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Document 1 ({file1Name})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comprehensiveAnalysis.keyTermsAnalysis?.doc1TopTerms?.map((term, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                  <span className="text-gray-300">
                    <HighlightedText text={term.term} searchTerm={searchTerm} />
                  </span>
                  <span className="text-blue-400 font-medium">{term.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Document 2 ({file2Name})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comprehensiveAnalysis.keyTermsAnalysis?.doc2TopTerms?.map((term, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                  <span className="text-gray-300">
                    <HighlightedText text={term.term} searchTerm={searchTerm} />
                  </span>
                  <span className="text-blue-400 font-medium">{term.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment Side-by-Side */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Risk Assessment Comparison</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Document 1 ({file1Name}) Risks</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comprehensiveAnalysis.riskAssessment?.doc1Risks?.map((risk, index) => (
                <div key={index} className={`p-3 rounded border ${
                  risk.riskLevel === 'high' ? 'bg-red-900/20 border-red-700' :
                  risk.riskLevel === 'medium' ? 'bg-yellow-900/20 border-yellow-700' :
                  'bg-green-900/20 border-green-700'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      risk.riskLevel === 'high' ? 'text-red-400' :
                      risk.riskLevel === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {risk.riskLevel?.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-white font-medium">{risk.type}</p>
                  <p className="text-sm text-gray-300">
                    <HighlightedText text={risk.description} searchTerm={searchTerm} />
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Document 2 ({file2Name}) Risks</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comprehensiveAnalysis.riskAssessment?.doc2Risks?.map((risk, index) => (
                <div key={index} className={`p-3 rounded border ${
                  risk.riskLevel === 'high' ? 'bg-red-900/20 border-red-700' :
                  risk.riskLevel === 'medium' ? 'bg-yellow-900/20 border-yellow-700' :
                  'bg-green-900/20 border-green-700'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      risk.riskLevel === 'high' ? 'text-red-400' :
                      risk.riskLevel === 'medium' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {risk.riskLevel?.toUpperCase()} RISK
                    </span>
                  </div>
                  <p className="text-white font-medium">{risk.type}</p>
                  <p className="text-sm text-gray-300">
                    <HighlightedText text={risk.description} searchTerm={searchTerm} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBySideView;
