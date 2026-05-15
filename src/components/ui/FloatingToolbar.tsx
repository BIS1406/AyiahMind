import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  Share2, 
  FileDown, 
  Plus, 
  Search, 
  LayoutGrid,
  Zap,
  Printer,
  ChevronUp,
  X,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FloatingToolbarProps {
  onSearch: () => void;
  onImport: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  activeItem?: string;
}

export default function FloatingToolbar({ 
  onSearch, 
  onImport, 
  onSave, 
  onShare, 
  onReport,
  activeItem 
}: FloatingToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-24 lg:bottom-12 right-6 lg:right-12 z-[100] flex flex-col items-end gap-4">
      
      {/* Sub-actions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col gap-3 mb-2"
          >
            {onReport && (
              <ToolbarButton 
                onClick={onReport} 
                icon={<FileDown className="w-5 h-5" />} 
                label="Report" 
                color="bg-orange-500" 
              />
            )}
            {onShare && (
              <ToolbarButton 
                onClick={onShare} 
                icon={<Share2 className="w-5 h-5" />} 
                label="Share" 
                color="bg-cyan-500" 
              />
            )}
            {onSave && (
              <ToolbarButton 
                onClick={onSave} 
                icon={<Save className="w-5 h-5" />} 
                label="Save" 
                color="bg-indigo-500" 
              />
            )}
            <ToolbarButton 
              onClick={() => navigate('/settings')} 
              icon={<LayoutGrid className="w-5 h-5" />} 
              label="System" 
              color="bg-zinc-800" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Toolbar */}
      <motion.div 
        layout
        className="glass-dark p-2 lg:p-3 rounded-[2.5rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex items-center gap-2 lg:gap-3"
      >
        <button 
          onClick={onSearch}
          className="w-12 h-12 lg:w-14 lg:h-14 glass rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg active:scale-90"
          title="Search Knowledge"
        >
          <Search className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>

        <button 
          onClick={onImport}
          className="w-12 h-12 lg:w-14 lg:h-14 vibrant-gradient rounded-full flex items-center justify-center text-white shadow-xl shadow-magenta/20 active:scale-95"
          title="Quick Upload"
        >
          <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>

        <div className="w-px h-8 lg:h-10 bg-white/10 mx-1 lg:mx-2" />

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-12 h-12 lg:w-14 lg:h-14 glass rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-primary text-white rotate-180' : 'text-secondary hover:text-primary'}`}
        >
          {isExpanded ? <X className="w-5 h-5 lg:w-6 lg:h-6" /> : <ChevronUp className="w-5 h-5 lg:w-6 lg:h-6" />}
        </button>
      </motion.div>

      {/* Decorative label */}
      {!isExpanded && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden lg:flex items-center gap-2 px-4 py-1.5 glass rounded-full border border-theme mb-2 mr-2"
        >
          <Sparkles className="w-3 h-3 text-magenta animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-secondary">Neural Multi-Action Unit</span>
        </motion.div>
      )}
    </div>
  );
}

function ToolbarButton({ onClick, icon, label, color }: { onClick: () => void, icon: React.ReactNode, label: string, color: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, x: -10 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex items-center gap-3 group"
    >
      <span className="text-[8px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-3 py-1.5 rounded-lg border border-theme">
        {label}
      </span>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl ${color} shadow-${color.split('-')[1]}/20`}>
        {icon}
      </div>
    </motion.button>
  );
}
