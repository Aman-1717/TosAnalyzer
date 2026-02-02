import React, { useState } from 'react';
import {
  FiHelpCircle,
  FiSend,
  FiLoader,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiZap,
  FiMessageSquare
} from 'react-icons/fi';
import { analyzeWhatIfScenario } from '../../services/geminiService';

/**
 * What If Engine Component
 * Interactive AI-powered scenario analysis
 */
const WhatIfEngine = ({ tosContent, companyName }) => {
  const [question, setQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  /**
   * Common scenario suggestions
   */
  const suggestions = [
    "What if I stop using this service but don't delete my account?",
    "What if I want to cancel my subscription after 6 months?",
    "What if the company gets acquired by another company?",
    "What if I dispute a charge on my credit card?",
    "What if my personal data gets breached?",
    "What if I want to download all my data?",
    "What if I violate the terms of service accidentally?",
    "What if the service changes its pricing model?",
    "What if I want to use this service for commercial purposes?",
    "What if I move to a different country?"
  ];

  /**
   * Handle scenario analysis
   */
  const analyzeScenario = async () => {
    if (!question.trim()) {
      setError('Please enter a scenario question.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await analyzeWhatIfScenario(question, tosContent);
      setAnalysis(result);
      
      // Add to history
      const newEntry = {
        id: Date.now(),
        question: question.trim(),
        analysis: result,
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [newEntry, ...prev.slice(0, 4)]); // Keep last 5 entries
      
      setQuestion('');
    } catch (err) {
      console.error('Scenario analysis failed:', err);
      setError('Analysis failed. Please try again or check your API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion);
    setError('');
  };

  /**
   * Handle key press
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzeScenario();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white flex items-center mb-2">
          <FiHelpCircle className="h-7 w-7 mr-3 text-green-400" />
          AI "What If" Engine
        </h2>
        <p className="text-gray-300">
          Ask scenario questions about {companyName || 'this service'} and get AI-powered consequence analysis
        </p>
      </div>

      {/* Question Input */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Ask Your Scenario Question</h3>
        
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What if I stop using this service but don't delete my account?"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {question.length}/500
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              💡 Tip: Be specific about your scenario for better analysis
            </div>
            
            <button
              onClick={analyzeScenario}
              disabled={isAnalyzing || !question.trim()}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              {isAnalyzing ? (
                <>
                  <FiLoader className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FiSend className="h-4 w-4 mr-2" />
                  Analyze Scenario
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
            <div className="flex items-center">
              <FiAlertTriangle className="h-4 w-4 text-red-400 mr-2" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
          <FiZap className="h-5 w-5 mr-2 text-yellow-400" />
          Common Scenarios
        </h3>
        
        <div className="grid md:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-left p-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-green-500 rounded-lg transition-colors"
            >
              <span className="text-gray-300 text-sm">{suggestion}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Analysis */}
      {analysis && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <FiCheckCircle className="h-5 w-5 mr-2 text-green-400" />
            Analysis Results
          </h3>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div 
              className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: analysis.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
              }} 
            />
          </div>
        </div>
      )}

      {/* Analysis History */}
      {history.length > 0 && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <FiMessageSquare className="h-5 w-5 mr-2 text-blue-400" />
            Recent Analysis History
          </h3>
          
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="border border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-white font-medium text-sm">"{entry.question}"</h4>
                  <div className="flex items-center text-xs text-gray-400">
                    <FiClock className="h-3 w-3 mr-1" />
                    {entry.timestamp}
                  </div>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div 
                    className="text-gray-400 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: entry.analysis.substring(0, 300).replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-300">$1</strong>') + '...'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center">
          <FiInfo className="h-5 w-5 mr-2 text-blue-400" />
          How the What If Engine Works
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-blue-400 font-medium mb-2">Analysis Process:</h4>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                AI analyzes your scenario against the ToS
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Identifies relevant clauses and terms
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Predicts likely consequences and outcomes
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Provides actionable recommendations
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-medium mb-2">Best Practices:</h4>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Be specific about your situation
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Include relevant timeframes
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Ask about realistic scenarios
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Consider multiple "what if" questions
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfEngine;
