import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronLeft, 
  Clock, 
  Trophy, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  RotateCcw,
  Timer
} from 'lucide-react';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { useUsage } from '../context/UsageContext';

interface Question {
  type: 'mcq' | 'tf' | 'fib';
  question: string;
  options?: string[];
  answer: any;
  explanation: string;
}

import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';
import AILoader from '../components/ui/AILoader';
import DiorEngineBranding from '../components/ui/DiorEngineBranding';

export default function QuizPage() {
  const { uploadId } = useParams();
  const { user, tier } = useAuth();
  const { isOverLimit, incrementUsage, setShowUpgradeModal } = useUsage();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [showExplanation, setShowExplanation] = useState(false);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if (!user || !uploadId) return;

    if (tier === 'free' && isOverLimit('quizzes')) {
      setShowUpgradeModal(true);
      navigate('/dashboard');
      return;
    }

    const fetchQuiz = async () => {
      try {
        const uploadDoc = await getDoc(doc(db, 'users', user.uid, 'uploads', uploadId));
        if (!uploadDoc.exists()) {
          navigate('/dashboard');
          return;
        }

        const data = uploadDoc.data();
        const response = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fileName: data.fileName, 
            summary: data.structuredSummary?.summary || data.aiSummary,
            tier,
            questionLimit: tier === 'free' ? 10 : 30
          })
        });

        const quizData = await response.json();
        setQuestions(quizData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to generate quiz:", err);
        navigate('/dashboard');
      }
    };

    fetchQuiz();
  }, [user, uploadId, navigate]);

  useEffect(() => {
    if (loading || isFinished) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isFinished]);

  const handleAnswer = (answer: any) => {
    if (showExplanation) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    setUserInput('');
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    let finalScore = 0;
    questions.forEach((q, i) => {
      if (q.type === 'mcq') {
        if (parseInt(answers[i]) === parseInt(q.answer)) finalScore++;
      } else if (q.type === 'tf') {
        if (answers[i] === q.answer) finalScore++;
      } else if (q.type === 'fib') {
        if (answers[i]?.toLowerCase().trim() === q.answer.toLowerCase().trim()) finalScore++;
      }
    });

    const percent = Math.round((finalScore / questions.length) * 100);
    setScore(percent);
    setIsFinished(true);
    incrementUsage('quizzes');

    // Update user average in Firestore
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const currentAvg = userSnap.data().quizAverage || 0;
          const newAvg = currentAvg === 0 ? percent : Math.round((currentAvg + percent) / 2);
          await updateDoc(userRef, { quizAverage: newAvg });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
      
      // Log quiz result
      try {
        await addDoc(collection(db, 'users', user.uid, 'quizzes'), {
          uploadId,
          score: percent,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/quizzes`);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary">
        <AILoader label="Generating Synthetic Assessment..." sublabel="Calibrating difficulty parameters via Dior AI" />
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-background text-primary selection:bg-blue-500 selection:text-white flex pb-20 lg:pb-0">
        <Sidebar />
        <MobileNav />
        <div className="flex-1 ml-0 lg:ml-[100px] xl:ml-[280px] transition-[margin] duration-500 flex items-center justify-center p-4 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl glass p-6 lg:p-12 text-center border border-theme rounded-[3rem]"
          >
            <div className="w-16 h-16 lg:w-24 lg:h-24 glass rounded-full flex items-center justify-center mx-auto mb-6 lg:mb-8 text-blue-400">
              <Trophy className="w-8 h-8 lg:w-12 lg:h-12" />
            </div>
            <h2 className="text-2xl lg:text-4xl font-serif italic mb-2">Knowledge Synthesis Complete</h2>
            <p className="text-secondary uppercase tracking-widest text-[8px] lg:text-[10px] font-bold mb-8 lg:mb-12">Performance Index: Dior Scholar v1.4</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 mb-8 lg:mb-12">
              <div className="glass p-6 lg:p-8 rounded-3xl border border-theme">
                <p className="text-3xl lg:text-5xl font-black mb-2">{score}%</p>
                <p className="text-[8px] lg:text-[10px] text-secondary uppercase tracking-widest">Mastery Level</p>
              </div>
              <div className="glass p-6 lg:p-8 rounded-3xl border border-theme">
                <p className="text-3xl lg:text-5xl font-black mb-2">{questions.length}</p>
                <p className="text-[8px] lg:text-[10px] text-secondary uppercase tracking-widest">Questions Attempted</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 py-4 glass rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[10px] hover:bg-surface transition-all border border-theme text-primary"
              >
                <RotateCcw className="w-4 h-4" /> Retry Assessment
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-4 bg-primary text-inverted rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
              >
                Finish Session <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background text-primary font-sans selection:bg-blue-500 selection:text-white flex pb-20 lg:pb-0">
      <Sidebar />
      <MobileNav />
      <div className="flex-1 ml-0 lg:ml-[100px] xl:ml-[280px] transition-[margin] duration-500 h-screen overflow-y-auto overflow-x-hidden">
        {/* Top Bar */}
        <nav className="fixed top-0 right-0 left-0 lg:left-[100px] xl:left-[280px] h-20 bg-background/80 backdrop-blur-md border-b border-theme z-40 px-6 lg:px-12 flex items-center justify-between transition-[left] duration-500">
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden md:block">
              <DiorEngineBranding />
            </div>
            <div className="flex items-center gap-3 glass px-4 py-1.5 rounded-full border border-theme">
              <Timer className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-400" />
              <span className="text-[10px] lg:text-xs font-mono font-bold text-primary">{formatTime(timeLeft)}</span>
            </div>
            <div className="hidden sm:block h-6 w-px bg-theme mx-2" />
            <div className="hidden sm:block">
              <p className="text-[10px] text-secondary uppercase tracking-widest font-bold">Progress</p>
              <p className="text-xs font-bold text-primary">{currentQuestion + 1} / {questions.length}</p>
            </div>
          </div>

          <div className="w-12 h-12" /> {/* Spacer */}
        </nav>

        {/* Progress Bar */}
        <div className="fixed top-20 right-0 left-0 lg:left-[100px] xl:left-[280px] h-1 bg-surface z-40 transition-[left] duration-500">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
            className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]"
          />
        </div>

        <main className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 lg:pt-40 pb-24">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 lg:space-y-12"
          >
            {/* Question Header */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-4 block">Question 0{currentQuestion + 1}</span>
              <h2 className="text-2xl lg:text-4xl font-serif italic leading-snug">
                {q.type === 'fib' ? q.question.replace('[blank]', '_______') : q.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-4">
              {q.type === 'mcq' && q.options?.map((opt, i) => (
                <button 
                  key={i}
                  disabled={showExplanation}
                  onClick={() => handleAnswer(i)}
                  className={`w-full p-6 rounded-3xl text-left border transition-all flex items-center justify-between group ${
                    answers[currentQuestion] === i 
                      ? (parseInt(q.answer) === i ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50')
                      : 'glass border-theme hover:bg-surface'
                  }`}
                >
                  <span className="font-bold flex items-center gap-4 text-primary">
                    <span className="text-[10px] glass border border-theme w-6 h-6 flex items-center justify-center rounded-lg">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </span>
                  {showExplanation && parseInt(q.answer) === i && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                  {showExplanation && answers[currentQuestion] === i && parseInt(q.answer) !== i && <XCircle className="w-5 h-5 text-red-400" />}
                </button>
              ))}

              {q.type === 'tf' && (
                <div className="grid grid-cols-2 gap-4">
                  {[true, false].map((val, i) => (
                    <button 
                      key={i}
                      disabled={showExplanation}
                      onClick={() => handleAnswer(val)}
                      className={`p-10 rounded-3xl border transition-all flex flex-col items-center justify-center gap-4 ${
                        answers[currentQuestion] === val
                          ? (q.answer === val ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50')
                          : 'glass border-theme hover:bg-surface'
                      }`}
                    >
                      <span className="text-2xl font-black uppercase tracking-[0.2em] text-primary">{val ? 'True' : 'False'}</span>
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'fib' && (
                <div className="space-y-4">
                  <input 
                    type="text"
                    value={userInput}
                    disabled={showExplanation}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter the corresponding terminology..."
                    className="w-full glass p-8 rounded-3xl outline-none border border-theme focus:border-blue-500 text-center text-xl font-bold italic font-serif text-primary"
                  />
                  {!showExplanation && (
                    <button 
                      onClick={() => handleAnswer(userInput)}
                      className="w-full py-4 bg-primary text-inverted rounded-2xl font-black uppercase tracking-widest text-[10px]"
                    >
                      Commit Answer
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* AI Explanation */}
            {showExplanation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-8 rounded-[2.5rem] border ${
                  (q.type === 'fib' ? userInput.toLowerCase().trim() === q.answer.toLowerCase().trim() : answers[currentQuestion] === q.answer)
                    ? 'bg-green-500/5 border-green-500/20' 
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-5 h-5 opacity-40 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-primary">Dior Insight</p>
                </div>
                <p className="text-sm leading-relaxed text-secondary">{q.explanation}</p>
                {q.type === 'fib' && <p className="mt-4 text-xs font-bold text-green-400 uppercase tracking-widest">Correct answer: {q.answer}</p>}
                
                <button 
                  onClick={nextQuestion}
                  className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors"
                >
                  Proceed to Next Synthesis <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 inset-x-0 h-16 bg-background/80 backdrop-blur-md border-t border-theme flex items-center justify-center z-50">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 text-primary font-mono">Quiz • Evaluation Module 7.1</p>
      </footer>
      </div>
    </div>
  );
}
