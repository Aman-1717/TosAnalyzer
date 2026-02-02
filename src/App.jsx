import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/clerk-react';
import { SignInWrapper, SignUpWrapper } from './components/Auth/ClerkAuthWrapper';
import { AccessibilityProvider, useAccessibility } from './contexts/AccessibilityContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import ComparePage from './pages/ComparePage';
import FuturePredictorPage from './pages/FuturePredictorPage';
import AccessibilityPage from './pages/AccessibilityPage';
import HistoryPage from './pages/HistoryPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

// Inner App component that uses accessibility context
function AppContent() {
  const { getThemeClasses, getTextClasses, getAnimationClasses } = useAccessibility();

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 ${getThemeClasses()} ${getTextClasses()} ${getAnimationClasses()}`}>
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Analyze route - temporarily made public for testing */}
            <Route path="/analyze" element={<AnalyzePage />} />

            {/* Compare route - temporarily made public for testing */}
            <Route path="/compare" element={<ComparePage />} />

            {/* Future Predictor route */}
            <Route path="/future-predictor" element={<FuturePredictorPage />} />

            <Route path="/accessibility" element={<AccessibilityPage />} />

            {/* History route - temporarily made public for testing */}
            <Route path="/history" element={<HistoryPage />} />

            <Route path="/sign-in/*" element={<SignInWrapper />} />
            <Route path="/sign-up/*" element={<SignUpWrapper />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AccessibilityProvider>
      <AppContent />
    </AccessibilityProvider>
  );
}

export default App;





