import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiFile, FiTrash2, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function HistoryPage() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load documents from localStorage
    const storedHistory = localStorage.getItem('documentHistory');
    if (storedHistory) {
      try {
        setDocuments(JSON.parse(storedHistory));
      } catch (error) {
        console.error('Error parsing document history:', error);
      }
    }
  }, []);

  const viewDocument = (document) => {
    // Store the selected document for the accessibility page
    localStorage.setItem('analyzedDocument', JSON.stringify(document));
    navigate('/accessibility');
  };

  const deleteDocument = (id) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    setDocuments(updatedDocuments);
    localStorage.setItem('documentHistory', JSON.stringify(updatedDocuments));
  };

  const clearHistory = () => {
    setDocuments([]);
    localStorage.removeItem('documentHistory');
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-white"
          >
            Document History
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-lg text-gray-300"
          >
            View and access your previously analyzed documents
          </motion.p>
        </div>

        {documents.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <FiClock className="h-6 w-6 text-blue-500 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Documents</h2>
                </div>
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-4">
                {documents.map(doc => (
                  <div 
                    key={doc.id} 
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center">
                        <FiFile className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="font-medium text-gray-900 dark:text-white">{doc.fileName}</h3>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Analyzed on {formatDate(doc.timestamp)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewDocument(doc)}
                        className="p-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View in Accessibility Mode"
                      >
                        <FiEye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <FiFile className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents in history</h3>
            <p className="text-gray-500 dark:text-gray-400">
              When you analyze documents, they will appear here for easy access.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default HistoryPage;