
import React, { useState, useEffect } from 'react';
import { DashboardStats } from '../types';
import { Save, User, Shield, Bell, HardDrive, RefreshCw, Trophy, Calendar, ExternalLink, Key } from 'lucide-react';
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

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <header>
        <h2 className="text-3xl font-bold">Instellingen</h2>
        <p className="text-gray-500">Configureer je doelen en koppel je Strava account.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Strava Integration Section */}
          <section className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2 text-orange-600">
                <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} /> Strava Koppeling
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
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-3">
                  <p className="text-sm text-orange-800 font-medium">
                    Om je echte Strava data te koppelen moet je een API applicatie aanmaken in je Strava account.
                  </p>
                  <a 
                    href="https://www.strava.com/settings/api" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 underline"
                  >
                    Ga naar Strava API Instellingen <ExternalLink size={14} />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                      <Key size={10} /> Client ID
                    </label>
                    <input 
                      type="text" 
                      placeholder="123456"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
                      value={stravaConfig.clientId}
                      onChange={e => setStravaConfig({...stravaConfig, clientId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                      <Shield size={10} /> Client Secret
                    </label>
                    <input 
                      type="password" 
                      placeholder="••••••••••••"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-500"
                      value={stravaConfig.clientSecret}
                      onChange={e => setStravaConfig({...stravaConfig, clientSecret: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleConnect}
                  className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                >
                  <RefreshCw size={20} /> Verbind met Strava
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-green-50 rounded-3xl border border-green-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl italic shadow-lg shadow-orange-100">S</div>
                  <div>
                    <p className="font-bold text-green-900">Account Gekoppeld</p>
                    <p className="text-xs text-green-600 font-medium">Je kunt nu je activiteiten synchroniseren op het Dashboard.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Shield size={20} />
                  <span className="text-xs font-bold uppercase tracking-widest">Veilig</span>
                </div>
              </div>
            )}
          </section>

          {/* Motivation Settings */}
          <section className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-8">
            <h3 className="font-bold text-lg flex items-center gap-2"><Trophy size={20} className="text-blue-600" /> Focus & Motivatie</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Mijn Grootste Doel</label>
                <textarea 
                  rows={2}
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
                  value={mainGoal}
                  onChange={(e) => setMainGoal(e.target.value)}
                  placeholder="Bijv. Hyrox solo onder de 1:15:00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Volgende Race Naam</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={nextRace.name}
                    onChange={(e) => setNextRace({...nextRace, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Datum van de Race</label>
                  <input 
                    type="date" 
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={nextRace.date.split('T')[0]}
                    onChange={(e) => setNextRace({...nextRace, date: new Date(e.target.value).toISOString()})}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2"><User size={20} className="text-blue-600" /> Wekelijkse Doelen</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Z2 Duur (minuten)</label>
                <input type="number" defaultValue={stats.z2Goal} className="w-full bg-gray-50 border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Kracht sessies</label>
                <input type="number" defaultValue={stats.strengthGoal} className="w-full bg-gray-50 border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">Threshold sessies</label>
                <input type="number" defaultValue={stats.thresholdGoal} className="w-full bg-gray-50 border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600">VO2 Max sessies</label>
                <input type="number" defaultValue={stats.vo2Goal} className="w-full bg-gray-50 border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              <Save size={20} /> Alles Opslaan
            </button>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-lg font-bold">Status</h3>
            <div className="flex justify-between text-sm">
              <span className="text-blue-300">Account Type</span>
              <span className="font-bold">Athlete Pro Lab</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-300">Strava API</span>
              <span className={`font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Gekoppeld' : 'Niet Gekoppeld'}
              </span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <h3 className="font-bold mb-4">Account</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-blue-600"><Shield size={16} /> Privacy Instellingen</li>
              <li className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-blue-600"><Bell size={16} /> Meldingen</li>
              <li className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-blue-600"><HardDrive size={16} /> Data Exporteren</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
