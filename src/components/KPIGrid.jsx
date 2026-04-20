import React from 'react';
import { Users, Tally3, Weight, CheckCircle, Sprout, Leaf, Trash2 } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, colorClass, bgColorClass, suffix = "", subtitle = "", highlight = false }) => (
  <div className={`relative overflow-hidden rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 transition-all hover:shadow-xl hover:-translate-y-1 duration-500 group ${
    highlight
      ? 'bg-rose-50 border-2 border-rose-200 shadow-rose-100'
      : 'bg-white border border-slate-100'
  }`}>
    {/* Decorative Background Icon for Mobile */}
    <Icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] rotate-12 transition-transform group-hover:scale-110 duration-700 ${colorClass}`} />

    <div className={`shrink-0 p-3 sm:p-4 rounded-2xl ${bgColorClass} transition-colors group-hover:scale-105 duration-300`}>
      <Icon className={`w-5 h-5 sm:w-7 sm:h-7 ${colorClass}`} />
    </div>
    
    <div className="relative z-10 flex flex-col">
      <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        {suffix && <span className="text-[10px] sm:text-sm font-bold text-slate-400">{suffix}</span>}
      </div>
      {subtitle && <p className="text-[9px] sm:text-xs text-slate-400 mt-0.5 font-bold uppercase truncate max-w-[120px] sm:max-w-none">{subtitle}</p>}
    </div>
  </div>
);

const KPIGrid = ({ stats }) => {
  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* ── TOP OPERATIONAL ROW ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <div className="col-span-2 lg:col-span-1">
          <KPICard title="Total Farmers" value={stats.totalFarmers} icon={Users} colorClass="text-blue-600" bgColorClass="bg-blue-100/50" />
        </div>
        <KPICard title="Total Area" value={stats.totalAcres} suffix="AC" icon={Tally3} colorClass="text-emerald-600" bgColorClass="bg-emerald-100/50" />
        <KPICard title="Exp. Yield" value={stats.totalYield} suffix="MT" icon={Weight} colorClass="text-purple-600" bgColorClass="bg-purple-100/50" />
      </div>

      {/* ── PHASE ROW ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <KPICard title="Confirmed" value={`${stats.confirmedCount}`} subtitle={`vs ${stats.notConfirmedCount} Pending`} icon={CheckCircle} colorClass="text-indigo-600" bgColorClass="bg-indigo-100/50" />
        <KPICard title="Sown" value={`${stats.sownCount}`} subtitle={`vs ${stats.notSownCount} Pending`} icon={Sprout} colorClass="text-lime-600" bgColorClass="bg-lime-100/50" />
        <KPICard title="Transplanted" value={stats.transplantCount} subtitle="Field Progress" icon={Leaf} colorClass="text-teal-600" bgColorClass="bg-teal-100/50" />
        <KPICard
          title="Deleted"
          value={stats.deletedCount ?? 0}
          subtitle="Rejected Records"
          icon={Trash2}
          colorClass="text-rose-600"
          bgColorClass="bg-rose-100/50"
          highlight
        />
      </div>
    </div>
  );
};

export default KPIGrid;
