import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles, X } from 'lucide-react';

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for the 'appinstalled' event
    window.addEventListener('appinstalled', (evt) => {
      console.log('AyiahMind was installed.');
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isDismissed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Maybe persist dismissal in session storage so it doesn't pop up again this session
    sessionStorage.setItem('pwa_dismissed', 'true');
  };

  useEffect(() => {
    if (sessionStorage.getItem('pwa_dismissed') === 'true') {
      setIsDismissed(true);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed bottom-32 lg:bottom-40 right-6 lg:right-12 z-[110] flex flex-col items-end gap-3"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            
            <div className="relative glass-dark p-6 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col gap-4 max-w-[280px]">
              <button 
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-secondary hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 vibrant-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary italic font-serif">AyiahMind Pro</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-magenta">Neural Desktop App</p>
                </div>
              </div>

              <p className="text-[10px] leading-relaxed text-secondary font-medium tracking-wide">
                Install for faster access, offline intelligence & specialized OS-level integration.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInstallClick}
                className="w-full py-3 vibrant-gradient rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-magenta/20"
              >
                <Download className="w-4 h-4" /> Install AyiahMind
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
