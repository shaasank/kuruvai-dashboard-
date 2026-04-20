import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LabelList, PieChart, Pie, Cell, Legend
} from 'recharts';

const REMARK_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#14b8a6', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#d946ef', '#ec4899', '#64748b'
];

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

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
        <ChartCard title="Procurement Status" subtitle="Overall distribution of farmers">
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

      {/* ── SUPERVISOR PERFORMANCE ──────────────────────────────────── */}
      <ChartCard title="Team Workload" subtitle="Performance comparison by assigned supervisor" heightClass="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.supervisorComparison} margin={{ top: 30, right: 10, left: -15, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={<WrappedTick />} interval={0} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" align="right" height={40} iconType="circle" iconSize={8} formatter={(val) => <span className="text-[10px] font-bold text-slate-400 uppercase">{val}</span>} />
            <Bar dataKey="farmers" name="Farmers" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={15}>
              <LabelList dataKey="farmers" position="top" style={{ fill: '#3b82f6', fontSize: 10, fontWeight: 900 }} />
            </Bar>
            <Bar dataKey="acres" name="Acres" fill="#10b981" radius={[6, 6, 0, 0]} barSize={15}>
              <LabelList dataKey="acres" position="top" style={{ fill: '#10b981', fontSize: 10, fontWeight: 900 }} />
            </Bar>
            <Bar dataKey="yield" name="Yield" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={15}>
              <LabelList dataKey="yield" position="top" style={{ fill: '#8b5cf6', fontSize: 10, fontWeight: 900 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

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
