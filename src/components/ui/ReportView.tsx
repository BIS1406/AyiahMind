import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Brain, 
  Target, 
  CheckCircle2, 
  Zap, 
  Cpu, 
  Download, 
  Printer, 
  Share2,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';

interface ReportData {
  fileName: string;
  summary: string;
  keyPoints: string[];
  definitions: { term: string; def: string }[];
  quizPerformance?: { score: number; date: string };
  studyAnalytics?: { hoursSpent: number; efficiency: number };
}

export default function ReportView({ data, onClose }: { data: ReportData; onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto glass p-10 lg:p-20 rounded-[4rem] border border-theme shadow-[0_100px_150px_rgba(0,0,0,0.5)] cyber-grid relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
        <Cpu className="w-[800px] h-[800px]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-20 relative z-10">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 vibrant-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-5xl font-serif italic tracking-tighter text-glow">Synthesis Report</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary mt-1">Dior Precision Analytical Deep Engine</p>
            </div>
          </div>
          <p className="text-secondary text-sm font-medium opacity-60">Report Ref: AI-{Math.random().toString(36).substring(7).toUpperCase()}</p>
        </div>

        <div className="flex flex-wrap gap-4 no-print">
          <button 
            onClick={handlePrint}
            className="px-6 py-4 glass rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all shadow-xl"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button 
            onClick={handlePrint} // Same for now
            className="px-6 py-4 vibrant-gradient text-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-magenta/20"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20 relative z-10">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-6 flex items-center gap-2">
              <FileText className="w-3 h-3" /> Abstract Highlights
            </h3>
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
              <p className="text-primary italic leading-relaxed font-light text-lg">
                {data.summary}
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-6 flex items-center gap-2">
              <Target className="w-3 h-3" /> Core Insights
            </h3>
            <ul className="space-y-4">
              {data.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-4 group">
                  <div className="w-6 h-6 glass rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <p className="text-secondary text-sm font-medium leading-relaxed group-hover:text-primary transition-colors">{point}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass p-8 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Activity className="w-12 h-12" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Cognitive Metrics</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] uppercase font-bold text-secondary mb-2">
                  <span>Knowledge Retention</span>
                  <span className="text-primary">84%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full w-[84%] bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-secondary mb-1">Efficiency</p>
                  <p className="text-lg font-bold text-primary">A+</p>
                </div>
                <div className="glass p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-secondary mb-1">Status</p>
                  <p className="text-sm font-bold text-green-400">Mastered</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-6">Neural Tokens</h3>
            <div className="flex flex-wrap gap-2">
              {['Concept', 'Analysis', 'Dior AI', 'Academic'].map((tag, i) => (
                <span key={i} className="px-4 py-2 glass rounded-xl text-[9px] font-bold text-secondary uppercase tracking-widest hover:text-primary transition-all cursor-pointer">#{tag}</span>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-theme pt-10 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 glass rounded-full flex items-center justify-center text-secondary">
             <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-secondary">Generation Date</p>
            <p className="text-xs font-bold text-primary">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Zap className="w-4 h-4 text-magenta animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-magenta">Certified Dior Synthesis Output</span>
        </div>
      </div>
    </motion.div>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
