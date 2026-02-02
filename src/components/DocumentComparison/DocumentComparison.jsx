import { useState } from 'react';
import FileUpload from '../FileUpload/FileUpload';

function DocumentComparison() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  const handleFileProcessed = (data) => {
    // Add the processed document to our list
    const newDocument = {
      id: Date.now(),
      name: data.fileName || `Document ${documents.length + 1}`,
      text: data.text,
      simplifiedText: data.simplifiedText,
      riskyClauses: data.riskyClauses
    };
    
    setDocuments([...documents, newDocument]);
  };

  const compareDocuments = () => {
    if (documents.length < 2) return;
    
    // For this example, we'll just compare the first two documents
    const doc1 = documents[0];
    const doc2 = documents[1];
    
    // Simple comparison - count risky clauses by type
    const riskComparison = {};
    
    // Process first document
    doc1.riskyClauses.forEach(clause => {
      if (!riskComparison[clause.type]) {
        riskComparison[clause.type] = { doc1: 0, doc2: 0 };
      }
      riskComparison[clause.type].doc1++;
    });
    
    // Process second document
    doc2.riskyClauses.forEach(clause => {
      if (!riskComparison[clause.type]) {
        riskComparison[clause.type] = { doc1: 0, doc2: 0 };
      }
      riskComparison[clause.type].doc2++;
    });
    
    // Calculate text similarity (very basic)
    const textSimilarity = calculateSimilarity(doc1.text, doc2.text);
    
    setComparisonResult({
      riskComparison,
      textSimilarity,
      doc1Name: doc1.name,
      doc2Name: doc2.name
    });
  };
  
  // Very basic text similarity calculation
  const calculateSimilarity = (text1, text2) => {
    // Count words in common
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    let commonWords = 0;
    words1.forEach(word => {
      if (words2.has(word)) commonWords++;
    });
    
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    return Math.round((commonWords / totalUniqueWords) * 100);
  };

  const removeDocument = (id) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    setComparisonResult(null);
  };

  return (
    <div className="w-full mt-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Document Comparison</h2>
        <p className="text-gray-600 mb-4">
          Upload multiple documents to compare their terms and risky clauses.
        </p>
        
        <FileUpload 
          onFileProcessed={handleFileProcessed} 
          setIsLoading={setIsLoading} 
        />
        
        {documents.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Uploaded Documents</h3>
            <ul className="divide-y divide-gray-200">
              {documents.map(doc => (
                <li key={doc.id} className="py-3 flex justify-between items-center">
                  <span>{doc.name}</span>
                  <button 
                    onClick={() => removeDocument(doc.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            
            {documents.length >= 2 && (
              <button
                onClick={compareDocuments}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Compare Documents
              </button>
            )}
          </div>
        )}
        
        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Processing document...</p>
          </div>
        )}
        
        {comparisonResult && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Comparison Results</h3>
            
            <div className="mb-4">
              <p className="font-medium">Text Similarity: {comparisonResult.textSimilarity}%</p>
              <p className="text-sm text-gray-600">
                This indicates how similar the overall text content is between documents.
              </p>
            </div>
            
            <h4 className="font-medium mb-2">Risky Clauses Comparison</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {comparisonResult.doc1Name}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {comparisonResult.doc2Name}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difference
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(comparisonResult.riskComparison).map(([type, counts]) => (
                    <tr key={type}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {counts.doc1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {counts.doc2}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={
                          counts.doc1 > counts.doc2 ? 'text-red-500' : 
                          counts.doc1 < counts.doc2 ? 'text-green-500' : 'text-gray-500'
                        }>
                          {counts.doc1 - counts.doc2}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentComparison;