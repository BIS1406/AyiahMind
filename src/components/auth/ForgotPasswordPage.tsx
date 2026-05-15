import { useState } from 'react';
import { motion } from 'motion/react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
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
          <Link to="/login" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
          <h1 className="text-4xl font-serif italic mb-2">Reset Password</h1>
          <p className="text-white/50 text-sm">We'll send a secure link to your inbox</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs p-4 rounded-xl mb-6">
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
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

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Sending...' : (
              <>
                Send Reset Link <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
