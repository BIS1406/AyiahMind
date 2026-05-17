import { useState } from 'react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../../lib/firebase';
import { Mail, Lock, LogIn, Chrome, ArrowRight, Github } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    console.log("Starting Google Login...");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Google Auth Success:", user.email);
      
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log("Creating new user profile...");
        const userPath = `users/${user.uid}`;
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            tier: 'free',
            studyStreak: 0,
            quizAverage: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, userPath);
        }
      }
      
      navigate('/');
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError(
        err.code === 'auth/popup-blocked' 
          ? 'Popup blocked! Please allow popups for this site or open in a new tab.' 
          : err.message || 'Failed to login with Google'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1)_0%,transparent_50%)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-10 rounded-[2.5rem] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] -z-10" />
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif italic mb-2">Welcome Back</h1>
          <p className="text-white/50 text-sm">Resume your journey with StudyMate Dior</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl mb-6">
            {error}
            <div className="mt-2 text-white/40">
              Note: If Google login fails, try <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">opening the app in a new tab</a>.
            </div>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scholar@dior.edu"
                className="w-full glass bg-white/5 border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-white/20 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end mb-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">Password</label>
              <Link to="/forgot-password" className="text-[10px] uppercase tracking-widest font-bold text-blue-400/60 hover:text-blue-400 transition-colors mr-4">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass bg-white/5 border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-white/20 transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
            <span className="bg-black/0 px-4 text-white/20 backdrop-blur-3xl">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-4 glass bg-white/5 border-white/5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <Chrome className="w-5 h-5" /> Google
          </button>
        </div>

        <p className="mt-10 text-center text-xs text-white/30 tracking-widest uppercase">
          New to Dior? <Link to="/signup" className="text-white hover:underline transition-all">Enroll Now</Link>
        </p>
      </motion.div>
    </div>
  );
}
