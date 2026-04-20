import React, { useMemo, useState } from 'react';
import { useSheetData } from '../hooks/useSheetData';
import { processData } from '../utils/dataTransformers';
import {
  Users, AreaChart, Tractor, Target,
  Map, BarChart3, PieChart, Activity,
  Search, Filter, RefreshCw, AlertTriangle, Clock
} from 'lucide-react';

import KPIGrid from './KPIGrid';
import FarmerGrid from './FarmerGrid';
import AnalyticsCharts from './AnalyticsCharts';
import DayByDayTracker from './DayByDayTracker';

const Dashboard = () => {
  const { data, loading, error, isUsingMock, lastFetched, refetch } = useSheetData();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const processed = useMemo(() => processData(data), [data]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-lg font-medium text-slate-600">Loading live data from Google Sheets…</p>
          <p className="text-sm text-slate-400">This may take a few seconds on first load</p>
        </div>
      </div>
    );
  }

  // Show a hard error only when we have NO data at all
  const hasNoData = processed.farmers.length === 0 && data.active.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-12 w-full text-slate-800 font-sans">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700">
            <Tractor className="h-7 w-7" />
            <h1 className="text-xl font-bold tracking-tight">Kuruvai Operations</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Last fetched timestamp */}
            {lastFetched && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {lastFetched.toLocaleTimeString()}
              </span>
            )}

            {/* Live indicator / error badge */}
            {error ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
                <AlertTriangle className="w-3 h-3" />
                Connection issue
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                Live Sync
                <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
              </span>
            )}

            {/* Manual refresh button */}
            <button
              onClick={handleRefresh}
              title="Refresh data"
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error banner (non-fatal) */}
        {error && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
          <div className="flex space-x-8 h-12">
            {[
              { id: 'overview', label: 'Overview Analytics', icon: BarChart3 },
              { id: 'schedule', label: 'Day-by-Day Tracking', icon: Activity },
              { id: 'farmers',  label: 'Farmer Database',    icon: Users },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">

        {/* No-data state */}
        {hasNoData && (
          <div className="mb-6 p-6 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-700 mb-1">No data loaded yet</h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto mb-4">
              {error
                ? error
                : 'Make sure your Google Apps Script is deployed with the new code, then click Refresh.'}
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Retry Connection
            </button>
          </div>
        )}

        {/* Stats row – always visible except Farmer DB tab */}
        {activeTab !== 'farmers' && !hasNoData && (
          <KPIGrid stats={processed.stats} />
        )}

        <div className="mt-8">
          {activeTab === 'overview' && !hasNoData && (
            <AnalyticsCharts charts={processed.charts} />
          )}

          {activeTab === 'schedule' && !hasNoData && (
            <DayByDayTracker calendarData={processed.calendarActivities} />
          )}

          {activeTab === 'farmers' && (
            <FarmerGrid farmers={processed.farmers} deletedFarmers={processed.deletedFarmers || []} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
