import React from 'react';
import { motion } from 'motion/react';
import { useUsage } from '../../context/UsageContext';
import { useAuth } from '../../context/AuthContext';
import { Zap } from 'lucide-react';

interface UsageCounterProps {
  type: 'uploads' | 'summaries' | 'quizzes' | 'coachMessages';
  icon?: React.ReactNode;
  label: string;
}

export default function UsageCounter({ type, icon, label }: UsageCounterProps) {
  const { usage, limits } = useUsage();
  const { tier } = useAuth();
  
  if (tier === 'premium') return null;

  const current = usage[type] as number;
  const limit = (limits as any)[type];
  const percentage = Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;

  return (
    <div className="glass-dark p-6 rounded-[2rem] border border-theme relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isNearLimit ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
            {icon}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">{label}</p>
            <p className="text-sm font-bold text-primary">{current} <span className="opacity-40">/ {limit}</span></p>
          </div>
        </div>
        {isNearLimit && (
          <div className="animate-pulse">
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
        )}
      </div>
      
      <div className="relative h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`absolute left-0 top-0 h-full rounded-full ${
            percentage >= 90 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
            percentage >= 70 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 
            'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]'
          }`}
        />
      </div>

      {isNearLimit && (
        <p className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-orange-400/80 animate-pulse">
          Cognitive Bandwidth Reaching Limit
        </p>
      )}
    </div>
  );
}
