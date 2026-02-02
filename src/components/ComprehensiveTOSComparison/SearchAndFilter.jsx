import React, { useState } from 'react';
import { FiSearch, FiFilter, FiX, FiInfo, FiTrendingUp } from 'react-icons/fi';

/**
 * Search and Filter Component
 * Provides search functionality and filtering options for TOS comparison
 */
const SearchAndFilter = ({
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'privacy', label: 'Privacy & Data' },
    { value: 'liability', label: 'Liability & Risk' },
    { value: 'dispute', label: 'Dispute Resolution' },
    { value: 'termination', label: 'Termination' },
    { value: 'intellectual', label: 'Intellectual Property' },
    { value: 'payment', label: 'Payment & Billing' },
    { value: 'service', label: 'Service Terms' }
  ];

  const searchSuggestions = [
    'liability', 'privacy', 'data sharing', 'termination', 'dispute resolution',
    'intellectual property', 'payment', 'refund', 'cancellation', 'arbitration',
    'jurisdiction', 'limitation of liability', 'indemnification', 'force majeure',
    'confidentiality', 'user content', 'third party', 'modification', 'suspension'
  ];

  const clearSearch = () => {
    onSearchChange('');
  };

  const clearFilters = () => {
    onSearchChange('');
    onCategoryChange('all');
  };

  const handleSuggestionClick = (suggestion) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
  };

  const filteredSuggestions = searchSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchTerm.toLowerCase()) &&
    suggestion.toLowerCase() !== searchTerm.toLowerCase()
  ).slice(0, 5);

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for terms like 'liability', 'privacy', 'termination'..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Suggestions */}
          {showSuggestions && searchTerm && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <div className="text-xs text-gray-400 mb-2 flex items-center">
                  <FiTrendingUp className="h-3 w-3 mr-1" />
                  Suggestions
                </div>
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <FiFilter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || selectedCategory !== 'all') && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {(searchTerm || selectedCategory !== 'all') && (
        <div className="mt-3 flex flex-wrap gap-2">
          {searchTerm && (
            <div className="flex items-center space-x-1 bg-blue-900/20 border border-blue-700 rounded-full px-3 py-1 text-sm">
              <span className="text-blue-300">Search: "{searchTerm}"</span>
              <button
                onClick={clearSearch}
                className="text-blue-400 hover:text-blue-300"
              >
                <FiX className="h-3 w-3" />
              </button>
            </div>
          )}
          {selectedCategory !== 'all' && (
            <div className="flex items-center space-x-1 bg-purple-900/20 border border-purple-700 rounded-full px-3 py-1 text-sm">
              <span className="text-purple-300">
                Category: {categories.find(c => c.value === selectedCategory)?.label}
              </span>
              <button
                onClick={() => onCategoryChange('all')}
                className="text-purple-400 hover:text-purple-300"
              >
                <FiX className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-3 text-xs text-gray-400">
        <div className="flex items-start space-x-2">
          <FiInfo className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            <p>
              <strong>Search Tips:</strong> Search for legal terms, clause types, or specific concepts.
              Results are highlighted across all views. Combine with category filters for precise results.
            </p>
            {searchTerm && (
              <p className="mt-1 text-blue-400">
                <strong>Active Search:</strong> "{searchTerm}" - {searchTerm.length < 3 ? 'Type at least 3 characters for better results' : 'Results highlighted in yellow'}
              </p>
            )}
            {!searchTerm && (
              <p className="mt-1 text-gray-500">
                <strong>Popular searches:</strong> liability, privacy, termination, dispute resolution, intellectual property
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
