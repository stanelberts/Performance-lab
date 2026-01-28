
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity as ActivityIcon, 
  BarChart2, 
  Layout, 
  Settings as SettingsIcon, 
  Tag, 
  Zap, 
  Trophy,
  ClipboardList,
  ArrowLeft
} from 'lucide-react';
import { MOCK_ACTIVITIES, DEFAULT_LABELS, MOCK_TEMPLATES, HYROX_STATIONS } from './mockData';
import { Activity, Label, DashboardStats, WorkoutTemplate } from './types';
import Dashboard from './components/Dashboard';
import ActivityList from './components/ActivityList';
import ActivityDetailView from './components/ActivityDetailView';
import LabelManager from './components/LabelManager';
import SettingsView from './components/SettingsView';
import BenchmarksView from './components/BenchmarksView';
import WorkoutsView from './components/WorkoutsView';
import { exchangeStravaCode, fetchStravaActivities } from './services/strava';
import { decodeActivityFromUrl } from './services/share';

const App: React.FC = () => {
  // Veilige initialisatie van activiteiten
  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const saved = localStorage.getItem('lab_activities');
      return saved ? JSON.parse(saved) : MOCK_ACTIVITIES;
    } catch (e) {
      console.error("Fout bij laden activiteiten:", e);
      return MOCK_ACTIVITIES;
    }
  });

  const [labels, setLabels] = useState<Label[]>(DEFAULT_LABELS);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(MOCK_TEMPLATES);
  const [activeTab, setActiveTab] = useState<'home' | 'list' | 'benchmarks' | 'workouts' | 'labels' | 'settings'>('home');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [sharedActivity, setSharedActivity] = useState<Partial<Activity> | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const [stravaToken, setStravaToken] = useState<string | null>(localStorage.getItem('strava_access_token'));

  const [mainGoal, setMainGoal] = useState('Mijn eerste Hyrox Solo onder de 1:15:00 finishen.');
  const [nextRace, setNextRace] = useState({
    name: 'Hyrox Rotterdam',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString()
  });

  const [runningPRs, setRunningPRs] = useState<Record<string, {time: string, date: string}>>({
    '1km': { time: '00:03:45', date: '2023-11-12' },
    '5km': { time: '00:19:50', date: '2024-01-20' },
    '10km': { time: '00:42:15', date: '2024-03-05' },
    'Halve Marathon': { time: '01:35:00', date: '2023-10-15' },
    'Marathon': { time: '00:00:00', date: '' },
  });

  const [hyroxStationPRs, setHyroxStationPRs] = useState<Record<string, {time: string, date: string}>>(
    HYROX_STATIONS.reduce((acc, station) => ({
      ...acc,
      [station]: { time: '00:00:00', date: '' }
    }), {})
  );

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const shareData = urlParams.get('share');
      
      if (shareData) {
        const decoded = decodeActivityFromUrl(shareData);
        if (decoded) {
          setSharedActivity(decoded);
        }
      }

      if (code) {
        const handleAuth = async () => {
          setIsSyncing(true);
          const configStr = localStorage.getItem('strava_config');
          if (configStr) {
            try {
              const config = JSON.parse(configStr);
              const data = await exchangeStravaCode(config, code);
              localStorage.setItem('strava_access_token', data.access_token);
              setStravaToken(data.access_token);
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch (err) {
              console.error(err);
            }
          }
          setIsSyncing(false);
        };
        handleAuth();
      }
    } catch (e) {
      setInitError("Er is een fout opgetreden bij het laden van de URL parameters.");
    }
  }, []);

  const handleSyncStrava = async () => {
    if (!stravaToken) {
      setActiveTab('settings');
      return;
    }
    setIsSyncing(true);
    try {
      const stravaActivities = await fetchStravaActivities(stravaToken);
      setActivities(prev => {
        const existingIds = new Set(prev.map(a => a.stravaId).filter(Boolean));
        const newActivities = stravaActivities.filter(a => !existingIds.has(a.stravaId));
        const updated = [...newActivities, ...prev].sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        localStorage.setItem('lab_activities', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert("Synchronisatie mislukt. Controleer je internetverbinding.");
    }
    setIsSyncing(false);
  };

  const selectedActivity = useMemo(() => 
    activities.find(a => a.id === selectedActivityId), 
  [activities, selectedActivityId]);

  const dashboardStats: DashboardStats = useMemo(() => {
    const z2Activities = activities.filter(a => a.labels.some(l => l.name.includes('Z2')));
    const z2Mins = z2Activities.reduce((acc, curr) => acc + curr.movingTime / 60, 0);

    return {
      z2Minutes: Math.round(z2Mins),
      z2Goal: 180,
      thresholdCount: activities.filter(a => a.labels.some(l => l.name === 'Threshold')).length,
      thresholdGoal: 1,
      vo2Count: activities.filter(a => a.labels.some(l => l.name === 'VO2')).length,
      vo2Goal: 1,
      strengthCount: activities.filter(a => a.labels.some(l => l.name.includes('Body'))).length,
      strengthGoal: 2,
    };
  }, [activities]);

  const handleUpdateLabels = (activityId: string, newLabels: Label[]) => {
    const updated = activities.map(a => a.id === activityId ? { ...a, labels: newLabels } : a);
    setActivities(updated);
    localStorage.setItem('lab_activities', JSON.stringify(updated));
  };

  const handleUpdateActivities = (newActivities: Activity[]) => {
    setActivities(newActivities);
    localStorage.setItem('lab_activities', JSON.stringify(newActivities));
  };

  // Fixed: handleBulkLabel implementation
  const handleBulkLabel = (ids: string[], label: Label) => {
    const updated = activities.map(a => {
      if (ids.includes(a.id)) {
        const hasLabel = a.labels.some(l => l.id === label.id);
        return hasLabel ? a : { ...a, labels: [...a.labels, label] };
      }
      return a;
    });
    setActivities(updated);
    localStorage.setItem('lab_activities', JSON.stringify(updated));
  };

  // Fixed: handleCreateActivity implementation
  const handleCreateActivity = (activity: Activity) => {
    const updated = [activity, ...activities];
    setActivities(updated);
    localStorage.setItem('lab_activities', JSON.stringify(updated));
    setSelectedActivityId(activity.id);
  };

  if (initError) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center p-8 text-center">
        <div className="space-y-4">
          <Zap className="mx-auto text-red-500" size={48} />
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Oeps! Lab Error</h1>
          <p className="text-secondary-text text-sm">{initError}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-electric-blue rounded-full text-xs font-black uppercase">Herladen</button>
        </div>
      </div>
    );
  }

  // Shared View Render
  if (sharedActivity) {
    return (
      <div className="min-h-screen bg-charcoal text-primary-text flex flex-col">
        <header className="p-6 border-b border-dark-border flex justify-between items-center bg-charcoal/50 backdrop-blur-md sticky top-0 z-50">
          <button onClick={() => {
            setSharedActivity(null);
            window.history.replaceState({}, document.title, window.location.pathname);
          }} className="flex items-center gap-2 text-secondary-text hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">
            <ArrowLeft size={16} /> Sluiten
          </button>
          <h1 className="text-sm font-black italic tracking-tighter text-electric-blue flex items-center gap-1">
            <Zap className="fill-electric-blue" size={16} /> PERFORMANCE LAB
          </h1>
          <div className="w-10" />
        </header>
        <div className="flex-1 overflow-y-auto">
          <ActivityDetailView 
            activity={sharedActivity as Activity} 
            allActivities={[]}
            onBack={() => {
              setSharedActivity(null);
              window.history.replaceState({}, document.title, window.location.pathname);
            }}
            onUpdateLabels={() => {}}
            availableLabels={[]}
            isSharedView={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:pl-64 bg-charcoal text-primary-text">
      <aside className="hidden md:flex flex-col w-64 bg-charcoal border-r border-dark-border fixed left-0 top-0 bottom-0 z-20">
        <div className="p-8">
          <h1 className="text-2xl font-black italic tracking-tighter text-electric-blue flex items-center gap-2">
            <Zap className="fill-electric-blue" size={28} /> PERFORMANCE LAB
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<Layout size={20}/>} label="Overzicht" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setSelectedActivityId(null); }} />
          <NavItem icon={<ActivityIcon size={20}/>} label="Sessies" active={activeTab === 'list'} onClick={() => { setActiveTab('list'); setSelectedActivityId(null); }} />
          <NavItem icon={<ClipboardList size={20}/>} label="Workouts" active={activeTab === 'workouts'} onClick={() => { setActiveTab('workouts'); setSelectedActivityId(null); }} />
          <NavItem icon={<Trophy size={20}/>} label="Benchmarks" active={activeTab === 'benchmarks'} onClick={() => { setActiveTab('benchmarks'); setSelectedActivityId(null); }} />
          <NavItem icon={<Tag size={20}/>} label="Labels" active={activeTab === 'labels'} onClick={() => { setActiveTab('labels'); setSelectedActivityId(null); }} />
          <div className="pt-8 border-t border-dark-border/30">
            <NavItem icon={<SettingsIcon size={20}/>} label="Instellingen" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setSelectedActivityId(null); }} />
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {selectedActivityId ? (
          <ActivityDetailView 
            activity={selectedActivity!} 
            allActivities={activities}
            onBack={() => setSelectedActivityId(null)}
            onUpdateLabels={(newLabels) => handleUpdateLabels(selectedActivityId, newLabels)}
            availableLabels={labels}
          />
        ) : (
          <div className="p-4 md:p-12 max-w-6xl mx-auto">
            {activeTab === 'home' && (
              <Dashboard 
                stats={dashboardStats} 
                recentActivities={activities.slice(0, 5)} 
                onSelectActivity={setSelectedActivityId}
                onQuickLabel={handleUpdateLabels}
                availableLabels={labels}
                mainGoal={mainGoal}
                setMainGoal={setMainGoal}
                nextRace={nextRace}
                setNextRace={setNextRace}
                onSync={handleSyncStrava}
                isSyncing={isSyncing}
              />
            )}
            {activeTab === 'list' && (
              <ActivityList 
                activities={activities} 
                onSelectActivity={setSelectedActivityId}
                onBulkLabel={handleBulkLabel}
                availableLabels={labels}
              />
            )}
            {activeTab === 'workouts' && (
              <WorkoutsView 
                templates={templates} 
                onLogActivity={handleCreateActivity}
              />
            )}
            {activeTab === 'benchmarks' && (
              <BenchmarksView 
                activities={activities} 
                onUpdateActivities={handleUpdateActivities}
                runningPRs={runningPRs}
                setRunningPRs={setRunningPRs}
                hyroxStationPRs={hyroxStationPRs}
                setHyroxStationPRs={setHyroxStationPRs}
              />
            )}
            {activeTab === 'labels' && (
              <LabelManager labels={labels} onUpdateLabels={setLabels} />
            )}
            {activeTab === 'settings' && (
              <SettingsView 
                stats={dashboardStats} 
                mainGoal={mainGoal} 
                setMainGoal={setMainGoal}
                nextRace={nextRace}
                setNextRace={setNextRace}
                isSyncing={isSyncing}
              />
            )}
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-charcoal/95 backdrop-blur-md border-t border-dark-border flex justify-around p-4 z-30">
        <MobileNavItem icon={<Layout size={24}/>} label="Home" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setSelectedActivityId(null); }} />
        <MobileNavItem icon={<ActivityIcon size={24}/>} label="Sessies" active={activeTab === 'list'} onClick={() => { setActiveTab('list'); setSelectedActivityId(null); }} />
        <MobileNavItem icon={<ClipboardList size={24}/>} label="Workouts" active={activeTab === 'workouts'} onClick={() => { setActiveTab('workouts'); setSelectedActivityId(null); }} />
        <MobileNavItem icon={<Trophy size={24}/>} label="Benches" active={activeTab === 'benchmarks'} onClick={() => { setActiveTab('benchmarks'); setSelectedActivityId(null); }} />
        <MobileNavItem icon={<SettingsIcon size={24}/>} label="Config" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setSelectedActivityId(null); }} />
      </nav>
    </div>
  );
};

// Fixed: NavItem component added
const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-electric-blue text-white shadow-lg shadow-electric-blue/20' : 'text-secondary-text hover:bg-dark-border/50 hover:text-primary-text'}`}
  >
    {icon}
    <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

// Fixed: MobileNavItem component added
const MobileNavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-electric-blue' : 'text-secondary-text'}`}
  >
    {icon}
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

// Fixed: Default export added
export default App;
