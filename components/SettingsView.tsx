
import React, { useState } from 'react';
import { DashboardStats } from '../types';
// Added Zap to imports
import { Save, User, Shield, Bell, HardDrive, RefreshCw, Trophy, Calendar, ExternalLink, Key, Download, Upload, Copy, Check, Zap } from 'lucide-react';
import { getStravaAuthUrl } from '../services/strava';

interface Props {
  stats: DashboardStats;
  mainGoal: string;
  setMainGoal: (g: string) => void;
  nextRace: { name: string, date: string };
  setNextRace: (r: { name: string, date: string }) => void;
  isSyncing: boolean;
}

const SettingsView: React.FC<Props> = ({ stats, mainGoal, setMainGoal, nextRace, setNextRace, isSyncing }) => {
  const [stravaConfig, setStravaConfig] = useState({
    clientId: localStorage.getItem('strava_client_id') || '',
    clientSecret: localStorage.getItem('strava_client_secret') || '',
  });
  const [importCode, setImportCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const isConnected = !!localStorage.getItem('strava_access_token');

  const saveStravaConfig = () => {
    localStorage.setItem('strava_client_id', stravaConfig.clientId);
    localStorage.setItem('strava_client_secret', stravaConfig.clientSecret);
    localStorage.setItem('strava_config', JSON.stringify(stravaConfig));
    alert('API instellingen lokaal opgeslagen.');
  };

  const handleConnect = () => {
    if (!stravaConfig.clientId || !stravaConfig.clientSecret) {
      alert('Vul eerst je Strava Client ID en Secret in.');
      return;
    }
    saveStravaConfig();
    const redirectUri = window.location.origin + window.location.pathname;
    window.location.href = getStravaAuthUrl(stravaConfig.clientId, redirectUri);
  };

  const disconnectStrava = () => {
    if (window.confirm('Weet je zeker dat je Strava wilt ontkoppelen? Je data blijft lokaal bewaard.')) {
      localStorage.removeItem('strava_access_token');
      localStorage.removeItem('strava_client_id');
      localStorage.removeItem('strava_client_secret');
      localStorage.removeItem('strava_config');
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      activities: JSON.parse(localStorage.getItem('lab_activities') || '[]'),
      labels: JSON.parse(localStorage.getItem('lab_labels') || '[]'),
      goals: { mainGoal, nextRace }
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stans-lab-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const copyDataToClipboard = () => {
    const data = {
      activities: JSON.parse(localStorage.getItem('lab_activities') || '[]'),
      labels: JSON.parse(localStorage.getItem('lab_labels') || '[]'),
      goals: { mainGoal, nextRace }
    };
    navigator.clipboard.writeText(JSON.stringify(data)).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  const importData = () => {
    try {
      const data = JSON.parse(importCode);
      if (window.confirm('Dit overschrijft je huidige lokale data. Doorgaan?')) {
        if (data.activities) localStorage.setItem('lab_activities', JSON.stringify(data.activities));
        if (data.labels) localStorage.setItem('lab_labels', JSON.stringify(data.labels));
        if (data.goals) {
          setMainGoal(data.goals.mainGoal);
          setNextRace(data.goals.nextRace);
        }
        alert('Data succesvol geïmporteerd! De app wordt herladen.');
        window.location.reload();
      }
    } catch (e) {
      alert('Ongeldige code. Kopieer de volledige export code.');
    }
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom duration-500 pb-20">
      <header>
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-primary-text">Instellingen</h2>
        <p className="text-secondary-text mt-2 font-bold uppercase text-xs tracking-widest">Systeembeheer & Synchronisatie</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Data Transfer Section - CRITICAL FOR MOBILE SYNC */}
          <section className="bg-charcoal p-8 rounded-[2.5rem] border border-dark-border shadow-2xl space-y-8 blue-glow">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary-text flex items-center gap-2">
              <HardDrive size={18} className="text-electric-blue" /> Data Overzetten naar Mobiel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-[10px] text-secondary-text uppercase font-bold leading-relaxed tracking-widest">
                  Stap 1: Kopieer je data op je laptop.
                </p>
                <button 
                  onClick={copyDataToClipboard}
                  className="w-full flex items-center justify-center gap-2 bg-dark-border/20 hover:bg-dark-border text-primary-text border border-dark-border py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  {copySuccess ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  {copySuccess ? 'Gekopieerd!' : 'Kopieer Lab Code'}
                </button>
                <button 
                  onClick={exportData}
                  className="w-full flex items-center justify-center gap-2 bg-dark-border/20 hover:bg-dark-border text-primary-text border border-dark-border py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  <Download size={16} /> Download .JSON Bestand
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] text-secondary-text uppercase font-bold leading-relaxed tracking-widest">
                  Stap 2: Plak de code op je telefoon.
                </p>
                <textarea 
                  className="w-full bg-black/40 border border-dark-border rounded-xl p-3 text-[10px] font-mono outline-none focus:ring-1 focus:ring-electric-blue text-secondary-text"
                  placeholder="Plak hier je Lab Code..."
                  rows={3}
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                />
                <button 
                  onClick={importData}
                  className="w-full flex items-center justify-center gap-2 bg-electric-blue text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-electric-blue/20"
                >
                  <Upload size={16} /> Importeer in Lab
                </button>
              </div>
            </div>
          </section>

          {/* Strava Integration Section */}
          <section className="bg-charcoal p-8 rounded-[2.5rem] border border-dark-border shadow-sm space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary-text flex items-center gap-2">
                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : 'text-electric-blue'} /> Strava Koppeling
              </h3>
              {isConnected && (
                <button 
                  onClick={disconnectStrava}
                  className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                >
                  Ontkoppelen
                </button>
              )}
            </div>

            {!isConnected ? (
              <div className="space-y-6">
                <div className="bg-dark-border/10 p-4 rounded-2xl border border-dark-border/50 space-y-3">
                  <p className="text-xs text-secondary-text font-medium leading-relaxed">
                    Koppel je Strava API om je workouts automatisch in het Lab te laden.
                  </p>
                  <a 
                    href="https://www.strava.com/settings/api" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[10px] font-black text-electric-blue underline uppercase tracking-widest"
                  >
                    Mijn Strava API Dashboard <ExternalLink size={14} />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-secondary-text uppercase tracking-widest">Client ID</label>
                    <input 
                      type="text" 
                      placeholder="bijv. 123456"
                      className="w-full bg-black/40 border border-dark-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-electric-blue text-primary-text"
                      value={stravaConfig.clientId}
                      onChange={e => setStravaConfig({...stravaConfig, clientId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-secondary-text uppercase tracking-widest">Client Secret</label>
                    <input 
                      type="password" 
                      placeholder="••••••••••••"
                      className="w-full bg-black/40 border border-dark-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-electric-blue text-primary-text"
                      value={stravaConfig.clientSecret}
                      onChange={e => setStravaConfig({...stravaConfig, clientSecret: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleConnect}
                  className="w-full bg-primary-text text-charcoal font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-electric-blue hover:text-white transition-all shadow-xl uppercase text-xs tracking-widest"
                >
                  <RefreshCw size={20} /> Verbind met Strava
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-green-500/5 rounded-3xl border border-green-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-electric-blue rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-lg">S</div>
                  <div>
                    <p className="font-black text-primary-text uppercase italic tracking-tighter">Strava Verbonden</p>
                    <p className="text-[10px] text-secondary-text font-bold uppercase tracking-widest">Je kunt nu syncen op het dashboard</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Shield size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Geautoriseerd</span>
                </div>
              </div>
            )}
          </section>

          {/* Goal Settings */}
          <section className="bg-charcoal p-8 rounded-[2.5rem] border border-dark-border shadow-sm space-y-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary-text flex items-center gap-2"><Trophy size={18} className="text-electric-blue" /> Focus & Motivatie</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-secondary-text uppercase tracking-widest">Mijn Grootste Doel</label>
                <textarea 
                  rows={2}
                  className="w-full bg-black/40 border border-dark-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-electric-blue text-lg font-black italic tracking-tighter uppercase text-primary-text"
                  value={mainGoal}
                  onChange={(e) => setMainGoal(e.target.value)}
                  placeholder="Bijv. Hyrox solo onder de 1:15:00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-secondary-text uppercase tracking-widest">Volgende Race</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/40 border border-dark-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-electric-blue font-bold text-primary-text"
                    value={nextRace.name}
                    onChange={(e) => setNextRace({...nextRace, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-secondary-text uppercase tracking-widest">Race Datum</label>
                  <input 
                    type="date" 
                    className="w-full bg-black/40 border border-dark-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-electric-blue font-bold text-primary-text"
                    value={nextRace.date.split('T')[0]}
                    onChange={(e) => setNextRace({...nextRace, date: new Date(e.target.value).toISOString()})}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-electric-blue p-8 rounded-[2.5rem] text-white shadow-2xl space-y-6 relative overflow-hidden">
            <Zap className="absolute -right-8 -bottom-8 text-white/10" size={160} />
            <h3 className="text-sm font-black uppercase tracking-widest italic">Systeem Status</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest border-b border-white/20 pb-2">
                <span className="opacity-70">Versie</span>
                <span>2.0.4 PRO</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest border-b border-white/20 pb-2">
                <span className="opacity-70">Strava API</span>
                <span className={isConnected ? 'text-white' : 'text-white/50'}>
                  {isConnected ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="opacity-70">Opslag</span>
                <span>Lokaal (Browser)</span>
              </div>
            </div>
          </div>
          
          <div className="bg-charcoal p-8 rounded-[2.5rem] border border-dark-border shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary-text mb-6">Account</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-[10px] font-black text-secondary-text uppercase tracking-widest cursor-pointer hover:text-electric-blue transition-colors">
                <Shield size={16} /> Privacy Policy
              </li>
              <li className="flex items-center gap-3 text-[10px] font-black text-secondary-text uppercase tracking-widest cursor-pointer hover:text-electric-blue transition-colors">
                <Bell size={16} /> Meldingen
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
