import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  ChevronLeft, 
  Mic, 
  Trash2, 
  Brain, 
  User as UserIcon,
  Loader2,
  Clock,
  History,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { useUsage } from '../context/UsageContext';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
}

const SUGGESTED_PROMPTS = [
  "Deepen my synthesis of recent biology notes",
  "How can I optimize my study window?",
  "Test my knowledge on Quantum Physics",
  "Explain Semantic Gap in simple terms"
];

import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import DiorEngineBranding from '../components/ui/DiorEngineBranding';

export default function ChatCoach() {
  const { user, tier } = useAuth();
  const { isOverLimit, incrementUsage, setShowUpgradeModal } = useUsage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = (window as any).history.state?.usr;

  useEffect(() => {
    if (location?.initialPrompt && messages.length === 0 && !loading) {
      setInput(location.initialPrompt);
    }
  }, [location, messages.length, loading]);

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  useEffect(() => {
    if (!user) return;

    const chatRef = collection(db, 'users', user.uid, 'messages');
    const q = query(chatRef, orderBy('timestamp', 'asc'), limit(50));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(msgs);
    }, (error) => {
      if (error.message.includes('permission-denied')) {
        console.warn('Chat messages listener delayed');
      } else {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/messages`);
      }
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, streamingContent]);

  const handleSend = async (content?: string) => {
    const text = content || input;
    if (!text.trim() || !user || loading) return;

    if (isOverLimit('coachMessages')) {
      setShowUpgradeModal(true);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: serverTimestamp()
    };

    setInput('');
    setLoading(true);
    setIsTyping(true);
    setStreamingContent('');

    try {
      const path = `users/${user.uid}/messages`;
      await addDoc(collection(db, 'users', user.uid, 'messages'), userMessage);

      const response = await fetch('/api/chat-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          tier
        })
      });

      if (!response.ok) {
        let errorMsg = 'Failed to connect to AI';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // Response might not be JSON if it's a stream error
        }
        throw new Error(errorMsg);
      }

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                fullContent += data.content;
                setStreamingContent(fullContent);
              }
            } catch (e) {
              console.error('Error parsing stream chunk', e);
            }
          }
        }
      }

      if (!fullContent) {
        throw new Error("Dior is temporarily disconnected. Please try again.");
      }

      const aiMessage: Message = {
        role: 'assistant',
        content: fullContent,
        timestamp: serverTimestamp()
      };

      const aiPath = `users/${user.uid}/messages`;
      await addDoc(collection(db, 'users', user.uid, 'messages'), aiMessage);
      setStreamingContent('');
      incrementUsage('coachMessages');

    } catch (err) {
      console.error("Chat Error:", err);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    if (!user || messages.length === 0) return;
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-background text-primary font-sans flex pb-20 lg:pb-0">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 ml-0 lg:ml-[100px] xl:ml-[280px] transition-[margin] duration-500 flex flex-col h-screen overflow-hidden">
        <header className="h-24 lg:h-28 bg-background/80 backdrop-blur-md border-b border-theme px-6 lg:px-12 flex items-center justify-between z-50 shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 glass rounded-2xl flex items-center justify-center text-blue-400 border border-theme">
                <Brain className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
            <div>
              <h1 className="text-xs lg:text-sm font-black uppercase tracking-[0.2em] text-primary">AI Coach</h1>
              <p className="text-[8px] lg:text-[10px] text-primary uppercase tracking-widest font-bold opacity-40">Personal Study Assistant</p>
            </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 px-6 py-3 glass rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface transition-all border border-theme text-primary">
              <History className="w-4 h-4" /> History
            </button>
            <button onClick={clearChat} className="p-3 glass rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-colors border border-theme text-secondary">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 lg:px-12 py-8 lg:py-12 space-y-12 scrollbar-hide"
          >
            {messages.length === 0 && !streamingContent && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-xl mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="mb-8 lg:mb-12 opacity-20"
                >
                  <Sparkles className="w-16 h-16 lg:w-24 lg:h-24" />
                </motion.div>
                <h2 className="text-2xl lg:text-4xl font-serif italic mb-6 leading-tight text-primary">How shall we optimize your knowledge today?</h2>
                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="flex items-center gap-3 glass px-5 py-2.5 rounded-full border border-theme">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping shadow-[0_0_10px_#3b82f6]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Neural Stream Pulse Sync</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 w-full px-4 text-primary">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="glass p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] text-xs lg:text-sm text-secondary hover:text-primary hover:bg-surface transition-all text-left border border-theme"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {messages.map((msg, i) => (
            <motion.div 
              key={msg.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 lg:gap-6 ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}
            >
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl glass flex items-center justify-center shrink-0 border border-theme ${msg.role === 'assistant' ? 'text-blue-400' : 'text-purple-400'}`}>
                {msg.role === 'assistant' ? <Brain className="w-4 h-4 lg:w-5 lg:h-5" /> : <UserIcon className="w-4 h-4 lg:w-5 lg:h-5" />}
              </div>
              <div className={`max-w-[85%] lg:max-w-2xl space-y-2 ${msg.role === 'assistant' ? '' : 'text-right'}`}>
                <div className={`glass p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] inline-block text-left border border-theme shadow-sm ${msg.role === 'assistant' ? 'rounded-tl-none border-l-2 border-l-blue-500/50' : 'rounded-tr-none bg-surface'}`}>
                  <div className="markdown-body transition-all duration-300 text-xs lg:text-sm text-primary">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-[8px] text-secondary uppercase tracking-widest font-black ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
                  <Clock className="w-2 h-2" />
                  {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                </div>
              </div>
            </motion.div>
          ))}

          {streamingContent && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-6"
            >
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-blue-400 border border-theme">
                <Brain className="w-5 h-5" />
              </div>
              <div className="max-w-2xl space-y-2">
                <div className="glass p-6 rounded-[2rem] rounded-tl-none border-l-2 border-l-blue-500/50 inline-block text-left border border-theme">
                  <div className="markdown-body text-primary">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isTyping && !streamingContent && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-6 relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-blue-400 border border-theme shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <Brain className="w-5 h-5" />
              </div>
              <div className="glass px-10 py-6 rounded-[2rem] rounded-tl-none flex gap-2 items-center scanning border border-blue-500/20">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" 
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Dior Precision Engine Processing...</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="px-4 lg:px-8 py-6 lg:py-8 shrink-0">
          <div className="max-w-4xl mx-auto relative glass p-2 pl-4 lg:pl-8 flex items-center group focus-within:border-blue-500/50 transition-all shadow-2xl border border-theme rounded-[2.5rem]">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Dior..."
              className="flex-1 bg-transparent border-none outline-none text-xs lg:text-sm text-primary placeholder:text-secondary opacity-80"
            />
            <div className="flex gap-1 lg:gap-2">
              <button 
                onClick={startSpeechRecognition}
                className={`p-2 lg:p-4 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-secondary hover:text-primary'}`}
              >
                {isListening ? <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" /> : <Mic className="w-4 h-4 lg:w-5 lg:h-5" />}
              </button>
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-3 lg:p-4 bg-primary text-inverted rounded-xl lg:rounded-[2rem] hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
              >
                {loading ? <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" /> : <Send className="w-4 h-4 lg:w-5 lg:h-5" />}
              </button>
            </div>
          </div>
          <p className="text-center text-[8px] lg:text-[10px] text-secondary uppercase tracking-[0.3em] font-black mt-4 lg:mt-6 antialiased">
            Synergetic Intelligence • Dior Precision Analytical Deep Engine v4.2.0
          </p>
        </div>
      </main>
      </div>
    </div>
  );
}
