import React, { useMemo, useState } from 'react';
import { useSheetData } from '../hooks/useSheetData';
import { processData } from '../utils/dataTransformers';
import {
  Users, Tractor, BarChart3, Activity,
  RefreshCw, AlertTriangle, Clock, Menu, X
} from 'lucide-react';

import KPIGrid from './KPIGrid';
import FarmerGrid from './FarmerGrid';
import AnalyticsCharts from './AnalyticsCharts';

const Dashboard = () => {
  const { data, loading, error, lastFetched, refetch } = useSheetData();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const processed = useMemo(() => processData(data), [data]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const navItems = [
    { id: 'overview', label: 'Analytics', icon: BarChart3 },
    { id: 'farmers',  label: 'Database', icon: Users },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 px-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-lg font-bold text-slate-800">Kuruvai Operations</p>
          <p className="text-sm text-slate-500">Connecting to live agricultural data...</p>
        </div>
      </div>
    );
  }

  const hasNoData = processed.farmers.length === 0 && data.active.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full text-slate-800 font-sans selection:bg-emerald-100">
      
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[100] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
                <Tractor className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base sm:text-xl font-black tracking-tight leading-none text-slate-900">Kuruvai</h1>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600 leading-none mt-1">Operations Dashboard</span>
              </div>
            </div>

            {/* Desktop Nav & Actions */}
            <div className="flex items-center gap-2 sm:gap-6">
              
              {/* Desktop Tabs */}
              <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                      activeTab === item.id 
                        ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-2 sm:gap-4 border-l border-slate-100 pl-2 sm:pl-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Last Sync</span>
                  <span className="text-xs font-bold text-slate-600">{lastFetched ? lastFetched.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Waiting...'}</span>
                </div>
                
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
                </button>

                {/* Mobile Menu Toggle */}
                <button 
                  className="md:hidden p-2.5 rounded-xl bg-slate-900 text-white shadow-lg active:scale-95 transition-transform"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE NAV MENU ─────────────────────────────────────────── */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-100 ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-4 grid grid-cols-3 gap-3 bg-white">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all active:scale-95 ${
                  activeTab === item.id 
                    ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20 shadow-inner' 
                    : 'bg-slate-50 text-slate-500'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-500 text-white px-4 py-2 text-[10px] sm:text-xs font-bold text-center tracking-wide uppercase">
             <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
               <AlertTriangle className="w-3 h-3" />
               <span>Connection Issue: {error}</span>
             </div>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 safe-bottom">
        
        {hasNoData && !loading ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-slate-200 text-center shadow-sm">
            <div className="bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">No Agricultural Data Found</h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto mb-8">
              We couldn't fetch data from your Google Sheet. Please check your deployment settings or refresh the connection.
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:shadow-slate-300 transition-all active:scale-95 flex items-center gap-3 mx-auto"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Reconnect Now
            </button>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Context Header for Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 capitalize">{activeTab} View</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Live updates from {processed.farmers.length} active records</p>
              </div>
            </div>

            {/* Dynamic Views */}
            <div className="transition-all duration-500 ease-out">
              {activeTab === 'overview' && (
                <div className="space-y-8 sm:space-y-12">
                  <KPIGrid stats={processed.stats} />
                  <AnalyticsCharts charts={processed.charts} />
                </div>
              )}

              {activeTab === 'farmers' && (
                <FarmerGrid farmers={processed.farmers} deletedFarmers={processed.deletedFarmers || []} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Refresh (iPhone style) */}
      <div className="md:hidden fixed bottom-6 right-6 z-[200]">
        <button
          onClick={handleRefresh}
          className={`p-4 rounded-full bg-emerald-600 text-white shadow-2xl shadow-emerald-400 active:scale-90 transition-transform ${isRefreshing ? 'animate-pulse' : ''}`}
        >
          <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
