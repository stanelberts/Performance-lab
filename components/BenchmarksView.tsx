
import React, { useState, useMemo } from 'react';
import { Activity, Label, ActivityType } from '../types';
import { Trophy, Medal, Zap, Map, Edit2, Check, X, Plus, Calendar, Clock, Trash2, Save, Timer, Users, User } from 'lucide-react';
import { formatDuration } from '../utils/analysis';
import { HYROX_STATIONS, DEFAULT_LABELS } from '../mockData';

interface RecordEntry {
  time: string;
  date: string;
}

interface Props {
  activities: Activity[];
  onUpdateActivities: (activities: Activity[]) => void;
  runningPRs: Record<string, RecordEntry>;
  setRunningPRs: (prs: Record<string, RecordEntry>) => void;
  hyroxStationPRs: Record<string, RecordEntry>;
  setHyroxStationPRs: (prs: Record<string, RecordEntry>) => void;
}

const BenchmarksView: React.FC<Props> = ({ 
  activities, 
  onUpdateActivities,
  runningPRs,
  setRunningPRs,
  hyroxStationPRs,
  setHyroxStationPRs
}) => {
  const [activeTab, setActiveTab] = useState<'hyrox' | 'running'>('hyrox');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingTab, setEditingTab] = useState<'hyrox' | 'running' | 'race' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddingRace, setIsAddingRace] = useState(false);
  const [editingRaceId, setEditingRaceId] = useState<string | null>(null);

  const [raceForm, setRaceForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    distance: '',
    hyroxCategory: 'Solo' as 'Solo' | 'Duo',
    hyroxDivision: 'Open' as 'Open' | 'Pro',
    hyroxSubCategory: 'Men' as 'Men' | 'Women' | 'Mixed'
  });

  const hyroxActivities = useMemo(() => 
    activities.filter(a => a.labels.some(l => l.name === 'Hyrox')),
  [activities]);

  const hyroxRaces = useMemo(() => 
    hyroxActivities.filter(a => a.isRace).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
  [hyroxActivities]);

  const runningRaces = useMemo(() => 
    activities.filter(a => a.isRace && (a.type === 'Run' || a.labels.some(l => l.category === 'Hardlopen')))
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
  [activities]);

  const calculatedStats = useMemo(() => {
    const solo = hyroxRaces.filter(a => a.hyroxData?.category === 'Solo');
    const duo = hyroxRaces.filter(a => a.hyroxData?.category === 'Duo');
    const getFastest = (list: Activity[]) => {
      if (list.length === 0) return null;
      return [...list].sort((a, b) => a.movingTime - b.movingTime)[0];
    };
    return { soloPR: getFastest(solo), duoPR: getFastest(duo) };
  }, [hyroxRaces]);

  const savePR = (key: string, type: 'hyrox' | 'running') => {
    if (type === 'running') {
      setRunningPRs({
        ...runningPRs,
        [key]: { time: editValue, date: new Date().toISOString().split('T')[0] }
      });
    } else {
      setHyroxStationPRs({
        ...hyroxStationPRs,
        [key]: { time: editValue, date: new Date().toISOString().split('T')[0] }
      });
    }
    setEditingKey(null);
    setEditingTab(null);
  };

  const startEditRace = (race: Activity) => {
    setEditingRaceId(race.id);
    setRaceForm({
      name: race.name,
      date: race.startDate.split('T')[0],
      time: formatDuration(race.movingTime),
      distance: (race.distance / 1000).toString(),
      hyroxCategory: race.hyroxData?.category || 'Solo',
      hyroxDivision: race.hyroxData?.division || 'Open',
      hyroxSubCategory: race.hyroxData?.subCategory || 'Men'
    });
    setIsAddingRace(true);
  };

  const deleteRace = (id: string) => {
    if (window.confirm('Verwijderen?')) {
      onUpdateActivities(activities.filter(a => a.id !== id));
    }
  };

  const handleRaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let seconds = 0;
    if (raceForm.time.includes(':')) {
      const parts = raceForm.time.split(':').reverse();
      seconds = parseInt(parts[0]) + (parts[1] ? parseInt(parts[1]) * 60 : 0) + (parts[2] ? parseInt(parts[2]) * 3600 : 0);
    } else {
      seconds = parseInt(raceForm.time) * 60;
    }
    const hyroxDataObj = activeTab === 'hyrox' ? {
      parts: [],
      category: raceForm.hyroxCategory,
      division: raceForm.hyroxDivision,
      subCategory: raceForm.hyroxCategory === 'Duo' ? raceForm.hyroxSubCategory : undefined
    } : undefined;

    if (editingRaceId) {
      onUpdateActivities(activities.map(a => a.id === editingRaceId ? {
        ...a,
        name: raceForm.name,
        startDate: new Date(raceForm.date).toISOString(),
        movingTime: seconds,
        distance: parseFloat(raceForm.distance) * 1000 || a.distance,
        hyroxData: hyroxDataObj ? { ...a.hyroxData, ...hyroxDataObj } : a.hyroxData
      } : a));
    } else {
      const manualRace: Activity = {
        id: Math.random().toString(36).substr(2, 9),
        name: raceForm.name,
        type: activeTab === 'hyrox' ? ActivityType.OTHER : ActivityType.RUN,
        distance: activeTab === 'hyrox' ? 8000 : (parseFloat(raceForm.distance) * 1000 || 0),
        movingTime: seconds,
        startDate: new Date(raceForm.date).toISOString(),
        labels: [activeTab === 'hyrox' ? DEFAULT_LABELS[4] : DEFAULT_LABELS[0]],
        laps: [],
        isRace: true,
        hyroxData: hyroxDataObj
      };
      onUpdateActivities([manualRace, ...activities]);
    }
    setIsAddingRace(false);
    setEditingRaceId(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-primary-text">Benchmarks</h2>
          <p className="text-secondary-text uppercase font-black text-[10px] tracking-widest mt-1">Status check. Verleg je grenzen.</p>
        </div>
        <div className="flex bg-charcoal p-1 rounded-2xl border border-dark-border">
          <button 
            onClick={() => setActiveTab('hyrox')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'hyrox' ? 'bg-primary-text text-charcoal shadow-lg' : 'text-secondary-text'}`}
          >
            Hyrox
          </button>
          <button 
            onClick={() => setActiveTab('running')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'running' ? 'bg-primary-text text-charcoal shadow-lg' : 'text-secondary-text'}`}
          >
            Hardlopen
          </button>
        </div>
      </header>

      {activeTab === 'hyrox' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top duration-500">
          <PRSummaryCard 
            icon={<User className="text-electric-blue" />} 
            title="Snelste Solo Finish" 
            activity={calculatedStats.soloPR} 
            color="bg-charcoal border-dark-border"
          />
          <PRSummaryCard 
            icon={<Users className="text-primary-text" />} 
            title="Snelste Duo Finish" 
            activity={calculatedStats.duoPR} 
            color="bg-charcoal border-dark-border"
          />
        </div>
      )}

      <section className="space-y-8">
        <h3 className="font-black uppercase text-xs tracking-widest text-secondary-text flex items-center gap-2">
          <Zap size={14} className="text-electric-blue" /> 
          Records
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(activeTab === 'hyrox' ? HYROX_STATIONS : Object.keys(runningPRs)).map(key => {
            const pr = activeTab === 'hyrox' ? hyroxStationPRs[key] : runningPRs[key];
            const isEditing = editingKey === key && editingTab === activeTab;
            return (
              <div key={key} className={`p-6 rounded-[2rem] border bg-charcoal shadow-xl transition-all relative min-h-[130px] ${isEditing ? 'border-electric-blue' : 'border-dark-border hover:border-secondary-text/50'}`}>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[9px] font-black text-secondary-text uppercase tracking-widest">{key}</p>
                  {!isEditing && (
                    <button 
                      onClick={() => { setEditingKey(key); setEditingTab(activeTab); setEditValue(pr.time); }}
                      className="p-2 bg-charcoal border border-dark-border text-secondary-text hover:text-primary-text transition-all"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      autoFocus
                      className="w-full bg-charcoal border border-dark-border rounded-xl px-3 py-2 text-sm font-black text-electric-blue outline-none"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                    />
                    <button onClick={() => savePR(key, activeTab)} className="p-2 bg-electric-blue text-white rounded-xl"><Check size={14}/></button>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl font-black italic tracking-tighter text-primary-text font-mono">
                      {pr.time !== '00:00:00' ? pr.time : '--:--:--'}
                    </p>
                    {pr.date && <p className="text-[8px] text-secondary-text uppercase font-black mt-2 tracking-widest italic">{new Date(pr.date).toLocaleDateString('nl-NL')}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-charcoal rounded-[2.5rem] border border-dark-border p-8 space-y-8 shadow-2xl">
        <div className="flex justify-between items-center">
          <h3 className="font-black uppercase text-xs tracking-widest text-secondary-text flex items-center gap-2">
            <Trophy size={16} className="text-electric-blue" /> 
            Race Historie
          </h3>
          <button 
            onClick={() => setIsAddingRace(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest bg-primary-text text-charcoal hover:bg-electric-blue hover:text-white transition-all"
          >
            <Plus size={16} /> Race Loggen
          </button>
        </div>

        <div className="space-y-4">
          {(activeTab === 'hyrox' ? hyroxRaces : runningRaces).map(race => (
            <div key={race.id} className="flex items-center justify-between p-6 bg-dark-border/10 rounded-3xl border border-dark-border group hover:border-electric-blue transition-all">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black italic bg-dark-border text-primary-text border border-dark-border/50">
                  {activeTab === 'hyrox' ? (race.hyroxData?.category === 'Duo' ? 'D' : 'S') : 'R'}
                </div>
                <div>
                  <p className="font-black uppercase italic tracking-tighter text-lg text-primary-text">{race.name}</p>
                  <div className="flex items-center gap-3 text-[9px] text-secondary-text font-black uppercase tracking-widest mt-1">
                    <Calendar size={10} /> {new Date(race.startDate).toLocaleDateString('nl-NL')}
                    <span>•</span>
                    {(race.distance / 1000).toFixed(1)} KM
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="font-black text-2xl italic tracking-tighter text-primary-text font-mono">{formatDuration(race.movingTime)}</p>
                  <p className="text-[9px] text-secondary-text uppercase font-black tracking-widest">Finishtijd</p>
                </div>
                <button onClick={() => deleteRace(race.id)} className="p-3 text-dark-border hover:text-red-500 transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const PRSummaryCard = ({ icon, title, activity, color }: any) => (
  <div className={`p-8 rounded-[2.5rem] border shadow-2xl flex items-center gap-8 ${color}`}>
    <div className="p-5 bg-dark-border/20 rounded-3xl border border-dark-border">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest mb-1">{title}</p>
      <p className="text-4xl font-black italic tracking-tighter font-mono text-primary-text">{activity ? formatDuration(activity.movingTime) : '--:--:--'}</p>
      {activity && (
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[9px] font-black bg-electric-blue text-white px-2 py-0.5 rounded-full uppercase">{activity.hyroxData?.division}</span>
          <span className="text-[10px] font-black text-secondary-text uppercase tracking-widest">{new Date(activity.startDate).toLocaleDateString('nl-NL')}</span>
        </div>
      )}
    </div>
  </div>
);

export default BenchmarksView;
