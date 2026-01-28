
import React, { useMemo, useState } from 'react';
import { Activity, Label, HyroxPart } from '../types';
import { ArrowLeft, Calendar, Tag, TrendingDown, TrendingUp, Zap, History, Trophy, Medal, Sparkles, Loader2 } from 'lucide-react';
import { formatDuration, formatPace, getComparison, getEfficiencyFactor } from '../utils/analysis';
import { ActivityIconByType } from './Dashboard';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { analyzeWorkout } from '../services/ai';

interface Props {
  activity: Activity;
  allActivities: Activity[];
  onBack: () => void;
  onUpdateLabels: (labels: Label[]) => void;
  availableLabels: Label[];
}

const ActivityDetailView: React.FC<Props> = ({ activity, allActivities, onBack, onUpdateLabels, availableLabels }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentLabels = activity.labels.map(l => l.name);
  
  const history = useMemo(() => {
    if (currentLabels.length === 0) return [];
    return allActivities
      .filter(a => a.labels.some(l => currentLabels.includes(l.name)))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [activity, allActivities]);

  const previousActivity = useMemo(() => {
    const sortedHistory = [...history].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    return sortedHistory.find(a => a.id !== activity.id && new Date(a.startDate) < new Date(activity.startDate));
  }, [history, activity]);

  const trendData = useMemo(() => {
    return history.map(a => ({
      date: new Date(a.startDate).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' }),
      pace: parseFloat((16.6667 / (a.distance / a.movingTime)).toFixed(2)),
      hr: a.avgHr,
      efficiency: getEfficiencyFactor(a) ? parseFloat((getEfficiencyFactor(a)! * 100).toFixed(2)) : null,
      isCurrent: a.id === activity.id
    })).slice(-10);
  }, [history, activity]);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeWorkout(activity);
    setAiAnalysis(result || "Geen analyse beschikbaar.");
    setIsAnalyzing(false);
  };

  const toggleLabel = (label: Label) => {
    const hasLabel = activity.labels.some(l => l.id === label.id);
    if (hasLabel) {
      onUpdateLabels(activity.labels.filter(l => l.id !== label.id));
    } else {
      onUpdateLabels([...activity.labels, label]);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal pb-20 animate-in slide-in-from-right duration-300">
      <div className="bg-charcoal/90 backdrop-blur-md border-b border-dark-border sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-dark-border rounded-full transition-colors text-primary-text">
          <ArrowLeft size={24} />
        </button>
        <h3 className="font-black uppercase italic tracking-tighter text-lg text-primary-text truncate max-w-[200px]">{activity.name}</h3>
        <div className="w-10" />
      </div>

      <div className="p-4 space-y-8 max-w-4xl mx-auto mt-6">
        {/* Metric Header */}
        <div className="bg-charcoal p-8 rounded-[2rem] border border-dark-border shadow-2xl space-y-6 relative overflow-hidden blue-glow">
          {activity.isRace && (
            <div className="absolute top-6 right-6 bg-electric-blue text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
              <Medal size={14} /> RACE MODE
            </div>
          )}
          <div className="flex items-center gap-6">
            <div className="p-5 bg-dark-border/20 rounded-2xl border border-dark-border">
              <ActivityIconByType type={activity.type} />
            </div>
            <div>
              <p className="text-[10px] text-secondary-text flex items-center gap-2 uppercase font-black tracking-widest mb-1">
                <Calendar size={12} className="text-electric-blue" /> {new Date(activity.startDate).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase text-primary-text">{activity.name}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Metric title="Afstand" value={`${(activity.distance / 1000).toFixed(2)} km`} />
            <Metric title="Totale Tijd" value={formatDuration(activity.movingTime)} />
            <Metric title="Gem. Tempo" value={`${formatPace(activity.distance / activity.movingTime)} /km`} />
            <Metric title="Efficiëntie" value={getEfficiencyFactor(activity) ? (getEfficiencyFactor(activity)! * 100).toFixed(1) : '--'} />
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="bg-charcoal p-8 rounded-[2rem] border border-dark-border shadow-2xl space-y-6 relative overflow-hidden border-electric-blue/30">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary-text flex items-center gap-2">
              <Sparkles size={18} className="text-electric-blue" /> AI Performance Coach
            </h3>
            {!aiAnalysis && (
              <button 
                onClick={handleAiAnalysis}
                disabled={isAnalyzing}
                className="bg-electric-blue text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
              >
                {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                Analyseer Sessie
              </button>
            )}
          </div>
          
          {aiAnalysis ? (
            <div className="text-sm text-secondary-text leading-relaxed font-medium animate-in fade-in slide-in-from-top-4 duration-500 whitespace-pre-wrap">
              {aiAnalysis}
            </div>
          ) : (
            <p className="text-[10px] text-secondary-text uppercase font-bold tracking-widest italic opacity-50">
              {isAnalyzing ? "Coach analyseert de data..." : "Klik op de knop voor een diepe duik in je data."}
            </p>
          )}
        </div>

        {/* Hyrox Specific Display */}
        {activity.hyroxData && (
          <HyroxDisplay 
            currentData={activity.hyroxData} 
            previousData={previousActivity?.hyroxData} 
          />
        )}

        {/* Trend Graph Section */}
        {trendData.length > 1 && (
          <div className="bg-charcoal p-8 rounded-[2rem] border border-dark-border space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-secondary-text flex items-center gap-2"><History size={18} className="text-electric-blue"/> Trend (Laatste 10)</h3>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444444" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#B0B0B0', fontSize: 10, fontWeight: 800}} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', borderRadius: '12px', border: '1px solid #444444', color: '#E0E0E0' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pace" 
                    stroke="#4D7CFF" 
                    strokeWidth={4} 
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      return payload.isCurrent ? <circle cx={cx} cy={cy} r={6} fill="#4D7CFF" stroke="#121212" strokeWidth={3} /> : <circle cx={cx} cy={cy} r={3} fill="#444444" />;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Labels */}
            <div className="bg-charcoal p-8 rounded-[2rem] border border-dark-border shadow-xl h-full">
              <h3 className="text-xs font-black uppercase tracking-widest text-secondary-text flex items-center gap-2 mb-6"><Tag size={18} className="text-electric-blue" /> Labels</h3>
              <div className="flex flex-wrap gap-2">
                {availableLabels.map(l => {
                  const active = activity.labels.some(al => al.id === l.id);
                  return (
                    <button 
                      key={l.id}
                      onClick={() => toggleLabel(l)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${active ? 'bg-electric-blue text-white border-electric-blue shadow-lg' : 'bg-dark-border/20 text-secondary-text border-dark-border hover:border-secondary-text'}`}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Laps */}
            {activity.laps.length > 0 && (
              <div className="bg-charcoal p-8 rounded-[2rem] border border-dark-border shadow-xl space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-secondary-text flex items-center gap-2"><Zap size={18} className="text-electric-blue" /> Ronde Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-black uppercase tracking-widest">
                    <thead>
                      <tr className="text-secondary-text border-b border-dark-border">
                        <th className="pb-3 text-left">#</th>
                        <th className="pb-3 text-left">Km</th>
                        <th className="pb-3 text-left">Tijd</th>
                        <th className="pb-3 text-right">Pace</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/50">
                      {activity.laps.map(lap => (
                        <tr key={lap.lapNumber} className="hover:bg-dark-border/10">
                          <td className="py-3 text-primary-text font-black italic">{lap.lapNumber}</td>
                          <td className="py-3 text-secondary-text">{(lap.distance / 1000).toFixed(1)}</td>
                          <td className="py-3 text-primary-text">{formatDuration(lap.time)}</td>
                          <td className="py-3 text-right font-mono text-electric-blue">{formatPace(lap.distance / lap.time)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

const Metric = ({ title, value }: { title: string, value: string }) => (
  <div className="p-4 bg-dark-border/20 rounded-[1.5rem] border border-dark-border/30">
    <p className="text-[9px] text-secondary-text uppercase font-black tracking-[0.2em] mb-1">{title}</p>
    <p className="text-xl font-black italic tracking-tighter text-primary-text">{value}</p>
  </div>
);

const HyroxDisplay = ({ currentData, previousData }: { currentData: any, previousData?: any }) => (
  <div className="bg-charcoal p-8 rounded-[2rem] border border-dark-border shadow-2xl space-y-8">
    <div className="flex justify-between items-center">
      <h3 className="text-xs font-black uppercase tracking-widest text-secondary-text flex items-center gap-2"><Trophy size={18} className="text-electric-blue" /> Hyrox Stations</h3>
      {currentData.totalScore && <span className="bg-electric-blue/10 text-electric-blue border border-electric-blue px-4 py-1 rounded-full font-black text-[10px] tracking-widest">SCORE: {currentData.totalScore}</span>}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {currentData.parts.map((part: HyroxPart, i: number) => {
        const prevPart = previousData?.parts.find((p: any) => p.name === part.name);
        const timeDiff = prevPart && part.time && prevPart.time ? part.time - prevPart.time : null;
        
        return (
          <div key={i} className="p-5 bg-dark-border/10 rounded-[2rem] border border-dark-border hover:border-secondary-text/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className="font-black italic tracking-tighter text-primary-text text-sm uppercase">{part.name}</span>
              {timeDiff !== null && (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${timeDiff <= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {timeDiff > 0 ? '+' : ''}{timeDiff}s
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <span className="text-[8px] text-secondary-text font-black uppercase tracking-widest mb-1">Tijd</span>
                <span className="font-mono font-black text-sm text-primary-text">{part.time ? formatDuration(part.time) : '--'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-secondary-text font-black uppercase tracking-widest mb-1">Gewicht</span>
                <span className="font-black text-sm text-primary-text">{part.weight || 0}<span className="text-[10px] font-medium ml-1">kg</span></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-secondary-text font-black uppercase tracking-widest mb-1">{part.name === 'Wall Balls' ? 'Reps' : 'Afstand'}</span>
                <span className="font-black text-sm text-primary-text">{part.name === 'Wall Balls' ? part.reps : `${part.distance}m`}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default ActivityDetailView;
