import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  LayoutDashboard, 
  FileText, 
  Flame, 
  Trophy, 
  Brain, 
  Calendar, 
  Upload, 
  LogOut,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  MoreVertical,
  User as UserIcon,
  Search,
  TrendingUp,
  Zap,
  Activity,
  ArrowUpRight,
  Target,
  Mic,
  Cloud
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import FileUploadModal from '../components/dashboard/FileUploadModal';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface UserStats {
  studyStreak: number;
  quizAverage: number;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface UploadItem {
  id: string;
  fileName: string;
  uploadDate: string;
  aiSummary: string;
}

import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import AILoader from '../components/ui/AILoader';
import UsageCounter from '../components/ui/UsageCounter';
import { useUsage } from '../context/UsageContext';

import DiorEngineBranding from '../components/ui/DiorEngineBranding';

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const CHART_DATA = [
  { name: 'Mon', value: 45, intensity: 20 },
  { name: 'Tue', value: 52, intensity: 35 },
  { name: 'Wed', value: 48, intensity: 25 },
  { name: 'Thu', value: 61, intensity: 45 },
  { name: 'Fri', value: 55, intensity: 40 },
  { name: 'Sat', value: 67, intensity: 55 },
  { name: 'Sun', value: 72, intensity: 65 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
};

export default function DashboardPage() {
  const { user, loading, tier, stats } = useAuth();
  const navigate = useNavigate();
  const { isOverLimit, setShowUpgradeModal } = useUsage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dashLoading, setDashLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    // Fetch Tasks
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const qTasks = query(tasksRef, orderBy('dueDate', 'asc'), limit(20));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const taskList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
      setTasks(taskList.filter(t => !t.completed).slice(0, 5));
    }, (error) => {
      // Soften error for the very first load as it might be a race condition with profile creation
      if (error.message.includes('permission-denied')) {
        console.warn('Task listener delayed - waiting for profile synchronization');
      } else {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/tasks`);
      }
    });

    // Fetch Uploads
    const uploadsRef = collection(db, 'users', user.uid, 'uploads');
    const qUploads = query(uploadsRef, orderBy('uploadDate', 'desc'), limit(3));
    const unsubUploads = onSnapshot(qUploads, (snapshot) => {
      const uploadList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UploadItem[];
      setUploads(uploadList);
      setDashLoading(false);
    }, (error) => {
      setDashLoading(false);
       if (error.message.includes('permission-denied')) {
        console.warn('Uploads listener delayed - waiting for profile synchronization');
      } else {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/uploads`);
      }
    });

    return () => {
      unsubTasks();
      unsubUploads();
    };
  }, [user]);

  if (loading || dashLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AILoader label="Synchronizing Core Node..." sublabel="Accessing Scholar Network Protocol 2.4.1" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-primary selection:text-inverted font-sans flex cyber-grid pb-20 lg:pb-0">
      <Sidebar />
      <MobileNav />
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#050505]">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/20 blur-[150px] rounded-full animate-float opacity-50" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/20 blur-[150px] rounded-full animate-float opacity-50" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-pink-600/10 blur-[200px] rounded-full opacity-30" />
        <div className="vibrant-gradient absolute inset-0 opacity-5" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-0 lg:ml-[100px] xl:ml-[280px] transition-[margin] duration-500 overflow-x-hidden">
        {/* Top Header */}
        <header className="h-20 lg:h-28 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40 bg-background/50 backdrop-blur-md border-b border-theme">
          <div className="hidden sm:block">
            <DiorEngineBranding />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center glass-dark px-6 py-3 rounded-2xl gap-4 border border-theme">
              <Search className="w-4 h-4 text-secondary" />
              <input 
                type="text" 
                placeholder="Query Intelligence Network..." 
                className="bg-transparent border-none outline-none text-[10px] w-64 text-primary uppercase tracking-widest font-bold placeholder:text-secondary"
              />
            </div>
            <div className="flex items-center gap-4 border-l border-theme pl-6 h-10">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">{user?.displayName}</p>
                <p className="text-[8px] text-secondary uppercase tracking-[0.2em] mt-1">Scholar Node</p>
              </div>
              <div className="w-12 h-12 rounded-2xl glass-dark flex items-center justify-center border border-theme overflow-hidden group">
                <UserIcon className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 lg:px-12 py-8 lg:py-12 max-w-[1600px] mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* Usage Analysis Section */}
            {tier === 'free' && (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <UsageCounter type="uploads" label="Upload Bandwidth" icon={<Upload className="w-5 h-5" />} />
                <UsageCounter type="summaries" label="Synthesis Limit" icon={<FileText className="w-5 h-5" />} />
                <UsageCounter type="quizzes" label="Evaluation Quota" icon={<CheckCircle2 className="w-5 h-5" />} />
                <UsageCounter type="coachMessages" label="Neural Queries" icon={<Brain className="w-5 h-5" />} />
              </section>
            )}

            {/* Hero Section */}
            <section className="grid grid-cols-12 gap-6 lg:gap-10">
              <motion.div 
                variants={itemVariants}
                className="col-span-12 xl:col-span-8 premium-card p-10 lg:p-14 relative overflow-hidden group min-h-[460px] flex flex-col justify-center neon-border shadow-[0_0_50px_rgba(192,38,211,0.15)]"
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-1000">
                  <Brain className="w-[600px] h-[600px] rotate-12 translate-x-32 -translate-y-32 text-pink-500" />
                </div>

                <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-3 glass w-fit px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5">
                    <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Neural Optimization Active</p>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic mb-6 leading-[0.95] tracking-tight">
                    Upload &<br />
                    <span className="not-italic font-sans font-black tracking-tighter text-glow bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-pulse-vibrant">
                      Research
                    </span>
                  </h1>
                  
                  <div className="flex items-start gap-6 max-w-2xl">
                    <div className="w-1 bg-gradient-to-b from-primary to-transparent h-16 rounded-full opacity-30" />
                    <p className="text-secondary text-xl leading-relaxed font-light">
                      Upload your documents to generate high-precision <span className="text-primary font-bold">AI Summaries</span> and interactive <span className="text-primary font-bold">Quizzes</span> instantly.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 pt-4">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (isOverLimit('uploads')) {
                          setShowUpgradeModal(true);
                        } else {
                          setIsUploadModalOpen(true);
                        }
                      }}
                      className="premium-button px-10 py-5 rounded-[2.5rem] vibrant-gradient shadow-[0_20px_50px_rgba(192,38,211,0.3)] border-none"
                    >
                      <Plus className="w-5 h-5" /> Initialize Synthesis
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05, backgroundColor: 'var(--bg-surface)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/coach')}
                      className="px-10 py-5 glass border border-theme rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-3 transition-all"
                    >
                      <Brain className="w-5 h-5 text-primary" /> Consult Dior AI
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <div className="col-span-12 xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6 lg:gap-10">
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="premium-card p-10 flex flex-col justify-between group overflow-hidden border-orange-500/30 neon-glow-purple bg-gradient-to-br from-orange-500/10 to-transparent"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 glass rounded-[2rem] flex items-center justify-center text-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.15)] border border-orange-500/10">
                      <Flame className="w-8 h-8 fill-current" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] block mb-1">Study Streak</span>
                      <div className="flex items-center gap-1 text-green-400 font-bold text-xs justify-end">
                        <TrendingUp className="w-3 h-3" /> +1 day
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-7xl font-black mb-1 tabular-nums tracking-tighter">{stats.studyStreak}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/60 italic">Intelligence Cycles</p>
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="premium-card p-10 flex flex-col justify-between group overflow-hidden border-purple-500/30 neon-glow-cyan bg-gradient-to-br from-purple-500/10 to-transparent"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 glass rounded-[2rem] flex items-center justify-center text-primary shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] border border-primary/10">
                      <Trophy className="w-8 h-8 fill-current" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] block mb-1">Module Mastery</span>
                      <div className="text-primary font-bold text-xs">Excellence Tier</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-7xl font-black mb-1 tabular-nums tracking-tighter">{stats.quizAverage}</h3>
                      <span className="text-3xl font-black text-secondary/40">%</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary/60 italic">Cognitive Retention</p>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Main Stats Grid */}
            <section className="grid grid-cols-12 gap-6 lg:gap-10">
              <motion.div 
                variants={itemVariants}
                className="col-span-12 lg:col-span-8 premium-card p-10"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                   <div>
                    <h2 className="text-3xl font-serif italic tracking-tight mb-1">Cognitive Velocity</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">Neural Response Patterns</p>
                   </div>
                   <div className="flex items-center gap-3 glass px-5 py-2.5 rounded-full border border-theme">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Optimization</span>
                   </div>
                </div>
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CHART_DATA}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#c026d3" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="currentColor" className="text-theme opacity-30" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 9, fontWeight: 900, fill: 'currentColor' }}
                          className="text-secondary"
                          dy={15}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 9, fontWeight: 900, fill: 'currentColor' }}
                          className="text-secondary"
                        />
                        <Tooltip 
                          cursor={{ stroke: '#c026d3', strokeWidth: 1, strokeDasharray: '4 4' }}
                          contentStyle={{ 
                            backgroundColor: 'rgba(5, 5, 5, 0.8)', 
                            border: '1px solid rgba(192, 38, 211, 0.3)',
                            borderRadius: '24px',
                            padding: '16px 20px',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 20px 40px rgba(192, 38, 211, 0.2)'
                          }}
                          labelStyle={{ 
                            fontSize: '10px', 
                            fontWeight: 900, 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.2em',
                            color: 'rgba(255, 255, 255, 0.5)',
                            marginBottom: '8px'
                          }}
                          itemStyle={{ 
                            color: '#c026d3', 
                            fontSize: '14px', 
                            fontWeight: 900 
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#c026d3" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                          animationDuration={2000}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="intensity" 
                          stroke="#06b6d4" 
                          strokeWidth={2}
                          fillOpacity={0.1} 
                          fill="#06b6d4" 
                          animationDuration={2500}
                        />
                      </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="col-span-12 lg:col-span-4 space-y-6 lg:space-y-10"
              >
                <div className="premium-card p-10 h-full relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-serif italic">Pending Actions</h2>
                    <Target className="w-5 h-5 text-secondary opacity-30" />
                  </div>

                  <div className="space-y-5">
                    {tasks.map((t, i) => (
                      <motion.div 
                        key={t.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className="glass p-6 rounded-[2rem] border border-theme hover:border-primary/30 hover:bg-surface transition-all flex items-center justify-between group/item cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${t.priority === 'high' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]'}`} />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-primary mb-1 truncate">{t.title}</h4>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary">Due {new Date(t.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-secondary opacity-0 group-hover/item:opacity-100 group-hover/item:text-primary transition-all" />
                      </motion.div>
                    ))}
                    {tasks.length === 0 && (
                      <div className="py-20 text-center space-y-4">
                        <CheckCircle2 className="w-12 h-12 text-secondary/20 mx-auto" />
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary/40 italic">Queue Fully Optimized</p>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => navigate('/planner')}
                    className="w-full mt-10 py-5 glass border border-theme rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-secondary hover:text-primary hover:border-primary/30 transition-all"
                  >
                    Manage Neural Pipeline
                  </button>
                </div>
              </motion.div>
            </section>

            {/* Bottom Row - Neural Insights & Digital Library */}
            <section className="grid grid-cols-12 gap-6 lg:gap-10">
              {/* Premium Locked Feature: Voice AI */}
              {tier === 'free' && (
                <motion.div 
                  variants={itemVariants}
                  onClick={() => setShowUpgradeModal(true)}
                  className="col-span-12 xl:col-span-4 premium-card p-10 relative overflow-hidden group cursor-pointer border-pink-500/30"
                >
                  <div className="absolute inset-0 bg-background/40 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-pink-500 mb-4 shadow-[0_0_20px_rgba(219,39,119,0.3)]">
                      <Mic className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-serif italic mb-2">Voice AI Interface</h3>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-pink-500 mb-4">Elite Feature Locked</p>
                    <div className="flex items-center gap-2 glass px-4 py-1.5 rounded-full border border-pink-500/20 text-pink-500 text-[10px] font-black uppercase tracking-widest">
                       Upgrade to Access
                    </div>
                  </div>
                  
                  <div className="opacity-20 blur-sm flex flex-col gap-4">
                    <div className="w-full h-20 glass rounded-2xl" />
                    <div className="flex gap-4">
                      <div className="flex-1 h-12 glass rounded-xl" />
                      <div className="flex-1 h-12 glass rounded-xl" />
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div 
                variants={itemVariants}
                className={`col-span-12 ${tier === 'free' ? 'xl:col-span-4' : 'xl:col-span-4'} premium-card p-10 bg-gradient-to-br from-primary/[0.03] to-transparent`}
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] border border-primary/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif italic">Research</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">AI Insights</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                    <div className="pl-6 space-y-4">
                      <p className="text-secondary leading-relaxed font-light italic text-lg">
                        "Your synthesis of <span className="text-primary font-medium">Neuro-Economics</span> suggests a high retention of core nodes but a weak peripheral understanding of historical context."
                      </p>
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:gap-4 transition-all">
                        Generate Refinement Strategy <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-5 rounded-3xl border border-theme border-l-4 border-l-blue-400">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary mb-2">Focus Target</p>
                      <p className="text-sm font-bold text-primary">Quantum Theory</p>
                    </div>
                    <div className="glass p-5 rounded-3xl border border-theme border-l-4 border-l-purple-400">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary mb-2">Next Session</p>
                      <p className="text-sm font-bold text-primary">Advanced Logic</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="col-span-12 xl:col-span-8 premium-card p-10"
              >
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-3xl font-serif italic tracking-tight mb-1">Saved Notes</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">Your AI Synthesis Library</p>
                      {tier === 'premium' ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 glass rounded-full border border-green-500/20">
                          <Cloud className="w-2.5 h-2.5 text-green-400" />
                          <span className="text-[7px] font-black uppercase text-green-400 tracking-widest">Synced</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowUpgradeModal(true)}
                          className="flex items-center gap-1.5 px-2 py-0.5 glass rounded-full border border-theme hover:border-primary/30"
                        >
                          <Cloud className="w-2.5 h-2.5 text-secondary" />
                          <span className="text-[7px] font-black uppercase text-secondary tracking-widest">Local Only</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/coach')}
                    className="flex items-center gap-3 glass px-5 py-2.5 rounded-full border border-theme text-[10px] font-black uppercase tracking-[0.3em] text-secondary hover:text-primary transition-all"
                  >
                    Holographic View <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {uploads.map((u, i) => (
                      <motion.div 
                        key={u.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -5 }}
                        onClick={() => navigate(`/summary/${u.id}`)}
                        className="p-6 glass rounded-[2.5rem] border border-theme hover:border-primary/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col gap-6">
                          <div className="flex justify-between items-start">
                            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-secondary group-hover:text-primary transition-all bg-surface border border-theme group-hover:border-primary/20">
                              <FileText className="w-7 h-7" />
                            </div>
                            <div className="h-2 w-12 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-primary mb-1 leading-snug group-hover:text-glow-sm">{u.fileName}</h4>
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-secondary">
                              <Clock className="w-3 h-3" /> Digitized {new Date(u.uploadDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -5 }}
                    onClick={() => setIsUploadModalOpen(true)}
                    className="p-6 glass rounded-[2.5rem] border-2 border-dashed border-theme hover:border-primary/40 flex flex-col items-center justify-center gap-4 text-secondary/40 hover:text-primary transition-all group min-h-[160px]"
                  >
                    <div className="w-12 h-12 glass rounded-full flex items-center justify-center border border-theme group-hover:bg-primary group-hover:text-inverted transition-all">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Initialize Archive</span>
                  </motion.button>
                </div>
              </motion.div>
            </section>

            {/* Footer Metrics */}
            <motion.footer 
              variants={itemVariants}
              className="pt-20 pb-10 border-t border-theme flex flex-col lg:flex-row justify-between items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all hover:opacity-100"
            >
              <div className="flex items-center gap-6">
                <div className="text-center lg:text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1">Global Node Uptime</p>
                  <p className="text-xs font-bold font-mono">99.999% INTEGRITY</p>
                </div>
                <div className="h-8 w-px bg-theme" />
                <div className="text-center lg:text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1">Scholar Sync Rate</p>
                  <p className="text-xs font-bold font-mono">842 GB/SEC</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/20">Powered by Ayiah</p>
                  <span className="text-[10px] font-black uppercase tracking-[0.6em]">DIOR PRECISION ENGINE v4.2.0</span>
                </div>
                <Brain className="w-5 h-5 text-primary" />
              </div>
            </motion.footer>
          </motion.div>
        </main>
      </div>

      <FileUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
}
