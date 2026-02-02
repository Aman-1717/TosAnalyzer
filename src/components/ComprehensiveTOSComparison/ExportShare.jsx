import React, { useState } from 'react';
import { FiDownload, FiShare2, FiMail, FiLink, FiFileText, FiImage, FiDatabase, FiCopy, FiCheck } from 'react-icons/fi';

/**
 * Export and Share Component
 * Provides various export formats and sharing options for comparison results
 */
const ExportShare = ({ analysis }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [shareMethod, setShareMethod] = useState('link');
  const [isExporting, setIsExporting] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  if (!analysis?.comprehensiveAnalysis) return null;

  const { comprehensiveAnalysis, file1Name, file2Name } = analysis;

  /**
   * Generate shareable link
   */
  const generateShareLink = () => {
    // Create a shareable summary of the analysis
    const summaryData = {
      file1Name,
      file2Name,
      date: new Date().toISOString(),
      similarity: comprehensiveAnalysis.contentMatching?.overallSimilarity || 0,
      riskLevel: comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 || 'unknown',
      changes: (comprehensiveAnalysis.contentMatching?.uniqueToDoc1 || 0) +
               (comprehensiveAnalysis.contentMatching?.uniqueToDoc2 || 0) +
               (comprehensiveAnalysis.contentMatching?.partialMatches || 0),
      wordCount1: comprehensiveAnalysis.structuralAnalysis?.doc1?.wordCount || 0,
      wordCount2: comprehensiveAnalysis.structuralAnalysis?.doc2?.wordCount || 0
    };

    // Encode the data in the URL
    const encodedData = btoa(JSON.stringify(summaryData));
    const link = `${window.location.origin}/compare?shared=${encodedData}`;
    setShareLink(link);
    return link;
  };

  /**
   * Copy link to clipboard
   */
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  /**
   * Generate HTML report content
   */
  const generateHTMLReport = () => {
    const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TOS Comparison Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .metric-label { font-size: 14px; color: #666; }
        .risk-high { color: #dc2626; }
        .risk-medium { color: #f59e0b; }
        .risk-low { color: #16a34a; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; }
        .changes { background-color: #fef3c7; padding: 15px; border-radius: 8px; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Terms of Service Comparison Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Document 1:</strong> ${file1Name}</p>
        <p><strong>Document 2:</strong> ${file2Name}</p>
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        <div class="metric">
            <div class="metric-value">${comprehensiveAnalysis.contentMatching?.overallSimilarity || 0}%</div>
            <div class="metric-label">Overall Similarity</div>
        </div>
        <div class="metric">
            <div class="metric-value risk-${comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 || 'low'}">${comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2?.toUpperCase() || 'UNKNOWN'}</div>
            <div class="metric-label">Risk Level</div>
        </div>
        <div class="metric">
            <div class="metric-value">${(comprehensiveAnalysis.contentMatching?.uniqueToDoc1 || 0) + (comprehensiveAnalysis.contentMatching?.uniqueToDoc2 || 0) + (comprehensiveAnalysis.contentMatching?.partialMatches || 0)}</div>
            <div class="metric-label">Total Changes</div>
        </div>
    </div>

    <div class="section">
        <h2>Content Analysis</h2>
        <table>
            <tr><th>Metric</th><th>Document 1 (${file1Name})</th><th>Document 2 (${file2Name})</th><th>Change</th></tr>
            <tr>
                <td>Word Count</td>
                <td>${comprehensiveAnalysis.structuralAnalysis?.doc1?.wordCount?.toLocaleString() || 'N/A'}</td>
                <td>${comprehensiveAnalysis.structuralAnalysis?.doc2?.wordCount?.toLocaleString() || 'N/A'}</td>
                <td>${comprehensiveAnalysis.structuralAnalysis?.comparison?.wordCountChange || 0}</td>
            </tr>
            <tr>
                <td>Readability Score</td>
                <td>${comprehensiveAnalysis.readabilityAnalysis?.doc1?.fleschScore || 'N/A'}</td>
                <td>${comprehensiveAnalysis.readabilityAnalysis?.doc2?.fleschScore || 'N/A'}</td>
                <td>${comprehensiveAnalysis.readabilityAnalysis?.comparison?.fleschScoreDifference || 0}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>Risk Assessment</h2>
        <h3>Document 1 (${file1Name}) Risks:</h3>
        <ul>
            ${comprehensiveAnalysis.riskAssessment?.doc1Risks?.map(risk =>
                `<li><strong>${risk.type}</strong> (${risk.riskLevel}): ${risk.description}</li>`
            ).join('') || '<li>No risks identified</li>'}
        </ul>
        <h3>Document 2 (${file2Name}) Risks:</h3>
        <ul>
            ${comprehensiveAnalysis.riskAssessment?.doc2Risks?.map(risk =>
                `<li><strong>${risk.type}</strong> (${risk.riskLevel}): ${risk.description}</li>`
            ).join('') || '<li>No risks identified</li>'}
        </ul>
    </div>

    <div class="section changes">
        <h2>Key Changes</h2>
        <p><strong>Exact Matches:</strong> ${comprehensiveAnalysis.contentMatching?.exactMatches || 0}</p>
        <p><strong>Partial Matches:</strong> ${comprehensiveAnalysis.contentMatching?.partialMatches || 0}</p>
        <p><strong>Content Unique to Document 1:</strong> ${comprehensiveAnalysis.contentMatching?.uniqueToDoc1 || 0}</p>
        <p><strong>Content Unique to Document 2:</strong> ${comprehensiveAnalysis.contentMatching?.uniqueToDoc2 || 0}</p>
    </div>

    <div class="footer">
        <p>This report was generated by TosDetective - Advanced Document Comparison System</p>
        <p>Report generated on ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;
    return reportHTML;
  };

  /**
   * Export as PDF (HTML format for now)
   */
  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      // Generate HTML report
      const htmlContent = generateHTMLReport();

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tos-comparison-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Report downloaded successfully! Open the HTML file in your browser to view or print as PDF.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export as Excel (CSV format)
   */
  const exportAsExcel = async () => {
    setIsExporting(true);
    try {
      // Create comprehensive CSV data
      const csvData = [
        ['TOS Comparison Report'],
        ['Generated:', new Date().toLocaleDateString()],
        ['Document 1:', file1Name],
        ['Document 2:', file2Name],
        [''],
        ['SUMMARY METRICS'],
        ['Metric', 'Document 1 (' + file1Name + ')', 'Document 2 (' + file2Name + ')', 'Change'],
        ['Word Count',
         comprehensiveAnalysis.structuralAnalysis?.doc1?.wordCount || 0,
         comprehensiveAnalysis.structuralAnalysis?.doc2?.wordCount || 0,
         comprehensiveAnalysis.structuralAnalysis?.comparison?.wordCountChange || 0],
        ['Sentence Count',
         comprehensiveAnalysis.structuralAnalysis?.doc1?.sentenceCount || 0,
         comprehensiveAnalysis.structuralAnalysis?.doc2?.sentenceCount || 0,
         comprehensiveAnalysis.structuralAnalysis?.comparison?.sentenceCountChange || 0],
        ['Readability Score',
         comprehensiveAnalysis.readabilityAnalysis?.doc1?.fleschScore || 0,
         comprehensiveAnalysis.readabilityAnalysis?.doc2?.fleschScore || 0,
         comprehensiveAnalysis.readabilityAnalysis?.comparison?.fleschScoreDifference || 0],
        ['Risk Level',
         comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc1 || 'unknown',
         comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 || 'unknown',
         'See risk analysis below'],
        ['Overall Similarity', '', comprehensiveAnalysis.contentMatching?.overallSimilarity + '%' || '0%', ''],
        [''],
        ['CONTENT MATCHING'],
        ['Type', 'Count', 'Description'],
        ['Exact Matches', comprehensiveAnalysis.contentMatching?.exactMatches || 0, 'Identical content in both documents'],
        ['Partial Matches', comprehensiveAnalysis.contentMatching?.partialMatches || 0, 'Similar but modified content'],
        ['Unique to Document 1', comprehensiveAnalysis.contentMatching?.uniqueToDoc1 || 0, 'Content only in Document 1 (' + file1Name + ')'],
        ['Unique to Document 2', comprehensiveAnalysis.contentMatching?.uniqueToDoc2 || 0, 'Content only in Document 2 (' + file2Name + ')'],
        [''],
        ['RISK ANALYSIS - Document 1 (' + file1Name + ')'],
        ['Risk Type', 'Risk Level', 'Description']
      ];

      // Add risks for document 1
      if (comprehensiveAnalysis.riskAssessment?.doc1Risks) {
        comprehensiveAnalysis.riskAssessment.doc1Risks.forEach(risk => {
          csvData.push([risk.type, risk.riskLevel, risk.description]);
        });
      }

      csvData.push(['']);
      csvData.push(['RISK ANALYSIS - Document 2 (' + file2Name + ')']);
      csvData.push(['Risk Type', 'Risk Level', 'Description']);

      // Add risks for document 2
      if (comprehensiveAnalysis.riskAssessment?.doc2Risks) {
        comprehensiveAnalysis.riskAssessment.doc2Risks.forEach(risk => {
          csvData.push([risk.type, risk.riskLevel, risk.description]);
        });
      }

      // Add key terms analysis
      csvData.push(['']);
      csvData.push(['KEY TERMS ANALYSIS']);
      csvData.push(['Term', 'Document 1 (' + file1Name + ') Count', 'Document 2 (' + file2Name + ') Count', 'Difference']);

      if (comprehensiveAnalysis.keyTermsAnalysis?.termComparison) {
        Object.entries(comprehensiveAnalysis.keyTermsAnalysis.termComparison).forEach(([term, data]) => {
          if (data.doc1Count > 0 || data.doc2Count > 0) {
            csvData.push([term, data.doc1Count, data.doc2Count, data.difference]);
          }
        });
      }

      // Convert to CSV and download
      const csvContent = csvData.map(row =>
        row.map(cell =>
          typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
        ).join(',')
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tos-comparison-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Excel data exported successfully! Open the CSV file in Excel or Google Sheets.');
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Excel export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Send email report
   */
  const sendEmailReport = () => {
    const subject = encodeURIComponent(`TOS Comparison Report: ${file1Name} vs ${file2Name}`);

    // Create detailed email body
    const emailBody = `
TOS COMPARISON REPORT
=====================

Documents Analyzed:
📄 Document 1: ${file1Name}
📄 Document 2: ${file2Name}
📅 Analysis Date: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
=================
🔍 Overall Similarity: ${comprehensiveAnalysis.contentMatching?.overallSimilarity || 0}%
⚠️ Risk Level: ${comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2?.toUpperCase() || 'UNKNOWN'}
📊 Total Changes: ${(comprehensiveAnalysis.contentMatching?.uniqueToDoc1 || 0) +
                   (comprehensiveAnalysis.contentMatching?.uniqueToDoc2 || 0) +
                   (comprehensiveAnalysis.contentMatching?.partialMatches || 0)}

DOCUMENT METRICS
================
📝 Word Count Change: ${comprehensiveAnalysis.structuralAnalysis?.doc1?.wordCount || 0} → ${comprehensiveAnalysis.structuralAnalysis?.doc2?.wordCount || 0}
📖 Readability Score: ${comprehensiveAnalysis.readabilityAnalysis?.doc1?.fleschScore || 'N/A'} → ${comprehensiveAnalysis.readabilityAnalysis?.doc2?.fleschScore || 'N/A'}

CONTENT CHANGES
===============
✅ Exact Matches: ${comprehensiveAnalysis.contentMatching?.exactMatches || 0}
🔄 Partial Matches: ${comprehensiveAnalysis.contentMatching?.partialMatches || 0}
➕ Added Content: ${comprehensiveAnalysis.contentMatching?.uniqueToDoc2 || 0} sections
➖ Removed Content: ${comprehensiveAnalysis.contentMatching?.uniqueToDoc1 || 0} sections

RISK ASSESSMENT
===============
${comprehensiveAnalysis.riskAssessment?.doc2Risks?.map(risk =>
  `⚠️ ${risk.type} (${risk.riskLevel.toUpperCase()}): ${risk.description}`
).join('\n') || 'No significant risks identified.'}

RECOMMENDATIONS
===============
${comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 === 'high' ?
  '🚨 HIGH PRIORITY: Review and address high-risk clauses immediately.' :
  '✅ MODERATE PRIORITY: Consider reviewing flagged items when convenient.'}

For detailed analysis and interactive charts, visit:
🔗 ${shareLink || generateShareLink()}

---
Generated by TOS Analyzer - Advanced Document Comparison System
Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
    `;

    const body = encodeURIComponent(emailBody);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  /**
   * Render export options
   */
  const renderExportOptions = () => {
    const exportOptions = [
      { id: 'pdf', label: 'PDF Report', icon: FiFileText, description: 'Comprehensive PDF report with all analysis' },
      { id: 'excel', label: 'Excel Data', icon: FiDatabase, description: 'Spreadsheet with comparison metrics' },
      { id: 'json', label: 'JSON Data', icon: FiFileText, description: 'Raw analysis data in JSON format' },
      { id: 'image', label: 'Summary Image', icon: FiImage, description: 'Visual summary as PNG image' }
    ];

    return (
      <div className="space-y-3">
        {exportOptions.map(option => (
          <label key={option.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
            <input
              type="radio"
              name="exportFormat"
              value={option.id}
              checked={exportFormat === option.id}
              onChange={(e) => setExportFormat(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <option.icon className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <div className="text-white font-medium">{option.label}</div>
              <div className="text-gray-400 text-sm">{option.description}</div>
            </div>
          </label>
        ))}
      </div>
    );
  };

  /**
   * Render share options
   */
  const renderShareOptions = () => {
    const shareOptions = [
      { id: 'link', label: 'Shareable Link', icon: FiLink, description: 'Generate a link to view this comparison' },
      { id: 'email', label: 'Email Report', icon: FiMail, description: 'Send summary via email' }
    ];

    return (
      <div className="space-y-3">
        {shareOptions.map(option => (
          <label key={option.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
            <input
              type="radio"
              name="shareMethod"
              value={option.id}
              checked={shareMethod === option.id}
              onChange={(e) => setShareMethod(e.target.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <option.icon className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <div className="text-white font-medium">{option.label}</div>
              <div className="text-gray-400 text-sm">{option.description}</div>
            </div>
          </label>
        ))}
      </div>
    );
  };

  /**
   * Export as JSON
   */
  const exportAsJSON = async () => {
    setIsExporting(true);
    try {
      const jsonData = {
        reportTitle: `TOS Comparison Report: ${file1Name} vs ${file2Name}`,
        generatedDate: new Date().toISOString(),
        documents: {
          document1: file1Name,
          document2: file2Name
        },
        summary: {
          overallSimilarity: comprehensiveAnalysis.contentMatching?.overallSimilarity || 0,
          riskLevel: comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 || 'unknown',
          totalChanges: (comprehensiveAnalysis.contentMatching?.uniqueToDoc1 || 0) +
                       (comprehensiveAnalysis.contentMatching?.uniqueToDoc2 || 0) +
                       (comprehensiveAnalysis.contentMatching?.partialMatches || 0)
        },
        detailedAnalysis: comprehensiveAnalysis,
        metadata: {
          exportFormat: 'JSON',
          exportDate: new Date().toISOString(),
          version: '1.0'
        }
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tos-comparison-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('JSON data exported successfully!');
    } catch (error) {
      console.error('JSON export failed:', error);
      alert('JSON export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export as Summary Image (SVG)
   */
  const exportAsSummaryImage = async () => {
    setIsExporting(true);
    try {
      // Create SVG content for summary image
      const svgContent = `
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .title { font: bold 24px Arial; fill: #1f2937; }
      .subtitle { font: 16px Arial; fill: #4b5563; }
      .metric-label { font: 14px Arial; fill: #6b7280; }
      .metric-value { font: bold 20px Arial; fill: #2563eb; }
      .risk-high { fill: #dc2626; }
      .risk-medium { fill: #f59e0b; }
      .risk-low { fill: #16a34a; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="#f9fafb" stroke="#e5e7eb" stroke-width="2"/>

  <!-- Header -->
  <text x="400" y="40" text-anchor="middle" class="title">TOS Comparison Summary</text>
  <text x="400" y="65" text-anchor="middle" class="subtitle">${file1Name} vs ${file2Name}</text>
  <text x="400" y="85" text-anchor="middle" class="subtitle">Generated: ${new Date().toLocaleDateString()}</text>

  <!-- Similarity Circle -->
  <circle cx="200" cy="180" r="60" fill="none" stroke="#e5e7eb" stroke-width="8"/>
  <circle cx="200" cy="180" r="60" fill="none" stroke="#2563eb" stroke-width="8"
          stroke-dasharray="${(comprehensiveAnalysis.contentMatching?.overallSimilarity || 0) * 3.77}, 377"
          stroke-dashoffset="94.25" transform="rotate(-90 200 180)"/>
  <text x="200" y="175" text-anchor="middle" class="metric-value">${comprehensiveAnalysis.contentMatching?.overallSimilarity || 0}%</text>
  <text x="200" y="195" text-anchor="middle" class="metric-label">Similarity</text>

  <!-- Risk Level -->
  <rect x="320" y="140" width="120" height="80" fill="${
    comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 === 'high' ? '#fef2f2' :
    comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 === 'medium' ? '#fffbeb' : '#f0fdf4'
  }" stroke="${
    comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 === 'high' ? '#dc2626' :
    comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 === 'medium' ? '#f59e0b' : '#16a34a'
  }" stroke-width="2" rx="8"/>
  <text x="380" y="170" text-anchor="middle" class="metric-value ${
    comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 === 'high' ? 'risk-high' :
    comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 === 'medium' ? 'risk-medium' : 'risk-low'
  }">${(comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 || 'LOW').toUpperCase()}</text>
  <text x="380" y="190" text-anchor="middle" class="metric-label">Risk Level</text>
  <text x="380" y="210" text-anchor="middle" class="metric-label">Document 2</text>

  <!-- Changes Count -->
  <rect x="480" y="140" width="120" height="80" fill="#eff6ff" stroke="#2563eb" stroke-width="2" rx="8"/>
  <text x="540" y="170" text-anchor="middle" class="metric-value">${
    (comprehensiveAnalysis.contentMatching?.uniqueToDoc1 || 0) +
    (comprehensiveAnalysis.contentMatching?.uniqueToDoc2 || 0) +
    (comprehensiveAnalysis.contentMatching?.partialMatches || 0)
  }</text>
  <text x="540" y="190" text-anchor="middle" class="metric-label">Total</text>
  <text x="540" y="210" text-anchor="middle" class="metric-label">Changes</text>

  <!-- Content Breakdown -->
  <text x="50" y="300" class="subtitle">Content Analysis:</text>
  <text x="50" y="330" class="metric-label">• Exact Matches: ${comprehensiveAnalysis.contentMatching?.exactMatches || 0}</text>
  <text x="50" y="350" class="metric-label">• Partial Matches: ${comprehensiveAnalysis.contentMatching?.partialMatches || 0}</text>
  <text x="50" y="370" class="metric-label">• Unique to Document 1: ${comprehensiveAnalysis.contentMatching?.uniqueToDoc1 || 0}</text>
  <text x="50" y="390" class="metric-label">• Unique to Document 2: ${comprehensiveAnalysis.contentMatching?.uniqueToDoc2 || 0}</text>

  <!-- Document Stats -->
  <text x="450" y="300" class="subtitle">Document Statistics:</text>
  <text x="450" y="330" class="metric-label">Document 1: ${comprehensiveAnalysis.structuralAnalysis?.doc1?.wordCount?.toLocaleString() || 'N/A'} words</text>
  <text x="450" y="350" class="metric-label">Document 2: ${comprehensiveAnalysis.structuralAnalysis?.doc2?.wordCount?.toLocaleString() || 'N/A'} words</text>
  <text x="450" y="370" class="metric-label">Readability 1: ${comprehensiveAnalysis.readabilityAnalysis?.doc1?.fleschScore || 'N/A'}</text>
  <text x="450" y="390" class="metric-label">Readability 2: ${comprehensiveAnalysis.readabilityAnalysis?.doc2?.fleschScore || 'N/A'}</text>

  <!-- Footer -->
  <text x="400" y="550" text-anchor="middle" class="metric-label">Generated by TosDetective - Advanced Document Comparison System</text>
  <text x="400" y="570" text-anchor="middle" class="metric-label">Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</text>
</svg>`;

      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tos-comparison-summary-${new Date().toISOString().split('T')[0]}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Summary image exported successfully! You can open the SVG file in any browser or convert to PNG.');
    } catch (error) {
      console.error('Image export failed:', error);
      alert('Image export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle export action
   */
  const handleExport = async () => {
    switch (exportFormat) {
      case 'pdf':
        await exportAsPDF();
        break;
      case 'excel':
        await exportAsExcel();
        break;
      case 'json':
        await exportAsJSON();
        break;
      case 'image':
        await exportAsSummaryImage();
        break;
      default:
        await exportAsPDF();
    }
  };

  /**
   * Handle share action
   */
  const handleShare = () => {
    switch (shareMethod) {
      case 'link':
        const link = generateShareLink();
        copyToClipboard(link);
        break;
      case 'email':
        if (!shareLink) {
          generateShareLink();
        }
        sendEmailReport();
        break;
      default:
        generateShareLink();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700 rounded-lg p-6">
        <div className="flex items-center mb-2">
          <FiShare2 className="h-6 w-6 text-green-400 mr-2" />
          <h2 className="text-xl font-semibold text-white">Export & Share</h2>
        </div>
        <p className="text-gray-300">
          Export your comparison results or share them with others
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FiDownload className="h-5 w-5 text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Export Report</h3>
          </div>

          {renderExportOptions()}

          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`
              w-full mt-4 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2
              ${isExporting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FiDownload className="h-4 w-4" />
                <span>Export {exportFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>

        {/* Share Section */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <FiShare2 className="h-5 w-5 text-green-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Share Results</h3>
          </div>

          {renderShareOptions()}

          {shareMethod === 'link' && shareLink && (
            <div className="mt-4 p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate mr-2">{shareLink}</span>
                <button
                  onClick={() => copyToClipboard(shareLink)}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs text-gray-300 transition-colors"
                >
                  {copied ? <FiCheck className="h-3 w-3" /> : <FiCopy className="h-3 w-3" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleShare}
            className="w-full mt-4 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {shareMethod === 'link' ? <FiLink className="h-4 w-4" /> : <FiMail className="h-4 w-4" />}
            <span>{shareMethod === 'link' ? 'Generate Link' : 'Send Email'}</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setExportFormat('pdf');
              handleExport();
            }}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FiFileText className="h-4 w-4" />
            <span>Quick PDF</span>
          </button>

          <button
            onClick={() => {
              setShareMethod('link');
              handleShare();
            }}
            className="flex items-center justify-center space-x-2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <FiLink className="h-4 w-4" />
            <span>Quick Link</span>
          </button>

          <button
            onClick={() => {
              setShareMethod('email');
              handleShare();
            }}
            className="flex items-center justify-center space-x-2 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <FiMail className="h-4 w-4" />
            <span>Quick Email</span>
          </button>
        </div>
      </div>

      {/* Export Summary */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Report Summary</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Documents</h4>
            <div className="space-y-1 text-sm text-gray-400">
              <div>Document 1: {file1Name}</div>
              <div>Document 2: {file2Name}</div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Key Metrics</h4>
            <div className="space-y-1 text-sm text-gray-400">
              <div>Similarity: {comprehensiveAnalysis.contentMatching?.overallSimilarity || 0}%</div>
              <div>Risk Level: {comprehensiveAnalysis.riskAssessment?.overallRiskLevel?.doc2 || 'Unknown'}</div>
              <div>Generated: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportShare;
