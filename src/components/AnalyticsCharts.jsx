import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LabelList, PieChart, Pie, Cell, Legend, ReferenceLine
} from 'recharts';

const REMARK_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#14b8a5c4', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#d946ef', '#ec4899', '#64748b'
];

const COLORS = ['#14b8a5c4', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a5c4', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-2xl shadow-2xl ring-1 ring-black/5">
        <p className="font-black text-slate-900 mb-1.5 text-xs uppercase tracking-wider">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{entry.name}</span>
              <span className="text-sm font-black" style={{ color: entry.color || entry.fill }}>
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const ChartCard = ({ title, badge, badgeColor = 'bg-rose-100 text-rose-700', subtitle, children, heightClass = "h-[300px] sm:h-[350px]" }) => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
    <div className="p-5 sm:p-7 border-b border-slate-50 flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-none uppercase">{title}</h3>
        {subtitle && <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 font-bold uppercase tracking-wide">{subtitle}</p>}
      </div>
      {badge !== undefined && (
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
          {badge} Total
        </span>
      )}
    </div>
    <div className={`p-4 sm:p-6 w-full ${heightClass}`}>
      {children}
    </div>
  </div>
);

const WrappedTick = ({ x, y, payload }) => {
  const label = String(payload.value);
  const truncated = label.length > 10 ? label.substring(0, 8) + '..' : label;
  return (
    <text x={x} y={y} dy={12} textAnchor="middle" fill="#94a3b8" fontSize={9} fontWeight={700} className="uppercase">
      {truncated}
    </text>
  );
};

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index, color }) => {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 15;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={COLORS[index % COLORS.length]} fill="none" strokeWidth={1.5} />
      <circle cx={ex} cy={ey} r={2} fill={COLORS[index % COLORS.length]} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 6}
        y={ey}
        dy={5}
        textAnchor={textAnchor}
        fill={COLORS[index % COLORS.length]}
        fontSize={14}
        fontWeight={900}
      >
        {value}
      </text>
    </g>
  );
};

const AnalyticsCharts = ({ charts }) => {
  const remarksData = charts.remarksData || [];
  const rejectedData = charts.rejectedByRemark || remarksData;
  const totalDeleted = remarksData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6 sm:space-y-10">

      {/* ── TOP GRID ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

        {/* Yield per Taluk */}
        <ChartCard title="Yield per Taluk" subtitle="Metric Tons (MT) by Location">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.talukYield} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                width={80}
              />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="value" name="Yield (MT)" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={20}>
                <LabelList dataKey="value" position="right" fill="#94a3b8" fontSize={10} fontWeight={700} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Procurement Overview */}
        <ChartCard title="Famers Distribution" subtitle="Overall distribution of farmers based on procurement status history">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.procurement}
                cx="50%" cy="45%"
                innerRadius="45%" outerRadius="65%"
                paddingAngle={8}
                dataKey="value"
                label={renderPieLabel}
                stroke="none"
              >
                {(charts.procurement || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={30}
                iconType="circle"
                iconSize={8}
                formatter={(val) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── SUPERVISOR PERFORMANCE BAR CHART ────────────────────────── */}
      <ChartCard
        title="Team Workload Overview"
        subtitle="Performance vs 500 MT target per supervisor"
        badge="500 MT / person"
        badgeColor="bg-purple-100 text-purple-700"
        heightClass="h-[400px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.supervisorComparison} margin={{ top: 30, right: 10, left: -15, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" align="right" height={40} iconType="circle" iconSize={8} formatter={(val) => <span className="text-[10px] font-bold text-slate-400 uppercase">{val}</span>} />
            {/* 625 MT Target Reference Line */}
            <ReferenceLine
              y={500}
              stroke="#8b5cf6"
              strokeDasharray="6 3"
              strokeWidth={2}
              label={{
                value: ' Target 500 MT',
                position: 'insideTopRight',
                fill: '#8b5cf6',
                fontSize: 10,
                fontWeight: 900
              }}
            />
            <Bar dataKey="farmers" name="Farmers" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={15}>
              <LabelList dataKey="farmers" position="top" style={{ fill: '#3b82f6', fontSize: 10, fontWeight: 900 }} />
            </Bar>
            <Bar dataKey="acres" name="Acres" fill="#10b981" radius={[6, 6, 0, 0]} barSize={15}>
              <LabelList dataKey="acres" position="top" style={{ fill: '#10b981', fontSize: 10, fontWeight: 900 }} />
            </Bar>
            <Bar dataKey="yield" name="Yield (MT)" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={15}>
              <LabelList dataKey="yield" position="top" style={{ fill: '#8b5cf6', fontSize: 10, fontWeight: 900 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── SUPERVISOR PERFORMANCE GRID ─────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-7 border-b border-slate-50 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Team Workload Details</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 font-bold uppercase tracking-wide">Progress vs 500 MT target per field officer</p>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
            Target 500 MT
          </span>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {(charts.supervisorComparison || []).map((s) => {
              const pct = Math.min(100, ((s.yield || 0) / 500) * 100);
              const remaining = Math.max(0, 500 - (s.yield || 0));
              // Mini arc SVG
              const R = 32, cx = 38, cy = 38;
              const startDeg = -210, sweepDeg = 240;
              const toRad = (d) => (d * Math.PI) / 180;
              const ptX = (a, r) => cx + r * Math.cos(toRad(a));
              const ptY = (a, r) => cy + r * Math.sin(toRad(a));
              const endFullDeg = startDeg + sweepDeg;
              const endPctDeg = startDeg + sweepDeg * (pct / 100);
              const largeArc = sweepDeg * (pct / 100) > 180 ? 1 : 0;
              const bgArc = `M ${ptX(startDeg, R)} ${ptY(startDeg, R)} A ${R} ${R} 0 1 1 ${ptX(endFullDeg, R)} ${ptY(endFullDeg, R)}`;
              const fgArc = pct > 0.5 ? `M ${ptX(startDeg, R)} ${ptY(startDeg, R)} A ${R} ${R} 0 ${largeArc} 1 ${ptX(endPctDeg, R)} ${ptY(endPctDeg, R)}` : null;
              const stroke = pct >= 100 ? '#059669' : pct >= 60 ? '#10b981' : pct >= 30 ? '#34d399' : '#6ee7b7';

              return (
                <div key={s.name} className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300">
                  {/* Mini Arc */}
                  <svg width="76" height="56" viewBox="0 0 76 56" className="overflow-visible">
                    <path d={bgArc} fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
                    {fgArc && (
                      <path d={fgArc} fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 4px ${stroke}88)` }} />
                    )}
                    <text x={cx} y={cy - 3} textAnchor="middle" fontSize="12" fontWeight="900" fill="#0f172a" fontFamily="system-ui">
                      {pct.toFixed(0)}%
                    </text>
                    <text x={cx} y={cx + 8} textAnchor="middle" fontSize="6" fontWeight="700" fill="#94a3b8" fontFamily="system-ui" letterSpacing="0.5">
                      OF TARGET
                    </text>
                  </svg>

                  {/* Name */}
                  <p className="text-[11px] font-black text-slate-800 text-center leading-tight">{s.name}</p>

                  {/* Stats row */}
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-lg">{s.farmers} 🧑‍🌾</span>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">{s.acres} AC</span>
                  </div>

                  {/* Yield vs Target */}
                  <div className="text-center">
                    <p className="text-sm font-black" style={{ color: stroke }}>{(s.yield || 0).toLocaleString()} MT</p>
                    {remaining > 0 && (
                      <p className="text-[8px] font-bold text-slate-400">{remaining.toLocaleString()} MT left</p>
                    )}
                    {remaining === 0 && (
                      <p className="text-[8px] font-black text-emerald-600">✓ Target Met!</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── REJECTION BREAKDOWN ─────────────────────────────────────── */}
      {rejectedData.length > 0 && (
        <ChartCard
          title="Rejection Analysis"
          subtitle="Detailed breakdown of deleted records by remark"
          badge={totalDeleted}
          badgeColor="bg-rose-500 text-white"
          heightClass="h-auto min-h-[300px]"
        >
          <div style={{ height: Math.max(250, rejectedData.length * 50) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rejectedData} layout="vertical" margin={{ top: 10, right: 80, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#334155', fontSize: 10, fontWeight: 800 }}
                  width={120}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(244, 63, 94, 0.05)' }} />
                <Bar dataKey="value" name="Deleted" radius={[0, 8, 8, 0]} barSize={25}>
                  {rejectedData.map((_, index) => (
                    <Cell key={`h-${index}`} fill={REMARK_COLORS[index % REMARK_COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={v => `${v} REMOVED`}
                    style={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}
    </div>
  );
};

export default AnalyticsCharts;
