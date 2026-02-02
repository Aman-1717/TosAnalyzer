import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX, FiLoader, FiZap, FiAlertTriangle, FiSearch, FiFilter, FiBarChart2, FiEye, FiCpu, FiClock, FiShare2, FiBookOpen } from 'react-icons/fi';
import { formatFileSize, getFileTypeDisplay } from '../../services/tosComparisonApi';
import SummaryReport from './SummaryReport';
import SideBySideView from './SideBySideView';
import VisualizationDashboard from './VisualizationDashboard';
import SearchAndFilter from './SearchAndFilter';
import AdvancedAnalytics from './AdvancedAnalytics';
import InteractiveTimeline from './InteractiveTimeline';
import ExportShare from './ExportShare';
import PlainEnglishTranslator from './PlainEnglishTranslator';

/**
 * Comprehensive TOS Comparison Component
 * Implements all advanced comparison features including content matching,
 * risk assessment, readability analysis, and interactive visualizations
 */
const ComprehensiveTOSComparison = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('summary'); // summary, sidebyside, visualizations, analytics, timeline, export
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
   * Handle comprehensive comparison
   */
  const handleComprehensiveCompare = async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/compare-comprehensive`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      setAnalysis(result);
      setActiveView('summary'); // Start with summary view

      // Store the analyzed documents for accessibility features
      try {
        // Create a combined document for accessibility features
        const combinedDocument = {
          fileName: `Comparison: ${file1.name} vs ${file2.name}`,
          originalText: `Document 1 (${file1.name}):\n\n${result.metadata?.file1Text || 'Text not available'}\n\n\n` +
                       `Document 2 (${file2.name}):\n\n${result.metadata?.file2Text || 'Text not available'}`,
          simplifiedText: result.aiInsights?.summary?.document1 && result.aiInsights?.summary?.document2
            ? `Document 1 Summary:\n${result.aiInsights.summary.document1}\n\n` +
              `Document 2 Summary:\n${result.aiInsights.summary.document2}\n\n` +
              `Key Differences:\n${result.aiInsights.keyDifferences?.map(diff =>
                `• ${diff.section}: ${diff.difference}`).join('\n') || 'No differences analyzed'}`
            : `Comparison Analysis:\n\nFile 1: ${result.file1Name}\nFile 2: ${result.file2Name}\n\n` +
              `Analysis completed on ${new Date().toLocaleDateString()}`,
          riskyClauses: result.aiInsights?.riskAnalysis ? [
            ...result.aiInsights.riskAnalysis.document1Risks?.map(risk => ({
              clause: risk.risk,
              risk: risk.severity,
              explanation: `Document 1: ${risk.explanation}`
            })) || [],
            ...result.aiInsights.riskAnalysis.document2Risks?.map(risk => ({
              clause: risk.risk,
              risk: risk.severity,
              explanation: `Document 2: ${risk.explanation}`
            })) || []
          ] : [],
          summary: result.aiInsights?.overallAssessment || 'Comparison analysis completed successfully.',
          comparisonData: result // Store the full comparison data
        };

        localStorage.setItem('analyzedDocument', JSON.stringify(combinedDocument));
        console.log('Stored comparison document for accessibility features');
      } catch (storageError) {
        console.error('Error storing document for accessibility:', storageError);
      }
    } catch (err) {
      console.error('Analysis error:', err);
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
    setActiveView('summary');
    setSearchTerm('');
    setSelectedCategory('all');
  };

  /**
   * Render file upload area
   */
  const renderFileUpload = (dropzone, file, fileNumber, title) => {
    const { getRootProps, getInputProps, isDragActive } = dropzone;

    return (
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
        
        {!file ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-400 bg-blue-900/20' 
                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-300 mb-2">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
            </p>
            <p className="text-sm text-gray-400 mb-4">or click to select</p>
            <p className="text-xs text-gray-500">
              Supports PDF and TXT files (max 10MB)
            </p>
          </div>
        ) : (
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiFile className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="font-medium text-white truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {getFileTypeDisplay(file.type)} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(fileNumber)}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                title="Remove file"
              >
                <FiX className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render view navigation tabs
   */
  const renderViewTabs = () => {
    const tabs = [
      { id: 'summary', label: 'Summary Report', icon: FiBarChart2 },
      { id: 'sidebyside', label: 'Side-by-Side', icon: FiEye },
      { id: 'visualizations', label: 'Visualizations', icon: FiBarChart2 },
      { id: 'analytics', label: 'AI Analytics', icon: FiCpu },
      { id: 'timeline', label: 'Timeline', icon: FiClock },
      { id: 'plainenglish', label: 'Plain English', icon: FiBookOpen, badge: 'NEW' },
      { id: 'export', label: 'Export & Share', icon: FiShare2 }
    ];

    return (
      <div className="flex flex-wrap gap-1 bg-gray-800 p-1 rounded-lg mb-6">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors relative
              ${activeView === id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            {badge && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded-full font-bold">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

  /**
   * Render analysis results based on active view
   */
  const renderAnalysisResults = () => {
    if (!analysis) return null;

    const commonProps = {
      analysis,
      searchTerm,
      selectedCategory,
      onSearchChange: setSearchTerm,
      onCategoryChange: setSelectedCategory
    };

    switch (activeView) {
      case 'summary':
        return <SummaryReport {...commonProps} />;
      case 'sidebyside':
        return <SideBySideView {...commonProps} />;
      case 'visualizations':
        return <VisualizationDashboard {...commonProps} />;
      case 'analytics':
        return <AdvancedAnalytics {...commonProps} />;
      case 'timeline':
        return <InteractiveTimeline {...commonProps} />;
      case 'plainenglish':
        return <PlainEnglishTranslator analysis={analysis} />;
      case 'export':
        return <ExportShare {...commonProps} />;
      default:
        return <SummaryReport {...commonProps} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FiZap className="h-8 w-8 text-purple-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">
              Comprehensive TOS Analysis
            </h1>
          </div>
          <p className="text-gray-300">
            Advanced document comparison with content matching, risk assessment, readability analysis, 
            clause categorization, and interactive visualizations.
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {renderFileUpload(dropzone1, file1, 1, "Document 1")}
            {renderFileUpload(dropzone2, file2, 2, "Document 2")}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FiAlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleComprehensiveCompare}
              disabled={!file1 || !file2 || isAnalyzing}
              className={`
                px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2
                ${file1 && file2 && !isAnalyzing
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isAnalyzing ? (
                <>
                  <FiLoader className="h-5 w-5 animate-spin" />
                  <span>Performing Comprehensive Analysis...</span>
                </>
              ) : (
                <>
                  <FiZap className="h-5 w-5" />
                  <span>Start Comprehensive Analysis</span>
                </>
              )}
            </button>

            {(file1 || file2 || analysis) && (
              <button
                onClick={resetComparison}
                className="px-6 py-3 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <SearchAndFilter
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              onSearchChange={setSearchTerm}
              onCategoryChange={setSelectedCategory}
            />

            {/* View Navigation */}
            {renderViewTabs()}

            {/* Analysis Content */}
            {renderAnalysisResults()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveTOSComparison;
