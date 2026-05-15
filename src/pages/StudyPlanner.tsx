import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  CalendarDays,
  Target,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Bell,
  X,
  Timer
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface PlannerEvent {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

interface Exam {
  id: string;
  subject: string;
  date: string;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

import Sidebar from '../components/layout/Sidebar';
import MobileNav from '../components/layout/MobileNav';

export default function StudyPlanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'timetable' | 'assignments' | 'goals' | 'exams'>('timetable');
  
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'event' | 'goal' | 'exam' | 'task'>('event');

  // Modal form states
  const [newTitle, setNewTitle] = useState('');
  const [newDay, setNewDay] = useState(1);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    if (!user) return;

    const eventsRef = collection(db, 'users', user.uid, 'planner_events');
    const unsubEvents = onSnapshot(query(eventsRef), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PlannerEvent[]);
    }, (error) => {
      if (error.message.includes('permission-denied')) {
        console.warn('Events listener delayed');
      } else {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/planner_events`);
      }
    });

    const goalsRef = collection(db, 'users', user.uid, 'planner_goals');
    const today = new Date().toISOString().split('T')[0];
    const unsubGoals = onSnapshot(query(goalsRef, where('date', '==', today)), (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DailyGoal[]);
    }, (error) => {
      if (error.message.includes('permission-denied')) {
        console.warn('Goals listener delayed');
      } else {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/planner_goals`);
      }
    });

    const examsRef = collection(db, 'users', user.uid, 'planner_exams');
    const unsubExams = onSnapshot(query(examsRef, orderBy('date', 'asc')), (snapshot) => {
      setExams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Exam[]);
    }, (error) => {
      if (error.message.includes('permission-denied')) {
        console.warn('Exams listener delayed');
      } else {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/planner_exams`);
      }
    });

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const unsubTasks = onSnapshot(query(tasksRef, orderBy('dueDate', 'asc')), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[]);
    }, (error) => {
      if (error.message.includes('permission-denied')) {
        console.warn('Tasks listener delayed');
      } else {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/tasks`);
      }
    });

    return () => {
      unsubEvents();
      unsubGoals();
      unsubExams();
      unsubTasks();
    };
  }, [user]);

  const handleAdd = async () => {
    if (!user) return;
    try {
      if (modalType === 'event') {
        await addDoc(collection(db, 'users', user.uid, 'planner_events'), {
          title: newTitle,
          dayOfWeek: newDay,
          startTime: newStartTime,
          endTime: newEndTime
        });
      } else if (modalType === 'goal') {
        await addDoc(collection(db, 'users', user.uid, 'planner_goals'), {
          text: newTitle,
          completed: false,
          date: new Date().toISOString().split('T')[0]
        });
      } else if (modalType === 'exam') {
        await addDoc(collection(db, 'users', user.uid, 'planner_exams'), {
          subject: newTitle,
          date: newDate
        });
      } else if (modalType === 'task') {
        await addDoc(collection(db, 'users', user.uid, 'tasks'), {
          title: newTitle,
          dueDate: newDate,
          priority: newPriority,
          completed: false,
          userId: user.uid
        });
      }
      setIsAddModalOpen(false);
      setNewTitle('');
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  const toggleGoal = async (id: string, current: boolean) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'planner_goals', id), {
      completed: !current
    });
  };

  const toggleTask = async (id: string, current: boolean) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'tasks', id), {
      completed: !current
    });
  };

  const deleteItem = async (type: string, id: string) => {
    if (!user) return;
    const path = type === 'event' ? 'planner_events' : type === 'exam' ? 'planner_exams' : type === 'goal' ? 'planner_goals' : 'tasks';
    await deleteDoc(doc(db, 'users', user.uid, path, id));
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen bg-background text-primary font-sans selection:bg-primary selection:text-inverted flex cyber-grid pb-20 lg:pb-0">
      <Sidebar />
      <MobileNav />
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="flex-1 ml-0 lg:ml-[100px] xl:ml-[280px] transition-[margin] duration-500 overflow-x-hidden">
        <nav className="h-24 lg:h-28 bg-background/80 backdrop-blur-md border-b border-theme flex flex-col md:flex-row items-center justify-between px-6 lg:px-12 sticky top-0 z-40 py-4 md:py-0 gap-4">
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight font-serif italic text-primary">Academic Planner</h1>
            <p className="text-[10px] text-secondary uppercase tracking-[0.2em] font-black mt-0.5">Study Schedule Management</p>
          </div>

          <div className="flex glass p-1 rounded-2xl border border-theme overflow-x-auto max-w-[90vw] md:max-w-none scrollbar-hide">
            {[
              { id: 'timetable', icon: Clock, label: 'Timetable' },
              { id: 'assignments', icon: BookOpen, label: 'Agenda' },
              { id: 'goals', icon: Target, label: 'Goals' },
              { id: 'exams', icon: Timer, label: 'Exams' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                  activeTab === tab.id ? 'bg-primary text-inverted shadow-xl' : 'text-secondary hover:text-primary'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button className="hidden sm:p-3 sm:glass sm:rounded-2xl sm:hover:bg-surface transition-all border border-theme text-secondary">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                setModalType(activeTab === 'timetable' ? 'event' : activeTab === 'assignments' ? 'task' : activeTab === 'goals' ? 'goal' : 'exam');
                setIsAddModalOpen(true);
              }}
              className="px-4 md:px-6 py-2 md:py-3 bg-primary text-inverted rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </nav>

        <main className="max-w-[1400px] mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'timetable' && (
            <motion.div 
              key="timetable"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6"
            >
              {days.map((day, idx) => (
                <div key={day} className="space-y-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">{day.slice(0, 3)}</p>
                    <div className={`w-2 h-2 rounded-full mx-auto ${new Date().getDay() === idx ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-surface'}`} />
                  </div>
                  
                  <div className="space-y-4">
                    {events.filter(e => e.dayOfWeek === idx).sort((a,b) => a.startTime.localeCompare(b.startTime)).map(event => (
                      <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass p-5 rounded-3xl border border-theme group hover:border-blue-500/30 transition-all cursor-pointer relative"
                      >
                        <button 
                          onClick={() => deleteItem('event', event.id)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
                          {event.startTime} - {event.endTime}
                        </p>
                        <h4 className="font-bold text-xs leading-tight mb-1 text-primary">{event.title}</h4>
                      </motion.div>
                    ))}
                    <button 
                      onClick={() => {
                        setNewDay(idx);
                        setModalType('event');
                        setIsAddModalOpen(true);
                      }}
                      className="w-full py-4 rounded-3xl border border-dashed border-theme hover:border-blue-500/20 hover:bg-surface transition-all text-secondary flex items-center justify-center p-2"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'assignments' && (
            <motion.div 
              key="assignments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-4"
            >
              {tasks.length === 0 ? (
                <div className="glass p-20 rounded-[3rem] text-center border border-theme">
                  <BookOpen className="w-16 h-16 text-secondary/20 mx-auto mb-6" />
                  <p className="text-secondary font-bold uppercase tracking-widest text-[10px]">Your agenda is currently optimized</p>
                </div>
              ) : (
                tasks.map(task => (
                  <motion.div 
                    key={task.id}
                    layoutId={task.id}
                    className="glass p-6 rounded-[2rem] flex items-center justify-between group hover:bg-surface transition-all border border-theme"
                  >
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => toggleTask(task.id, task.completed)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.completed ? 'bg-blue-500 border-blue-500' : 'border-theme group-hover:border-primary/40'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <div>
                        <h4 className={`font-bold transition-all ${task.completed ? 'text-secondary line-through' : 'text-primary'}`}>{task.title}</h4>
                        <div className="flex gap-4 mt-1">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-500' : 
                            task.priority === 'medium' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            {task.priority} Priority
                          </span>
                          <span className="text-[8px] text-secondary font-black uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-2 h-2" /> Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteItem('task', task.id)}
                      className="p-3 text-secondary hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'goals' && (
            <motion.div 
              key="goals"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-serif italic mb-2 text-primary">Daily Objectives</h2>
                <p className="text-[10px] text-secondary uppercase tracking-[0.3em] font-black">Optimization Sequence for {new Date().toLocaleDateString()}</p>
              </div>

              <div className="space-y-4">
                {goals.map(goal => (
                  <motion.div 
                    key={goal.id}
                    className="glass p-8 rounded-[2.5rem] flex items-center gap-6 group hover:border-primary/20 transition-all border border-theme"
                  >
                    <button 
                      onClick={() => toggleGoal(goal.id, goal.completed)}
                      className={`w-12 h-12 rounded-2xl glass border flex items-center justify-center transition-all group-hover:scale-110 ${
                        goal.completed ? 'border-green-500/50 text-green-500' : 'border-theme text-secondary'
                      }`}
                    >
                      {goal.completed ? <CheckCircle2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    </button>
                    <div className="flex-1 text-primary">
                      <p className={`text-lg transition-all ${goal.completed ? 'text-secondary line-through' : ''}`}>
                        {goal.text}
                      </p>
                    </div>
                    <button onClick={() => deleteItem('goal', goal.id)} className="opacity-0 group-hover:opacity-100 p-2 text-secondary hover:text-red-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
                
                <div className="pt-6">
                  <button 
                    onClick={() => {
                      setModalType('goal');
                      setIsAddModalOpen(true);
                    }}
                    className="w-full py-8 glass rounded-[2.5rem] border-dashed border-theme flex flex-col items-center gap-4 text-secondary hover:text-primary hover:border-primary/30 transition-all"
                  >
                    <Target className="w-8 h-8 scale-x-[-1]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Define New Objective</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'exams' && (
            <motion.div 
              key="exams"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {exams.map(exam => {
                const daysLeft = Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <motion.div 
                    key={exam.id}
                    whileHover={{ y: -10 }}
                    className="glass p-10 rounded-[3rem] relative overflow-hidden group border border-white/5"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-primary">
                      <Timer className="w-32 h-32" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-12">
                      <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-theme">
                        <CalendarDays className="w-6 h-6" />
                      </div>
                      <button onClick={() => deleteItem('exam', exam.id)} className="p-2 glass border border-theme rounded-lg text-secondary hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-2xl font-serif italic mb-1 text-primary">{exam.subject}</h3>
                      <p className="text-[10px] text-secondary uppercase tracking-[0.2em] font-black mb-10">
                        Scheduled: {new Date(exam.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      
                      <div className="flex items-baseline gap-3">
                        <span className={`text-6xl font-black ${daysLeft <= 7 ? 'text-red-500' : daysLeft <= 14 ? 'text-orange-500' : 'text-primary'}`}>
                          {daysLeft < 0 ? 0 : daysLeft}
                        </span>
                        <span className="text-sm font-black uppercase tracking-widest text-secondary">Days Remaining</span>
                      </div>
                    </div>

                    <div className="mt-10 h-1.5 glass rounded-full overflow-hidden border border-theme">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, 100 - (daysLeft / 30) * 100)}%` }}
                        className={`h-full ${daysLeft <= 7 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-24">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-3xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl glass p-12 rounded-[4rem] border border-theme shadow-2xl"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-10 right-10 p-4 glass rounded-2xl border border-theme hover:bg-surface transition-all text-secondary hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-12">
                <h2 className="text-4xl font-serif italic mb-2 tracking-tight text-primary">Create Item</h2>
                <p className="text-[10px] text-secondary uppercase tracking-[0.3em] font-black">Appending to {modalType} database</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-2">Description</label>
                  <input 
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={modalType === 'exam' ? 'Advanced Neuro-Economics' : 'Synthesize Research Notes...'}
                    className="w-full bg-surface border border-theme rounded-2xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-secondary/30 text-primary"
                  />
                </div>

                {modalType === 'event' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-2">Start Time</label>
                        <input type="time" value={newStartTime} onChange={e => setNewStartTime(e.target.value)} className="w-full bg-surface border border-theme rounded-2xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all text-primary" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-2">End Time</label>
                        <input type="time" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} className="w-full bg-surface border border-theme rounded-2xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-2">Day of Week</label>
                      <select 
                        value={newDay} 
                        onChange={e => setNewDay(parseInt(e.target.value))}
                        className="w-full bg-surface border border-theme rounded-2xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all appearance-none text-primary"
                      >
                        {days.map((d, i) => <option key={d} value={i} className="bg-background text-primary">{d}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {(modalType === 'exam' || modalType === 'task') && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-2">Target Date</label>
                    <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full bg-surface border border-theme rounded-2xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all text-primary" />
                  </div>
                )}

                {modalType === 'task' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary ml-2">Priority Level</label>
                    <div className="flex gap-4">
                      {['low', 'medium', 'high'].map(p => (
                        <button 
                          key={p}
                          onClick={() => setNewPriority(p as any)}
                          className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            newPriority === p ? 'bg-primary text-inverted border-primary' : 'border-theme text-secondary hover:border-blue-500/30'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleAdd}
                  disabled={!newTitle}
                  className="w-full py-5 bg-primary text-inverted rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-2xl mt-6"
                >
                  Commit to Planner
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
