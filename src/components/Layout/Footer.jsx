import { FiGithub, FiHeart } from 'react-icons/fi';
import { useAccessibility } from '../../contexts/AccessibilityContext';

function Footer() {
  const { getTextClasses, getAnimationClasses } = useAccessibility();

  return (
    <footer className={`bg-white dark:bg-gray-800 shadow-inner py-6 ${getAnimationClasses()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className={`text-gray-600 dark:text-gray-300 text-sm ${getTextClasses()}`}>
              © {new Date().getFullYear()} TosDetective. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="GitHub"
            >
              <FiGithub className="h-5 w-5" />
            </a>
            <span className={`flex items-center text-gray-500 dark:text-gray-400 text-sm ${getTextClasses()}`}>
              Made with <FiHeart className="h-4 w-4 mx-1 text-red-500" /> for simplicity
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;