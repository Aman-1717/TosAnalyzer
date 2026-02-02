import React from 'react';
import { FiInfo, FiAlertTriangle, FiCheckCircle, FiXCircle, FiTrendingUp, FiTrendingDown, FiMinus, FiSearch } from 'react-icons/fi';
import { filterClauseCategories, filterRisks, filterKeyTerms, createSearchSummary } from './searchUtils';
import HighlightedText from './HighlightedText';

/**
 * Summary Report Component
 * Displays comprehensive analysis results in a structured report format
 */
const SummaryReport = ({ analysis, searchTerm, selectedCategory }) => {
  if (!analysis?.comprehensiveAnalysis) return null;

  const { comprehensiveAnalysis, file1Name, file2Name } = analysis;

  // Filter data based on search term
  const filteredClauseCategories = filterClauseCategories(comprehensiveAnalysis.clauseCategories, searchTerm);
  const filteredDoc1Risks = filterRisks(comprehensiveAnalysis.riskAssessment?.doc1Risks, searchTerm);
  const filteredDoc2Risks = filterRisks(comprehensiveAnalysis.riskAssessment?.doc2Risks, searchTerm);
  const filteredTermComparison = filterKeyTerms(comprehensiveAnalysis.keyTermsAnalysis?.termComparison, searchTerm);

  // Create search summary
  const searchSummary = createSearchSummary(analysis, searchTerm);

  /**
   * Get risk level color and icon
   */
  const getRiskDisplay = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return { color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700', icon: FiXCircle };
      case 'medium':
        return { color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700', icon: FiAlertTriangle };
      case 'low':
        return { color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700', icon: FiCheckCircle };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-600', icon: FiMinus };
    }
  };

  /**
   * Get change trend icon
   */
  const getTrendIcon = (change) => {
    if (change > 0) return <FiTrendingUp className="h-4 w-4 text-red-400" />;
    if (change < 0) return <FiTrendingDown className="h-4 w-4 text-green-400" />;
    return <FiMinus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Search Results Header */}
      {searchTerm && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FiSearch className="h-5 w-5 text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-blue-300">Search Results</h3>
          </div>
          <p className="text-blue-200">{searchSummary}</p>
          {searchSummary.includes('No matches') && (
            <p className="text-blue-300 text-sm mt-2">
              Try different keywords like "privacy", "liability", "termination", or "data"
            </p>
          )}
        </div>
      )}

      {/* Overview Section */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FiInfo className="h-6 w-6 text-blue-400 mr-2" />
          <h2 className="text-xl font-semibold text-blue-300">Analysis Overview</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-white mb-2">{file1Name}</h3>
            <div className="space-y-1 text-sm text-gray-300">
              <p>Words: {comprehensiveAnalysis.structuralAnalysis?.doc1?.wordCount?.toLocaleString()}</p>
              <p>Sentences: {comprehensiveAnalysis.structuralAnalysis?.doc1?.sentenceCount}</p>
              <p>Readability: {comprehensiveAnalysis.readabilityAnalysis?.doc1?.readingLevel}</p>
              <p>Risk Level: <span className={getRiskDisplay(comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc1).color}>
                {comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc1?.toUpperCase()}
              </span></p>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">{file2Name}</h3>
            <div className="space-y-1 text-sm text-gray-300">
              <p>Words: {comprehensiveAnalysis.structuralAnalysis?.doc2?.wordCount?.toLocaleString()}</p>
              <p>Sentences: {comprehensiveAnalysis.structuralAnalysis?.doc2?.sentenceCount}</p>
              <p>Readability: {comprehensiveAnalysis.readabilityAnalysis?.doc2?.readingLevel}</p>
              <p>Risk Level: <span className={getRiskDisplay(comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2).color}>
                {comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2?.toUpperCase()}
              </span></p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-600">
          <p className="text-gray-300">
            <strong>Overall Similarity:</strong> {comprehensiveAnalysis.contentMatching?.overallSimilarity}%
          </p>
          <p className="text-gray-300 mt-1">
            <strong>Length Change:</strong> {comprehensiveAnalysis.structuralAnalysis?.comparison?.lengthChangePercentage}%
            {getTrendIcon(comprehensiveAnalysis.structuralAnalysis?.comparison?.lengthChangePercentage)}
          </p>
        </div>
      </div>

      {/* Content Matching Section */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Content Matching Analysis</h2>
        
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-900/20 border border-green-700 rounded">
            <div className="text-2xl font-bold text-green-400">
              {comprehensiveAnalysis.contentMatching?.exactMatches}
            </div>
            <div className="text-sm text-green-300">Exact Matches</div>
          </div>
          <div className="text-center p-4 bg-yellow-900/20 border border-yellow-700 rounded">
            <div className="text-2xl font-bold text-yellow-400">
              {comprehensiveAnalysis.contentMatching?.partialMatches}
            </div>
            <div className="text-sm text-yellow-300">Partial Matches</div>
          </div>
          <div className="text-center p-4 bg-red-900/20 border border-red-700 rounded">
            <div className="text-2xl font-bold text-red-400">
              {comprehensiveAnalysis.contentMatching?.uniqueToDoc1}
            </div>
            <div className="text-sm text-red-300">Unique to Doc 1</div>
          </div>
          <div className="text-center p-4 bg-blue-900/20 border border-blue-700 rounded">
            <div className="text-2xl font-bold text-blue-400">
              {comprehensiveAnalysis.contentMatching?.uniqueToDoc2}
            </div>
            <div className="text-sm text-blue-300">Unique to Doc 2</div>
          </div>
        </div>

        {/* Sample unique content */}
        {comprehensiveAnalysis.contentMatching?.matchDetails && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-white mb-2">Sample Content Unique to {file1Name}:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {comprehensiveAnalysis.contentMatching.matchDetails.unique1?.slice(0, 3).map((item, index) => (
                  <div key={index} className="p-2 bg-red-900/10 border border-red-800 rounded text-sm text-gray-300">
                    {item.text?.substring(0, 100)}...
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Sample Content Unique to {file2Name}:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {comprehensiveAnalysis.contentMatching.matchDetails.unique2?.slice(0, 3).map((item, index) => (
                  <div key={index} className="p-2 bg-blue-900/10 border border-blue-800 rounded text-sm text-gray-300">
                    {item.text?.substring(0, 100)}...
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Risk Assessment Section */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Risk Assessment</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-white mb-3">Document 1 ({file1Name}) Risks</h3>
            <div className="space-y-2">
              {filteredDoc1Risks?.map((risk, index) => {
                const display = getRiskDisplay(risk.riskLevel);
                const Icon = display.icon;
                return (
                  <div key={index} className={`p-3 rounded border ${display.bg} ${display.border}`}>
                    <div className="flex items-center mb-1">
                      <Icon className={`h-4 w-4 mr-2 ${display.color}`} />
                      <span className={`text-sm font-medium ${display.color}`}>
                        {risk.riskLevel?.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-white font-medium">
                      <HighlightedText text={risk.type} searchTerm={searchTerm} />
                    </p>
                    <p className="text-sm text-gray-300">
                      <HighlightedText text={risk.description} searchTerm={searchTerm} />
                    </p>
                  </div>
                );
              })}
              {filteredDoc1Risks?.length === 0 && searchTerm && (
                <p className="text-gray-400 text-sm italic">No risks match your search term</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-white mb-3">Document 2 ({file2Name}) Risks</h3>
            <div className="space-y-2">
              {filteredDoc2Risks?.map((risk, index) => {
                const display = getRiskDisplay(risk.riskLevel);
                const Icon = display.icon;
                return (
                  <div key={index} className={`p-3 rounded border ${display.bg} ${display.border}`}>
                    <div className="flex items-center mb-1">
                      <Icon className={`h-4 w-4 mr-2 ${display.color}`} />
                      <span className={`text-sm font-medium ${display.color}`}>
                        {risk.riskLevel?.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-white font-medium">
                      <HighlightedText text={risk.type} searchTerm={searchTerm} />
                    </p>
                    <p className="text-sm text-gray-300">
                      <HighlightedText text={risk.description} searchTerm={searchTerm} />
                    </p>
                  </div>
                );
              })}
              {filteredDoc2Risks?.length === 0 && searchTerm && (
                <p className="text-gray-400 text-sm italic">No risks match your search term</p>
              )}
            </div>
          </div>
        </div>

        {/* Risk Comparison */}
        {comprehensiveAnalysis.riskAssessment?.riskComparison && (
          <div className="mt-6 p-4 bg-gray-700 rounded border border-gray-600">
            <h4 className="font-medium text-white mb-3">Risk Changes</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(comprehensiveAnalysis.riskAssessment.riskComparison).map(([riskType, comparison]) => (
                <div key={riskType} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <span className="text-gray-300">{riskType}</span>
                  <div className="flex items-center space-x-2">
                    <span className={getRiskDisplay(comparison.doc1).color}>{comparison.doc1}</span>
                    <span className="text-gray-500">→</span>
                    <span className={getRiskDisplay(comparison.doc2).color}>{comparison.doc2}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      comparison.change === 'increased' ? 'bg-red-900/20 text-red-300' :
                      comparison.change === 'decreased' ? 'bg-green-900/20 text-green-300' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {comparison.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Key Terms Analysis */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Key Terms Analysis</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-white mb-3">Top Terms in Document 1 ({file1Name})</h3>
            <div className="space-y-2">
              {comprehensiveAnalysis.keyTermsAnalysis?.doc1TopTerms
                ?.filter(term => !searchTerm || term.term.toLowerCase().includes(searchTerm.toLowerCase()))
                ?.map((term, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                  <span className="text-gray-300">
                    <HighlightedText text={term.term} searchTerm={searchTerm} />
                  </span>
                  <span className="text-blue-400 font-medium">{term.count}</span>
                </div>
              ))}
              {searchTerm && comprehensiveAnalysis.keyTermsAnalysis?.doc1TopTerms
                ?.filter(term => term.term.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <p className="text-gray-400 text-sm italic">No terms match your search</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-white mb-3">Top Terms in Document 2 ({file2Name})</h3>
            <div className="space-y-2">
              {comprehensiveAnalysis.keyTermsAnalysis?.doc2TopTerms
                ?.filter(term => !searchTerm || term.term.toLowerCase().includes(searchTerm.toLowerCase()))
                ?.map((term, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                  <span className="text-gray-300">
                    <HighlightedText text={term.term} searchTerm={searchTerm} />
                  </span>
                  <span className="text-blue-400 font-medium">{term.count}</span>
                </div>
              ))}
              {searchTerm && comprehensiveAnalysis.keyTermsAnalysis?.doc2TopTerms
                ?.filter(term => term.term.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <p className="text-gray-400 text-sm italic">No terms match your search</p>
              )}
            </div>
          </div>
        </div>

        {/* Significant Differences */}
        {comprehensiveAnalysis.keyTermsAnalysis?.significantDifferences && (
          <div className="mt-6">
            <h4 className="font-medium text-white mb-3">Significant Term Changes</h4>
            <div className="space-y-2">
              {comprehensiveAnalysis.keyTermsAnalysis.significantDifferences.slice(0, 5).map(([term, data], index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <span className="text-gray-300 font-medium">{term}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">
                      {data.doc1Count} → {data.doc2Count}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      data.difference > 0 ? 'bg-green-900/20 text-green-300' :
                      data.difference < 0 ? 'bg-red-900/20 text-red-300' :
                      'bg-gray-600 text-gray-400'
                    }`}>
                      {data.difference > 0 ? '+' : ''}{data.difference}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Readability Analysis */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Readability Analysis</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-white mb-3">{file1Name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Flesch Score:</span>
                <span className="text-blue-400">{comprehensiveAnalysis.readabilityAnalysis?.doc1?.fleschScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Reading Level:</span>
                <span className="text-blue-400">{comprehensiveAnalysis.readabilityAnalysis?.doc1?.readingLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Avg Words/Sentence:</span>
                <span className="text-blue-400">{comprehensiveAnalysis.readabilityAnalysis?.doc1?.averageWordsPerSentence}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-white mb-3">{file2Name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Flesch Score:</span>
                <span className="text-blue-400">{comprehensiveAnalysis.readabilityAnalysis?.doc2?.fleschScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Reading Level:</span>
                <span className="text-blue-400">{comprehensiveAnalysis.readabilityAnalysis?.doc2?.readingLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Avg Words/Sentence:</span>
                <span className="text-blue-400">{comprehensiveAnalysis.readabilityAnalysis?.doc2?.averageWordsPerSentence}</span>
              </div>
            </div>
          </div>
        </div>

        {comprehensiveAnalysis.readabilityAnalysis?.comparison && (
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded">
            <p className="text-blue-300">
              <strong>Readability Change:</strong> {comprehensiveAnalysis.readabilityAnalysis.comparison.recommendation}
            </p>
            <p className="text-blue-300 mt-1">
              <strong>Complexity:</strong> Document 2 is {comprehensiveAnalysis.readabilityAnalysis.comparison.complexityChange}
            </p>
          </div>
        )}
      </div>

      {/* Clause Categories */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Clause Categories</h2>
        
        <div className="space-y-4">
          {Object.entries(filteredClauseCategories || {}).map(([category, data]) => (
            <div key={category} className="p-4 bg-gray-700 rounded border border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">
                  <HighlightedText text={category} searchTerm={searchTerm} />
                </h4>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-300">
                    {data.doc1Count} → {data.doc2Count}
                    {searchTerm && (
                      <span className="text-blue-400 ml-2">
                        (filtered)
                      </span>
                    )}
                  </span>
                  {getTrendIcon(data.difference)}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Document 1 ({file1Name}): {data.doc1Count} clauses</p>
                  {data.doc1Clauses?.slice(0, 2).map((clause, index) => (
                    <p key={index} className="text-gray-300 text-xs">
                      <HighlightedText text={clause.substring(0, 80) + '...'} searchTerm={searchTerm} />
                    </p>
                  ))}
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Document 2 ({file2Name}): {data.doc2Count} clauses</p>
                  {data.doc2Clauses?.slice(0, 2).map((clause, index) => (
                    <p key={index} className="text-gray-300 text-xs">
                      <HighlightedText text={clause.substring(0, 80) + '...'} searchTerm={searchTerm} />
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {Object.keys(filteredClauseCategories || {}).length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-400">
              <FiSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No clause categories match your search term "{searchTerm}"</p>
              <p className="text-sm mt-1">Try searching for terms like "privacy", "liability", or "termination"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryReport;
