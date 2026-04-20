import React, { useMemo, useState } from 'react';
import { format, parseISO, isToday, isPast, isFuture } from 'date-fns';
import { CalendarDays, CheckCircle2, CircleDashed, Clock } from 'lucide-react';

const ActivityIcon = ({ activity }) => {
  if (activity.includes('Sowing') || activity.includes('Transplant')) return <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><CalendarDays className="w-4 h-4" /></div>;
  if (activity.includes('Fertilizer') || activity.includes('Weedicide') || activity.includes('Protection')) return <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Clock className="w-4 h-4" /></div>;
  if (activity.includes('Harvest')) return <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><CheckCircle2 className="w-4 h-4" /></div>;
  return <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><CircleDashed className="w-4 h-4" /></div>;
};

const DayByDayTracker = ({ calendarData }) => {
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'upcoming', 'past'

  const sortedDates = useMemo(() => {
    return Object.keys(calendarData).sort((a, b) => new Date(a) - new Date(b));
  }, [calendarData]);

  const filteredDates = useMemo(() => {
    const now = new Date();
    // Normalize now to start of day for accurate past/future comparison
    now.setHours(0, 0, 0, 0); 

    return sortedDates.filter(dateStr => {
      const d = parseISO(dateStr);
      if (filterMode === 'upcoming') return d >= now;
      if (filterMode === 'past') return d < now;
      return true;
    });
  }, [sortedDates, filterMode]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Day-by-Day Activity Tracker</h2>
          <p className="text-sm text-slate-500 mt-1">Timeline of agricultural activities showing only days with scheduled work.</p>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-lg">
          {['all', 'upcoming', 'past'].map((mode) => (
            <button
              key={mode}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                filterMode === mode 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setFilterMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {filteredDates.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CalendarDays className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p>No activities found for the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredDates.map(dateStr => {
              const activities = calendarData[dateStr];
              const dateObj = parseISO(dateStr);
              const isTodayDate = isToday(dateObj);
              
              return (
                <div key={dateStr} className="relative pl-4 sm:pl-0">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    {/* Date Sidebar */}
                    <div className="sm:w-48 shrink-0 relative z-10">
                      <div className={`sticky top-20 p-4 rounded-xl border ${
                        isTodayDate 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm' 
                          : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}>
                        <div className="text-sm font-semibold uppercase tracking-wider mb-1">
                          {isTodayDate ? 'Today' : format(dateObj, 'EEEE')}
                        </div>
                        <div className="text-2xl font-bold">
                          {format(dateObj, 'MMM d')}
                        </div>
                        <div className="text-xs mt-1 text-slate-500 font-medium">
                          {activities.length} Action{activities.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Activities List */}
                    <div className="flex-1 space-y-3">
                      {activities.map((act, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all">
                          <ActivityIcon activity={act.activity} />
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800">{act.activity}</h4>
                            <p className="text-sm text-slate-500 mt-0.5">
                              Farmer: <span className="font-semibold text-slate-700">{act.farmerName}</span> 
                              {" • "}Village: <span className="font-medium">{act.village}</span>
                            </p>
                          </div>
                          <div className="hidden sm:block">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                              act.status.toLowerCase() === 'active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {act.status || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayByDayTracker;
