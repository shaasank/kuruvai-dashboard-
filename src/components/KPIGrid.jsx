import React from 'react';
import { Users, Tally3, CheckCircle, Sprout, Trash2, Layers } from 'lucide-react';

/* ── Generic KPI Card ──────────────────────────────────────────────── */
const KPICard = ({ title, value, icon: Icon, colorClass, bgColorClass, suffix = "", subtitle = "", highlight = false, trend = null }) => (
  <div className={`relative overflow-hidden rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 transition-all hover:shadow-xl hover:-translate-y-1 duration-500 group ${highlight
    ? 'bg-rose-50 border-2 border-rose-200 shadow-rose-100'
    : 'bg-white border border-slate-100'
    }`}>
    <Icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] rotate-12 transition-transform group-hover:scale-110 duration-700 ${colorClass}`} />

    <div className={`shrink-0 p-3 sm:p-4 rounded-2xl ${bgColorClass} transition-colors group-hover:scale-105 duration-300`}>
      <Icon className={`w-5 h-5 sm:w-7 sm:h-7 ${colorClass}`} />
    </div>

    <div className="relative z-10 flex-1 flex flex-col min-w-0">
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
        {trend !== null && trend !== undefined && trend !== 0 && (
          <div className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-lg ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend > 0 ? '↑' : '↓'} {trend > 0 ? '+' : ''}{Math.abs(trend)}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        {suffix && <span className="text-[10px] sm:text-sm font-bold text-slate-400">{suffix}</span>}
      </div>
      {subtitle && <p className="text-[9px] sm:text-xs text-slate-400 mt-0.5 font-bold uppercase truncate">{subtitle}</p>}
    </div>
  </div>
);

/* ── Paired KPI Card ───────────────────────────────────────────────── */
const PairedKPICard = ({ title, icon: Icon, colorClass, bgColorClass, topLabel, topValue, topSuffix = "", bottomLabel, bottomValue, bottomSuffix = "" }) => (
  <div className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 duration-500 group bg-white border border-slate-100`}>
    <Icon className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-[0.03] rotate-12 transition-transform group-hover:scale-110 duration-700 ${colorClass}`} />
    
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`shrink-0 p-2.5 rounded-xl ${bgColorClass} transition-colors group-hover:scale-105 duration-300`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClass}`} />
      </div>
      <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
    </div>

    <div className="relative z-10 flex flex-col gap-3">
      <div className="flex flex-col">
        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{topLabel}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none tracking-tight">{typeof topValue === 'number' ? topValue.toLocaleString() : topValue}</span>
          {topSuffix && <span className="text-[10px] font-bold text-slate-400">{topSuffix}</span>}
        </div>
      </div>
      
      <div className="h-px w-full bg-slate-100"></div>

      <div className="flex flex-col">
        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{bottomLabel}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none tracking-tight">{typeof bottomValue === 'number' ? bottomValue.toLocaleString() : bottomValue}</span>
          {bottomSuffix && <span className="text-[10px] font-bold text-slate-400">{bottomSuffix}</span>}
        </div>
      </div>
    </div>
  </div>
);

/* ── Premium Yield Target Card with Radial Arc ─────────────────────── */
const YieldTargetCard = ({ currentYield = 0, targetYield = 2500 }) => {
  const pct = Math.min(100, (currentYield / targetYield) * 100);
  const remaining = Math.max(0, targetYield - currentYield);

  const R = 64, cx = 86, cy = 86;
  const startDeg = -210, sweepDeg = 240;
  const toRad = (d) => (d * Math.PI) / 180;
  const ptX = (a, r) => cx + r * Math.cos(toRad(a));
  const ptY = (a, r) => cy + r * Math.sin(toRad(a));

  const endFullDeg = startDeg + sweepDeg;
  const endPctDeg  = startDeg + sweepDeg * (pct / 100);
  const largeArc   = sweepDeg * (pct / 100) > 180 ? 1 : 0;

  const bgArc = `M ${ptX(startDeg, R)} ${ptY(startDeg, R)} A ${R} ${R} 0 1 1 ${ptX(endFullDeg, R)} ${ptY(endFullDeg, R)}`;
  const fgArc = pct > 0.5 ? `M ${ptX(startDeg, R)} ${ptY(startDeg, R)} A ${R} ${R} 0 ${largeArc} 1 ${ptX(endPctDeg, R)} ${ptY(endPctDeg, R)}` : null;

  const stroke    = pct < 40 ? '#f43f5e' : pct < 75 ? '#f59e0b' : '#8b5cf6';
  const badgeCls  = pct < 40 ? 'bg-rose-50 text-rose-600 border-rose-100'
                  : pct < 75 ? 'bg-amber-50 text-amber-600 border-amber-100'
                  : 'bg-purple-50 text-purple-600 border-purple-100';

  const milestones = [25, 50, 75];

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 h-full">
      <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full blur-3xl opacity-[0.05] group-hover:opacity-[0.12] transition-opacity duration-700" style={{ background: stroke }} />
      
      {/* Left: Text Details */}
      <div className="flex-1 flex flex-col min-w-0 z-10 order-2 sm:order-1 items-center sm:items-start text-center sm:text-left">
        <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Total Expected Yield</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-none">{currentYield.toLocaleString()}</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-400">MT</span>
        </div>
      </div>

      {/* Middle: Gauge */}
      <div className="shrink-0 z-10 order-1 sm:order-2">
        <svg width="172" height="120" viewBox="0 0 172 120" className="overflow-visible drop-shadow-sm">
          <path d={bgArc} fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
          {milestones.map(m => {
            const mDeg = startDeg + sweepDeg * (m / 100);
            return <line key={m} x1={ptX(mDeg, R - 8)} y1={ptY(mDeg, R - 8)} x2={ptX(mDeg, R + 4)} y2={ptY(mDeg, R + 4)} stroke={pct >= m ? stroke : '#cbd5e1'} strokeWidth="2.5" strokeLinecap="round" />;
          })}
          {fgArc && <path d={fgArc} fill="none" stroke={stroke} strokeWidth="12" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${stroke}66)` }} />}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="24" fontWeight="900" fill="#0f172a" fontFamily="system-ui, sans-serif">{pct.toFixed(0)}%</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fontWeight="700" fill="#94a3b8" fontFamily="system-ui, sans-serif" letterSpacing="2">OF TARGET</text>
        </svg>
      </div>

      {/* Right: Badges */}
      <div className="flex-1 flex flex-col items-center sm:items-end justify-center gap-3 z-10 order-3 w-full sm:w-auto">
        <div className="flex items-center justify-between w-full max-w-[220px] bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Target</span>
          <span className="text-sm sm:text-base font-black text-slate-700">{targetYield.toLocaleString()} MT</span>
        </div>
        <div className={`flex items-center justify-between w-full max-w-[220px] px-4 py-3 rounded-2xl border shadow-sm ${badgeCls}`}>
          <span className="text-xs font-black uppercase tracking-widest opacity-60">Left</span>
          <span className="text-sm sm:text-base font-black">{remaining.toLocaleString()} MT</span>
        </div>
      </div>
    </div>
  );
};

/* ── KPI Grid ──────────────────────────────────────────────────────── */
const KPIGrid = ({ stats }) => {
  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* ── TOP OPERATIONAL ROW (Paired Cards) ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <PairedKPICard
          title="Global Overview"
          icon={Layers}
          colorClass="text-blue-600"
          bgColorClass="bg-blue-100/50"
          topLabel="Total Farmers"
          topValue={stats.totalFarmers}
          bottomLabel="Total Area"
          bottomValue={stats.globalAcres}
          bottomSuffix="AC"
        />
        <PairedKPICard
          title="Confirmed Base"
          icon={CheckCircle}
          colorClass="text-indigo-600"
          bgColorClass="bg-indigo-100/50"
          topLabel="Confirmed Farmers"
          topValue={stats.confirmedCount}
          bottomLabel="Confirmed Area"
          bottomValue={stats.confirmedAcres}
          bottomSuffix="AC"
        />
        <PairedKPICard
          title="Sown Operations"
          icon={Sprout}
          colorClass="text-emerald-600"
          bgColorClass="bg-emerald-100/50"
          topLabel="Sown Farmers"
          topValue={stats.sownCount}
          bottomLabel="Sown Area"
          bottomValue={stats.totalAcres}
          bottomSuffix="AC"
        />
      </div>

      {/* ── YIELD ROW ────────────────────────────────────────────────── */}
      <div className="w-full">
        <YieldTargetCard
          currentYield={stats.totalYield || 0}
          targetYield={stats.targetYield || 2500}
        />
      </div>
    </div>
  );
};

export default KPIGrid;

