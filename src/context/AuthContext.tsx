import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  tier: 'free' | 'premium';
  stats: {
    studyStreak: number;
    quizAverage: number;
  };
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  tier: 'free',
  stats: { studyStreak: 0, quizAverage: 0 }
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<'free' | 'premium'>('free');
  const [stats, setStats] = useState({ studyStreak: 0, quizAverage: 0 });

  useEffect(() => {
    let unsubMeta: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous meta listener if user changed
      if (unsubMeta) {
        unsubMeta();
        unsubMeta = null;
      }

      setUser(firebaseUser);
      
      if (firebaseUser) {
        setLoading(true); // Re-set loading while we fetch meta
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        unsubMeta = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setTier(data.tier || 'free');
            setStats({
              studyStreak: data.studyStreak || 0,
              quizAverage: data.quizAverage || 0
            });
          } else {
            setTier('free');
            setStats({ studyStreak: 0, quizAverage: 0 });
          }
          setLoading(false);
        }, (error) => {
          console.error("Auth Metadata Error:", error);
          // If we can't get metadata, we still proceed as 'free' user
          // to avoid blocking the app indefinitely if permissions are slow to sync
          setTier('free');
          setLoading(false);
        });
      } else {
        setTier('free');
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubMeta) unsubMeta();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, tier, stats }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
