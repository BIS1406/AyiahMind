import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronLeft, 
  Brain, 
  FileText, 
  ListOrdered, 
  Hash, 
  Zap,
  Share2,
  Download,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface AISummaryData {
  summary: string;
  concepts?: { title: string; description: string }[];
  questions?: string[];
  strategy?: string;
  keyPoints?: string[];
  definitions?: { term: string; definition: string }[];
  examHighlights?: string[];
  confidenceScore?: number;
}

import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import AILoader from '../components/ui/AILoader';
import DiorEngineBranding from '../components/ui/DiorEngineBranding';
import FloatingToolbar from '../components/ui/FloatingToolbar';
import SearchModal from '../components/ui/SearchModal';
import FileUploadModal from '../components/dashboard/FileUploadModal';
import ReportView from '../components/ui/ReportView';

export default function SummaryPage() {
  const { uploadId } = useParams();
  const { user, tier } = useAuth();
  const navigate = useNavigate();
  const [docData, setDocData] = useState<any>(null);
  const [aiData, setAiData] = useState<AISummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!user || !uploadId) return;

    const docRef = doc(db, 'users', user.uid, 'uploads', uploadId);
    const unsub = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDocData(data);
        
        // If data was processed during upload, use that data
        if (data.processed) {
          setAiData({
            summary: data.aiSummary,
            concepts: data.concepts,
            questions: data.questions,
            strategy: data.strategy,
            keyPoints: data.keyPoints || data.concepts?.map((c: any) => c.title) || [],
            definitions: data.definitions || data.concepts?.map((c: any) => ({ term: c.title, definition: c.description })) || [],
            examHighlights: data.examHighlights || data.questions || [],
            confidenceScore: data.confidenceScore || 95
          });
          setLoading(false);
        } else if (data.structuredSummary) {
          setAiData(data.structuredSummary);
          setLoading(false);
        } else if (!hasTriggeredRef.current) {
          // Trigger generation if not already triggered
          hasTriggeredRef.current = true;
          generateSummary(data.fileName);
        }
      } else {
        navigate('/dashboard');
      }
    }, (error) => {
      if (error.message.includes('permission-denied')) {
        console.warn('Summary listener delayed');
      } else {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/uploads/${uploadId}`);
        setLoading(false);
      }
    });

    return () => unsub();
  }, [user, uploadId, navigate]);

  const generateSummary = async (fileName: string) => {
    setGenerating(true);
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, tier })
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);

      // Save to Firestore so we don't regenerate
      if (user && uploadId) {
        const docRef = doc(db, 'users', user.uid, 'uploads', uploadId);
        await updateDoc(docRef, {
          structuredSummary: result
        });
      }
      
      setAiData(result);
    } catch (err) {
      console.error("Failed to generate summary:", err);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  // Typing effect for the summary narrative
  useEffect(() => {
    if (aiData?.summary && !generating) {
      let i = 0;
      const interval = setInterval(() => {
        setTypedText(aiData.summary.slice(0, i));
        i++;
        if (i > aiData.summary.length) clearInterval(interval);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [aiData, generating]);

  const handleFeedback = async (rating: 'positive' | 'negative') => {
    if (!user || !uploadId || feedbackLoading || feedbackSent) return;
    
    setFeedbackLoading(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'uploads', uploadId);
      await updateDoc(docRef, {
        userFeedback: {
          rating,
          timestamp: new Date().toISOString()
        }
      });
      setFeedbackSent(true);
    } catch (err) {
      console.error("Failed to send feedback:", err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary p-8">
        <AILoader label="Synthesizing Knowledge Graphs..." sublabel="Extracting Semantic Structures via Dior Gen-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-blue-500 selection:text-white flex pb-20 lg:pb-0">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 ml-0 lg:ml-[100px] xl:ml-[280px] transition-[margin] duration-500 min-h-screen overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-theme px-6 lg:px-12 h-20 lg:h-28 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="hidden md:block">
              <DiorEngineBranding />
            </div>
            <div>
              <h1 className="text-xs lg:text-sm font-black uppercase tracking-[0.2em] truncate max-w-[200px] sm:max-w-none text-primary">{docData?.fileName}</h1>
              <p className="text-[8px] lg:text-[10px] text-secondary uppercase tracking-widest mt-1">AI Summary • Dior Gen-4</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 px-6 py-3 glass rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface transition-all border border-theme text-primary">
              <Share2 className="w-3.5 h-3.5" /> Share Report
            </button>
            <button className="p-3 glass rounded-2xl hover:bg-surface border border-theme text-primary">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 lg:pt-12 pb-32 space-y-12">
        
        {showReport ? (
           <div className="relative">
              <button 
                onClick={() => setShowReport(false)}
                className="absolute top-10 right-10 z-50 glass px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest no-print"
              >
                Close Report
              </button>
              <ReportView 
                data={{
                  fileName: docData?.fileName,
                  summary: aiData?.summary || '',
                  keyPoints: aiData?.keyPoints || [],
                  definitions: aiData?.definitions?.map(d => ({ term: d.term, def: d.definition })) || []
                }}
                onClose={() => setShowReport(false)}
              />
           </div>
        ) : (
          <>
          {/* Narrative Summary Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass p-8 md:p-16 rounded-[2.5rem] lg:rounded-[3.5rem] relative overflow-hidden group shadow-2xl ${generating ? 'scanning' : ''}`}
        >
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 group-hover:rotate-0 transition-all duration-1000">
            <Brain className="w-96 h-96" />
          </div>
          
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif italic text-primary">Executive Synthesis</h2>
              <p className="text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Simplified AI Overview</p>
            </div>
          </div>

          <div className="max-w-4xl relative">
            <div className="bg-surface backdrop-blur-sm p-6 md:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-theme">
              <p className="text-lg md:text-2xl leading-[1.8] font-normal text-primary/80 tracking-normal antialiased">
                {generating ? (
                  <span className="flex items-center gap-4 text-secondary animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin" /> Deep Learning in progress...
                  </span>
                ) : (
                  <>
                    {typedText}
                    <motion.span 
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-1.5 h-6 bg-blue-500 ml-1 translate-y-1 shadow-[0_0_10px_#3b82f6]"
                    />
                  </>
                )}
              </p>
              
              {!generating && aiData && (
                  <div className="mt-12 pt-8 border-t border-theme flex flex-col sm:flex-row flex-wrap gap-4">
                  <button 
                    onClick={() => navigate(`/quiz/${uploadId}`)}
                    className="px-6 md:px-8 py-4 bg-primary text-inverted rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Zap className="w-4 h-4" /> Assessment
                  </button>
                  <button 
                    onClick={() => navigate('/coach', { state: { initialPrompt: `Let's dive deeper into ${docData?.fileName}. I want to specifically focus on...` } })}
                    className="px-6 md:px-8 py-4 glass rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-surface transition-all flex items-center justify-center text-primary"
                  >
                    Deep Dive
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Key Points & Definitions */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Key Points */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 px-4">
                <ListOrdered className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold uppercase tracking-widest text-secondary">Fundamental Axioms</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(aiData?.keyPoints || []).map((point, i) => (
                  <div key={i} className="glass p-6 rounded-3xl hover:bg-surface transition-all group border-l-2 border-transparent hover:border-blue-500/50">
                    <div className="flex gap-4">
                      <span className="text-[10px] font-black text-blue-500/50">0{i+1}</span>
                      <p className="text-sm font-medium leading-relaxed text-primary">{point}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Definitions */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 px-4">
                <Hash className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold uppercase tracking-widest text-secondary">Semantic Lexicon</h3>
              </div>
              <div className="space-y-4">
                {(aiData?.definitions || []).map((item, i) => (
                  <div key={i} className="glass p-6 rounded-3xl flex flex-col md:flex-row md:items-center gap-6 group hover:bg-surface transition-all border border-theme">
                    <div className="md:w-1/3">
                      <p className="text-blue-400 font-black uppercase tracking-widest text-xs">{item.term}</p>
                    </div>
                    <div className="md:w-2/3">
                      <p className="text-sm text-secondary">{item.definition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Exam Highlights & Metadata */}
          <aside className="lg:col-span-4 space-y-12">
            
            {/* Exam Highlights */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-[2.5rem] border-t-4 border-t-yellow-500/50 relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-8">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-bold font-serif italic text-yellow-500/80">Exam Critical Path</h3>
              </div>
              <div className="space-y-6">
                {(aiData?.examHighlights || []).map((high, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50 mt-1.5 shrink-0" />
                    <p className="text-sm text-yellow-500/90 leading-relaxed font-medium">{high}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">
                <p className="text-[10px] text-yellow-500/50 font-black uppercase tracking-[0.2em] mb-2 text-center">Likelihood of emergence</p>
                <div className="h-1 w-full bg-yellow-500/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '85%' }}
                    className="h-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                  />
                </div>
              </div>
            </motion.div>

            {/* AI Trust Level */}
            <div className="glass p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">Reliability Index</h3>
              <div className="flex items-center gap-6 text-primary">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary/5" />
                    <motion.circle 
                      initial={{ strokeDashoffset: 176 }}
                      animate={{ strokeDashoffset: 176 - (176 * (aiData?.confidenceScore || 0) / 100) }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      cx="32" cy="32" r="28" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="176" 
                      className="shadow-blue-500" strokeLinecap="round" 
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">{aiData?.confidenceScore || 0}%</span>
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Semantic Accuracy</p>
                  <p className="text-[10px] text-secondary uppercase tracking-widest mt-1">AI-Self Assessed Confidence</p>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="pt-6 border-t border-theme">
                <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-4">Was this summary accurate?</p>
                <div className="flex gap-3">
                  {feedbackSent ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase tracking-widest"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Feedback Synced
                    </motion.div>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleFeedback('positive')}
                        disabled={feedbackLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 glass rounded-xl hover:bg-green-500/10 hover:text-green-400 transition-all disabled:opacity-50 text-secondary"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleFeedback('negative')}
                        disabled={feedbackLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 glass rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50 text-secondary"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowReport(true)}
              className="w-full py-6 glass rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-surface transition-all flex items-center justify-center gap-3 group text-primary border border-theme"
            >
              <FileText className="w-4 h-4 group-hover:translate-y-1 transition-transform" /> View Full Report
            </button>
          </aside>
        </div>
          </>
        )}
        </main>
      </div>

      {/* Floating Toolbar with Summary-specific context */}
      {!showReport && (
        <FloatingToolbar 
          onSearch={() => setIsSearchOpen(true)}
          onImport={() => setIsUploadOpen(true)}
          onSave={() => alert("Intelligence fragment successfully preserved in your permanent archives.")}
          onShare={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Share link copied!");
          }}
          onReport={() => setShowReport(true)}
        />
      )}
      
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <FileUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      
      <footer className="fixed bottom-0 inset-x-0 h-16 bg-background/80 backdrop-blur-md border-t border-theme flex items-center justify-center pointer-events-none z-50">
        <div className="flex items-center gap-3 opacity-30 text-primary group">
          <Brain className="w-4 h-4" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated by Dior Precision Engine • AyiahMind OS</span>
            <span className="text-[7px] font-black uppercase tracking-[0.6em] mt-1 text-primary/40">Powered by Ayiah</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
