
import React, { useState } from 'react';
import { WorkoutTemplate, Activity, ActivityType, HyroxPart } from '../types';
// Add Zap to the imports
import { Plus, Play, Calendar, Clipboard, ArrowRight, X, Trophy, Medal, Users, User, Save, Zap } from 'lucide-react';
import { formatDuration } from '../utils/analysis';
import { ActivityIconByType } from './Dashboard';
import { HYROX_STATIONS } from '../mockData';

interface Props {
  templates: WorkoutTemplate[];
  onLogActivity: (activity: Activity) => void;
}

const WorkoutsView: React.FC<Props> = ({ templates, onLogActivity }) => {
  const [manualMode, setManualMode] = useState(false);
  const [isHyroxEntry, setIsHyroxEntry] = useState(false);
  const [isRaceToggle, setIsRaceToggle] = useState(false);
  const [hyroxCategory, setHyroxCategory] = useState<'Solo' | 'Duo'>('Solo');
  const [hyroxDivision, setHyroxDivision] = useState<'Open' | 'Pro'>('Open');
  const [hyroxSubCategory, setHyroxSubCategory] = useState<'Men' | 'Women' | 'Mixed'>('Men');

  const [formData, setFormData] = useState({
    name: '',
    type: ActivityType.RUN,
    distance: '',
    duration: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [hyroxParts, setHyroxParts] = useState<HyroxPart[]>(
    HYROX_STATIONS.map(name => ({
      name,
      time: 0,
      weight: 0,
      distance: name.includes('Ski') || name.includes('Row') ? 1000 : 
                name.includes('Push') || name.includes('Pull') ? 50 : 
                name.includes('Burpee') ? 80 : 
                name.includes('Farmers') ? 200 : 
                name.includes('Lunges') ? 100 : 0,
      reps: name.includes('Wall') ? 75 : 0
    }))
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalHyroxTime = hyroxParts.reduce((acc, curr) => acc + (curr.time || 0), 0);
    
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || (isRaceToggle ? `Hyrox ${hyroxCategory} ${hyroxDivision} Race` : (isHyroxEntry ? `Hyrox Sessie` : 'Handmatige Sessie')),
      type: isHyroxEntry ? ActivityType.OTHER : formData.type,
      distance: parseFloat(formData.distance) * 1000 || (isHyroxEntry ? 8000 : 0),
      movingTime: (parseInt(formData.duration) * 60) || totalHyroxTime || 0,
      startDate: new Date(formData.date).toISOString(),
      labels: isHyroxEntry ? [{ id: 'l5', name: 'Hyrox', category: 'Hyrox', color: '#8B5CF6' }] : [],
      laps: [],
      isRace: isRaceToggle,
      hyroxData: isHyroxEntry ? { 
        parts: hyroxParts, 
        category: hyroxCategory, 
        division: hyroxDivision,
        subCategory: hyroxCategory === 'Duo' ? hyroxSubCategory : undefined
      } : undefined
    };
    onLogActivity(newActivity);
    setManualMode(false);
    setIsHyroxEntry(false);
    setIsRaceToggle(false);
    setFormData({ name: '', type: ActivityType.RUN, distance: '', duration: '', date: new Date().toISOString().split('T')[0] });
  };

  const weightIrrelevant = (name: string) => 
    name.includes('Ski') || name.includes('Row') || name.includes('Burpee');

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-dark-border pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-primary-text">Workouts</h2>
          <p className="text-secondary-text mt-2 font-bold uppercase text-xs tracking-widest">Plan je overwinning.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setIsHyroxEntry(true); setManualMode(true); }}
            className="bg-electric-blue/10 text-electric-blue px-6 py-3 border border-electric-blue rounded-full text-xs font-black uppercase tracking-widest hover:bg-electric-blue hover:text-white transition-all shadow-lg"
          >
            <Trophy size={16} className="inline mr-2" /> Hyrox Log
          </button>
          <button 
            onClick={() => { setIsHyroxEntry(false); setManualMode(true); }}
            className="bg-primary-text text-charcoal px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-electric-blue hover:text-white transition-all shadow-lg"
          >
            <Plus size={16} className="inline mr-2" /> Handmatig
          </button>
        </div>
      </header>

      <section className="space-y-6">
        <h3 className="font-black uppercase text-xs tracking-widest text-secondary-text flex items-center gap-2">
          <Clipboard size={16} /> Trainings Sjablonen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-charcoal p-8 rounded-[2rem] border border-dark-border shadow-xl hover:border-electric-blue transition-all flex flex-col justify-between group">
              <div>
                <div className="p-4 bg-dark-border/20 rounded-2xl w-fit mb-6 group-hover:bg-dark-border/40 transition-colors">
                  <ActivityIconByType type={template.type} />
                </div>
                <h4 className="font-black uppercase italic tracking-tighter text-xl text-primary-text mb-2">{template.name}</h4>
                <p className="text-sm text-secondary-text font-medium leading-relaxed mb-8">{template.description}</p>
              </div>
              <button 
                onClick={() => {
                  const newActivity: Activity = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: template.name,
                    type: template.type,
                    distance: template.targetDistance || 0,
                    movingTime: template.targetDuration || 3600,
                    startDate: new Date().toISOString(),
                    labels: template.defaultLabels,
                    laps: [],
                    templateId: template.id
                  };
                  onLogActivity(newActivity);
                }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-dark-border/30 hover:bg-electric-blue text-primary-text rounded-2xl font-black uppercase text-xs tracking-widest transition-all border border-dark-border"
              >
                <Play size={14} fill="currentColor" /> Loggen
              </button>
            </div>
          ))}
        </div>
      </section>

      {manualMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-charcoal w-full max-w-2xl rounded-[3rem] border border-dark-border shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-8">
            <div className="p-8 border-b border-dark-border flex justify-between items-center bg-dark-border/10">
              <h3 className="font-black uppercase italic tracking-tighter text-2xl text-primary-text flex items-center gap-3">
                {isHyroxEntry ? <><Trophy className="text-electric-blue" /> Hyrox Sessie</> : 'Handmatige Sessie'}
              </h3>
              <button onClick={() => { setManualMode(false); setIsHyroxEntry(false); setIsRaceToggle(false); }} className="p-3 bg-dark-border/30 hover:bg-dark-border rounded-full text-secondary-text"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleManualSubmit} className="p-10 space-y-8">
              {isHyroxEntry && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-6 bg-electric-blue/5 rounded-3xl border border-electric-blue/20">
                    <Medal className={isRaceToggle ? "text-electric-blue fill-electric-blue" : "text-dark-border"} size={28} />
                    <div className="flex-1">
                      <p className="text-sm font-black uppercase text-primary-text tracking-widest italic">Race Modus</p>
                      <p className="text-[10px] text-secondary-text uppercase font-bold tracking-widest">Sla op als officieel record</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsRaceToggle(!isRaceToggle)}
                      className={`w-14 h-7 rounded-full transition-all relative ${isRaceToggle ? 'bg-electric-blue shadow-[0_0_10px_rgba(0,0,255,0.5)]' : 'bg-dark-border'}`}
                    >
                      <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${isRaceToggle ? 'translate-x-7' : ''}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary-text uppercase tracking-[0.2em]">Categorie</label>
                      <div className="flex bg-black/40 p-1 rounded-2xl border border-dark-border">
                        <button 
                          type="button"
                          onClick={() => setHyroxCategory('Solo')}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hyroxCategory === 'Solo' ? 'bg-electric-blue text-white shadow-lg' : 'text-secondary-text'}`}
                        >
                          Solo
                        </button>
                        <button 
                          type="button"
                          onClick={() => setHyroxCategory('Duo')}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hyroxCategory === 'Duo' ? 'bg-electric-blue text-white shadow-lg' : 'text-secondary-text'}`}
                        >
                          Duo
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondary-text uppercase tracking-[0.2em]">Divisie</label>
                       <div className="flex bg-black/40 p-1 rounded-2xl border border-dark-border">
                        <button 
                          type="button"
                          onClick={() => setHyroxDivision('Open')}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hyroxDivision === 'Open' ? 'bg-electric-blue text-white shadow-lg' : 'text-secondary-text'}`}
                        >
                          Open
                        </button>
                        <button 
                          type="button"
                          onClick={() => setHyroxDivision('Pro')}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hyroxDivision === 'Pro' ? 'bg-electric-blue text-white shadow-lg' : 'text-secondary-text'}`}
                        >
                          Pro
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary-text uppercase tracking-[0.2em]">Sessie Naam</label>
                  <input 
                    type="text" 
                    placeholder={isHyroxEntry ? "Hyrox Rotterdam" : "Naam van de sessie"}
                    className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-electric-blue font-black uppercase italic tracking-tighter text-primary-text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary-text uppercase tracking-[0.2em]">Datum</label>
                  <input type="date" className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-electric-blue font-black text-primary-text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              {isHyroxEntry ? (
                <div className="space-y-6 pt-4">
                  <h4 className="font-black uppercase text-xs tracking-widest text-secondary-text flex items-center gap-2">
                    <Zap size={14} className="text-electric-blue" /> Stations Data
                  </h4>
                  <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                    {hyroxParts.map((part, index) => (
                      <div key={part.name} className="p-6 bg-black/30 rounded-[2rem] border border-dark-border flex flex-col md:flex-row items-center gap-6 group hover:border-secondary-text/30 transition-all">
                        <div className="w-full md:w-44 font-black text-[10px] text-secondary-text uppercase tracking-widest italic">{part.name}</div>
                        <div className="flex-1 grid grid-cols-2 gap-6 w-full">
                          <div className="space-y-1">
                            <span className="text-[9px] text-secondary-text/50 font-black uppercase tracking-widest">Seconden</span>
                            <input 
                              type="number" 
                              className="w-full bg-charcoal border border-dark-border rounded-xl px-4 py-3 text-lg font-black text-primary-text outline-none focus:ring-2 focus:ring-electric-blue font-mono" 
                              value={part.time || ''} 
                              onChange={e => {
                                const newParts = [...hyroxParts];
                                newParts[index].time = parseInt(e.target.value) || 0;
                                setHyroxParts(newParts);
                              }}
                            />
                          </div>
                           <div className="space-y-1">
                            {!weightIrrelevant(part.name) ? (
                              <>
                                <span className="text-[9px] text-secondary-text/50 font-black uppercase tracking-widest">KG</span>
                                <input 
                                  type="number" 
                                  className="w-full bg-charcoal border border-dark-border rounded-xl px-4 py-3 text-lg font-black text-primary-text outline-none focus:ring-2 focus:ring-electric-blue" 
                                  value={part.weight || ''} 
                                  onChange={e => {
                                    const newParts = [...hyroxParts];
                                    newParts[index].weight = parseInt(e.target.value) || 0;
                                    setHyroxParts(newParts);
                                  }}
                                />
                              </>
                            ) : <div className="h-full flex items-center justify-center pt-6"><span className="text-[9px] text-dark-border font-black uppercase tracking-widest italic">N.v.t.</span></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary-text uppercase tracking-[0.2em]">Afstand (km)</label>
                    <input type="number" step="0.1" className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-electric-blue font-black text-primary-text" value={formData.distance} onChange={e => setFormData({...formData, distance: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondary-text uppercase tracking-[0.2em]">Duur (min)</label>
                    <input type="number" className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-electric-blue font-black text-primary-text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm transition-all shadow-2xl ${isHyroxEntry ? 'bg-electric-blue text-white shadow-electric-blue/20' : 'bg-primary-text text-charcoal shadow-white/10 hover:bg-electric-blue hover:text-white'}`}
              >
                {isRaceToggle ? 'Finish Race Loggen' : 'Opslaan in Lab'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutsView;
