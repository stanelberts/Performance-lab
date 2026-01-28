
import React, { useState, useEffect } from 'react';
import { Activity, DashboardStats, Label } from '../types';
import { formatDuration, formatPace } from '../utils/analysis';
import { CheckCircle2, Circle, Clock, Flame, TrendingUp, Trophy, Timer, Edit2, X, Check, RefreshCw, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface Props {
  stats: DashboardStats;
  recentActivities: Activity[];
  onSelectActivity: (id: string) => void;
  onQuickLabel: (id: string, labels: Label[]) => void;
  availableLabels: Label[];
  mainGoal: string;
  setMainGoal: (goal: string) => void;
  nextRace: { name: string, date: string };
  setNextRace: (race: { name: string, date: string }) => void;
  onSync: () => void;
  isSyncing: boolean;
}

const Dashboard: React.FC<Props> = ({ 
  stats, 
  recentActivities, 
  onSelectActivity, 
  onQuickLabel, 
  availableLabels, 
  mainGoal, 
  setMainGoal,
  nextRace,
  setNextRace,
  onSync,
  isSyncing
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(mainGoal);
  const [tempRaceName, setTempRaceName] = useState(nextRace.name);
  const [tempRaceDate, setTempRaceDate] = useState(nextRace.date.split('T')[0]);

  const chartData = [
    { name: 'Z2', val: stats.z2Minutes, goal: stats.z2Goal, color: '#10B981' },
    { name: 'Thres', val: stats.thresholdCount * 45, goal: stats.thresholdGoal * 45, color: '#F59E0B' },
    { name: 'VO2', val: stats.vo2Count * 30, goal: stats.vo2Goal * 30, color: '#EF4444' },
    { name: 'Kracht', val: stats.strengthCount * 60, goal: stats.strengthGoal * 60, color: '#6B7280' },
  ];

  const handleSaveGoal = () => {
    setMainGoal(tempGoal);
    setNextRace({ name: tempRaceName, date: new Date(tempRaceDate).toISOString() });
    setIsEditingGoal(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-end border-b border-dark-border pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-primary-text">Hallo Stan! 👋</h2>
          <p className="text-secondary-text mt-2 font-bold uppercase text-xs tracking-widest">Breid je limieten uit.</p>
        </div>
        <button 
          onClick={onSync}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all border ${isSyncing ? 'bg-dark-border/50 text-secondary-text border-dark-border' : 'bg-primary-text text-charcoal hover:bg-electric-blue hover:text-white shadow-lg'}`}
        >
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync Strava'}
        </button>
      </header>

      {/* Motivational Goal Card */}
      <section className="bg-charcoal border border-dark-border rounded-[2rem] p-10 text-primary-text shadow-2xl relative overflow-hidden group blue-glow">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Zap size={250} className="fill-electric-blue" />
        </div>
        
        <button 
          onClick={() => {
            setTempGoal(mainGoal);
            setTempRaceName(nextRace.name);
            setTempRaceDate(nextRace.date.split('T')[0]);
            setIsEditingGoal(!isEditingGoal);
          }}
          className="absolute top-6 right-6 p-3 bg-dark-border hover:bg-electric-blue rounded-full transition-colors z-20"
        >
          {isEditingGoal ? <X size={20} /> : <Edit2 size={20} />}
        </button>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          {isEditingGoal ? (
            <div className="flex-1 space-y-6 animate-in fade-in zoom-in duration-200">
               <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Aanpassen Missie</label>
                <textarea 
                  className="w-full bg-charcoal border border-dark-border rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-electric-blue text-xl font-bold text-primary-text"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Naam Race</label>
                  <input 
                    type="text" 
                    className="w-full bg-charcoal border border-dark-border rounded-xl px-3 py-3 outline-none text-sm font-bold"
                    value={tempRaceName}
                    onChange={(e) => setTempRaceName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Datum</label>
                  <input 
                    type="date" 
                    className="w-full bg-charcoal border border-dark-border rounded-xl px-3 py-3 outline-none text-sm font-bold"
                    value={tempRaceDate}
                    onChange={(e) => setTempRaceDate(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={handleSaveGoal}
                className="bg-electric-blue text-white px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-electric-blue/20"
              >
                <Check size={18} /> Opslaan
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-2">
                  <span className="bg-electric-blue text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Huidige Missie</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none uppercase">
                  "{mainGoal}"
                </h3>
              </div>

              <div className="bg-dark-border/20 backdrop-blur-sm p-8 rounded-[2rem] border border-dark-border flex flex-col items-center min-w-[240px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary-text mb-6 flex items-center gap-2">
                  <Timer size={14} className="text-electric-blue" /> Volgende Race
                </p>
                <h4 className="font-black text-center mb-6 text-xl italic uppercase">{nextRace.name}</h4>
                <Countdown date={nextRace.date} />
              </div>
            </>
          )}
        </div>
      </section>

      {/* Weekdoelen Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GoalCard 
          title="Z2 Duur" 
          value={stats.z2Minutes} 
          goal={stats.z2Goal} 
          unit="min" 
          icon={<Clock className="text-electric-blue" />} 
          color="bg-electric-blue"
        />
        <GoalCard 
          title="Threshold" 
          value={stats.thresholdCount} 
          goal={stats.thresholdGoal} 
          unit="sessie" 
          icon={<Flame className="text-primary-text" />} 
          color="bg-secondary-text"
        />
        <GoalCard 
          title="VO2 Max" 
          value={stats.vo2Count} 
          goal={stats.vo2Goal} 
          unit="sessie" 
          icon={<TrendingUp className="text-primary-text" />} 
          color="bg-primary-text"
        />
        <GoalCard 
          title="Kracht" 
          value={stats.strengthCount} 
          goal={stats.strengthGoal} 
          unit="sessie" 
          icon={<CheckCircle2 className="text-electric-blue" />} 
          color="bg-electric-blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 bg-charcoal p-8 rounded-[2rem] border border-dark-border">
          <h3 className="text-xs font-black uppercase tracking-widest text-secondary-text mb-8">Trainingsload (min)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#B0B0B0', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  cursor={{ fill: '#444444' }}
                  contentStyle={{ backgroundColor: '#121212', borderRadius: '12px', border: '1px solid #444444' }}
                />
                <Bar dataKey="val" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-charcoal p-8 rounded-[2rem] border border-dark-border">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-secondary-text">Recente Sessies</h3>
          </div>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div 
                key={activity.id} 
                onClick={() => onSelectActivity(activity.id)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-dark-border/10 hover:bg-dark-border/20 transition-all cursor-pointer border border-dark-border/50 hover:border-electric-blue"
              >
                <div className="p-3 rounded-xl bg-dark-border">
                  <ActivityIconByType type={activity.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm uppercase italic tracking-tighter truncate text-primary-text">{activity.name}</p>
                  <p className="text-[10px] font-bold text-secondary-text uppercase">{new Date(activity.startDate).toLocaleDateString('nl-NL')}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {activity.labels.map(l => (
                    <span key={l.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} title={l.name} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Countdown = ({ date }: { date: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number }>({ d: 0, h: 0, m: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(date).getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ d: 0, h: 0, m: 0 });
      } else {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);

  return (
    <div className="flex gap-6">
      <TimeBox value={timeLeft.d} unit="Dgn" />
      <TimeBox value={timeLeft.h} unit="Uur" />
      <TimeBox value={timeLeft.m} unit="Min" />
    </div>
  );
};

const TimeBox = ({ value, unit }: { value: number, unit: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-3xl font-black italic tracking-tighter text-primary-text">{value.toString().padStart(2, '0')}</span>
    <span className="text-[9px] font-black uppercase text-secondary-text tracking-widest">{unit}</span>
  </div>
);

const GoalCard = ({ title, value, goal, unit, icon, color }: any) => {
  const percent = Math.min(100, (value / goal) * 100);
  return (
    <div className="bg-charcoal p-8 rounded-[2rem] border border-dark-border space-y-6 shadow-xl">
      <div className="flex justify-between items-center">
        <div className="p-2 bg-dark-border/30 rounded-xl border border-dark-border">{icon}</div>
        <span className="text-3xl font-black italic tracking-tighter text-primary-text">{value}<span className="text-sm font-bold text-secondary-text">/{goal}</span></span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-secondary-text mb-3">{title}</p>
        <div className="h-1.5 w-full bg-dark-border/50 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-1000`} 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const ActivityIconByType = ({ type }: { type: string }) => {
  switch (type) {
    case 'Run': return <Flame size={18} className="text-primary-text" />;
    case 'Ride': return <TrendingUp size={18} className="text-electric-blue" />;
    case 'WeightTraining': return <CheckCircle2 size={18} className="text-primary-text" />;
    default: return <Circle size={18} className="text-secondary-text" />;
  }
};

export default Dashboard;
