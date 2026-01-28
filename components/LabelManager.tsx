
import React, { useState } from 'react';
import { Label } from '../types';
import { Plus, Trash2, Edit3, Palette, X, Check } from 'lucide-react';

interface Props {
  labels: Label[];
  onUpdateLabels: (labels: Label[]) => void;
}

const LabelManager: React.FC<Props> = ({ labels, onUpdateLabels }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState({ name: '', category: 'Hardlopen', color: '#3B82F6' });

  const addLabel = () => {
    if (!newLabel.name) return;
    onUpdateLabels([...labels, { ...newLabel, id: Math.random().toString(36).substr(2, 9) }]);
    setNewLabel({ name: '', category: 'Hardlopen', color: '#3B82F6' });
    setIsAdding(false);
  };

  const removeLabel = (id: string) => {
    if (window.confirm('Weet je zeker dat je dit label wilt verwijderen?')) {
      onUpdateLabels(labels.filter(l => l.id !== id));
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-dark-border pb-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-primary-text">Label Beheer</h2>
          <p className="text-secondary-text mt-2 font-bold uppercase text-xs tracking-widest">Structureer je data.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary-text text-charcoal px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-electric-blue hover:text-white transition-all shadow-xl"
        >
          <Plus size={18} /> Nieuw Label
        </button>
      </header>

      {isAdding && (
        <div className="bg-charcoal p-10 rounded-[2.5rem] border border-dark-border shadow-2xl space-y-8 animate-in zoom-in duration-200">
          <div className="flex justify-between items-center">
             <h3 className="font-black uppercase italic tracking-tighter text-xl text-primary-text">Configureer Label</h3>
             <button onClick={() => setIsAdding(false)} className="text-secondary-text hover:text-white"><X size={24}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Naam</label>
              <input 
                type="text" 
                className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 text-primary-text font-bold outline-none focus:ring-2 focus:ring-electric-blue"
                value={newLabel.name}
                onChange={e => setNewLabel({...newLabel, name: e.target.value})}
                placeholder="bijv. Interval"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Categorie</label>
              <select 
                className="w-full bg-black/40 border border-dark-border rounded-2xl px-5 py-4 text-primary-text font-bold outline-none focus:ring-2 focus:ring-electric-blue"
                value={newLabel.category}
                onChange={e => setNewLabel({...newLabel, category: e.target.value})}
              >
                <option value="Hardlopen" className="bg-charcoal">Hardlopen</option>
                <option value="Fietsen" className="bg-charcoal">Fietsen</option>
                <option value="Kracht" className="bg-charcoal">Kracht</option>
                <option value="Hyrox" className="bg-charcoal">Hyrox</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondary-text uppercase tracking-widest">Kleur Accent</label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  className="w-20 h-14 bg-black/40 border border-dark-border rounded-2xl cursor-pointer p-2"
                  value={newLabel.color}
                  onChange={e => setNewLabel({...newLabel, color: e.target.value})}
                />
                <div className="flex-1 text-[10px] font-black uppercase text-secondary-text">Kleurcode: <span className="font-mono text-primary-text">{newLabel.color.toUpperCase()}</span></div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button 
              onClick={addLabel} 
              className="bg-electric-blue text-white px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg shadow-electric-blue/20"
            >
              Label Opslaan
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labels.map(label => (
          <div key={label.id} className="bg-charcoal p-6 rounded-[2rem] border border-dark-border shadow-xl flex items-center justify-between group hover:border-secondary-text/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: label.color, color: label.color }} />
              <div>
                <p className="font-black uppercase italic tracking-tighter text-lg text-primary-text">{label.name}</p>
                <p className="text-[10px] font-black text-secondary-text uppercase tracking-widest">{label.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-3 bg-dark-border/20 text-secondary-text hover:text-electric-blue rounded-xl transition-all"><Edit3 size={18} /></button>
              <button onClick={() => removeLabel(label.id)} className="p-3 bg-dark-border/20 text-secondary-text hover:text-red-500 rounded-xl transition-all"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabelManager;
