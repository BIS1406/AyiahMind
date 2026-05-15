import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Brain, 
  Calendar, 
  Home,
  Sun,
  Moon,
  Settings,
  Crown
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'landing', icon: Home, label: 'Home', path: '/' },
    { id: 'coach', icon: Brain, label: 'Coach', path: '/coach' },
    { id: 'pricing', icon: Crown, label: 'Elite', path: '/pricing' },
    { id: 'planner', icon: Calendar, label: 'Plan', path: '/planner' },
    { id: 'settings', icon: Settings, label: 'Sets', path: '/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 inset-x-0 h-20 bg-background/80 backdrop-blur-md border-t border-theme z-[60] lg:hidden flex items-center justify-around px-2">
      {menuItems.map((item) => (
        <motion.button
          key={item.id}
          whileTap={{ scale: 0.9 }}
          onClick={() => item.path !== '#' && navigate(item.path)}
          className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 relative ${
            isActive(item.path) 
              ? 'text-primary' 
              : 'text-secondary'
          }`}
        >
          <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : ''}`} />
          <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          
          {isActive(item.path) && (
            <motion.div 
              layoutId="mobile-nav-active"
              className="absolute -top-2 w-8 h-1 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] rounded-full"
            />
          )}
        </motion.button>
      ))}

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="flex flex-col items-center gap-1 p-2 text-secondary hover:text-primary transition-all relative"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        <span className="text-[8px] font-black uppercase tracking-widest">Theme</span>
      </motion.button>
    </nav>
  );
}
