import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LabelList, PieChart, Pie, Cell, Legend
} from 'recharts';

// Per-bar colour palette for deletion remarks
const REMARK_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#14b8a6', '#06b6d4', '#3b82f6',
  '#8b5cf6', '#d946ef', '#ec4899', '#64748b'
];

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

/* ── Shared tooltip ───────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color || entry.fill }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ── Card wrapper ────────────────────────────────────────────────────── */
const ChartCard = ({ title, badge, badgeColor = 'bg-rose-100 text-rose-700', subtitle, children }) => (
  <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex flex-wrap items-start gap-3 mb-4 sm:mb-6">
      <div className="flex-1 min-w-0">
        <h3 className="text-base sm:text-lg font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {badge !== undefined && (
        <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
          {badge} farmers
        </span>
      )}
    </div>
    <div className="h-64 sm:h-72 w-full">
      {children}
    </div>
  </div>
);

/* ── Custom X-axis tick that wraps long remark text ──────────────────── */
const WrappedTick = ({ x, y, payload }) => {
  const MAX_CHARS = 12;
  const words = String(payload.value).split(' ');
  const lines = [];
  let line = '';
  words.forEach(w => {
    const candidate = line ? `${line} ${w}` : w;
    if (candidate.length > MAX_CHARS && line) {
      lines.push(line);
      line = w;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((l, i) => (
        <text
          key={i}
          x={0}
          y={0}
          dy={12 + i * 14}
          textAnchor="middle"
          fill="#64748b"
          fontSize={11}
        >
          {l}
        </text>
      ))}
    </g>
  );
};

/* ══════════════════════════════════════════════════════════════════════ */
const AnalyticsCharts = ({ charts }) => {
  const remarksData    = charts.remarksData    || [];
  const rejectedData   = charts.rejectedByRemark || remarksData;
  const totalDeleted   = remarksData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">

      {/* ── ROW 1: 2-column grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">



        {/* Yield per Taluk */}
        <ChartCard title="Expected Yield per Taluk (MT)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.talukYield} margin={{ top: 5, right: 30, left: 0, bottom: 5 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={120} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Yield (MT)" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24}>
                <LabelList dataKey="value" position="right" fill="#64748b" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Procurement Status */}
        <ChartCard title="Procurement Status Overview">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.procurement}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ value, cx, cy, midAngle, outerRadius, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius * 1.25;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text x={x} y={y} fill={COLORS[index % COLORS.length]} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14} fontWeight="bold">
                      {value}
                    </text>
                  );
                }}
                labelLine={false}
              >
                {(charts.procurement || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Supervisor Performance */}
        <ChartCard title="Supervisor Performance Comparison">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.supervisorComparison} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Bar yAxisId="left" dataKey="yield" name="Yield (MT)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20}>
                <LabelList dataKey="yield" position="top" fill="#64748b" fontSize={11} offset={5} />
              </Bar>
              <Bar yAxisId="right" dataKey="farmers" name="Farmer Count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20}>
                <LabelList dataKey="farmers" position="top" fill="#64748b" fontSize={11} offset={5} />
              </Bar>
              <Bar yAxisId="left" dataKey="acres" name="Acres" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20}>
                <LabelList dataKey="acres" position="top" fill="#64748b" fontSize={11} offset={5} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>{/* end 2-col grid */}

      {/* ── FULL-WIDTH: Rejected Farmers horizontal breakdown ─────────── */}
      {rejectedData.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-rose-100 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Rejected Farmers — Full Breakdown by Remark
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Each bar = one rejection reason from the "Deleted Farmers" sheet · Count shown on the right
              </p>
            </div>
            <span className="shrink-0 px-3 py-1 bg-rose-600 text-white text-sm font-bold rounded-full shadow">
              {totalDeleted} Total Deleted
            </span>
          </div>

          {/* Dynamic height: at least 220 px, then 52 px per remark */}
          <div style={{ height: Math.max(220, rejectedData.length * 52) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rejectedData}
                layout="vertical"
                margin={{ top: 4, right: 100, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#334155', fontSize: 13, fontWeight: 500 }}
                  width={210}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#fef2f2' }} />
                <Bar dataKey="value" name="Farmers Deleted" radius={[0, 6, 6, 0]} barSize={30} isAnimationActive>
                  {rejectedData.map((_, index) => (
                    <Cell key={`h-${index}`} fill={REMARK_COLORS[index % REMARK_COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={v => `${v} farmer${v !== 1 ? 's' : ''}`}
                    style={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};

export default AnalyticsCharts;
