import React from 'react';
import { Users, Tally3, CheckCircle, Sprout, Trash2 } from 'lucide-react';

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

/* ── Premium Yield Target Card with Radial Arc ─────────────────────── */
const YieldTargetCard = ({ currentYield = 0, targetYield = 2500 }) => {
  const pct = Math.min(100, (currentYield / targetYield) * 100);
  const remaining = Math.max(0, targetYield - currentYield);

  // SVG half-arc constants
  const R = 48;
  const cx = 64;
  const cy = 64;
  const startDeg = -210;
  const sweepDeg = 240;
  const toRad = (d) => (d * Math.PI) / 180;
  const ptX = (angle, r) => cx + r * Math.cos(toRad(angle));
  const ptY = (angle, r) => cy + r * Math.sin(toRad(angle));

  const endFullDeg = startDeg + sweepDeg;
  const endPctDeg  = startDeg + sweepDeg * (pct / 100);
  const largeArc   = sweepDeg * (pct / 100) > 180 ? 1 : 0;

  const bgArc = `M ${ptX(startDeg, R)} ${ptY(startDeg, R)} A ${R} ${R} 0 1 1 ${ptX(endFullDeg, R)} ${ptY(endFullDeg, R)}`;
  const fgArc = pct > 0.5
    ? `M ${ptX(startDeg, R)} ${ptY(startDeg, R)} A ${R} ${R} 0 ${largeArc} 1 ${ptX(endPctDeg, R)} ${ptY(endPctDeg, R)}`
    : null;

  // Colour by completion
  const stroke    = pct < 40 ? '#f43f5e' : pct < 75 ? '#f59e0b' : '#8b5cf6';
  const badgeCls  = pct < 40 ? 'bg-rose-50 text-rose-600 border-rose-100'
                  : pct < 75 ? 'bg-amber-50 text-amber-600 border-amber-100'
                  : 'bg-purple-50 text-purple-600 border-purple-100';

  const milestones = [25, 50, 75];

  return (
    <div className="relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
      {/* Ambient glow behind arc */}
      <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full blur-3xl opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-700"
        style={{ background: stroke }} />

      {/* Radial arc SVG */}
      <div className="shrink-0">
        <svg width="128" height="92" viewBox="0 0 128 92" className="overflow-visible">
          {/* Track */}
          <path d={bgArc} fill="none" stroke="#f1f5f9" strokeWidth="9" strokeLinecap="round" />

          {/* Milestone ticks */}
          {milestones.map(m => {
            const mDeg = startDeg + sweepDeg * (m / 100);
            return (
              <line key={m}
                x1={ptX(mDeg, R - 6)} y1={ptY(mDeg, R - 6)}
                x2={ptX(mDeg, R + 2)} y2={ptY(mDeg, R + 2)}
                stroke={pct >= m ? stroke : '#cbd5e1'}
                strokeWidth="1.5" strokeLinecap="round"
              />
            );
          })}

          {/* Progress arc */}
          {fgArc && (
            <path d={fgArc} fill="none" stroke={stroke} strokeWidth="9" strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 5px ${stroke}66)` }} />
          )}

          {/* Centre: percentage */}
          <text x={cx} y={cy - 5} textAnchor="middle" fontSize="17" fontWeight="900" fill="#0f172a" fontFamily="system-ui, sans-serif">
            {pct.toFixed(0)}%
          </text>
          <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fontWeight="700" fill="#94a3b8" fontFamily="system-ui, sans-serif" letterSpacing="1.5">
            OF TARGET
          </text>
        </svg>
      </div>

      {/* Text details */}
      <div className="flex-1 flex flex-col min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Exp. Yield</p>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">{currentYield.toLocaleString()}</span>
          <span className="text-xs font-bold text-slate-400">MT</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-2.5">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-xl">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Target</span>
            <span className="text-[10px] font-black text-slate-700">{targetYield.toLocaleString()} MT</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-xl border ${badgeCls}`}>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Left</span>
            <span className="text-[10px] font-black">{remaining.toLocaleString()} MT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── KPI Grid ──────────────────────────────────────────────────────── */
const KPIGrid = ({ stats }) => {
  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* ── TOP OPERATIONAL ROW ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <KPICard
          title="Total Farmers"
          value={stats.totalFarmers}
          icon={Users}
          colorClass="text-blue-600"
          bgColorClass="bg-blue-100/50"
          trend={stats.initialFarmers > 0 ? stats.farmerTrend : null}
          subtitle={stats.initialFarmers > 0 ? `Initial: ${stats.initialFarmers} farmers` : undefined}
        />
        <KPICard
          title="Total Area"
          value={stats.totalAcres}
          suffix="AC"
          icon={Tally3}
          colorClass="text-emerald-600"
          bgColorClass="bg-emerald-100/50"
        />
        <YieldTargetCard
          currentYield={stats.totalYield || 0}
          targetYield={stats.targetYield || 2500}
        />
      </div>

      {/* ── PHASE ROW ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <KPICard title="Confirmed" value={stats.confirmedCount} subtitle={`vs ${stats.notConfirmedCount} Pending`} icon={CheckCircle} colorClass="text-indigo-600" bgColorClass="bg-indigo-100/50" />
        <KPICard title="Sown" value={stats.sownCount} subtitle={`vs ${stats.notSownCount} Pending`} icon={Sprout} colorClass="text-lime-600" bgColorClass="bg-lime-100/50" />
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
