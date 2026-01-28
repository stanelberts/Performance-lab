
import React, { useState, useMemo } from 'react';
import { Activity, Label } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar, Cell } from 'recharts';
import { formatPace, getEfficiencyFactor, formatDuration } from '../utils/analysis';
import { TrendingUp, Activity as ActivityIcon, Zap, Trophy, Medal } from 'lucide-react';

interface Props {
  activities: Activity[];
  availableLabels: Label[];
}

const TrendsView: React.FC<Props> = ({ activities, availableLabels }) => {
  const [activeSubTab, setActiveSubTab] = useState<'trends' | 'races'>('trends');
  const [selectedLabelId, setSelectedLabelId] = useState<string>(availableLabels[0]?.id || '');

  const labelData = useMemo(() => {
    const label = availableLabels.find(l => l.id === selectedLabelId);
    if (!label) return [];

    return activities
      .filter(a => a.labels.some(l => l.id === selectedLabelId))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map(a => ({
        name: new Date(a.startDate).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' }),
        pace: parseFloat((16.6667 / (a.distance / a.movingTime)).toFixed(2)),
        hr: a.avgHr,
        efficiency: getEfficiencyFactor(a) ? parseFloat((getEfficiencyFactor(a)! * 100).toFixed(2)) : null,
      }));
  }, [activities, selectedLabelId, availableLabels]);

  const raceHistory = useMemo(() => {
    return activities
      .filter(a => a.labels.some(l => l.name === 'Hyrox'))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map(a => ({
        name: a.name,
        date: new Date(a.startDate).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' }),
        time: a.movingTime / 60,
        isRace: a.isRace,
        id: a.id
      }));
  }, [activities]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Analyse</h2>
          <p className="text-gray-500">Inzicht in je progressie en race-historie.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveSubTab('trends')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'trends' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            Algemene Trends
          </button>
          <button 
            onClick={() => setActiveSubTab('races')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'races' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
          >
            Wedstrijden
          </button>
        </div>
      </header>

      {activeSubTab === 'trends' ? (
        <div className="space-y-8">
          <div className="flex justify-end">
             <select 
              value={selectedLabelId} 
              onChange={(e) => setSelectedLabelId(e.target.value)}
              className="bg-white border rounded-xl px-4 py-2 font-bold text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableLabels.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {labelData.length > 1 ? (
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white p-6 rounded-3xl border shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="text-blue-600" /> Tempo Trend (min/km)
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={labelData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="pace" stroke="#3B82F6" strokeWidth={4} dot={{ r: 4, fill: '#3B82F6' }} name="Tempo" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <ActivityIcon className="text-red-500" /> Gem. Hartslag
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={labelData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="hr" stroke="#EF4444" strokeWidth={3} dot={{ r: 3, fill: '#EF4444' }} name="Hartslag" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Zap className="text-yellow-500" /> Efficiëntie Factor
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={labelData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="efficiency" stroke="#F59E0B" strokeWidth={3} dot={{ r: 3, fill: '#F59E0B' }} name="Efficiëntie" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border shadow-sm text-center">
              <TrendingUp size={48} className="mx-auto text-gray-200 mb-4" />
              <h3 className="font-bold text-gray-400">Nog niet genoeg data</h3>
              <p className="text-sm text-gray-400">Label minimaal 2 sessies om trends te zien.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="text-yellow-500" /> Hyrox Race Vergelijking
            </h3>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={raceHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis label={{ value: 'Minuten', angle: -90, position: 'insideLeft' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value.toFixed(1)} min`, 'Totale Tijd']}
                  />
                  <Bar dataKey="time" radius={[8, 8, 0, 0]}>
                    {raceHistory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isRace ? '#A855F7' : '#D8B4FE'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded-full" /> Officiële Race</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-200 rounded-full" /> Simulatie</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Medal size={18} className="text-purple-600"/> Race Historie</h3>
            <div className="space-y-3">
              {[...raceHistory].reverse().map((race) => (
                <div key={race.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${race.isRace ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-500'}`}>
                      <Medal size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{race.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black">{race.date} {race.isRace && '• RACE'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">{formatDuration(race.time * 60)}</p>
                    <p className="text-[10px] text-gray-400">FINISHTIJD</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendsView;
