import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { UsageProvider, useUsage } from './context/UsageContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SummaryPage from './pages/SummaryPage';
import QuizPage from './pages/QuizPage';
import ChatCoach from './pages/ChatCoach';
import StudyPlanner from './pages/StudyPlanner';
import SettingsPage from './pages/SettingsPage';
import PricingPage from './pages/PricingPage';
import { motion, AnimatePresence } from 'motion/react';
import UpgradeModal from './components/ui/UpgradeModal';
import SearchModal from './components/ui/SearchModal';
import FloatingToolbar from './components/ui/FloatingToolbar';
import FileUploadModal from './components/dashboard/FileUploadModal';
import PWAInstall from './components/ui/PWAInstall';
import React, { useEffect, useState } from 'react';

const GlobalUpgradeModal = () => {
  const { showUpgradeModal, setShowUpgradeModal } = useUsage();
  return (
    <UpgradeModal 
      isOpen={showUpgradeModal} 
      onClose={() => setShowUpgradeModal(false)} 
    />
  );
};

const GlobalComponents = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!user || location.pathname === '/login' || location.pathname === '/signup') return null;

  const isSummaryPage = location.pathname.startsWith('/summary/');

  return (
    <>
      {!isSummaryPage && (
        <FloatingToolbar 
          onSearch={() => setIsSearchOpen(true)}
          onImport={() => setIsUploadOpen(true)}
        />
      )}
      <PWAInstall />
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      <FileUploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
      <GlobalUpgradeModal />
    </>
  );
};

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.99 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.99 }}
    transition={{ 
      duration: 0.4, 
      ease: [0.23, 1, 0.32, 1] 
    }}
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UsageProvider>
        <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <PageTransition><DashboardPage /></PageTransition>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/summary/:uploadId" 
              element={
                <ProtectedRoute>
                  <PageTransition><SummaryPage /></PageTransition>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz/:uploadId" 
              element={
                <ProtectedRoute>
                  <PageTransition><QuizPage /></PageTransition>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/coach" 
              element={
                <ProtectedRoute>
                  <PageTransition><ChatCoach /></PageTransition>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/planner" 
              element={
                <ProtectedRoute>
                  <PageTransition><StudyPlanner /></PageTransition>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <PageTransition><SettingsPage /></PageTransition>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pricing" 
              element={
                <ProtectedRoute>
                  <PageTransition><PricingPage /></PageTransition>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        <GlobalComponents />
      </Router>
      </UsageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
