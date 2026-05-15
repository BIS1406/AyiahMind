import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Sparkles, 
  Brain, 
  Zap, 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  Crown,
  ChevronLeft,
  ArrowRight,
  Star,
  Cpu,
  Monitor,
  Cloud,
  Mic,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';

const PLANS = [
  {
    id: 'free',
    name: 'Standard Node',
    subtitle: 'Base Intelligence',
    price: '0',
    currency: 'GHS',
    period: '/mo',
    description: 'Fundamental tools for the casual scholar.',
    features: [
      'Maximum 5 uploads per day',
      '5 AI High-Precision Summaries',
      '3 Specialized Quizzes (10 Qs max)',
      '20 AI Coach Messages Daily',
      'Basic PDF Analysis (10MB limit)'
    ],
    buttonText: 'Current Plan',
    highlighted: false,
    gradient: 'from-zinc-800 to-zinc-900',
    icon: <Cpu className="w-6 h-6" />
  },
  {
    id: 'elite',
    name: 'Dior Elite',
    subtitle: 'Maximum Precision',
    price: '20',
    currency: 'GHS',
    period: '/mo',
    description: 'Complete neural integration for a professional academic career.',
    features: [
      'Unlimited High-Speed Uploads',
      'Unlimited Analysis & Summaries',
      'Unlimited Specialized Quizzes',
      'Unlimited Dior AI Coach Access',
      'OCR Handwritten Note Scanning',
      'Futuristic Voice AI Assistant',
      'Global Cloud Research Sync',
      'Dior Strategic Growth Analytics'
    ],
    buttonText: 'Upgrade to Elite',
    highlighted: true,
    gradient: 'from-primary to-blue-600',
    badge: 'Most Significant',
    icon: <Crown className="w-6 h-6" />
  },
  {
    id: 'school',
    name: 'Institutional',
    subtitle: 'Campus-wide Synapse',
    price: 'Custom',
    description: 'Bespoke deployments for educational institutions and research labs.',
    features: [
      'Fleet Management',
      'Custom LLM Fine-tuning',
      'Internal Knowledge Graph',
      'Enterprise SSO & Security',
      'Dedicated Architect Support'
    ],
    buttonText: 'Contact Us',
    highlighted: false,
    gradient: 'from-zinc-900 to-black',
    isContact: true,
    icon: <ShieldCheck className="w-6 h-6" />
  }
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [showNumber, setShowNumber] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);

  const handleReveal = () => {
    setContactRevealed(true);
    setShowNumber(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />

      <main className="flex-1 ml-0 lg:ml-[100px] xl:ml-[280px] transition-all duration-500 min-h-screen pb-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-20">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-16 lg:mb-24 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 glass px-5 py-2 rounded-full border border-primary/20 text-primary"
            >
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Upgrade Cognitive Tier</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif italic text-primary leading-tight"
            >
              Architect Your <span className="not-italic font-sans font-black tracking-tighter">Peak Potential</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-secondary max-w-2xl text-lg font-light leading-relaxed"
            >
              Select the neural synchronization tier that aligns with your academic ambitions. 
              Powered by the <span className="text-primary font-medium">Dior Precision Analytical Deep Engine</span>.
            </motion.p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {PLANS.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className={`relative flex flex-col p-8 lg:p-10 rounded-[3rem] border transition-all duration-500 overflow-hidden group ${
                  plan.highlighted 
                    ? 'bg-primary border-transparent text-inverted shadow-[0_40px_80px_rgba(var(--primary-rgb),0.25)]' 
                    : 'glass border-theme text-primary hover:border-primary/30'
                }`}
              >
                {/* Background Glow */}
                <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 ${plan.highlighted ? 'bg-inverted' : 'bg-primary'}`} />

                {plan.badge && (
                  <div className="absolute top-8 right-8">
                    <span className="px-4 py-1.5 glass rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-inverted/20 bg-inverted/10">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-10 space-y-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.highlighted ? 'bg-inverted/10 text-inverted' : 'bg-primary/10 text-primary'}`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif italic mb-1">{plan.name}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${plan.highlighted ? 'opacity-60' : 'text-secondary'}`}>{plan.subtitle}</p>
                  </div>
                </div>

                <div className="mb-10">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-sm font-black opacity-60">{plan.currency}</span>
                    <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                    <span className="text-sm font-bold opacity-60 tracking-widest uppercase">{plan.period}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlighted ? 'opacity-80' : 'text-secondary font-light'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="flex-1 space-y-5 mb-12">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-4">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.highlighted ? 'text-inverted' : 'text-primary'}`} />
                      <span className={`text-sm font-medium ${plan.highlighted ? 'opacity-90' : 'text-secondary'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {!plan.isContact ? (
                  <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all transform hover:scale-105 active:scale-95 shadow-xl ${
                    plan.highlighted 
                      ? 'bg-inverted text-primary hover:shadow-2xl' 
                      : 'glass border border-theme hover:bg-surface'
                  }`}>
                    {plan.buttonText}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <motion.button 
                      onClick={() => window.location.href = 'mailto:contact@ayiahmind.com'}
                      className="w-full py-5 glass border border-theme rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:border-primary transition-all flex items-center justify-center gap-3"
                    >
                      <MessageSquare className="w-4 h-4" /> Chat with Us
                    </motion.button>
                    
                    <motion.button 
                      onClick={handleReveal}
                      className="w-full py-5 bg-primary text-inverted rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-3 shadow-lg"
                    >
                      <Phone className="w-4 h-4" /> 
                      {contactRevealed ? '0554029814' : 'Click to View Number'}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Secure Badge */}
          <div className="mt-20 flex flex-col items-center gap-6 opacity-40">
             <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-[0.4em]">Enterprise-Grade Encryption Secured</span>
             </div>
             <p className="text-[10px] uppercase tracking-widest text-center max-w-md antialiased">
                Payment systems managed via highly secure Dior gateways. All upgrades are final upon neural instantiation.
             </p>
          </div>

        </div>
      </main>
    </div>
  );
}
