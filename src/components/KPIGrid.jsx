import React from 'react';
import { Users, Tally3, Weight, CheckCircle, Sprout, Leaf, Trash2 } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, colorClass, bgColorClass, suffix = "", subtitle = "", highlight = false }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md duration-300 ${
    highlight
      ? 'border-2 border-rose-200 ring-1 ring-rose-100'
      : 'border border-slate-100'
  }`}>
    <div className={`p-4 rounded-xl ${bgColorClass}`}>
      <Icon className={`w-7 h-7 ${colorClass}`} />
    </div>
    <div>
      <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        {suffix && <span className="text-sm font-medium text-slate-500">{suffix}</span>}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
    </div>
  </div>
);

const KPIGrid = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Top Level Operational KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <KPICard title="Total Farmers" value={stats.totalFarmers} icon={Users} colorClass="text-blue-600" bgColorClass="bg-blue-50" />
        <KPICard title="Total Acres" value={stats.totalAcres} suffix=" Acres" icon={Tally3} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" />
        <KPICard title="Expected Yield" value={stats.totalYield} suffix=" MT" icon={Weight} colorClass="text-purple-600" bgColorClass="bg-purple-50" />
      </div>

      {/* Phase KPIs + Deleted highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Confirmed" value={`${stats.confirmedCount} / ${stats.notConfirmedCount}`} subtitle="Confirmed vs Pending" icon={CheckCircle} colorClass="text-indigo-600" bgColorClass="bg-indigo-50" />
        <KPICard title="Sown" value={`${stats.sownCount} / ${stats.notSownCount}`} subtitle="Sown vs Pending" icon={Sprout} colorClass="text-lime-600" bgColorClass="bg-lime-50" />
        <KPICard title="Transplanted" value={stats.transplantCount} subtitle="Total Fields" icon={Leaf} colorClass="text-teal-600" bgColorClass="bg-teal-50" />
        <KPICard
          title="Deleted Farmers"
          value={stats.deletedCount ?? 0}
          subtitle="From Deleted sheet"
          icon={Trash2}
          colorClass="text-rose-600"
          bgColorClass="bg-rose-50"
          highlight
        />
      </div>
    </div>
  );
};

export default KPIGrid;

