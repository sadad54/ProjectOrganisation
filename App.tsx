
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, BookOpen, Waves, BarChart2, User, Menu, 
  ShieldAlert, Wind, Brain, Heart, Sparkles, MessageCircle, 
  X, ChevronRight, Play, Pause, RotateCcw, Volume2, 
  CheckCircle2, Flame, Zap, TrendingUp, Share2, RefreshCw, Send,
  Bold, Italic, List, Type as TypeIcon, Maximize2, Plus, 
  Moon, Sun, Coffee, Mic, Info, ArrowRight, Layers,
  Baby, Target, Settings, LogOut, ExternalLink, Activity, Star, Palette, Clock,
  Trash2, AlertCircle, Calendar, CheckSquare, Square, Volume1
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, AreaChart, Area, PieChart, Pie } from 'recharts';
import { GlassCard, AnimatedButton, MoodOrb, ProgressRing } from './components';
import { Screen, Mood, JournalEntry, Habit, UserSession, Tone, FavoriteAffirmation, Theme, RoutineItem, AuraVoice } from './types';
import { geminiService } from './geminiService';
import { backend } from './backend';

// --- BACKGROUND VECTOR ARTS ---

const DynamicBackground: React.FC<{ screen: Screen; theme: Theme }> = ({ screen, theme }) => {
  const renderArt = () => {
    switch (screen) {
      case 'Home':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 800" fill="none">
            <circle cx="350" cy="150" r="100" fill="currentColor" className="text-theme-accent animate-float blur-3xl opacity-40" />
            <circle cx="50" cy="650" r="150" fill="currentColor" className="text-theme-accent animate-float blur-3xl opacity-20" style={{ animationDelay: '-3s' }} />
            <path d="M-50 700 Q150 650 450 750" stroke="currentColor" strokeWidth="1" className="text-theme-accent opacity-10" />
            <path d="M-50 750 Q150 700 450 800" stroke="currentColor" strokeWidth="1" className="text-theme-accent opacity-05" />
          </svg>
        );
      case 'Journal':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 800">
            <line x1="15%" y1="0" x2="15%" y2="100%" stroke="currentColor" strokeWidth="0.5" className="text-theme-accent" />
            {[...Array(25)].map((_, i) => (
              <line key={i} x1="15%" y1={`${i * 4}%`} x2="100%" y2={`${i * 4}%`} stroke="currentColor" strokeWidth="0.3" className="text-theme-accent opacity-30" />
            ))}
            <path d="M300 100 Q350 150 300 200" stroke="currentColor" strokeWidth="1" fill="none" className="text-theme-accent animate-float" />
          </svg>
        );
      case 'Meditation':
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="absolute rounded-full border border-theme-accent animate-pulse" 
                style={{ 
                  width: `${(i + 1) * 120}px`, 
                  height: `${(i + 1) * 120}px`, 
                  animationDuration: '8s', 
                  animationDelay: `${i * 1.5}s` 
                }} 
              />
            ))}
          </div>
        );
      case 'Insights':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-05 pointer-events-none" viewBox="0 0 400 800">
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-theme-accent" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <circle cx="200" cy="400" r="280" stroke="currentColor" strokeWidth="1" fill="none" className="text-theme-accent opacity-20 animate-spin-slow" />
          </svg>
        );
      case 'Sounds':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" viewBox="0 0 400 800">
            {[...Array(6)].map((_, i) => (
              <path 
                key={i} 
                d={`M-50 ${200 + i * 100} Q150 ${150 + i * 100} 250 ${200 + i * 100} T450 ${200 + i * 100}`} 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
                className="text-theme-accent animate-float" 
                style={{ animationDuration: `${5 + i}s`, animationDelay: `-${i * 1.5}s` }}
              />
            ))}
          </svg>
        );
      case 'Routine':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 800">
            {[...Array(12)].map((_, i) => (
              <circle key={i} cx="200" cy={i * 70} r="40" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-theme-accent opacity-20" />
            ))}
          </svg>
        );
      default:
        return (
          <div className="absolute inset-0 overflow-hidden opacity-05 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-theme-accent rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-theme-accent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden select-none">
      {renderArt()}
    </div>
  );
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Auth');
  const [user, setUser] = useState<UserSession | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteAffirmation[]>([]);
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [currentMood, setCurrentMood] = useState<Mood>('calm');
  const [aiCorrelation, setAiCorrelation] = useState<string>("Analyzing your patterns...");
  const [theme, setTheme] = useState<Theme>('midnight');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      const storedUser = await backend.getUser();
      if (storedUser) {
        setUser(storedUser);
        const [storedHabits, storedJournals, storedFavs, storedRoutine] = await Promise.all([
          backend.getHabits(),
          backend.getJournals(),
          backend.getFavorites(),
          backend.getRoutine()
        ]);
        setHabits(storedHabits);
        setJournalEntries(storedJournals);
        setFavorites(storedFavs);
        setRoutine(storedRoutine);
        
        if (storedUser.onboardingCompleted) {
          setCurrentScreen('Home');
        } else {
          setCurrentScreen('Onboarding');
        }
      }
      setIsInitializing(false);
    };
    init();
  }, []);

  const getThemeColors = () => {
    switch (theme) {
      case 'forest': return 'forest-theme';
      case 'sunset': return 'sunset-theme';
      case 'ocean': return 'ocean-theme';
      default: return '';
    }
  };

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
    setShowMoreMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (newUser: UserSession) => {
    setUser(newUser);
    if (newUser.onboardingCompleted) {
      navigate('Home');
    } else {
      navigate('Onboarding');
    }
  };

  const handleOnboardingComplete = async (voicePreference: AuraVoice) => {
    const updatedUser = await backend.completeOnboarding(voicePreference);
    setUser(updatedUser);
    navigate('Home');
  };

  const handleLogout = async () => {
    await backend.logout();
    setUser(null);
    setCurrentScreen('Auth');
  };

  const toggleHabit = async (id: string) => {
    const updated = await backend.toggleHabit(id);
    setHabits(updated);
  };

  const addHabit = async (name: string, time: any, icon: string) => {
    const updated = await backend.addHabit({ name, time, icon });
    setHabits(updated);
  };

  const removeHabit = async (id: string) => {
    const updated = await backend.removeHabit(id);
    setHabits(updated);
  };

  const toggleRoutineItem = async (id: string) => {
    const updated = await backend.toggleRoutine(id);
    setRoutine(updated);
  };

  const saveEntry = async (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry = await backend.saveJournal(entry);
    setJournalEntries([newEntry, ...journalEntries]);
    navigate('Home');
  };

  const toggleFavoriteAffirmation = async (text: string, mood: Mood) => {
    const updated = await backend.toggleFavorite(text, mood);
    setFavorites(updated);
  };

  if (isInitializing) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-[#050508] ${getThemeColors()}`}>
        <div className="w-24 h-24 glass rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="text-white" size={32} />
        </div>
      </div>
    );
  }

  const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={`flex flex-col min-h-screen pb-32 max-w-[440px] mx-auto relative bg-[#050508] transition-colors duration-1000 ${getThemeColors()}`}>
      <DynamicBackground screen={currentScreen} theme={theme} />
      <main className="px-6 pt-16 relative z-10">{children}</main>
      <nav className="fixed bottom-6 left-6 right-6 max-w-[392px] mx-auto glass-dark rounded-[2.5rem] p-2 flex justify-between items-center z-50 shadow-2xl border border-white/5">
        <TabItem icon={Home} label="Sanctuary" active={currentScreen === 'Home'} onClick={() => navigate('Home')} />
        <TabItem icon={BookOpen} label="Chronicle" active={currentScreen === 'Journal'} onClick={() => navigate('Journal')} />
        <TabItem icon={Waves} label="Ethereal" active={currentScreen === 'Sounds'} onClick={() => navigate('Sounds')} />
        <TabItem icon={BarChart2} label="Pulse" active={currentScreen === 'Insights'} onClick={() => navigate('Insights')} />
        <TabItem icon={Menu} label="Nexus" active={showMoreMenu} onClick={() => setShowMoreMenu(true)} />
      </nav>
      {showMoreMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-3xl z-[60] flex items-end animate-in fade-in slide-in-from-bottom duration-500">
          <div className="w-full max-w-[440px] mx-auto glass-dark rounded-t-[3.5rem] p-12 relative border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <button onClick={() => setShowMoreMenu(false)} className="absolute top-8 right-10 text-white/20 hover:text-white transition-colors"><X size={32} /></button>
            <h2 className="text-3xl font-black mb-10 tracking-tighter">The Nexus</h2>
            <div className="grid grid-cols-3 gap-10">
              <MoreMenuItem icon={Flame} label="Disciplines" color="text-orange-400" onClick={() => navigate('Habits')} />
              <MoreMenuItem icon={ShieldAlert} label="Sanctuary" color="text-emerald-400" onClick={() => navigate('Wellness')} />
              <MoreMenuItem icon={Target} label="Meditation" color="text-violet-400" onClick={() => navigate('Meditation')} />
              <MoreMenuItem icon={Zap} label="Aura" color="text-amber-400" onClick={() => navigate('Affirmations')} />
              <MoreMenuItem icon={Layers} label="CBT Tool" color="text-purple-400" onClick={() => navigate('CBT')} />
              <MoreMenuItem icon={User} label="Profile" color="text-zinc-400" onClick={() => navigate('Profile')} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (currentScreen === 'Auth') return <AuthScreen onSuccess={handleLoginSuccess} />;
  if (currentScreen === 'Onboarding') return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  
  if (currentScreen === 'Home') return <Layout><HomeScreen user={user} currentMood={currentMood} navigate={navigate} habits={habits} toggleHabit={toggleHabit} onAddHabit={addHabit} /></Layout>;
  if (currentScreen === 'Journal') return <Layout><JournalScreen onSubmit={saveEntry} auraVoice={user?.auraVoice || 'mentor'} mood={currentMood} onClose={() => navigate('Home')} /></Layout>;
  if (currentScreen === 'Sounds') return <Layout><SoundscapeMixer /></Layout>;
  if (currentScreen === 'Insights') return <Layout><AnalyticsDetailed entries={journalEntries} correlation={aiCorrelation} /></Layout>;
  if (currentScreen === 'Wellness') return <Layout><NexusGrid navigate={navigate} /></Layout>;
  if (currentScreen === 'Affirmations') return <Layout><AffirmationEvolver auraVoice={user?.auraVoice || 'mentor'} mood={currentMood} recentJournal={journalEntries[0]?.content} favorites={favorites} onToggleFavorite={toggleFavoriteAffirmation} onClose={() => navigate('Wellness')} /></Layout>;
  if (currentScreen === 'Habits') return <Layout><DisciplineManager habits={habits} toggleHabit={toggleHabit} onAdd={addHabit} onRemove={removeHabit} /></Layout>;
  if (currentScreen === 'Grounding') return <Layout><InteractiveGrounding onClose={() => navigate('Wellness')} /></Layout>;
  if (currentScreen === 'Breath') return <Layout><AdvancedBreathwork onClose={() => navigate('Wellness')} /></Layout>;
  if (currentScreen === 'CBT') return <Layout><ThoughtReframe auraVoice={user?.auraVoice || 'mentor'} onClose={() => navigate('Wellness')} /></Layout>;
  if (currentScreen === 'EmotionWheel') return <Layout><EmotionWheel onClose={() => navigate('Wellness')} onSelect={(m) => { setCurrentMood(m); navigate('Journal'); }} /></Layout>;
  if (currentScreen === 'InnerChild') return <Layout><InnerChildScreen onClose={() => navigate('Wellness')} currentMood={currentMood} auraVoice={user?.auraVoice || 'mentor'} /></Layout>;
  if (currentScreen === 'Profile') return <Layout><ProfileScreen user={user} entries={journalEntries} favorites={favorites} onLogout={handleLogout} theme={theme} setTheme={setTheme} /></Layout>;
  if (currentScreen === 'Meditation') return <Layout><AIMeditation currentMood={currentMood} auraVoice={user?.auraVoice || 'mentor'} onClose={() => navigate('Wellness')} /></Layout>;
  if (currentScreen === 'Routine') return <Layout><RoutineScreen currentRoutine={routine} habits={habits} auraVoice={user?.auraVoice || 'mentor'} onToggle={toggleRoutineItem} onUpdate={async (u) => { await backend.saveRoutine(u); setRoutine(u); }} onClose={() => navigate('Home')} /></Layout>;

  return null;
};

// --- SOUNDSCAPE MIXER (UPDATED) ---

interface SoundLayer {
  id: string;
  label: string;
  volume: number;
  active: boolean;
  url: string;
}

const SoundscapeMixer: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const defaultLayers: SoundLayer[] = [
    { 
      id: 'rain', 
      label: 'Soft Rain', 
      volume: 80, 
      active: true, 
      url: 'https://assets.mixkit.co/active_storage/sfx/2561/2561-preview.mp3' 
    },
    { 
      id: 'thunder', 
      label: 'Soft Thunder', 
      volume: 30, 
      active: false, 
      url: 'https://assets.mixkit.co/active_storage/sfx/2562/2562-preview.mp3' 
    },
    { 
      id: 'wind', 
      label: 'Night Wind', 
      volume: 50, 
      active: true, 
      url: 'https://assets.mixkit.co/active_storage/sfx/2563/2563-preview.mp3' 
    },
  ];

  const [layers, setLayers] = useState<SoundLayer[]>(defaultLayers);

  useEffect(() => {
    // Cleanup audios on unmount
    return () => {
      // Fix: cast the audio object to HTMLAudioElement to avoid 'unknown' type errors
      Object.values(audioRefs.current).forEach(audio => {
        const audioElement = audio as HTMLAudioElement;
        audioElement.pause();
        audioElement.src = '';
      });
    };
  }, []);

  // Update audio instances when layers or playing status changes
  useEffect(() => {
    layers.forEach(layer => {
      let audio = audioRefs.current[layer.id];
      if (!audio) {
        audio = new Audio(layer.url);
        audio.loop = true;
        audioRefs.current[layer.id] = audio;
      }
      
      audio.volume = (layer.volume / 100) * (layer.active ? 1 : 0);
      
      if (playing && layer.active) {
        audio.play().catch(e => console.debug("Audio playback interaction blocked", e));
      } else {
        audio.pause();
      }
    });
  }, [layers, playing]);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  const handleVolumeChange = (id: string, volume: number) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, volume } : l));
  };

  const handleReset = () => {
    setLayers(prev => prev.map(l => {
      const def = defaultLayers.find(dl => dl.id === l.id);
      return def ? { ...l, volume: def.volume } : l;
    }));
  };

  return (
    <div className="flex flex-col min-h-[80vh] space-y-12 animate-in fade-in duration-1000 relative z-10">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Ethereal Mix.</h2>
          <p className="text-white/20 text-xs font-black uppercase tracking-widest mt-1">Ambient Neural Mapping</p>
        </div>
        <button 
          onClick={handleReset}
          className="w-12 h-12 glass rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90"
          title="Reset Volumes"
        >
          <RotateCcw size={20} />
        </button>
      </header>

      <div className="relative mx-auto group">
        <div className={`w-72 h-72 rounded-full border-2 border-white/5 flex items-center justify-center transition-all duration-1000 ${playing ? 'scale-110' : 'scale-95 opacity-50'}`}>
          <div className={`absolute inset-[-60px] border border-white/5 rounded-full ${playing ? 'animate-spin-slow' : ''}`}></div>
          <MoodOrb mood="calm" size="lg" />
        </div>
        <button 
          onClick={() => setPlaying(!playing)} 
          className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center text-black shadow-2xl transition-transform active:scale-90 hover:scale-105"
        >
          {playing ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
        </button>
      </div>

      <div className="space-y-6 pt-10">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Neural Layers</h3>
        <div className="space-y-4">
          {layers.map(layer => (
            <GlassCard key={layer.id} className={`!p-5 flex flex-col space-y-4 transition-all ${layer.active ? 'border-theme-accent/40 bg-theme-accent/10' : 'opacity-40 grayscale'}`}>
              <div className="flex items-center justify-between" onClick={() => toggleLayer(layer.id)}>
                <div className="flex items-center space-x-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${layer.active ? 'bg-theme-accent text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-white/10 text-white/20'}`}>
                    {layer.id === 'rain' ? <Waves size={24} /> : layer.id === 'wind' ? <Wind size={24} /> : <Zap size={24} />}
                  </div>
                  <div>
                    <p className="font-black tracking-tight">{layer.label}</p>
                    <p className="text-[9px] uppercase font-black text-white/20 tracking-widest">{layer.active ? 'Resonating' : 'Silent'}</p>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-white/40">{layer.volume}%</div>
              </div>
              <div className="flex items-center space-x-4">
                <Volume1 size={14} className="text-white/20" />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={layer.volume} 
                  onChange={(e) => handleVolumeChange(layer.id, parseInt(e.target.value))} 
                  className="flex-1 h-1.5 bg-white/5 rounded-full appearance-none outline-none accent-white cursor-pointer" 
                />
                <Volume2 size={14} className="text-white/20" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- ONBOARDING SCREEN ---

const OnboardingScreen: React.FC<{ onComplete: (voice: AuraVoice) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [voice, setVoice] = useState<AuraVoice>('friend');
  
  const steps = [
    {
      title: "The light within.",
      desc: "Synchronize your spirit with Aura, your digital sanctuary for clarity and peace.",
      icon: <Sparkles size={80} className="text-white animate-pulse" />
    },
    {
      title: "Choose Aura's Voice.",
      desc: "How should your digital guide speak to you?",
      icon: <Volume1 size={80} className="text-theme-accent animate-float" />,
      customUI: true
    },
    {
      title: "AI Wisdom.",
      desc: "Journal your thoughts and let our neural networks reveal patterns in your soul's arc.",
      icon: <Brain size={80} className="text-indigo-400 animate-float" />
    },
    {
      title: "Ethereal Focus.",
      desc: "Architect your focus with ambient soundscapes and guided meditations designed for your frequency.",
      icon: <Waves size={80} className="text-emerald-400 animate-spin-slow" />
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete(voice);
  };

  const voices: {id: AuraVoice, label: string, desc: string}[] = [
    { id: 'mentor', label: 'Stoic Mentor', desc: 'Direct, logical, and wise.' },
    { id: 'friend', label: 'Warm Friend', desc: 'Empathetic and supportive.' },
    { id: 'zen', label: 'Zen Guide', desc: 'Poetic and minimalist.' },
    { id: 'coach', label: 'High Coach', desc: 'Action-oriented and punchy.' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050508] p-10 justify-between relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-20%] w-[400px] h-[400px] bg-theme-accent/20 blur-[150px] rounded-full"></div>
      
      <div className="flex-1 flex flex-col items-center justify-center space-y-12 z-10">
        <div key={step} className="animate-in fade-in zoom-in-95 duration-1000 flex flex-col items-center text-center space-y-8 w-full">
          <div className="w-48 h-48 glass rounded-[4rem] flex items-center justify-center shadow-2xl">
            {steps[step].icon}
          </div>
          <div className="space-y-4 w-full">
            <h2 className="text-5xl font-black tracking-tighter text-white">{steps[step].title}</h2>
            <p className="text-white/40 text-lg leading-relaxed max-w-[280px] mx-auto font-medium">
              {steps[step].desc}
            </p>

            {steps[step].customUI && (
              <div className="grid grid-cols-2 gap-3 mt-8">
                {voices.map(v => (
                  <button 
                    key={v.id} 
                    onClick={() => setVoice(v.id)}
                    className={`p-4 rounded-3xl border transition-all text-left ${voice === v.id ? 'bg-white text-black border-white' : 'glass text-white/40 border-white/5'}`}
                  >
                    <p className="font-black text-xs uppercase tracking-tighter">{v.label}</p>
                    <p className="text-[10px] opacity-60 mt-1 line-clamp-1">{v.desc}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="z-10 space-y-8">
        <div className="flex justify-center space-x-3">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-12 bg-white' : 'w-2 bg-white/10'}`}></div>
          ))}
        </div>
        <AnimatedButton onClick={handleNext} className="w-full h-[72px] text-xl rounded-[2rem] shadow-2xl">
          {step === steps.length - 1 ? 'Enter Sanctuary' : 'Next Step'}
        </AnimatedButton>
      </div>
    </div>
  );
};

// --- AUTH SCREEN ---

const AuthScreen: React.FC<{ onSuccess: (user: UserSession) => void }> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill all radiance fields.");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      let user;
      if (isLogin) {
        user = await backend.login(email, password);
      } else {
        user = await backend.signup(name, email, password);
      }
      onSuccess(user);
    } catch (e: any) {
      setError(e.message || "Failed to enter sanctuary.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050508] items-center justify-center px-10 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-full h-full bg-indigo-600/20 blur-[140px] rounded-full animate-float"></div>
      
      <div className="z-10 text-center mb-16">
        <h1 className="text-7xl font-black mb-4 tracking-tighter bg-gradient-to-b from-white to-zinc-700 bg-clip-text text-transparent">AURA.</h1>
        <p className="text-white/40 font-medium serif-italic text-2xl">{isLogin ? 'Welcome Back' : 'Join the Collective'}</p>
      </div>

      <div className="w-full space-y-6 z-10 max-w-sm">
        {error && (
          <div className="flex items-center space-x-3 text-rose-400 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 animate-in shake duration-300">
            <AlertCircle size={20} />
            <p className="text-xs font-black uppercase tracking-widest">{error}</p>
          </div>
        )}

        <GlassCard className="!p-2 space-y-1">
          {!isLogin && (
            <>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Spirit Name" 
                className="h-16 px-6 w-full bg-transparent outline-none font-medium text-white placeholder:text-white/10" 
              />
              <div className="h-px bg-white/5 mx-6"></div>
            </>
          )}
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address" 
            className="h-16 px-6 w-full bg-transparent outline-none font-medium text-white placeholder:text-white/10" 
          />
          <div className="h-px bg-white/5 mx-6"></div>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" 
            className="h-16 px-6 w-full bg-transparent outline-none font-medium text-white placeholder:text-white/10" 
          />
        </GlassCard>

        <AnimatedButton 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full h-[72px] text-xl rounded-[2rem] shadow-2xl relative overflow-hidden"
        >
          {isLoading ? <RefreshCw className="animate-spin" /> : (isLogin ? 'Enter Sanctuary' : 'Create Presence')}
        </AnimatedButton>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-center text-white/30 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.2em] py-4"
        >
          {isLogin ? "Don't have a presence? Sign Up" : "Already a member? Log In"}
        </button>
      </div>
    </div>
  );
};

// --- GOAL ARCHITECT CHATBOT ---

const GoalArchitect: React.FC<{ auraVoice: AuraVoice, onAdopt: (name: string, time: any, icon: string) => void }> = ({ auraVoice, onAdopt }) => {
  const [goal, setGoal] = useState("");
  const [isArchitecting, setIsArchitecting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleArchitect = async () => {
    if (!goal.trim()) return;
    setIsArchitecting(true);
    const res = await geminiService.suggestHabitsFromGoal(goal, auraVoice);
    setSuggestions(res);
    setIsArchitecting(false);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center space-x-3 px-2">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Brain size={16} />
        </div>
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Goal Architect</h3>
      </div>
      <GlassCard className="!p-6 space-y-6 border-indigo-500/20 bg-indigo-500/5">
        <div className="space-y-4">
          <p className="text-sm font-medium text-white/60 leading-relaxed italic">
            What are you aiming for in this season of life? I will architect the disciplines to match.
          </p>
          <div className="relative">
            <input 
              type="text" 
              value={goal}
              onChange={e => setGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleArchitect()}
              placeholder="Ex: Better focus at work"
              className="w-full h-14 glass rounded-2xl pl-6 pr-14 outline-none font-bold text-sm bg-black/20"
            />
            <button 
              onClick={handleArchitect}
              disabled={isArchitecting || !goal.trim()}
              className="absolute right-2 top-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black shadow-lg disabled:opacity-20 transition-all active:scale-90"
            >
              {isArchitecting ? <RefreshCw className="animate-spin" size={18} /> : <ArrowRight size={18} />}
            </button>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
            {suggestions.map((s, i) => (
              <div key={i} className="glass bg-white/[0.02] p-4 rounded-2xl flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{s.icon}</div>
                  <div>
                    <p className="font-bold text-sm">{s.name}</p>
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">{s.time} • {s.reason}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    onAdopt(s.name, s.time, s.icon);
                    setSuggestions(prev => prev.filter((_, idx) => idx !== i));
                  }}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-indigo-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black"
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </section>
  );
};

// --- HOME SCREEN ---

const HomeScreen: React.FC<{ 
  user: UserSession | null; 
  currentMood: Mood; 
  navigate: any; 
  habits: Habit[]; 
  toggleHabit: any;
  onAddHabit: (name: string, time: any, icon: string) => void;
}> = ({ user, currentMood, navigate, habits, toggleHabit, onAddHabit }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 relative z-10">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">Welcome, {user?.name}.</h1>
          <p className="text-white/30 text-sm font-medium mt-2">Your sanctuary is ready.</p>
        </div>
        <MoodOrb mood={currentMood} size="sm" />
      </header>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard onClick={() => navigate('Routine')} className="bg-emerald-500/10 border-emerald-500/20 group">
          <div className="flex justify-between items-start h-full">
            <div className="space-y-2">
              <h3 className="text-xl font-black tracking-tight group-hover:translate-x-1 transition-transform">Architecture</h3>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Plan your day</p>
            </div>
            <Calendar className="text-emerald-400" size={20} />
          </div>
        </GlassCard>
        <GlassCard onClick={() => navigate('Journal')} className="bg-indigo-600/10 border-indigo-500/20 group">
          <div className="flex justify-between items-start h-full">
            <div className="space-y-2">
              <h3 className="text-xl font-black tracking-tight group-hover:translate-x-1 transition-transform">Chronicle</h3>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Journal spirit</p>
            </div>
            <Plus className="text-indigo-400" size={20} />
          </div>
        </GlassCard>
      </div>

      <GoalArchitect auraVoice={user?.auraVoice || 'friend'} onAdopt={onAddHabit} />

      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Daily Disciplines</h3>
          <button onClick={() => navigate('Habits')} className="text-white/40 hover:text-white transition-colors"><ChevronRight size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {habits.slice(0, 4).map(h => (
            <GlassCard key={h.id} onClick={() => toggleHabit(h.id)} className={`!p-5 flex flex-col items-center text-center space-y-3 transition-all ${h.completed ? 'opacity-30 grayscale scale-95' : 'hover:scale-[1.02]'}`}>
              <div className="text-3xl">{h.icon}</div>
              <p className="font-bold text-sm line-clamp-1">{h.name}</p>
              {h.completed && <CheckCircle2 className="text-emerald-400" size={16} />}
            </GlassCard>
          ))}
        </div>
      </section>

      <GlassCard className="!p-8 bg-white/[0.02]">
        <div className="flex items-center space-x-4 mb-6">
          <Activity className="text-rose-400" size={24} />
          <h3 className="text-xl font-black tracking-tighter">Neural Pulse</h3>
        </div>
        <p className="text-white/60 leading-relaxed font-medium italic">"The consistency of your light determines the clarity of your path."</p>
      </GlassCard>
    </div>
  );
};

// --- ROUTINE SCREEN ---

const RoutineScreen: React.FC<{ currentRoutine: RoutineItem[], habits: Habit[], auraVoice: AuraVoice, onToggle: (id: string) => void, onUpdate: (items: RoutineItem[]) => void, onClose: () => void }> = ({ currentRoutine, habits, auraVoice, onToggle, onUpdate, onClose }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    const optimized = await geminiService.optimizeRoutine(currentRoutine, habits, auraVoice);
    const mapped: RoutineItem[] = optimized.map((o: any, i: number) => ({
      id: `opt-${i}`,
      title: o.title,
      time: o.time,
      completed: false,
      source: 'app'
    }));
    onUpdate(mapped);
    setIsOptimizing(false);
  };

  const handleSyncGoogle = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    const googleItems: RoutineItem[] = [
      { id: 'g1', title: 'Product Review Meeting', time: '11:00 AM', completed: false, source: 'google' },
      { id: 'g2', title: 'Yoga Class', time: '05:30 PM', completed: false, source: 'google' },
    ];
    onUpdate([...currentRoutine, ...googleItems]);
    setIsSyncing(false);
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-right-8 duration-700 relative z-10">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Architecture.</h2>
          <p className="text-white/20 text-xs font-black uppercase tracking-widest mt-1">Daily Routine Plan</p>
        </div>
        <button onClick={onClose} className="w-12 h-12 glass rounded-full flex items-center justify-center"><X /></button>
      </header>

      <div className="flex space-x-3 overflow-x-auto no-scrollbar py-2">
        <AnimatedButton onClick={handleOptimize} disabled={isOptimizing} className="!h-12 text-xs flex-1 rounded-2xl whitespace-nowrap">
          {isOptimizing ? <RefreshCw className="animate-spin mr-2" size={14} /> : <Zap size={14} className="mr-2" />}
          AI Optimize
        </AnimatedButton>
        <AnimatedButton onClick={handleSyncGoogle} disabled={isSyncing} variant="secondary" className="!h-12 text-xs flex-1 rounded-2xl whitespace-nowrap">
          {isSyncing ? <RefreshCw className="animate-spin mr-2" size={14} /> : <Calendar size={14} className="mr-2" />}
          Sync Google
        </AnimatedButton>
      </div>

      <div className="space-y-4">
        {currentRoutine.length === 0 && (
          <p className="text-center text-white/20 italic py-12">Your day is a blank canvas.</p>
        )}
        {currentRoutine.sort((a, b) => a.time.localeCompare(b.time)).map(item => (
          <GlassCard key={item.id} onClick={() => onToggle(item.id)} className={`!p-5 flex items-center space-x-5 transition-all ${item.completed ? 'opacity-30 grayscale' : 'hover:bg-white/[0.08]'}`}>
            <div className="w-12 h-12 glass-dark rounded-xl flex items-center justify-center text-xs font-black text-white/40">
              {item.time.split(' ')[0]}
            </div>
            <div className="flex-1">
              <h4 className={`font-bold tracking-tight ${item.completed ? 'line-through' : ''}`}>{item.title}</h4>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/20 mt-1">
                {item.source === 'google' ? 'Google Calendar' : 'Sanctuary Plan'}
              </p>
            </div>
            {item.completed ? <CheckSquare className="text-emerald-400" /> : <Square className="text-white/10" />}
          </GlassCard>
        ))}
      </div>
      
      <div className="pt-10">
         <GlassCard className="bg-white/[0.02] border-white/5 flex items-center space-x-6">
            <div className="w-16 h-16 rounded-full bg-theme-accent/20 flex items-center justify-center text-theme-accent">
               <Clock size={32} />
            </div>
            <div>
               <p className="text-sm font-bold">Remaining Focus</p>
               <p className="text-[10px] uppercase font-black text-white/20 tracking-widest mt-1">
                 {currentRoutine.filter(i => !i.completed).length} items awaiting resonance
               </p>
            </div>
         </GlassCard>
      </div>
    </div>
  );
};

// --- JOURNAL SCREEN ---

const JournalScreen: React.FC<{ onSubmit: (e: any) => void, auraVoice: AuraVoice, mood: Mood, onClose: () => void }> = ({ onSubmit, auraVoice, mood, onClose }) => {
  const [intensity, setIntensity] = useState(5);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prompt, setPrompt] = useState("Witness your thoughts...");
  const [isPromptLoading, setIsPromptLoading] = useState(false);

  const fetchPrompt = async () => {
    setIsPromptLoading(true);
    const p = await geminiService.generateJournalPrompt(mood, auraVoice);
    setPrompt(p);
    setIsPromptLoading(false);
  };

  useEffect(() => {
    fetchPrompt();
  }, [mood, auraVoice]);

  const execCommand = (command: string) => { document.execCommand(command, false, ''); editorRef.current?.focus(); };

  const handleSave = async () => {
    const content = editorRef.current?.innerHTML || "";
    const plainText = editorRef.current?.innerText || "";
    if (content.length < 20) return;
    setIsAnalyzing(true);
    const [insight, title] = await Promise.all([
      geminiService.analyzeJournal(plainText, auraVoice),
      geminiService.generateJournalTitle(plainText)
    ]);
    onSubmit({ mood, intensity, content, date: new Date().toISOString(), insight, title });
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-10 pb-12 animate-in slide-in-from-right-8 duration-700 relative z-10">
      <header className="flex justify-between items-center">
        <h2 className="text-4xl font-black tracking-tighter">The Chronicle.</h2>
        <button onClick={onClose} className="w-12 h-12 glass rounded-full flex items-center justify-center"><X /></button>
      </header>
      <GlassCard className="!p-4 bg-indigo-600/5 border-indigo-500/20 italic text-indigo-300/80 flex justify-between items-center">
        <p className="text-sm font-medium pr-4">{isPromptLoading ? 'Summoning guidance...' : prompt}</p>
        <button onClick={fetchPrompt} disabled={isPromptLoading} className="flex-shrink-0 text-indigo-400 hover:rotate-180 transition-all">
          <RefreshCw size={18} className={isPromptLoading ? 'animate-spin' : ''} />
        </button>
      </GlassCard>
      <div className="glass rounded-[3rem] p-3 shadow-2xl relative">
        <div className="flex items-center space-x-2 p-3 border-b border-white/5 mb-2">
          <EditorAction onClick={() => execCommand('bold')} icon={Bold} />
          <EditorAction onClick={() => execCommand('italic')} icon={Italic} />
          <EditorAction onClick={() => execCommand('insertUnorderedList')} icon={List} />
          <div className="flex-1"></div>
          <Sparkles size={16} className="text-indigo-400 mr-2" />
        </div>
        <div 
          ref={editorRef} 
          contentEditable 
          className="editor-container min-h-[400px] p-6 outline-none font-medium leading-[1.8] text-xl text-white/90 selection:bg-indigo-500/30" 
        />
      </div>
      <AnimatedButton onClick={handleSave} disabled={isAnalyzing} className="w-full h-[72px] text-xl font-black rounded-[2rem]">
        {isAnalyzing ? <RefreshCw className="animate-spin mr-2" /> : <Send className="mr-2" />}
        {isAnalyzing ? 'Processing...' : 'Seal Chronicle'}
      </AnimatedButton>
    </div>
  );
};

// --- DISCIPLINE MANAGER ---

const DisciplineManager: React.FC<{ habits: Habit[]; toggleHabit: any; onAdd: any; onRemove: any }> = ({ habits, toggleHabit, onAdd, onRemove }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Anytime'>('Morning');
  const [newIcon, setNewIcon] = useState('✨');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName, newTime, newIcon);
      setNewName('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-right-8 duration-700 relative z-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black tracking-tighter">Disciplines.</h2>
          <p className="text-white/20 text-xs font-black uppercase tracking-widest mt-1">Consistency Engine</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${showAddForm ? 'bg-rose-500/20 text-rose-400 rotate-45' : 'glass text-indigo-400'}`}
        >
          <Plus size={32} />
        </button>
      </header>

      {showAddForm && (
        <GlassCard className="animate-in zoom-in-95 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-white/20">Discipline Name</label>
              <input 
                type="text" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: Cold Plunge"
                className="w-full h-14 glass rounded-2xl px-6 outline-none font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/20">Timeframe</label>
                <select 
                  value={newTime} 
                  onChange={e => setNewTime(e.target.value as any)}
                  className="w-full h-14 glass rounded-2xl px-4 outline-none font-bold bg-[#0a0a0f]"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Anytime">Anytime</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/20">Icon</label>
                <input 
                  type="text" 
                  value={newIcon} 
                  onChange={e => setNewIcon(e.target.value)}
                  className="w-full h-14 glass rounded-2xl text-center outline-none text-2xl"
                  maxLength={2}
                />
              </div>
            </div>
            <AnimatedButton onClick={() => {}} className="w-full h-16 rounded-[1.5rem]">Architect Discipline</AnimatedButton>
          </form>
        </GlassCard>
      )}

      <div className="space-y-4">
        {habits.map(h => (
          <div key={h.id} className="group relative">
            <div 
              onClick={() => toggleHabit(h.id)} 
              className="glass rounded-[2rem] p-6 flex items-center justify-between transition-all hover:bg-white/[0.05] cursor-pointer"
            >
               <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 glass-dark rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl">{h.icon}</div>
                  <div>
                    <p className={`text-xl font-bold tracking-tight ${h.completed ? 'text-white/20 line-through' : ''}`}>{h.name}</p>
                    <div className="flex items-center space-x-3 mt-1 opacity-30 font-black text-[9px] uppercase tracking-widest">
                      <span>{h.time}</span>
                      <span className="w-1 h-1 rounded-full bg-white"></span>
                      <span className="text-orange-400">Streak: {h.streak}</span>
                    </div>
                  </div>
               </div>
               <div className="flex items-center space-x-4">
                 {h.completed ? <CheckCircle2 className="text-emerald-400" size={28} /> : <div className="w-8 h-8 rounded-xl border-2 border-white/5" />}
               </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(h.id); }}
              className="absolute -right-2 -top-2 w-8 h-8 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- AFFIRMATION EVOLVER ---

const AffirmationEvolver: React.FC<{ 
  auraVoice: AuraVoice;
  mood: Mood; 
  recentJournal?: string; 
  favorites: FavoriteAffirmation[]; 
  onToggleFavorite: (text: string, mood: Mood) => void;
  onClose: () => void;
}> = ({ auraVoice, mood, recentJournal, favorites, onToggleFavorite, onClose }) => {
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<Tone>('Compassionate');

  const fetchAffirmations = async () => {
    setIsLoading(true);
    const results = await geminiService.generateAffirmations(mood, tone, auraVoice, recentJournal);
    setAffirmations(results);
    setCurrentIndex(0);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAffirmations();
  }, [mood, tone, auraVoice]);

  const currentText = affirmations[currentIndex] || "...";
  const isFav = favorites.some(f => f.text === currentText);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Aura Affirmation',
          text: `"${currentText}" - A visceral anchor for my current spirit.`,
          url: window.location.href
        });
      } catch (e) { console.debug('Share failed'); }
    } else {
      alert("Sharing is not supported on this browser.");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative z-10 flex flex-col items-center">
      <header className="flex justify-between items-center w-full">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Aura Pulse.</h2>
          <p className="text-white/20 text-xs font-black uppercase tracking-widest mt-1">{tone} Evolution</p>
        </div>
        <button onClick={onClose} className="w-12 h-12 glass rounded-full flex items-center justify-center"><X /></button>
      </header>

      <div className="flex space-x-2 w-full overflow-x-auto no-scrollbar py-2">
        {(['Compassionate', 'Stoic', 'Energetic', 'Poetic'] as Tone[]).map(t => (
          <button 
            key={t} 
            onClick={() => setTone(t)}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${tone === t ? 'bg-white text-black' : 'glass text-white/40'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <GlassCard 
        onClick={() => setCurrentIndex((currentIndex + 1) % (affirmations.length || 1))}
        className={`w-full aspect-square max-w-[340px] rounded-[3.5rem] flex flex-col items-center justify-center p-12 text-center relative group active:scale-95 transition-all shadow-2xl ${isLoading ? 'opacity-50' : ''}`}
      >
        <Sparkles className="absolute top-10 left-10 text-theme-accent opacity-10" size={48} />
        <p key={currentIndex} className="text-3xl font-black tracking-tighter leading-tight text-white/90 animate-in slide-in-from-bottom-4 duration-500">
          {isLoading ? "Synthesizing frequency..." : currentText}
        </p>
        <div className="absolute bottom-10 flex space-x-1.5">
          {affirmations.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/10'}`}></div>
          ))}
        </div>
      </GlassCard>

      <div className="flex space-x-4 w-full max-w-[340px]">
        <AnimatedButton onClick={fetchAffirmations} className="flex-1 rounded-[1.5rem]">
          <RefreshCw size={20} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Evolve
        </AnimatedButton>
        <AnimatedButton 
          onClick={() => onToggleFavorite(currentText, mood)} 
          variant="secondary"
          className={`w-16 rounded-[1.5rem] ${isFav ? 'text-amber-400' : 'text-white/30'}`}
        >
          <Star size={24} fill={isFav ? "currentColor" : "none"} />
        </AnimatedButton>
        <AnimatedButton onClick={handleShare} variant="secondary" className="w-16 rounded-[1.5rem] text-white/30">
          <Share2 size={24} />
        </AnimatedButton>
      </div>
    </div>
  );
};

// --- ANALYTICS DETAILED ---

const AnalyticsDetailed: React.FC<{ entries: JournalEntry[]; correlation: string }> = ({ entries, correlation }) => {
  const data = entries.slice(0, 7).reverse().map(e => ({
    name: new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' }),
    intensity: e.intensity || 5
  }));

  return (
    <div className="space-y-12 animate-in fade-in duration-700 relative z-10">
      <header>
        <h2 className="text-4xl font-black tracking-tighter">Pulse Analytics.</h2>
        <p className="text-white/20 text-xs font-black uppercase tracking-widest mt-1">Biometric Insight</p>
      </header>

      <GlassCard className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="intensity" stroke="#818cf8" fillOpacity={1} fill="url(#colorIntensity)" />
            <Tooltip contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#ffffff10', borderRadius: '1rem', color: '#fff' }} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      <GlassCard className="bg-indigo-600/5 border-indigo-500/20">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="text-indigo-400" size={20} />
          <h3 className="font-black uppercase text-[10px] tracking-widest text-indigo-400">AI Deep Correlation</h3>
        </div>
        <p className="text-lg font-medium leading-relaxed">{correlation}</p>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="text-center">
          <p className="text-3xl font-black mb-1">{entries.length}</p>
          <p className="text-[10px] uppercase font-black text-white/20 tracking-widest">Total Chronicles</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-3xl font-black mb-1">14</p>
          <p className="text-[10px] uppercase font-black text-white/20 tracking-widest">Day Streak</p>
        </GlassCard>
      </div>
    </div>
  );
};

// --- ADVANCED BREATHWORK ---

const AdvancedBreathwork: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [timer, setTimer] = useState(4);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (active) {
      interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            if (phase === 'Inhale') { setPhase('Hold'); return 4; }
            if (phase === 'Hold') { setPhase('Exhale'); return 4; }
            setPhase('Inhale'); return 4;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [active, phase]);

  return (
    <div className="fixed inset-0 bg-[#050508] z-[100] p-10 flex flex-col items-center justify-center animate-in fade-in duration-700">
      <button onClick={onClose} className="absolute top-12 right-10 text-white/20 z-20"><X size={32} /></button>
      <div className={`w-64 h-64 rounded-full flex items-center justify-center transition-all duration-[4000ms] ${phase === 'Inhale' ? 'scale-125 bg-indigo-500/20' : phase === 'Exhale' ? 'scale-75 bg-rose-500/20' : 'scale-100 bg-white/10'}`}>
        <div className="text-center">
          <p className="text-4xl font-black tracking-tighter mb-2">{phase}</p>
          <p className="text-6xl font-black">{timer}</p>
        </div>
      </div>
      <AnimatedButton onClick={() => setActive(!active)} className="mt-20 w-48 rounded-full">
        {active ? 'Pause' : 'Commence'}
      </AnimatedButton>
    </div>
  );
};

// --- PROFILE SCREEN ---

const ProfileScreen: React.FC<{ user: any; entries: any[]; favorites: any[]; onLogout: () => void; theme: Theme; setTheme: any }> = ({ user, entries, favorites, onLogout, theme, setTheme }) => {
  const themes: Theme[] = ['midnight', 'forest', 'sunset', 'ocean'];
  return (
    <div className="space-y-12 animate-in fade-in duration-700 relative z-10">
      <header className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-[3rem] glass flex items-center justify-center text-4xl mb-6 shadow-2xl border border-white/10">
          {user?.name?.[0] || 'U'}
        </div>
        <h2 className="text-4xl font-black tracking-tighter">{user?.name}</h2>
        <p className="text-white/20 text-xs font-black uppercase tracking-widest mt-2">Aura Voice: {user?.auraVoice || 'mentor'}</p>
      </header>

      <section className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20">Aesthetic Frequency</h3>
        <div className="grid grid-cols-2 gap-4">
          {themes.map(t => (
            <button key={t} onClick={() => setTheme(t)} className={`h-16 rounded-2xl border transition-all flex items-center justify-center font-bold capitalize ${theme === t ? 'bg-white text-black border-white' : 'glass text-white border-white/5 hover:border-white/20'}`}>
              {t}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="text-center">
          <p className="text-3xl font-black mb-1">{entries.length}</p>
          <p className="text-[10px] uppercase font-black text-white/20 tracking-widest">Chronicles</p>
        </GlassCard>
        <GlassCard className="text-center">
          <p className="text-3xl font-black mb-1">{favorites.length}</p>
          <p className="text-[10px] uppercase font-black text-white/20 tracking-widest">Favorites</p>
        </GlassCard>
      </div>

      <AnimatedButton onClick={onLogout} variant="danger" className="w-full rounded-[2rem]">
        <LogOut size={20} className="mr-2" />
        Departure
      </AnimatedButton>
    </div>
  );
};

// --- AI MEDITATION ---

const AIMeditation: React.FC<{ currentMood: Mood; auraVoice: AuraVoice, onClose: () => void }> = ({ currentMood, auraVoice, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [meditation, setMeditation] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await geminiService.generateMeditation(currentMood, 5, auraVoice);
      setMeditation(res);
      setLoading(false);
    };
    fetch();
  }, [currentMood, auraVoice]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-500">
      <div className="w-32 h-32 rounded-full glass flex items-center justify-center animate-spin-slow">
        <Target className="text-indigo-400" size={48} />
      </div>
      <p className="text-xl font-black tracking-tighter">Manifesting Stillness...</p>
    </div>
  );

  const phase = meditation?.phases?.[currentPhase] || "Breathe deeply.";

  return (
    <div className="space-y-12 animate-in fade-in duration-700 relative z-10 text-center flex flex-col items-center">
      <header className="flex justify-between items-center w-full">
        <h2 className="text-3xl font-black tracking-tighter">Inner Presence.</h2>
        <button onClick={onClose} className="w-12 h-12 glass rounded-full flex items-center justify-center"><X /></button>
      </header>

      <MoodOrb mood={currentMood} size="lg" />

      <div className="min-h-[200px] flex flex-col items-center justify-center space-y-6">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/20">Phase {currentPhase + 1} of {meditation?.phases?.length}</h3>
        <p key={currentPhase} className="text-3xl font-black tracking-tighter leading-tight animate-in slide-in-from-bottom-4 duration-1000">
          {phase}
        </p>
      </div>

      <div className="flex space-x-4 w-full">
        <AnimatedButton 
          onClick={() => setCurrentPhase(p => Math.max(0, p - 1))} 
          variant="secondary" 
          disabled={currentPhase === 0}
          className="flex-1 rounded-[1.5rem]"
        >
          Previous
        </AnimatedButton>
        <AnimatedButton 
          onClick={() => currentPhase < (meditation?.phases?.length - 1) ? setCurrentPhase(p => p + 1) : onClose()} 
          className="flex-1 rounded-[1.5rem]"
        >
          {currentPhase < (meditation?.phases?.length - 1) ? 'Advance' : 'Seal'}
        </AnimatedButton>
      </div>
    </div>
  );
};

// --- CBT THOUGHT REFRAME ---

const ThoughtReframe: React.FC<{ auraVoice: AuraVoice, onClose: () => void }> = ({ auraVoice, onClose }) => {
  const [step, setStep] = useState(0);
  const [thought, setThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const process = async () => { setLoading(true); const res = await geminiService.reframeThought(thought, auraVoice); setResult(res); setLoading(false); setStep(1); };
  return (
    <div className="space-y-10 animate-in slide-in-from-right-8 duration-500 relative z-10">
      <header className="flex justify-between items-center"><h2 className="text-4xl font-black tracking-tighter">CBT Lens.</h2><button onClick={onClose} className="w-12 h-12 glass rounded-full flex items-center justify-center"><X /></button></header>
      {step === 0 ? (
        <div className="space-y-8">
          <textarea value={thought} onChange={e => setThought(e.target.value)} className="w-full h-48 glass rounded-[2.5rem] p-8 outline-none text-xl font-medium leading-relaxed resize-none" placeholder="Enter a distressing thought..." />
          <AnimatedButton onClick={process} disabled={!thought || loading} className="w-full h-[72px] text-xl rounded-[2.5rem]">{loading ? <RefreshCw className="animate-spin" /> : 'Refract Through CBT'}</AnimatedButton>
        </div>
      ) : (
        <div className="space-y-8">
          <GlassCard className="bg-red-500/5 border-red-500/20">
            <label className="text-[10px] font-black uppercase text-rose-400 block mb-2">Neural Distortion</label>
            <p className="text-2xl font-black tracking-tight">{result?.distortion}</p>
          </GlassCard>
          <GlassCard className="bg-emerald-500/5 border-emerald-500/20">
            <label className="text-[10px] font-black uppercase text-emerald-400 block mb-2">Balanced Reframe</label>
            <p className="text-2xl font-black tracking-tight">{result?.reframe}</p>
          </GlassCard>
          <AnimatedButton onClick={() => { setStep(0); setThought(''); }} className="w-full">Reframe Again</AnimatedButton>
        </div>
      )}
    </div>
  );
};

// --- INNER CHILD ---

const InnerChildScreen: React.FC<{ onClose: () => void; currentMood: Mood; auraVoice: AuraVoice }> = ({ onClose, currentMood, auraVoice }) => {
  const [messages, setMessages] = useState<{role: 'adult' | 'child', text: string}[]>([{role: 'child', text: "I'm here. How are you?"}]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSend = async () => { if (!input || isLoading) return; const userMsg = input; setInput(""); setMessages(prev => [...prev, {role: 'adult', text: userMsg}]); setIsLoading(true); const childResponse = await geminiService.getInnerChildResponse(userMsg, currentMood, auraVoice); setMessages(prev => [...prev, {role: 'child', text: childResponse || "..."}]); setIsLoading(false); };
  return (
    <div className="fixed inset-0 bg-[#050508] z-[100] flex flex-col pt-24 pb-12 px-8 animate-in slide-in-from-bottom duration-1000 relative">
      <button onClick={onClose} className="absolute top-12 right-10 text-white/20 z-20"><X size={32} /></button>
      <div className="text-center mb-10 z-10"><Baby size={48} className="text-rose-400 mx-auto mb-4" /><h2 className="text-3xl font-black tracking-tighter">Healing Dialogue.</h2></div>
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 mb-8 z-10">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'adult' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-6 rounded-[2rem] text-lg font-medium leading-relaxed ${m.role === 'adult' ? 'glass text-white' : 'bg-rose-500/10 text-rose-300'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="relative z-10"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Message your younger self..." className="w-full h-16 glass rounded-3xl pl-8 pr-16 outline-none text-white" /><button onClick={handleSend} className="absolute right-3 top-3 w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-black"><ArrowRight size={20} /></button></div>
    </div>
  );
};

// --- HELPERS ---

const TabItem: React.FC<{ icon: any; label: string; active: boolean; onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center py-3 transition-all ${active ? 'text-white' : 'text-white/20 hover:text-white/40'}`}>
    <Icon size={26} strokeWidth={active ? 2.5 : 2} className={active ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''} />
    {active && <span className="text-[9px] font-black uppercase mt-1 tracking-tighter">{label}</span>}
  </button>
);

const MoreMenuItem: React.FC<{ icon: any; label: string; color: string; onClick: () => void }> = ({ icon: Icon, label, color, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center group">
    <div className={`w-20 h-20 glass rounded-[2.5rem] flex items-center justify-center border border-white/5 group-active:scale-90 transition-all mb-4 bg-white/[0.02]`}>
      <Icon size={32} className={color} />
    </div>
    <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">{label}</span>
  </button>
);

const EditorAction: React.FC<{ onClick: () => void; icon: any }> = ({ onClick, icon: Icon }) => (
  <button onClick={onClick} className="w-12 h-12 rounded-[1.2rem] hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all active:scale-90">
    <Icon size={20} />
  </button>
);

const NexusGrid: React.FC<{ navigate: any }> = ({ navigate }) => (
  <div className="space-y-10 animate-in fade-in duration-700 relative z-10">
    <h2 className="text-4xl font-black tracking-tighter">Nexus Hub.</h2>
    <div className="grid grid-cols-2 gap-4">
      <ToolCard icon={Target} label="Core" sub="Emotion Wheel" onClick={() => navigate('EmotionWheel')} color="text-amber-400" />
      <ToolCard icon={Clock} label="Focus" sub="Meditation" onClick={() => navigate('Meditation')} color="text-violet-400" />
      <ToolCard icon={Waves} label="Resonance" sub="Breathing" onClick={() => navigate('Breath')} color="text-indigo-400" />
      <ToolCard icon={ShieldAlert} label="Tether" sub="Grounding" onClick={() => navigate('Grounding')} color="text-rose-400" />
      <ToolCard icon={Layers} label="Lens" sub="CBT Tool" onClick={() => navigate('CBT')} color="text-purple-400" />
      <ToolCard icon={TrendingUp} label="Pulse" sub="Affirmations" onClick={() => navigate('Affirmations')} color="text-emerald-400" />
    </div>
  </div>
);

const ToolCard: React.FC<{ icon: any; label: string; sub: string; onClick: () => void; color: string }> = ({ icon: Icon, label, sub, onClick, color }) => (
  <GlassCard onClick={onClick} className="!p-8 flex flex-col items-center text-center space-y-4 hover:border-white/20 transition-all active:scale-95">
    <div className={`w-14 h-14 glass rounded-2xl flex items-center justify-center ${color} bg-white/[0.02]`}>
      <Icon size={32} />
    </div>
    <div>
      <h4 className="font-black text-lg tracking-tight">{label}</h4>
      <p className="text-[9px] uppercase font-black text-white/20 tracking-widest">{sub}</p>
    </div>
  </GlassCard>
);

const EmotionWheel: React.FC<{ onClose: () => void; onSelect: (m: Mood) => void }> = ({ onClose, onSelect }) => {
  const categories = [
    { mood: 'joyful', label: 'Elated', color: 'bg-amber-400' },
    { mood: 'calm', label: 'Serene', color: 'bg-teal-400' },
    { mood: 'energized', label: 'Active', color: 'bg-orange-500' },
    { mood: 'anxious', label: 'Restless', color: 'bg-fuchsia-500' },
    { mood: 'sad', label: 'Reflective', color: 'bg-indigo-600' },
    { mood: 'grateful', label: 'Full', color: 'bg-rose-400' },
    { mood: 'peaceful', label: 'Quiet', color: 'bg-emerald-400' },
    { mood: 'neutral', label: 'Balanced', color: 'bg-slate-500' },
  ];
  return (
    <div className="fixed inset-0 bg-[#050508] z-[100] p-10 flex flex-col justify-center animate-in fade-in duration-700 relative">
      <button onClick={onClose} className="absolute top-12 right-10 text-white/20 hover:rotate-90 transition-all z-20"><X size={32} /></button>
      <h2 className="text-4xl font-black tracking-tighter text-center mb-16 z-10">The Core.</h2>
      <div className="grid grid-cols-2 gap-6 max-w-[320px] mx-auto z-10">
        {categories.map((item) => (
          <button key={item.mood} onClick={() => onSelect(item.mood as Mood)} className="flex flex-col items-center group">
            <div className={`w-24 h-24 rounded-[2.5rem] ${item.color} p-0.5 group-active:scale-95 transition-all shadow-2xl`}>
              <div className="w-full h-full bg-[#050508] rounded-[2.4rem] flex items-center justify-center">
                <MoodOrb mood={item.mood} size="sm" />
              </div>
            </div>
            <span className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const InteractiveGrounding: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const steps = [{ n: 5, sense: "see", icon: "👁", color: "text-indigo-400" }, { n: 4, sense: "touch", icon: "🖐", color: "text-emerald-400" }, { n: 3, sense: "hear", icon: "👂", color: "text-amber-400" }, { n: 2, sense: "smell", icon: "👃", color: "text-rose-400" }, { n: 1, sense: "taste", icon: "👅", color: "text-purple-400" }];
  return (
    <div className="fixed inset-0 bg-[#050508] z-[100] p-10 flex flex-col justify-center animate-in fade-in duration-700 relative">
      <button onClick={onClose} className="absolute top-12 right-10 text-white/20 z-20"><X size={32} /></button>
      <div className="flex flex-col items-center z-10"><div className={`w-24 h-24 glass rounded-[2.5rem] flex items-center justify-center text-4xl mb-6 ${steps[step].color}`}>{steps[step].icon}</div><p className="text-2xl font-bold leading-tight tracking-tight text-center">Acknowledge <span className="text-5xl font-black">{steps[step].n}</span> items you can <span className="serif-italic underline decoration-indigo-500/30">{steps[step].sense}</span>.</p></div>
      <AnimatedButton onClick={() => step < 4 ? setStep(step+1) : onClose()} className="w-full h-16 rounded-[2rem] mt-8 z-10">{step < 4 ? 'Continue' : 'Return'}</AnimatedButton>
    </div>
  );
};

export default App;
