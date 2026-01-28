
import React, { useState, useMemo } from 'react';
import { Activity, Label } from '../types';
import { Search, Filter, CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { formatPace, formatDuration } from '../utils/analysis';
import { ActivityIconByType } from './Dashboard';

interface Props {
  activities: Activity[];
  onSelectActivity: (id: string) => void;
  onBulkLabel: (ids: string[], label: Label) => void;
  availableLabels: Label[];
}

const ActivityList: React.FC<Props> = ({ activities, onSelectActivity, onBulkLabel, availableLabels }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unlabeled'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return activities.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'unlabeled' ? a.labels.length === 0 : true;
      return matchesSearch && matchesFilter;
    });
  }, [activities, search, filter]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-charcoal p-6 rounded-[2rem] border border-dark-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" size={18} />
          <input 
            type="text" 
            placeholder="Zoek activiteit..." 
            className="w-full pl-12 pr-4 py-3 bg-dark-border/20 border border-dark-border rounded-2xl focus:ring-2 focus:ring-electric-blue outline-none text-primary-text font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-electric-blue text-white' : 'bg-dark-border/30 text-secondary-text border border-dark-border'}`}
          >
            Allemaal
          </button>
          <button 
            onClick={() => setFilter('unlabeled')}
            className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'unlabeled' ? 'bg-electric-blue text-white' : 'bg-dark-border/30 text-secondary-text border border-dark-border'}`}
          >
            Nog labelen
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-10 bg-electric-blue text-white p-5 rounded-3xl shadow-2xl flex items-center justify-between animate-in slide-in-from-top duration-300">
          <span className="font-black uppercase tracking-widest text-sm">{selectedIds.length} geselecteerd</span>
          <div className="flex gap-4">
            <select 
              className="bg-black/20 border border-white/20 text-white text-xs font-bold rounded-xl px-3 py-1 outline-none"
              onChange={(e) => {
                const label = availableLabels.find(l => l.id === e.target.value);
                if (label) {
                  onBulkLabel(selectedIds, label);
                  setSelectedIds([]);
                }
              }}
            >
              <option value="" className="bg-charcoal text-white">Selecteer Label</option>
              {availableLabels.map(l => (
                <option key={l.id} value={l.id} className="bg-charcoal text-white">{l.name}</option>
              ))}
            </select>
            <button onClick={() => setSelectedIds([])} className="text-[10px] font-black uppercase tracking-tighter hover:underline">Annuleren</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map(activity => (
          <div 
            key={activity.id}
            className={`group bg-charcoal rounded-[2rem] border transition-all hover:border-electric-blue shadow-lg ${selectedIds.includes(activity.id) ? 'border-electric-blue bg-electric-blue/5' : 'border-dark-border'}`}
          >
            <div className="flex items-center p-5">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleSelect(activity.id); }}
                className="mr-4 text-electric-blue"
              >
                {selectedIds.includes(activity.id) ? <CheckCircle size={24} fill="currentColor" className="text-electric-blue" /> : <Circle size={24} className="text-dark-border" />}
              </button>
              
              <div onClick={() => onSelectActivity(activity.id)} className="flex-1 flex items-center gap-6 cursor-pointer">
                <div className="p-4 bg-dark-border/20 rounded-2xl group-hover:bg-dark-border/40 transition-colors">
                  <ActivityIconByType type={activity.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black uppercase italic tracking-tighter text-lg text-primary-text truncate">{activity.name}</h4>
                  <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-secondary-text mt-2">
                    <span>{new Date(activity.startDate).toLocaleDateString('nl-NL')}</span>
                    <span>•</span>
                    <span>{(activity.distance / 1000).toFixed(1)} km</span>
                    <span>•</span>
                    <span>{formatDuration(activity.movingTime)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex -space-x-1.5">
                    {activity.labels.map(l => (
                      <div key={l.id} className="w-5 h-5 rounded-full border-2 border-charcoal shadow-sm" style={{ backgroundColor: l.color }} title={l.name} />
                    ))}
                  </div>
                  <ChevronRight size={20} className="text-dark-border group-hover:text-electric-blue transition-colors" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityList;
