import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { FiLogIn, FiSearch } from 'react-icons/fi';
import { useAccessibility } from '../../contexts/AccessibilityContext';

function Navbar() {
  const { getTextClasses, getAnimationClasses } = useAccessibility();

  return (
    <header className={`bg-gray-800 shadow-lg py-5 ${getAnimationClasses()}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 w-full">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className={`flex items-center text-white text-2xl font-bold ${getTextClasses()} hover:text-blue-400 transition-colors`}>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <FiSearch className="h-8 w-8 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-extrabold">
                Tos<span className="text-yellow-400">Detective</span>
              </span>
            </div>
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-12">
            <Link to="/" className={`text-gray-300 hover:text-white transition-colors text-lg font-medium ${getTextClasses()}`}>
              Home
            </Link>
            <Link to="/analyze" className={`text-gray-300 hover:text-white transition-colors text-lg font-medium ${getTextClasses()}`}>
              Analyze
            </Link>
            <Link to="/compare" className={`text-gray-300 hover:text-white transition-colors text-lg font-medium ${getTextClasses()}`}>
              Compare
            </Link>
            <Link to="/future-predictor" className={`text-gray-300 hover:text-white transition-colors text-lg font-medium ${getTextClasses()}`}>
              Future Predictor
            </Link>
            <Link to="/accessibility" className={`text-gray-300 hover:text-white transition-colors text-lg font-medium ${getTextClasses()}`}>
              Accessibility
            </Link>
            <SignedIn>
              <Link to="/history" className={`text-gray-300 hover:text-white transition-colors text-lg font-medium ${getTextClasses()}`}>
                History
              </Link>
            </SignedIn>
          </nav>
          
          {/* Auth Buttons */}
          <div className="flex items-center">
            <SignedOut>
              <Link to="/sign-in" className={`flex items-center text-gray-300 hover:text-white transition-colors text-lg font-medium ${getTextClasses()}`}>
                <FiLogIn className="mr-2" />
                Sign In
              </Link>
            </SignedOut>
            
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

