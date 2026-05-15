import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  CheckCircle2, 
  X, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Brain,
  Video,
  Database,
  Cloud,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export default function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl glass p-8 lg:p-12 rounded-[3.5rem] border border-theme shadow-[0_40px_100px_rgba(var(--primary-rgb),0.2)] overflow-hidden"
          >
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <button 
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 glass rounded-2xl flex items-center justify-center text-secondary hover:text-primary transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-6 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]">
                  <Crown className="w-10 h-10" />
                </div>
                <h2 className="text-3xl lg:text-5xl font-serif italic mb-4 text-primary leading-tight">
                  Upgrade to <span className="not-italic font-sans font-black tracking-tighter">Elite Potential</span>
                </h2>
                <p className="text-secondary max-w-md text-sm lg:text-base mb-2">
                  {reason || "Unlock the full analytical power of the Dior Precision Analytical Deep Engine."}
                </p>
                <div className="flex items-center gap-2 glass px-4 py-1 rounded-full border border-primary/20 mt-4">
                  <Zap className="w-3 h-3 text-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Dior Elite Access Required</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary mb-6 pl-2">Elite Features</h3>
                  {[
                    { icon: Sparkles, text: "Unlimited Document Processing" },
                    { icon: Brain, text: "Advanced AI Strategic Summaries" },
                    { icon: Video, text: "Voice AI Interactive Interface" },
                    { icon: FileText, text: "OCR Manuscript Analysis" }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <div className="glass p-8 rounded-[2.5rem] border border-primary/10 relative overflow-hidden bg-primary/[0.02]">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                  <div className="mb-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary block mb-2">Best Value Selection</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-secondary">GHS</span>
                      <span className="text-4xl font-black tracking-tighter text-primary">20</span>
                      <span className="text-xs text-secondary font-bold uppercase tracking-widest">/mo</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {["Unlimited Quizzes", "Cloud Synced Brain", "Priority Proactive Alerts"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs text-secondary">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => {
                      navigate('/pricing');
                      onClose();
                    }}
                    className="w-full py-4 bg-primary text-inverted rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Upgrade Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-center gap-6 opacity-40">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Secure Dior Gateway</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Global Data Fidelity</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
