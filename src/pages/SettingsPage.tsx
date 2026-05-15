import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Moon, 
  Sun, 
  Bell, 
  Brain, 
  Shield, 
  HardDrive, 
  Palette, 
  Globe, 
  Mail, 
  Lock, 
  Eye, 
  Zap, 
  Cpu, 
  Smartphone,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Crown
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import { useTheme, ColorTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const SettingsSection = ({ title, description, icon: Icon, children }: { title: string, description: string, icon: any, children: React.ReactNode }) => (
  <motion.section 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="glass p-8 rounded-[2.5rem] border border-theme mb-8"
  >
    <div className="flex items-start gap-6 mb-8">
      <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-primary border border-theme">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-primary uppercase">{title}</h2>
        <p className="text-sm text-secondary font-medium">{description}</p>
      </div>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </motion.section>
);

const SettingItem = ({ label, description, children }: { label: string, description: string, children: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-theme last:border-0">
    <div className="max-w-md">
      <h3 className="font-bold text-primary">{label}</h3>
      <p className="text-xs text-secondary leading-relaxed">{description}</p>
    </div>
    <div className="shrink-0">
      {children}
    </div>
  </div>
);

export default function SettingsPage() {
  const { theme, colorTheme, toggleTheme, setColorTheme } = useTheme();
  const { user, tier } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('appearance');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    // Simulate neural cache purge
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsClearing(false);
    setIsClearModalOpen(false);
  };

  const colorThemes: { id: ColorTheme, color: string, name: string }[] = [
    { id: 'blue', color: '#3b82f6', name: 'Royal Blue' },
    { id: 'purple', color: '#a855f7', name: 'Imperial Purple' },
    { id: 'cyan', color: '#06b6d4', name: 'Deep Cyan' },
    { id: 'green', color: '#10b981', name: 'Emerald Green' },
  ];

  return (
    <div className="min-h-screen bg-background text-primary font-sans flex pb-20 lg:pb-0">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1 ml-0 lg:ml-[100px] xl:ml-[280px] transition-[margin] duration-500 min-h-screen overflow-y-auto overflow-x-hidden cyber-grid">
        <header className="h-28 flex items-center px-6 lg:px-12 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-theme">
          <div>
            <h1 className="text-xs lg:text-sm font-black uppercase tracking-[0.4em] text-secondary">Settings</h1>
            <p className="text-2xl lg:text-3xl font-serif italic text-primary">Customize Your Workspace</p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6 lg:p-12 relative z-10">
          
          {/* Appearance Section */}
          <SettingsSection 
            title="Appearance" 
            description="Customize the visual atmosphere of your workspace."
            icon={Palette}
          >
            <SettingItem 
              label="Interface Mode" 
              description="Switch between light and dark visual profiles for optimal comfort."
            >
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-4 glass p-1.5 rounded-2xl border border-theme w-40 relative overflow-hidden"
              >
                <motion.div 
                  className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-primary rounded-xl"
                  animate={{ x: theme === 'dark' ? '100%' : '0%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                <div className={`flex-1 flex items-center justify-center gap-2 py-2 relative z-10 text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-inverted' : 'text-secondary'}`}>
                  <Sun className="w-3 h-3" /> Light
                </div>
                <div className={`flex-1 flex items-center justify-center gap-2 py-2 relative z-10 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-inverted' : 'text-secondary'}`}>
                  <Moon className="w-3 h-3" /> Dark
                </div>
              </button>
            </SettingItem>

            <SettingItem 
              label="Accent Palette" 
              description="Choose a primary color language to harmonize with your intellectual workflow."
            >
              <div className="flex gap-3">
                {colorThemes.map((ct) => (
                  <button
                    key={ct.id}
                    onClick={() => setColorTheme(ct.id)}
                    className={`w-10 h-10 rounded-full border-2 p-1 transition-all hover:scale-110 ${colorTheme === ct.id ? 'border-primary' : 'border-transparent'}`}
                    title={ct.name}
                  >
                    <div 
                      className="w-full h-full rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" 
                      style={{ backgroundColor: ct.color }}
                    />
                  </button>
                ))}
              </div>
            </SettingItem>
          </SettingsSection>

          {/* Subscription Section */}
          <SettingsSection 
            title="Subscription" 
            description="Manage your neural synchronization tier and cognitive access."
            icon={Crown}
          >
            <div className={`p-8 rounded-[2rem] border transition-all duration-300 ${
              tier === 'premium' 
                ? 'bg-primary border-transparent text-inverted shadow-xl' 
                : 'glass border-theme text-primary'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <h3 className="text-xl font-bold italic font-serif mb-2">{tier === 'premium' ? 'Dior Elite Mastery' : 'Standard Intelligence'}</h3>
                  <p className={`text-xs font-medium max-w-sm ${tier === 'premium' ? 'opacity-80' : 'text-secondary'}`}>
                    {tier === 'premium' 
                      ? 'Your cognitive bandwidth is fully optimized. The Dior Precision Engine is running at peak capacity.' 
                      : 'You are currently using the fundamental intelligence node. Upgrade to unlock full analytical precision.'}
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/pricing')}
                  className={`px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all transform hover:scale-105 active:scale-95 ${
                    tier === 'premium' 
                      ? 'bg-inverted text-primary shadow-lg' 
                      : 'bg-primary text-inverted shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)]'
                  }`}
                >
                  {tier === 'premium' ? 'View Details' : 'Upgrade to Elite'}
                </button>
              </div>
            </div>
          </SettingsSection>

          {/* Account Section */}
          <SettingsSection 
            title="Account" 
            description="Manage your identity and subscription status."
            icon={User}
          >
            <div className="glass p-6 rounded-3xl border border-theme flex flex-col md:flex-row items-center gap-8 mb-4">
              <div className="w-24 h-24 glass rounded-full flex items-center justify-center text-4xl font-serif italic border-2 border-primary overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-primary">{user?.displayName || 'Dior Scholar'}</h3>
                <p className="text-sm text-secondary font-medium mb-4">{user?.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <span className={`px-3 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    tier === 'premium' ? 'text-primary border-primary/20' : 'text-secondary border-theme'
                  }`}>
                    Tier: {tier === 'premium' ? 'Dior Elite' : 'Standard Node'}
                  </span>
                  <span className="px-3 py-1 glass rounded-full text-[10px] font-black uppercase tracking-widest text-green-400 border border-green-500/20">
                    Sync Status: Active
                  </span>
                </div>
              </div>
            </div>
            
            <SettingItem 
              label="Display Identity" 
              description="The name visible across your research reports and synthesis logs."
            >
              <input 
                type="text" 
                defaultValue={user?.displayName || ''} 
                className="bg-surface border border-theme rounded-xl px-4 py-2 text-sm text-primary focus:border-primary outline-none transition-all w-full sm:w-64"
                placeholder="Enter display name"
              />
            </SettingItem>
          </SettingsSection>

          {/* Notifications Section */}
          <SettingsSection 
            title="Notifications" 
            description="Configure how the Dior AI interacts with your focus sessions."
            icon={Bell}
          >
            <SettingItem 
              label="Push Directives" 
              description="Real-time alerts for study goals, quiz availability, and schedule adjustments."
            >
              <div className="w-12 h-6 glass border border-theme rounded-full p-1 relative cursor-pointer">
                <div className="absolute right-1 top-1 bottom-1 w-4 bg-primary rounded-full" />
              </div>
            </SettingItem>
            <SettingItem 
              label="Email Summaries" 
              description="Weekly syntheses of your intellectual growth and performance analytics."
            >
              <div className="w-12 h-6 glass border border-theme rounded-full p-1 relative cursor-pointer">
                <div className="absolute right-1 top-1 bottom-1 w-4 bg-primary rounded-full" />
              </div>
            </SettingItem>
          </SettingsSection>

          {/* AI Settings Section */}
          <SettingsSection 
            title="AI Settings" 
            description="Fine-tune the neural parameters of the Dior Intelligence engine."
            icon={Brain}
          >
            <SettingItem 
              label="Model Precision" 
              description="Adjust the balance between analytical rigor and creative synthesis."
            >
              <select className="bg-surface border border-theme rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-primary focus:border-primary outline-none transition-all cursor-pointer">
                <option>Analytical (Deep)</option>
                <option>Heuristic (Fast)</option>
                <option>Nuanced (Hybrid)</option>
              </select>
            </SettingItem>
            <SettingItem 
              label="Tone & Personality" 
              description="The rhetorical style used by the Dior AI Coach."
            >
              <select className="bg-surface border border-theme rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-primary focus:border-primary outline-none transition-all cursor-pointer">
                <option>Stoic & Formal</option>
                <option>Empathetic & Supportive</option>
                <option>Direct & Results-Oriented</option>
              </select>
            </SettingItem>
          </SettingsSection>

          {/* Security Section */}
          <SettingsSection 
            title="Security" 
            description="Assurance protocols for your intellectual property."
            icon={Shield}
          >
            <SettingItem 
              label="Two-Factor Assurance" 
              description="Elevate account security with secondary biometric or token verification."
            >
              <button className="px-6 py-2 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-primary border border-theme hover:bg-surface transition-all">
                Enable Protocol
              </button>
            </SettingItem>
            <SettingItem 
              label="Active Sessions" 
              description="Monitor and manage all hardware currently interfaced with your data."
            >
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-red-500 transition-colors">
                View Access Logs <ChevronRight className="w-3 h-3" />
              </button>
            </SettingItem>
          </SettingsSection>

          {/* Storage Section */}
          <SettingsSection 
            title="Storage" 
            description="Monitor and optimize your holographic data usage."
            icon={HardDrive}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Neural Capacity</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">12.4 GB / 50 GB</span>
              </div>
              <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-theme">
                <div className="h-full bg-primary w-[24.8%] shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
              </div>
            </div>
            
            <SettingItem 
              label="Automated Pruning" 
              description="Automatically archive synthesis logs older than 90 cycles."
            >
              <div className="w-12 h-6 glass border border-theme rounded-full p-1 relative cursor-pointer">
                <div className="absolute left-1 top-1 bottom-1 w-4 bg-secondary/20 rounded-full" />
              </div>
            </SettingItem>

            <SettingItem 
              label="Neural Cache Optimization" 
              description="Purge temporary analytical fragments and redundant cognitive metadata."
            >
              <button 
                onClick={() => setIsClearModalOpen(true)}
                className="px-6 py-2 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 border border-red-500/20 hover:bg-red-500/5 transition-all"
              >
                Flush Cache
              </button>
            </SettingItem>
          </SettingsSection>

          <footer className="mt-20 pb-20 text-center">
             <div className="flex items-center justify-center gap-3 opacity-20 mb-4">
                <Brain className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Core OS v2.4.0 • Academic Tier</span>
             </div>
             <p className="text-[8px] text-secondary font-black uppercase tracking-widest">Studymate Dior Excellence Framework</p>
          </footer>
        </main>
      </div>

      {/* Clear Cache Confirmation Modal */}
      <AnimatePresence>
        {isClearModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isClearing && setIsClearModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass p-10 rounded-[3rem] border border-theme shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/10 rounded-full blur-[80px]" />
              
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 glass rounded-[2rem] flex items-center justify-center text-red-500 mx-auto mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                  <Zap className={`w-10 h-10 ${isClearing ? 'animate-pulse' : ''}`} />
                </div>
                
                <h2 className="text-2xl font-serif italic mb-4 text-primary">Neural Purge Protocol</h2>
                <p className="text-secondary text-sm font-medium leading-relaxed mb-10">
                  {isClearing 
                    ? "Defragmenting neural clusters and flushing temporary analytical data. Please maintain connection..."
                    : "You are about to clear the localized AI cache. This will optimize performance but may cause short delays in retrieving recent synthesis fragments."
                  }
                </p>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleClearCache}
                    disabled={isClearing}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-3 ${
                      isClearing 
                        ? 'bg-zinc-800 text-secondary cursor-wait' 
                        : 'bg-red-500 text-white shadow-[0_15px_30px_rgba(239,68,68,0.2)] hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isClearing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                        Purging Engine...
                      </>
                    ) : 'Initiate Flush'}
                  </button>
                  
                  {!isClearing && (
                    <button 
                      onClick={() => setIsClearModalOpen(false)}
                      className="w-full py-5 glass border border-theme rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] text-secondary hover:text-primary transition-all"
                    >
                      Abort Protocol
                    </button>
                  )}
                </div>

                {isClearing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex flex-col items-center gap-3"
                  >
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                       <span className="text-[8px] font-black uppercase tracking-widest text-red-500/50">Engine Sanitization in Progress</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
