import React from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, Cpu } from 'lucide-react';

export default function DiorEngineBranding() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-4 glass-dark px-6 py-3 rounded-full border border-purple-500/30 bg-purple-500/5 select-none neon-glow-purple shadow-[0_0_20px_rgba(192,38,211,0.2)]"
    >
      <div className="relative">
        <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
        <motion.div 
          animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-cyan-400 rounded-full blur-md"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[7px] font-black uppercase tracking-[0.5em] text-pink-500 leading-none mb-1">Branded AI Identity</span>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">Dior Precision Analytical Deep Engine</span>
           <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" />
              <span className="text-[8px] font-black text-secondary">v4.2.0</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
