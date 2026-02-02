/**
 * Search Utilities for TOS Comparison
 * Provides search and highlighting functionality across all components
 */

/**
 * Highlight search terms in text - returns simple string replacement
 * @param {string} text - The text to search in
 * @param {string} searchTerm - The term to search for
 * @returns {string} - Text with HTML highlighting
 */
export const highlightSearchTermSimple = (text, searchTerm) => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark style="background-color: #fef08a; color: #000; padding: 2px 4px; border-radius: 3px; font-weight: 500;">$1</mark>');
};

/**
 * Highlight search terms in text for React components
 * @param {string} text - The text to search in
 * @param {string} searchTerm - The term to search for
 * @returns {Array|string} - Text parts for React rendering
 */
export const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  const parts = text.split(regex);

  // Return simple string if no matches
  if (parts.length === 1) return text;

  // Return array of parts for React to render
  return parts.filter(part => part).map((part, index) => ({
    text: part,
    isHighlight: regex.test(part),
    key: index
  }));
};

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Check if text contains search term
 * @param {string} text - Text to search in
 * @param {string} searchTerm - Term to search for
 * @returns {boolean} - Whether text contains the search term
 */
export const containsSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return true;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};

/**
 * Filter array of objects by search term in specified fields
 * @param {Array} items - Array of items to filter
 * @param {string} searchTerm - Term to search for
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} - Filtered array
 */
export const filterBySearchTerm = (items, searchTerm, searchFields = ['text', 'content', 'description']) => {
  if (!searchTerm || !items) return items;
  
  return items.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return containsSearchTerm(value, searchTerm);
      }
      return false;
    });
  });
};

/**
 * Filter clause categories by search term
 * @param {Object} clauseCategories - Clause categories object
 * @param {string} searchTerm - Term to search for
 * @returns {Object} - Filtered clause categories
 */
export const filterClauseCategories = (clauseCategories, searchTerm) => {
  if (!searchTerm || !clauseCategories) return clauseCategories;
  
  const filtered = {};
  
  Object.entries(clauseCategories).forEach(([category, data]) => {
    const filteredDoc1Clauses = data.doc1Clauses?.filter(clause => 
      containsSearchTerm(clause, searchTerm)
    ) || [];
    
    const filteredDoc2Clauses = data.doc2Clauses?.filter(clause => 
      containsSearchTerm(clause, searchTerm)
    ) || [];
    
    // Include category if it has matching clauses or if category name matches
    if (filteredDoc1Clauses.length > 0 || 
        filteredDoc2Clauses.length > 0 || 
        containsSearchTerm(category, searchTerm)) {
      filtered[category] = {
        ...data,
        doc1Clauses: filteredDoc1Clauses,
        doc2Clauses: filteredDoc2Clauses,
        doc1Count: filteredDoc1Clauses.length,
        doc2Count: filteredDoc2Clauses.length
      };
    }
  });
  
  return filtered;
};

/**
 * Filter risks by search term
 * @param {Array} risks - Array of risk objects
 * @param {string} searchTerm - Term to search for
 * @returns {Array} - Filtered risks
 */
export const filterRisks = (risks, searchTerm) => {
  if (!searchTerm || !risks) return risks;
  
  return risks.filter(risk => 
    containsSearchTerm(risk.type, searchTerm) ||
    containsSearchTerm(risk.description, searchTerm) ||
    containsSearchTerm(risk.riskLevel, searchTerm)
  );
};

/**
 * Filter key terms by search term
 * @param {Object} termComparison - Term comparison object
 * @param {string} searchTerm - Term to search for
 * @returns {Object} - Filtered term comparison
 */
export const filterKeyTerms = (termComparison, searchTerm) => {
  if (!searchTerm || !termComparison) return termComparison;
  
  const filtered = {};
  
  Object.entries(termComparison).forEach(([term, data]) => {
    if (containsSearchTerm(term, searchTerm)) {
      filtered[term] = data;
    }
  });
  
  return filtered;
};

/**
 * Get search statistics
 * @param {Object} analysis - Comprehensive analysis object
 * @param {string} searchTerm - Term to search for
 * @returns {Object} - Search statistics
 */
export const getSearchStatistics = (analysis, searchTerm) => {
  if (!searchTerm || !analysis) {
    return {
      totalMatches: 0,
      clauseMatches: 0,
      riskMatches: 0,
      termMatches: 0
    };
  }
  
  const { comprehensiveAnalysis } = analysis;
  
  // Count clause matches
  let clauseMatches = 0;
  if (comprehensiveAnalysis.clauseCategories) {
    Object.values(comprehensiveAnalysis.clauseCategories).forEach(category => {
      clauseMatches += (category.doc1Clauses?.filter(clause => 
        containsSearchTerm(clause, searchTerm)
      ).length || 0);
      clauseMatches += (category.doc2Clauses?.filter(clause => 
        containsSearchTerm(clause, searchTerm)
      ).length || 0);
    });
  }
  
  // Count risk matches
  const doc1RiskMatches = filterRisks(comprehensiveAnalysis.riskAssessment?.doc1Risks || [], searchTerm).length;
  const doc2RiskMatches = filterRisks(comprehensiveAnalysis.riskAssessment?.doc2Risks || [], searchTerm).length;
  const riskMatches = doc1RiskMatches + doc2RiskMatches;
  
  // Count term matches
  const termMatches = Object.keys(filterKeyTerms(comprehensiveAnalysis.keyTermsAnalysis?.termComparison || {}, searchTerm)).length;
  
  return {
    totalMatches: clauseMatches + riskMatches + termMatches,
    clauseMatches,
    riskMatches,
    termMatches
  };
};

/**
 * Create search result summary
 * @param {Object} analysis - Comprehensive analysis object
 * @param {string} searchTerm - Term to search for
 * @returns {string} - Search summary text
 */
export const createSearchSummary = (analysis, searchTerm) => {
  if (!searchTerm) return '';
  
  const stats = getSearchStatistics(analysis, searchTerm);
  
  if (stats.totalMatches === 0) {
    return `No matches found for "${searchTerm}"`;
  }
  
  const parts = [];
  if (stats.clauseMatches > 0) parts.push(`${stats.clauseMatches} clause${stats.clauseMatches !== 1 ? 's' : ''}`);
  if (stats.riskMatches > 0) parts.push(`${stats.riskMatches} risk${stats.riskMatches !== 1 ? 's' : ''}`);
  if (stats.termMatches > 0) parts.push(`${stats.termMatches} term${stats.termMatches !== 1 ? 's' : ''}`);
  
  return `Found "${searchTerm}" in ${parts.join(', ')} (${stats.totalMatches} total matches)`;
};
