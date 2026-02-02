import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText, FiLayers, FiEye, FiShield, FiClock } from 'react-icons/fi';

function HomePage() {
  const features = [
    {
      icon: <FiFileText className="h-6 w-6 text-blue-500" />,
      title: 'Document Analysis',
      description: 'Upload and analyze Terms of Service documents to extract and simplify complex legal language.',
      link: '/analyze'
    },
    {
      icon: <FiLayers className="h-6 w-6 text-purple-500" />,
      title: 'Document Comparison',
      description: 'Compare multiple Terms of Service documents to identify differences and similarities.',
      link: '/compare'
    },
    {
      icon: <FiEye className="h-6 w-6 text-green-500" />,
      title: 'Accessibility Tools',
      description: 'Customize your reading experience with text-to-speech, font size adjustments, and contrast modes.',
      link: '/accessibility'
    },
    {
      icon: <FiShield className="h-6 w-6 text-red-500" />,
      title: 'Risk Detection',
      description: 'Automatically identify potentially risky clauses and understand their implications.',
      link: '/analyze'
    },
    {
      icon: <FiClock className="h-6 w-6 text-purple-500" />,
      title: 'Future Predictor',
      description: 'Predict future ToS changes and analyze long-term risks using AI-powered trend analysis.',
      link: '/future-predictor'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl"
          >
            Understand Terms of Service <span className="text-blue-600">Without the Legalese</span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 max-w-xl mx-auto text-xl text-gray-300"
          >
            Our AI-powered tool simplifies complex legal documents, highlights risky clauses, and makes Terms of Service understandable for everyone.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex justify-center"
          >
            <Link
              to="/analyze"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get Started
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="relative bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-700"
              >
                <div className="absolute -top-3 -left-3 bg-gray-700 rounded-full p-3 shadow-md border border-gray-600">
                  {feature.icon}
                </div>
                <h3 className="mt-8 text-lg font-medium text-white">{feature.title}</h3>
                <p className="mt-2 text-base text-gray-300">{feature.description}</p>
                <div className="mt-4">
                  <Link
                    to={feature.link}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Learn more →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default HomePage;
