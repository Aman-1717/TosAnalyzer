import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiClock, 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiEye, 
  FiShield,
  FiUpload,
  FiArrowLeft,
  FiZap,
  FiTarget,
  FiGlobe,
  FiUsers,
  FiHelpCircle
} from 'react-icons/fi';
import CustomFileUploader from '../components/Analysis/CustomFileUploader';
import RiskForecast from '../components/FuturePredictor/RiskForecast';
import TrendPredictor from '../components/FuturePredictor/TrendPredictor';
import CompanyPatternMatcher from '../components/FuturePredictor/CompanyPatternMatcher';
import FutureScenarios from '../components/FuturePredictor/FutureScenarios';
import LegalChangeImpact from '../components/FuturePredictor/LegalChangeImpact';
import UserImpactAlerts from '../components/FuturePredictor/UserImpactAlerts';
import WhatIfEngine from '../components/FuturePredictor/WhatIfEngine';
import VisualRiskMap from '../components/FuturePredictor/VisualRiskMap';
import UniqueFeatures from '../components/FuturePredictor/UniqueFeatures';
import { analyzeFutureRisks } from '../services/geminiService';

/**
 * Future Predictor Page
 * Comprehensive ToS future risk analysis and prediction
 */
const FuturePredictorPage = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  /**
   * Handle file processing (compatible with FileUploader component)
   */
  const handleFileProcessed = (result) => {
    // Handle both formats: {file, content} and document object
    let file, content;

    if (result.file && result.content) {
      // New format: {file, content}
      file = result.file;
      content = result.content;
    } else if (result.fileName && result.originalText) {
      // Document object format from FileUploader
      file = { name: result.fileName };
      content = result.originalText;
    } else {
      console.error('Invalid file processing result:', result);
      setError('Invalid file processing result. Please try again.');
      return;
    }

    setUploadedFile(file);
    setFileContent(content);
    setError('');

    // Try to extract company name from filename
    const filename = file.name.toLowerCase();
    if (filename.includes('google')) setCompanyName('Google');
    else if (filename.includes('facebook') || filename.includes('meta')) setCompanyName('Meta/Facebook');
    else if (filename.includes('apple')) setCompanyName('Apple');
    else if (filename.includes('amazon')) setCompanyName('Amazon');
    else if (filename.includes('microsoft')) setCompanyName('Microsoft');
    else if (filename.includes('twitter') || filename.includes('x.com')) setCompanyName('Twitter/X');
    else setCompanyName('');
  };

  /**
   * Start future risk analysis
   */
  const startAnalysis = async () => {
    if (!fileContent) {
      setError('Please upload a Terms of Service document first.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const results = await analyzeFutureRisks(fileContent, companyName);
      setAnalysisResults(results);
      setActiveTab('risks');
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Analysis failed. Please try again or check your API key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Navigation tabs
   */
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiEye },
    { id: 'risks', label: 'Risk Forecast', icon: FiAlertTriangle },
    { id: 'trends', label: 'Future Trends', icon: FiTrendingUp },
    { id: 'patterns', label: 'Company Patterns', icon: FiUsers },
    { id: 'scenarios', label: 'Future Scenarios', icon: FiClock },
    { id: 'legal', label: 'Legal Changes', icon: FiGlobe },
    { id: 'whatif', label: 'What If?', icon: FiHelpCircle },
    { id: 'visual', label: 'Risk Map', icon: FiTarget },
    { id: 'features', label: 'Simulator', icon: FiZap }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                title="Back to Home"
              >
                <FiArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <FiClock className="h-8 w-8 mr-3 text-purple-400" />
                  Future Predictor
                </h1>
                <p className="text-purple-200 mt-1">
                  Predict future risks and changes in Terms of Service
                </p>
              </div>
            </div>
            
            {/* Company Badge */}
            {companyName && (
              <div className="bg-purple-600 px-4 py-2 rounded-lg">
                <span className="text-white font-medium">{companyName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisResults ? (
          /* Upload Section */
          <div className="space-y-8">
            {/* Upload Area */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-8">
              <div className="text-center mb-6">
                <FiUpload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  Future Predictor
                </h2>
                <h3 className="text-xl font-semibold text-purple-200 mb-2">
                  Upload Terms of Service
                </h3>
                <p className="text-gray-300">
                  Upload a ToS document to analyze future risks and predict changes
                </p>
              </div>

              <CustomFileUploader
                onFileProcessed={handleFileProcessed}
                setIsLoading={setIsAnalyzing}
                mode="simple"
              />

              {/* Company Name Input */}
              {uploadedFile && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google, Facebook, Apple..."
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Start Analysis Button */}
              {uploadedFile && (
                <div className="mt-6 text-center">
                  <button
                    onClick={startAnalysis}
                    disabled={isAnalyzing}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center mx-auto"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing Future Risks...
                      </>
                    ) : (
                      <>
                        <FiZap className="h-5 w-5 mr-2" />
                        Start Future Analysis
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <FiShield className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Risk Forecast</h3>
                <p className="text-gray-300 text-sm">
                  Analyze data sharing, auto-renewal, arbitration, and pricing risks
                </p>
              </div>
              
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <FiTrendingUp className="h-8 w-8 text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Trend Prediction</h3>
                <p className="text-gray-300 text-sm">
                  Predict future ToS changes based on industry trends
                </p>
              </div>
              
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                <FiHelpCircle className="h-8 w-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">What If Engine</h3>
                <p className="text-gray-300 text-sm">
                  Ask scenario questions and get AI-powered consequence analysis
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-1">
              <div className="flex flex-wrap gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-96">
              {activeTab === 'overview' && (
                <div className="text-center py-12">
                  <FiEye className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-2">Future Predictor</h2>
                  <h3 className="text-xl font-semibold text-purple-200 mb-2">Analysis Complete!</h3>
                  <p className="text-gray-300">Select a tab above to explore the future predictions</p>
                </div>
              )}
              
              {activeTab === 'risks' && (
                <RiskForecast 
                  riskData={analysisResults?.riskForecast} 
                  companyName={companyName}
                />
              )}
              
              {activeTab === 'trends' && (
                <TrendPredictor 
                  companyName={companyName}
                  tosContent={fileContent}
                />
              )}
              
              {activeTab === 'patterns' && (
                <CompanyPatternMatcher 
                  patterns={analysisResults?.companyPatterns}
                  companyName={companyName}
                />
              )}
              
              {activeTab === 'scenarios' && (
                <FutureScenarios 
                  scenarios={analysisResults?.futureScenarios}
                  companyName={companyName}
                />
              )}
              
              {activeTab === 'legal' && (
                <LegalChangeImpact 
                  legalChanges={analysisResults?.legalChanges}
                  tosContent={fileContent}
                />
              )}
              
              {activeTab === 'whatif' && (
                <WhatIfEngine 
                  tosContent={fileContent}
                  companyName={companyName}
                />
              )}
              
              {activeTab === 'visual' && (
                <VisualRiskMap 
                  riskData={analysisResults?.riskForecast}
                  companyName={companyName}
                />
              )}
              
              {activeTab === 'features' && (
                <UniqueFeatures 
                  tosContent={fileContent}
                  companyName={companyName}
                  analysisResults={analysisResults}
                />
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-900 border border-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <FiAlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuturePredictorPage;
