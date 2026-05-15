import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface UsageData {
  uploads: number;
  summaries: number;
  quizzes: number;
  coachMessages: number;
  lastReset: string;
}

interface UsageContextType {
  usage: UsageData;
  limits: typeof FREE_LIMITS;
  isOverLimit: (type: keyof UsageData) => boolean;
  incrementUsage: (type: keyof UsageData) => void;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  remainingDays: number;
}

export const FREE_LIMITS = {
  uploads: 5,
  summaries: 5,
  quizzes: 3,
  coachMessages: 20,
  maxPdfSize: 10 * 1024 * 1024, // 10MB
  maxPages: 30,
  maxQuizQuestions: 10
};

const INITIAL_USAGE: UsageData = {
  uploads: 0,
  summaries: 0,
  quizzes: 0,
  coachMessages: 0,
  lastReset: new Date().toISOString().split('T')[0]
};

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export const UsageProvider = ({ children }: { children: ReactNode }) => {
  const { tier, user } = useAuth();
  const [usage, setUsage] = useState<UsageData>(() => {
    const saved = localStorage.getItem(`usage_${user?.uid || 'guest'}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      if (parsed.lastReset === today) {
        return parsed;
      }
    }
    return INITIAL_USAGE;
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`usage_${user.uid}`, JSON.stringify(usage));
    }
  }, [usage, user]);

  const incrementUsage = (type: keyof UsageData) => {
    if (tier === 'premium') return;
    
    setUsage(prev => ({
      ...prev,
      [type]: (prev[type] as number) + 1
    }));
  };

  const isOverLimit = (type: keyof UsageData) => {
    if (tier === 'premium') return false;
    const current = usage[type] as number;
    const limit = (FREE_LIMITS as any)[type];
    return current >= limit;
  };

  return (
    <UsageContext.Provider value={{ 
      usage, 
      limits: FREE_LIMITS, 
      isOverLimit, 
      incrementUsage, 
      showUpgradeModal, 
      setShowUpgradeModal,
      remainingDays: 30 // Mock
    }}>
      {children}
    </UsageContext.Provider>
  );
};

export const useUsage = () => {
  const context = useContext(UsageContext);
  if (!context) throw new Error('useUsage must be used within UsageProvider');
  return context;
};
