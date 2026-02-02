import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX, FiLoader, FiZap, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { formatFileSize, getFileTypeDisplay } from '../../services/tosComparisonApi';

/**
 * Gemini-powered TOS Comparison Component
 * Uses AI to provide intelligent analysis of TOS differences
 */
const GeminiTOSComparison = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  /**
   * Handle file drop for first document
   */
  const onDrop1 = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Please upload only PDF or TXT files');
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile1(file);
      setError(null);
    }
  };

  /**
   * Handle file drop for second document
   */
  const onDrop2 = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Please upload only PDF or TXT files');
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile2(file);
      setError(null);
    }
  };

  // Configure dropzones
  const dropzone1 = useDropzone({
    onDrop: onDrop1,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    multiple: false
  });

  const dropzone2 = useDropzone({
    onDrop: onDrop2,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    multiple: false
  });

  /**
   * Remove selected file
   */
  const removeFile = (fileNumber) => {
    if (fileNumber === 1) {
      setFile1(null);
    } else {
      setFile2(null);
    }
    setError(null);
  };

  /**
   * Handle AI-powered comparison
   */
  const handleGeminiCompare = async () => {
    if (!file1 || !file2) {
      setError('Please upload both documents before comparing');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('file1', file1);
      formData.append('file2', file2);

      const response = await fetch(`${API_BASE_URL}/api/compare-gemini`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysis(result);
    } catch (err) {
      setError(err.message || 'Failed to analyze documents');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Reset the comparison
   */
  const resetComparison = () => {
    setFile1(null);
    setFile2(null);
    setAnalysis(null);
    setError(null);
  };

  /**
   * Get risk level color
   */
  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  /**
   * Render file upload area
   */
  const renderFileUpload = (dropzone, file, fileNumber, title) => {
    const { getRootProps, getInputProps, isDragActive } = dropzone;

    return (
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        
        {!file ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">or click to select</p>
            <p className="text-xs text-gray-400">
              Supports PDF and TXT files (max 10MB)
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiFile className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getFileTypeDisplay(file.type)} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(fileNumber)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                title="Remove file"
              >
                <FiX className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FiZap className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              AI-Powered TOS Comparison
            </h1>
          </div>
          <p className="text-gray-600">
            Upload two Terms of Service documents and get intelligent AI analysis of their differences, 
            risks, and recommendations using Google's Gemini AI.
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {renderFileUpload(dropzone1, file1, 1, "Original Document")}
            {renderFileUpload(dropzone2, file2, 2, "Updated Document")}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FiAlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleGeminiCompare}
              disabled={!file1 || !file2 || isAnalyzing}
              className={`
                px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2
                ${file1 && file2 && !isAnalyzing
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isAnalyzing ? (
                <>
                  <FiLoader className="h-5 w-5 animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <FiZap className="h-5 w-5" />
                  <span>Analyze with Gemini AI</span>
                </>
              )}
            </button>

            {(file1 || file2 || analysis) && (
              <button
                onClick={resetComparison}
                className="px-6 py-3 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-8">
            {/* Summary Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <FiInfo className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-900">Document Summaries</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{analysis.file1Name}</h3>
                  <p className="text-gray-700">{analysis.analysis.summary?.document1}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{analysis.file2Name}</h3>
                  <p className="text-gray-700">{analysis.analysis.summary?.document2}</p>
                </div>
              </div>
            </div>

            {/* Overall Assessment */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Assessment</h2>
              <p className="text-gray-700 leading-relaxed">{analysis.analysis.overallAssessment}</p>
            </div>

            {/* Key Differences */}
            {analysis.analysis.keyDifferences && analysis.analysis.keyDifferences.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Differences</h2>
                <div className="space-y-6">
                  {analysis.analysis.keyDifferences.map((diff, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{diff.section}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(diff.riskLevel)}`}>
                          {diff.riskLevel?.toUpperCase()} RISK
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">{analysis.file1Name}:</h4>
                          <p className="text-gray-600 text-sm">{diff.document1}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">{analysis.file2Name}:</h4>
                          <p className="text-gray-600 text-sm">{diff.document2}</p>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-sm text-yellow-800"><strong>Difference:</strong> {diff.difference}</p>
                        <p className="text-sm text-yellow-800 mt-1"><strong>User Impact:</strong> {diff.userImpact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Analysis */}
            {analysis.analysis.riskAnalysis && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Risk Analysis</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Document 1 Risks */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{analysis.file1Name} Risks</h3>
                    <div className="space-y-3">
                      {analysis.analysis.riskAnalysis.document1Risks?.map((risk, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getRiskColor(risk.severity)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(risk.severity)}`}>
                              {risk.severity?.toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 mb-2">{risk.risk}</p>
                          <p className="text-sm text-gray-600">{risk.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document 2 Risks */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{analysis.file2Name} Risks</h3>
                    <div className="space-y-3">
                      {analysis.analysis.riskAnalysis.document2Risks?.map((risk, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getRiskColor(risk.severity)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(risk.severity)}`}>
                              {risk.severity?.toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 mb-2">{risk.risk}</p>
                          <p className="text-sm text-gray-600">{risk.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.analysis.recommendation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FiCheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-semibold text-green-900">AI Recommendations</h2>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-green-900 mb-2">Better for Users:</h3>
                  <p className="text-green-800">
                    {analysis.analysis.recommendation.betterForUsers === 'document1'
                      ? analysis.file1Name
                      : analysis.analysis.recommendation.betterForUsers === 'document2'
                      ? analysis.file2Name
                      : 'Neither document is clearly better'}
                  </p>
                  <p className="text-green-700 mt-2">{analysis.analysis.recommendation.reasoning}</p>
                </div>

                {analysis.analysis.recommendation.keyWarnings && (
                  <div>
                    <h3 className="font-medium text-green-900 mb-3">Key Warnings:</h3>
                    <ul className="space-y-2">
                      {analysis.analysis.recommendation.keyWarnings.map((warning, index) => (
                        <li key={index} className="flex items-start">
                          <FiAlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-green-800">{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Raw Analysis Fallback */}
            {analysis.analysis.rawAnalysis && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Analysis</h2>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-white p-4 rounded border">
                    {analysis.analysis.rawAnalysis}
                  </pre>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              <p>
                Analysis completed on {new Date(analysis.metadata.comparisonDate).toLocaleString()}
                using {analysis.analysis.metadata?.model || 'Gemini AI'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiTOSComparison;
