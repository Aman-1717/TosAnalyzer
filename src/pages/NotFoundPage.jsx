import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiHome } from 'react-icons/fi';

function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]"
    >
      <FiAlertCircle className="text-red-500 w-20 h-20 mb-6" />
      
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 text-center">
        Page Not Found
      </h1>
      
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <Link 
        to="/"
        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FiHome className="mr-2" />
        Back to Home
      </Link>
    </motion.div>
  );
}

export default NotFoundPage;