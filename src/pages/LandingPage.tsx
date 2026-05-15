import { motion, useScroll, useTransform } from 'motion/react';
import { 
  Sparkles, 
  BrainCircuit, 
  LayoutDashboard, 
  MessageSquareText, 
  ChevronRight,
  Star,
  CheckCircle2,
  Menu,
  X,
  Zap,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [0, 0.9]);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-colors duration-500"
      style={{
        backgroundColor: theme === 'dark' ? `rgba(0, 0, 0, ${opacity.get()})` : `rgba(255, 255, 255, ${opacity.get()})`,
        backdropFilter: 'blur(12px)',
        borderBottom: opacity.get() > 0 ? '1px solid var(--border)' : 'none'
      }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold tracking-tighter font-serif italic text-primary uppercase">AyiahMind</span>
      </div>
      
      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-widest uppercase text-secondary">
        <a href="#features" className="hover:text-primary transition-colors">Features</a>
        <a href="#preview" className="hover:text-primary transition-colors">Preview</a>
        <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 transition-all hover:bg-surface rounded-full text-secondary hover:text-primary"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="px-6 py-2 bg-primary text-inverted rounded-full text-xs font-bold tracking-widest uppercase hover:scale-105 transition-all">
              DASHBOARD
            </Link>
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <UserIcon className="w-4 h-4 text-secondary" />
              <span className="text-xs font-bold tracking-widest uppercase truncate max-w-[100px] text-primary">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="p-2 glass rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all text-secondary"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link to="/login" className="px-6 py-2 glass rounded-full text-sm font-semibold hover:bg-primary hover:text-inverted transition-all text-primary">
            ENROLL NOW
          </Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden text-primary" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl p-8 flex flex-col gap-6 md:hidden border-b border-theme text-primary"
        >
          <a href="#features" onClick={() => setIsOpen(false)} className="text-lg">Features</a>
          <a href="#preview" onClick={() => setIsOpen(false)} className="text-lg">Preview</a>
          <a href="#pricing" onClick={() => setIsOpen(false)} className="text-lg">Pricing</a>
          <button 
            onClick={() => { toggleTheme(); setIsOpen(false); }}
            className="flex items-center gap-4 text-lg"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          {user ? (
            <div className="flex flex-col gap-4">
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="w-full py-4 bg-primary text-inverted rounded-xl font-bold text-center">DASHBOARD</Link>
              <button onClick={() => signOut(auth)} className="w-full py-4 glass rounded-xl font-bold text-red-500">SIGN OUT</button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} className="w-full py-4 glass rounded-xl font-bold flex items-center justify-center">GET STARTED</Link>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(192,38,211,0.1)_0%,transparent_50%)]" />
      <div className="absolute top-[-10%] -left-[10%] w-[60%] h-[60%] pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15)_0%,transparent_70%)] blur-[120px]" />
      <div className="absolute bottom-[-10%] -right-[10%] w-[60%] h-[60%] pointer-events-none -z-10 bg-[radial-gradient(circle_at_center,rgba(219,39,119,0.15)_0%,transparent_70%)] blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-5xl"
      >
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-block px-5 py-2 glass rounded-full text-[10px] font-bold tracking-[0.4em] uppercase mb-10 text-white shadow-[0_0_20px_rgba(192,38,211,0.3)] border-purple-500/20"
        >
          The Future of Academic Excellence
        </motion.div>
        <h1 className="text-6xl md:text-9xl font-serif italic mb-10 leading-[0.9] text-white text-balance tracking-tighter">
          Master Your <br /> 
          <span className="not-italic font-sans font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 via-blue-400 to-cyan-400 animate-pulse-vibrant">
            Academic Journey
          </span>
        </h1>
        <p className="text-lg md:text-xl text-secondary mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          Unlock infinite cognitive potential. AyiahMind is the elite AI-driven ecosystem powered by the Dior Precision Analytical Deep Engine.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to={useAuth().user ? "/dashboard" : "/signup"} className="w-full sm:w-auto px-12 py-6 vibrant-gradient text-white rounded-full font-black text-lg hover:scale-110 active:scale-95 transition-all shadow-[0_20px_60px_rgba(192,38,211,0.4)] cursor-pointer text-center uppercase tracking-widest border-none">
            {useAuth().user ? "Go to Dashboard" : "Begin Ascension"}
          </Link>
          <button className="w-full sm:w-auto px-12 py-6 glass rounded-full font-bold text-lg hover:bg-surface transition-all flex items-center justify-center gap-3 cursor-pointer text-white border-white/20">
            Watch Reality <ChevronRight className="w-5 h-5 font-bold text-purple-400" />
          </button>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mt-20 w-full max-w-5xl glass rounded-t-3xl border-b-0 p-4 aspect-video relative overflow-hidden group shadow-2xl shadow-blue-500/10"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <div className="w-full h-full bg-zinc-900 rounded-2xl overflow-hidden flex flex-col">
          <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 p-8 flex gap-8">
            <div className="w-1/3 space-y-4">
              <div className="h-8 glass rounded-lg w-3/4" />
              <div className="h-32 glass rounded-lg" />
              <div className="h-20 glass rounded-lg w-5/6" />
            </div>
            <div className="flex-1 space-y-6">
              <div className="h-12 glass rounded-xl w-1/4" />
              <div className="space-y-3">
                <div className="h-4 glass rounded-full w-full" />
                <div className="h-4 glass rounded-full w-full" />
                <div className="h-4 glass rounded-full w-2/3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-40 glass rounded-2xl" />
                <div className="h-40 glass rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 py-12 flex justify-center z-20">
            <span className="px-6 py-2 glass rounded-full text-xs font-bold tracking-widest text-white animate-pulse">
                INTERACTIVE WORKSPACE
            </span>
        </div>
      </motion.div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "Neural Synthesis",
      desc: "Instant multi-dimensional mapping of complex datasets and academic literature via Dior Engine."
    },
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: "Strategic Planning",
      desc: "AI-driven study schedules that adapt to your performance and deadlines in real-time."
    },
    {
      icon: <MessageSquareText className="w-6 h-6" />,
      title: "Socratic Dialogues",
      desc: "Engage in deep philosophical or technical debates with your assistant to cement learning."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Rapid Quiz Forge",
      desc: "Generate custom mock exams and flashcards from your study materials in seconds."
    }
  ];

  return (
    <section id="features" className="py-32 px-6 bg-background relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-6xl font-serif italic mb-6 text-primary">Precision-Engineered Intelligence</h2>
            <p className="text-secondary max-w-xl mx-auto">Every module in AyiahMind is architected to accelerate high-level cognitive processing.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 glass rounded-3xl hover:bg-surface transition-all group cursor-default"
            >
              <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight text-primary uppercase">{f.title}</h3>
              <p className="text-secondary leading-relaxed text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AIPreview = () => {
  return (
    <section id="preview" className="py-32 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        <div className="flex-1 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
          <span className="px-4 py-1.5 glass rounded-full text-[10px] font-bold tracking-widest uppercase text-white/50">
            INTELLIGENCE IN ACTION
          </span>
          <h2 className="text-5xl md:text-7xl font-serif italic leading-tight">
            The AI That <br /> 
            <span className="not-italic font-sans font-bold">Thinks With You</span>
          </h2>
          <p className="text-lg text-white/50 leading-relaxed max-w-lg mx-auto lg:mx-0">
            AyiahMind doesn't just process data; it architects understanding. Powered by the Dior Precision Engine, it provides deep analytical insights for the intellectual elite.
          </p>
          
          <ul className="space-y-4 text-left">
            {[ "Multilingual fluency in 100+ languages", "Advanced mathematical reasoning", "Contextual memory across all semesters", "Proactive deadline alerts" ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-white/80">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 w-full lg:w-auto">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-dark rounded-[3rem] p-8 aspect-square flex flex-col"
          >
            <div className="flex-1 overflow-y-auto space-y-6 mb-8 pr-4 scrollbar-hide">
              <div className="flex flex-col gap-2 max-w-[80%]">
                <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest pl-4">User</span>
                <div className="glass p-4 rounded-3xl rounded-tl-none">
                  Can you help me synthesize the main arguments of the Kantian ethics lecture and how it contrasts with Utilitarianism?
                </div>
              </div>
              
              <div className="flex flex-col gap-2 max-w-[90%] self-end items-end">
                <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest pr-4">Dior AI Assistant</span>
                <div className="bg-white text-black p-5 rounded-3xl rounded-tr-none shadow-xl">
                    <p className="font-semibold mb-2 italic font-serif text-[10px] text-blue-500 uppercase tracking-widest">Synthesis Mode Active</p>
                    <p className="text-sm">I have architected a mental model for Kantian Deontology. Unlike Utilitarianism, it rejects consequentialism in favor of pure reason. I've mapped this to your existing Ethics library.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 max-w-[80%]">
                <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest pl-4">User</span>
                <div className="glass p-4 rounded-3xl rounded-tl-none">
                  Excellent. Generate a rigorous assessment on the Dior Deep Engine.
                </div>
              </div>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Message StudyMate Dior..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-12 focus:outline-none focus:border-white/30 transition-all text-sm"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  return (
    <section className="py-32 px-6 bg-zinc-950/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 text-balance">
            <h2 className="text-4xl md:text-6xl font-serif italic mb-6">Testimonials of Excellence</h2>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-primary text-primary" />)}
            </div>
            <p className="mt-4 text-secondary">Harnessing the Dior Precision Engine.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "Dior transformed my research process. It's like having a Rhodes scholar permanently at your desk.",
              author: "Elena V.",
              role: "Ph.D. Candidate, Oxford"
            },
            {
              quote: "The interface is pure luxury, but the intelligence is the real star. My GPA hasn't been this high since high school.",
              author: "Marcus T.",
              role: "Law Student, Harvard"
            },
            {
              quote: "A masterpiece of AI integration. It doesn't just help me study; it helps me THINK better.",
              author: "Sophia L.",
              role: "Medical Student, Stanford"
            }
          ].map((t, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="glass p-10 rounded-[2.5rem] relative flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl font-serif mb-6 opacity-20">"</div>
                <p className="text-lg italic font-serif leading-relaxed mb-8">{t.quote}</p>
              </div>
              <div>
                <p className="font-bold tracking-tight">{t.author}</p>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-1">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  return (
    <section id="pricing" className="py-32 px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 text-white">
            <h2 className="text-4xl md:text-6xl font-serif italic mb-6">Choose Your Tier</h2>
            <p className="text-white/50 text-balance">Invest in your intellectual future with our elite selection of plans.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          <div className="p-10 glass rounded-[3rem] flex flex-col text-white">
            <h3 className="text-xl font-bold mb-2 tracking-widest text-white/80">FREE PLAN</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold tracking-tighter">GHS 0</span>
              <span className="text-white/40">/mo</span>
            </div>
            <ul className="flex-1 space-y-4 mb-10">
              {["Limited PDF uploads", "Basic AI summaries", "Limited quizzes", "Basic AI coach access"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                  <CheckCircle2 className="w-5 h-5 text-white/20 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="w-full py-4 glass rounded-2xl font-bold hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[10px] text-center">Begin Journey</Link>
          </div>

          <div className="p-10 bg-white text-black rounded-[3rem] relative flex flex-col scale-105 shadow-[0_40px_100px_rgba(255,255,255,0.1)] z-10 vibrant-gradient border-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-5 py-2 bg-white text-purple-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
                Most Popular
            </div>
            <h3 className="text-xl font-bold mb-2 italic font-serif text-white">DIOR ELITE</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold tracking-tighter sm:text-5xl text-white">GHS 20</span>
              <span className="opacity-60 text-white font-bold">/mo</span>
            </div>
            <ul className="flex-1 space-y-4 mb-10">
              {["Unlimited uploads", "Advanced AI summaries", "Unlimited quizzes", "AI study coach pro", "OCR note scanning", "Premium analytics"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white font-medium">
                  <CheckCircle2 className="w-5 h-5 text-white/50 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="w-full py-5 bg-white text-purple-600 rounded-2xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.2)] uppercase tracking-[0.2em] text-[10px] text-center">Architect Your Potential</Link>
          </div>

          <div className="p-10 glass rounded-[3rem] flex flex-col text-white">
            <h3 className="text-xl font-bold mb-2 tracking-widest text-white/80">SCHOOL PLAN</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-2xl font-bold tracking-tight">Contact Us</span>
            </div>
            <p className="text-xs text-white/40 mb-6 italic">Custom pricing for institutions</p>
            <ul className="flex-1 space-y-4 mb-10">
              {["Campus-wide licensing", "Admin insights dashboard", "SSO & Security suite", "Dedicated API access", "Physical concierge support"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                  <CheckCircle2 className="w-5 h-5 text-white/20 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/pricing" className="w-full py-4 glass rounded-2xl font-bold hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[10px] text-center">View Contact</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="pt-32 pb-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
          <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold tracking-tighter font-serif italic text-primary uppercase">AyiahMind</span>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/20 mb-8">Powered by Ayiah</p>
            <p className="max-w-md text-white/50 text-sm leading-relaxed mb-8">
              Crafting tools for the architects of tomorrow. Join an elite community where intelligence meets luxury.
            </p>
            <div className="flex gap-6">
                {["Twitter", "Threads", "LinkedIn", "Instagram"].map(link => (
                    <a key={link} href="#" className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 hover:text-white transition-colors">
                        {link}
                    </a>
                ))}
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><a href="#" className="hover:text-white transition-colors">Workspace</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chrome Extension</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Elite Tiers</a></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Data Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ethics Charter</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 gap-6">
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-secondary/30">
                © 2026 AYIAHMIND • DIOR PRECISION ANALYTICAL DEEP ENGINE.
              </p>
              <p className="text-[8px] uppercase tracking-[0.4em] font-black text-primary/20 mt-2">Powered by Ayiah</p>
            </div>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-3 py-1 glass rounded-full text-[8px] font-black tracking-widest uppercase">SYDNEY</div>
            <div className="px-3 py-1 glass rounded-full text-[8px] font-black tracking-widest uppercase text-white/40">PARIS</div>
            <div className="px-3 py-1 glass rounded-full text-[8px] font-black tracking-widest uppercase text-white/40">TOKYO</div>
            <div className="px-3 py-1 glass rounded-full text-[8px] font-black tracking-widest uppercase text-white/40">MILAN</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function LandingPage() {
  return (
    <div className="selection:bg-primary selection:text-inverted scroll-smooth min-h-screen bg-background text-primary cyber-grid transition-colors duration-500">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <AIPreview />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
