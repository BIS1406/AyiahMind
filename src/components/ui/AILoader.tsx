import { motion } from 'motion/react';
import { Brain, Sparkles } from 'lucide-react';

interface AILoaderProps {
  label?: string;
  sublabel?: string;
}

export default function AILoader({ 
  label = "Synthesizing Neural Networks...", 
  sublabel = "Initializing Dior Precision Analytical Deep Engine" 
}: AILoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
      <div className="relative mb-12">
        {/* Outer rotating ring */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border-2 border-dashed border-blue-500/20"
        />
        
        {/* Inner pulsing glow */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 m-auto w-16 h-16 bg-blue-500/20 blur-2xl rounded-full"
        />

        {/* Central Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              filter: ["brightness(1)", "brightness(2)", "brightness(1)"],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-blue-400"
          >
            <Brain className="w-12 h-12" />
          </motion.div>
        </div>

        {/* Scanner Line */}
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_15px_#3b82f6] opacity-50 z-10"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          <h2 className="text-2xl font-serif italic text-white/90">{label}</h2>
        </div>
        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">{sublabel}</p>
      </motion.div>

      {/* Progress mini-bar */}
       <div className="w-48 h-1 bg-white/5 rounded-full mt-10 overflow-hidden relative">
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 w-2/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          />
       </div>
    </div>
  );
}
