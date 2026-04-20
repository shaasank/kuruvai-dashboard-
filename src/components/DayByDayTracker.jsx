import React, { useMemo, useState } from 'react';
import { format, parseISO, isToday } from 'date-fns';
import { CalendarDays, CheckCircle2, CircleDashed, Clock, MapPin, User, ChevronRight } from 'lucide-react';

const ActivityIcon = ({ activity }) => {
  const act = String(activity).toLowerCase();
  if (act.includes('sowing') || act.includes('transplant')) 
    return <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-50"><CalendarDays className="w-5 h-5" /></div>;
  if (act.includes('fertilizer') || act.includes('weedicide') || act.includes('protection')) 
    return <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm shadow-blue-50"><Clock className="w-5 h-5" /></div>;
  if (act.includes('harvest')) 
    return <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm shadow-amber-50"><CheckCircle2 className="w-5 h-5" /></div>;
  return <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm shadow-slate-50"><CircleDashed className="w-5 h-5" /></div>;
};

const DayByDayTracker = ({ calendarData }) => {
  const [filterMode, setFilterMode] = useState('all');

  const sortedDates = useMemo(() => {
    return Object.keys(calendarData).sort((a, b) => new Date(a) - new Date(b));
  }, [calendarData]);

  const filteredDates = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); 

    return sortedDates.filter(dateStr => {
      const d = parseISO(dateStr);
      if (filterMode === 'upcoming') return d >= now;
      if (filterMode === 'past') return d < now;
      return true;
    });
  }, [sortedDates, filterMode]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── HEADER & FILTERS ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-auto">
          {['all', 'upcoming', 'past'].map((mode) => (
            <button
              key={mode}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                filterMode === mode 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              onClick={() => setFilterMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* ── TIMELINE ───────────────────────────────────────────────── */}
      <div className="relative">
        {filteredDates.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No activities scheduled</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredDates.map((dateStr, dateIdx) => {
              const activities = calendarData[dateStr];
              const dateObj = parseISO(dateStr);
              const isTodayDate = isToday(dateObj);
              
              return (
                <div key={dateStr} className="relative">
                  {/* Vertical Line for Desktop */}
                  {dateIdx < filteredDates.length - 1 && (
                    <div className="absolute left-[20px] sm:left-[210px] top-[80px] bottom-[-48px] w-0.5 bg-gradient-to-b from-slate-100 to-transparent hidden sm:block"></div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
                    {/* Date Sidebar */}
                    <div className="sm:w-40 shrink-0">
                      <div className={`p-4 sm:p-5 rounded-3xl border transition-all duration-500 ${
                        isTodayDate 
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-100 scale-105' 
                          : 'bg-white border-slate-100 text-slate-900 shadow-sm'
                      }`}>
                        <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isTodayDate ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {format(dateObj, 'EEEE')}
                        </div>
                        <div className="text-2xl sm:text-3xl font-black tracking-tighter">
                          {format(dateObj, 'MMM d')}
                        </div>
                        <div className={`text-[9px] mt-2 font-black uppercase tracking-wider flex items-center gap-1.5 ${isTodayDate ? 'text-emerald-100' : 'text-slate-400'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${isTodayDate ? 'bg-white animate-pulse' : 'bg-slate-200'}`}></div>
                          {activities.length} Task{activities.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Activities List */}
                    <div className="flex-1 space-y-4">
                      {activities.map((act, idx) => (
                        <div key={idx} className="group relative bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex items-center gap-5">
                          <ActivityIcon activity={act.activity} />
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight truncate group-hover:text-emerald-600 transition-colors">
                              {act.activity}
                            </h4>
                            
                            <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3 text-slate-300" />
                                <span className="text-[11px] font-bold text-slate-500">{act.farmerName}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-slate-300" />
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{act.village}</span>
                              </div>
                            </div>
                          </div>

                          <div className="hidden sm:block">
                            <div className="p-2 rounded-full bg-slate-50 group-hover:bg-emerald-50 transition-colors">
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            </div>
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
