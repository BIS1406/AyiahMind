import { useState } from 'react';
import { motion } from 'motion/react';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, googleProvider, db } from '../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Mail, Lock, User, UserPlus, Chrome, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      // Save initial user profile to Firestore
      const userPath = `users/${user.uid}`;
      const now = new Date().toISOString();
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email || '',
          displayName: name,
          photoURL: null,
          tier: 'free',
          studyStreak: 0,
          quizAverage: 0,
          createdAt: now,
          updatedAt: now
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, userPath);
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    console.log("Starting Google Signup...");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Google Auth Success:", user.email);
      
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      const signupUserPath = `users/${user.uid}`;
      const now = new Date().toISOString();
      
      if (!userDoc.exists()) {
        console.log("Creating new user profile...");
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            tier: 'free',
            studyStreak: 0,
            quizAverage: 0,
            createdAt: now,
            updatedAt: now
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, signupUserPath);
        }
      } else {
        console.log("Updating existing user profile...");
        try {
          await setDoc(userRef, {
            displayName: user.displayName || userDoc.data()?.displayName || null,
            photoURL: user.photoURL || userDoc.data()?.photoURL || null,
            updatedAt: now
          }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, signupUserPath);
        }
      }

      navigate('/');
    } catch (err: any) {
      console.error("Google Signup Error:", err);
      setError(
        err.code === 'auth/popup-blocked' 
          ? 'Popup blocked! Please allow popups for this site or open in a new tab.' 
          : err.message || 'Failed to signup with Google'
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
          <h1 className="text-4xl font-serif italic mb-2">Join the Elite</h1>
          <p className="text-white/50 text-sm">Become a StudyMate Dior scholar today</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl mb-6">
            {error}
            <div className="mt-2 text-white/40">
              Note: If Google login fails, try <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">opening the app in a new tab</a>.
            </div>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean-Paul Sartre"
                className="w-full glass bg-white/5 border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-white/20 transition-all"
                required
              />
            </div>
          </div>

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
            <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-4">Password</label>
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
            {loading ? 'Creating Account...' : (
              <>
                Enroll Now <UserPlus className="w-4 h-4" />
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
            onClick={handleGoogleSignup}
            className="w-full py-4 glass bg-white/5 border-white/5 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <Chrome className="w-5 h-5" /> Google
          </button>
        </div>

        <p className="mt-10 text-center text-xs text-white/30 tracking-widest uppercase">
          Already Enrolled? <Link to="/login" className="text-white hover:underline transition-all">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
