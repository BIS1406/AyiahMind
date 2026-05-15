import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  FileText, 
  Brain, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Command,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim() || !user) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      // In a real app, you'd use Algolia or specialized search indexes
      // For now, we simulate with a Firestore fetch of recent items
      const uploadsRef = collection(db, 'users', user.uid, 'uploads');
      const q = query(uploadsRef, limit(10));
      const snapshot = await getDocs(q);
      
      const filtered = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data(), type: 'upload' }))
        .filter((item: any) => 
          item.fileName?.toLowerCase().includes(term.toLowerCase()) ||
          item.aiSummary?.toLowerCase().includes(term.toLowerCase())
        );
        
      setResults(filtered);
    } catch (err) {
      console.error("Search Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-start justify-center pt-[10vh] px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-2xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl glass-dark rounded-[2.5rem] border border-theme shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-6 border-b border-theme relative flex items-center gap-4">
              <Search className="w-6 h-6 text-primary" />
              <input 
                autoFocus
                placeholder="Search uploads, notes, or AI topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xl lg:text-2xl font-serif italic text-primary placeholder:text-secondary"
              />
              <div className="hidden sm:flex items-center gap-2 glass px-3 py-1 rounded-xl border border-theme">
                <Command className="w-3 h-3 text-secondary" />
                <span className="text-[10px] font-black tracking-widest text-secondary">ESC</span>
              </div>
              <button 
                onClick={onClose}
                className="sm:hidden w-8 h-8 glass rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto scrollbar-hide p-4 space-y-2">
              {loading && searchTerm && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Parsing Knowledge Base...</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary px-4 py-2">Found Intelligence</p>
                  {results.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => {
                        navigate(`/summary/${item.id}`);
                        onClose();
                      }}
                      className="w-full flex items-center gap-6 p-4 rounded-3xl hover:bg-white/5 transition-all group text-left"
                    >
                      <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-primary group-hover:text-magenta transition-colors">{item.fileName}</h4>
                        <p className="text-xs text-secondary line-clamp-1 opacity-60">Synthesized on {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-secondary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))}
                </div>
              )}

              {!loading && searchTerm && results.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 glass rounded-[2rem] flex items-center justify-center text-secondary mx-auto mb-6 opacity-30">
                    <Brain className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif italic text-primary opacity-40">No fragments found for "{searchTerm}"</h3>
                  <button 
                    onClick={() => navigate('/coach')}
                    className="mt-6 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                  >
                    Ask AI Coach Instead
                  </button>
                </div>
              )}

              {!searchTerm && (
                <div className="py-10 space-y-8">
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary px-4 mb-4">Suggested Actions</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
                      {[
                        { label: 'Summarize Recent', icon: FileText, path: '/dashboard' },
                        { label: 'Voice AI Launch', icon: Brain, path: '/dashboard' },
                        { label: 'Weekly Report', icon: CheckCircle2, path: '/pricing' },
                        { label: 'Global Chats', icon: MessageSquare, path: '/coach' }
                      ].map((action, i) => (
                        <button 
                          key={i}
                          onClick={() => { navigate(action.path); onClose(); }}
                          className="flex items-center gap-4 p-4 glass rounded-2xl border border-theme hover:border-primary/20 transition-all text-left group"
                        >
                          <action.icon className="w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
                          <span className="text-xs font-bold text-secondary group-hover:text-primary">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="px-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-secondary mb-4 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Recent Queries
                    </h5>
                    <div className="flex flex-wrap gap-2 text-[10px] font-black tracking-widest italic text-secondary uppercase">
                      {['Neural Economics', 'Mitosis Diagram', 'Global Law', 'AI Ethics'].map((q, i) => (
                        <span key={i} className="px-3 py-1 glass rounded-lg cursor-pointer hover:text-primary">{q}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-950/50 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-secondary border-t border-white/5">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Command className="w-2.5 h-2.5" /> K to search</span>
                <span className="flex items-center gap-1"><ArrowRight className="w-2.5 h-2.5" /> to select</span>
              </div>
              <span className="text-magenta">AyiahMind Precision Search</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
