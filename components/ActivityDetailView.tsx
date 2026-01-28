
import React, { useMemo } from 'react';
import { Activity, Label, HyroxPart } from '../types';
import { ArrowLeft, Calendar, Tag, TrendingDown, TrendingUp, Zap, History, Trophy, Medal } from 'lucide-react';
import { formatDuration, formatPace, getComparison, getEfficiencyFactor } from '../utils/analysis';
import { ActivityIconByType } from './Dashboard';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line, CartesianGrid } from 'recharts';

interface Props {
  activity: Activity;
  allActivities: Activity[];
  onBack: () => void;
  onUpdateLabels: (labels: Label[]) => void;
  availableLabels: Label[];
}

const ActivityDetailView: React.FC<Props> = ({ activity, allActivities, onBack, onUpdateLabels, availableLabels }) => {
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

  const comparison = getComparison(activity, previousActivity);

  const trendData = useMemo(() => {
    return history.map(a => ({
      date: new Date(a.startDate).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' }),
      pace: parseFloat((16.6667 / (a.distance / a.movingTime)).toFixed(2)),
      hr: a.avgHr,
      efficiency: getEfficiencyFactor(a) ? parseFloat((getEfficiencyFactor(a)! * 100).toFixed(2)) : null,
      isCurrent: a.id === activity.id
    })).slice(-10);
  }, [history, activity]);

  const toggleLabel = (label: Label) => {
    const hasLabel = activity.labels.some(l => l.id === label.id);
    if (hasLabel) {
      onUpdateLabels(activity.labels.filter(l => l.id !== label.id));
    } else {
      onUpdateLabels([...activity.labels, label]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-in slide-in-from-right duration-300">
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h3 className="font-bold truncate max-w-[200px]">{activity.name}</h3>
        <div className="w-10" />
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Metric Header */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4 relative overflow-hidden">
          {activity.isRace && (
            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
              <Medal size={12} /> RACE
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <ActivityIconByType type={activity.type} />
            </div>
            <div>
              <p className="text-xs text-gray-400 flex items-center gap-1 uppercase font-bold tracking-widest">
                <Calendar size={12} /> {new Date(activity.startDate).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h2 className="text-xl font-bold">{activity.name}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Metric title="Afstand" value={`${(activity.distance / 1000).toFixed(2)} km`} />
            <Metric title="Totale Tijd" value={formatDuration(activity.movingTime)} />
            <Metric title="Gem. Tempo" value={`${formatPace(activity.distance / activity.movingTime)} /km`} />
            <Metric title="Efficiëntie" value={getEfficiencyFactor(activity) ? (getEfficiencyFactor(activity)! * 100).toFixed(1) : '--'} />
          </div>
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
          <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><History size={18}/> Trend (Laatste 10)</h3>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Tempo in min/km</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pace" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      return payload.isCurrent ? <circle cx={cx} cy={cy} r={6} fill="#3B82F6" stroke="white" strokeWidth={2} /> : <circle cx={cx} cy={cy} r={3} fill="#3B82F6" />;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Labels */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border">
          <h3 className="font-bold flex items-center gap-2 mb-4"><Tag size={18}/> Labels</h3>
          <div className="flex flex-wrap gap-2">
            {availableLabels.map(l => {
              const active = activity.labels.some(al => al.id === l.id);
              return (
                <button 
                  key={l.id}
                  onClick={() => toggleLabel(l)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'}`}
                >
                  {l.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Laps */}
        {activity.laps.length > 0 && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Zap size={18}/> Ronde Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b">
                    <th className="pb-2 text-left">#</th>
                    <th className="pb-2 text-left">Km</th>
                    <th className="pb-2 text-left">Tijd</th>
                    <th className="pb-2 text-right">Pace</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activity.laps.map(lap => (
                    <tr key={lap.lapNumber} className="hover:bg-gray-50">
                      <td className="py-2 font-bold">{lap.lapNumber}</td>
                      <td className="py-2">{(lap.distance / 1000).toFixed(1)}</td>
                      <td className="py-2">{formatDuration(lap.time)}</td>
                      <td className="py-2 text-right font-mono">{formatPace(lap.distance / lap.time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Metric = ({ title, value }: { title: string, value: string }) => (
  <div className="p-3 bg-gray-50 rounded-2xl">
    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{title}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

const HyroxDisplay = ({ currentData, previousData }: { currentData: any, previousData?: any }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="font-bold text-purple-600 flex items-center gap-2"><Trophy size={18} /> Hyrox Stations</h3>
      {currentData.totalScore && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-black text-sm">SCORE: {currentData.totalScore}</span>}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {currentData.parts.map((part: HyroxPart, i: number) => {
        const prevPart = previousData?.parts.find((p: any) => p.name === part.name);
        const timeDiff = prevPart && part.time && prevPart.time ? part.time - prevPart.time : null;
        
        return (
          <div key={i} className="p-4 bg-purple-50 rounded-3xl border border-purple-100 space-y-2 group transition-all hover:bg-purple-100/50">
            <div className="flex justify-between items-start">
              <span className="font-black text-purple-900 text-sm uppercase tracking-tight">{part.name}</span>
              {timeDiff !== null && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${timeDiff <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {timeDiff > 0 ? '+' : ''}{timeDiff}s
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <span className="text-[8px] text-purple-400 font-bold uppercase">Tijd</span>
                <span className="font-mono font-bold text-sm">{part.time ? formatDuration(part.time) : '--'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-purple-400 font-bold uppercase">Gewicht</span>
                <span className="font-bold text-sm flex items-center gap-1">{part.weight || 0}<span className="text-[10px] font-normal">kg</span></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-purple-400 font-bold uppercase">{part.name === 'Wall Balls' ? 'Reps' : 'Afstand'}</span>
                <span className="font-bold text-sm">{part.name === 'Wall Balls' ? part.reps : `${part.distance}m`}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default ActivityDetailView;
