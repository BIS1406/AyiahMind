import { motion } from 'motion/react';
import { 
  Sparkles, 
  LayoutDashboard, 
  Brain, 
  Calendar, 
  Trophy, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowLeft,
  Sun,
  Moon,
  Crown,
  Search,
  Command
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { tier } = useAuth();

  const menuItems = [
    { id: 'landing', icon: Home, label: 'Home', path: '/' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Research', path: '/dashboard' },
    { id: 'coach', icon: Brain, label: 'AI Coach', path: '/coach' },
    { id: 'planner', icon: Calendar, label: 'Planner', path: '/planner' },
    { id: 'pricing', icon: Crown, label: 'Upgrade Elite', path: '/pricing' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 100 : 280 }}
      className="fixed left-0 top-0 h-screen bg-background border-r border-theme z-[60] hidden lg:flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
    >
      {/* Logo Section */}
      <div 
        className="h-28 flex items-center px-8 justify-between shrink-0 cursor-pointer"
        onClick={() => navigate('/')}
      >
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-blue-500 rounded-2xl blur-md"
              />
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-xl relative z-10">
                <Sparkles className="w-6 h-6 text-inverted" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.2em] leading-none text-primary">AyiahMind</h1>
              <p className="text-[8px] text-secondary uppercase tracking-widest mt-1 font-bold">Dior Neural OS</p>
            </div>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <Sparkles className="w-6 h-6 text-inverted" />
          </div>
        )}
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
        {/* Navigation Controls */}
        <div className="px-4 mb-8 space-y-2">
          <button 
            onClick={() => navigate(-1)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-secondary hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span>Back</span>}
          </button>
        </div>

        <div className="px-4 mb-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="w-full flex items-center justify-between gap-4 px-6 py-4 glass rounded-[2rem] border border-theme hover:border-primary/20 transition-all cursor-pointer group"
          >
             <div className="flex items-center gap-4">
                <Search className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary group-hover:text-primary">Search</span>}
             </div>
             {!isCollapsed && (
                <div className="flex items-center gap-1 glass px-2 py-0.5 rounded-lg border border-theme opacity-40">
                   <Command className="w-2 h-2" />
                   <span className="text-[8px] font-black uppercase">K</span>
                </div>
             )}
          </motion.div>
        </div>

        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => item.path !== '#' && navigate(item.path)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-300 group relative ${
              isActive(item.path) 
                ? 'text-white vibrant-gradient shadow-[0_10px_30px_rgba(192,38,211,0.4)]' 
                : 'text-secondary hover:text-primary hover:bg-surface'
            }`}
          >
            <item.icon className={`w-5 h-5 shrink-0 transition-all duration-300 ${
              isActive(item.path) ? 'text-white scale-110' : 'group-hover:scale-110'
            }`} />
            {!isCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
            )}
            {item.id === 'pricing' && tier === 'premium' && (
              <div className="absolute right-6 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_gold]" />
              </div>
            )}
            {isActive(item.path) && !isCollapsed && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute right-6 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"
              />
            )}
            {!isActive(item.path) && !isCollapsed && item.id === 'coach' && (
              <div className="absolute right-6 flex items-center gap-1">
                <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                <span className="text-[6px] font-black uppercase text-cyan-500/50">Live</span>
              </div>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Footer Section */}
      <div className="p-4 space-y-2 shrink-0">
        <motion.button 
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleTheme}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl text-secondary hover:text-primary hover:bg-surface transition-all group"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
          )}
          {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </motion.button>
        <motion.button 
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all group ${
            isActive('/settings') 
              ? 'text-inverted bg-primary shadow-xl shadow-primary/20' 
              : 'text-secondary hover:text-primary hover:bg-surface'
          }`}
        >
          <Settings className={`w-5 h-5 transition-all duration-300 ${
            isActive('/settings') ? 'text-inverted rotate-45' : 'group-hover:rotate-45'
          }`} />
          {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Settings</span>}
        </motion.button>
        <motion.button 
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signOut(auth)}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl text-red-500/60 hover:text-red-400 hover:bg-red-500/5 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logout</span>}
        </motion.button>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-4 w-full flex items-center justify-center p-3 text-secondary hover:text-primary transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {!isCollapsed && (
          <div className="mt-8 text-center pb-4">
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/20">Powered by Ayiah</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
