import React, { useState, useMemo } from 'react';
import { Search, Filter, X, ChevronRight, ChevronLeft } from 'lucide-react';

const INTERNAL_KEYS = new Set(['_numericAcre', '_numericYield', 'rowNumber']);

const deriveColumns = (rows) => {
  if (!rows || rows.length === 0) return [];
  const seen = new Set();
  const cols = [];
  rows.forEach(row => {
    Object.keys(row).forEach(k => {
      if (!INTERNAL_KEYS.has(k) && !seen.has(k)) {
        seen.add(k);
        cols.push(k);
      }
    });
  });
  return cols;
};

const formatCell = (val) => {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return String(val);
};

const Chip = ({ value }) => {
  const v = String(value).toLowerCase();
  let cls = 'bg-slate-100 text-slate-600';
  if (v.includes('procured'))        cls = 'bg-emerald-500 text-white shadow-sm shadow-emerald-100';
  else if (v.includes('new'))        cls = 'bg-blue-500 text-white shadow-sm shadow-blue-100';
  else if (v.includes('not purch'))  cls = 'bg-amber-500 text-white shadow-sm shadow-amber-100';
  else if (v.includes('sold'))       cls = 'bg-purple-500 text-white shadow-sm shadow-purple-100';
  else if (v.includes('confirmed'))  cls = 'bg-emerald-600 text-white';
  else if (v.includes('yet'))        cls = 'bg-slate-700 text-white';
  return (
    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${cls}`}>
      {String(value)}
    </span>
  );
};

const STATUS_COLS = new Set(['procurement status', 'procurement_status', 'status']);

const FarmerGrid = ({ farmers = [], deletedFarmers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVillage, setFilterVillage] = useState('All');
  const [activeSheet, setActiveSheet] = useState('ALL');

  const sheets = useMemo(() => {
    const supervisors = [
      ...new Set(farmers.map(f =>
        f['Assingned to'] || f['Assigned to'] || f['Assigned To'] || ''
      ).filter(Boolean))
    ].sort();
    return ['ALL', ...supervisors, 'Deleted Farmers'];
  }, [farmers]);

  const activeRows = useMemo(() => {
    if (activeSheet === 'Deleted Farmers') return deletedFarmers;
    if (activeSheet === 'ALL') return farmers;
    return farmers.filter(f =>
      (f['Assingned to'] || f['Assigned to'] || f['Assigned To'] || '') === activeSheet
    );
  }, [farmers, deletedFarmers, activeSheet]);

  const columns = useMemo(() => deriveColumns(activeRows), [activeRows]);

  const villages = useMemo(() => {
    const vs = [...new Set(activeRows.map(f => f['Village'] || '').filter(Boolean))].sort();
    return ['All', ...vs];
  }, [activeRows]);

  React.useEffect(() => { setFilterVillage('All'); }, [activeSheet]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return activeRows.filter(row => {
      const matchSearch = !term || Object.values(row).some(v =>
        String(v).toLowerCase().includes(term)
      );
      const matchVillage = filterVillage === 'All' || (row['Village'] || '') === filterVillage;
      return matchSearch && matchVillage;
    });
  }, [activeRows, searchTerm, filterVillage]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all duration-300">
      
      {/* ── MOBILE SCROLLABLE TABS ─────────────────────────────────── */}
      <div className="bg-slate-50 p-2 border-b border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {sheets.map(sheet => {
            const isActive = activeSheet === sheet;
            const isDeleted = sheet === 'Deleted Farmers';
            return (
              <button
                key={sheet}
                onClick={() => setActiveSheet(sheet)}
                className={`shrink-0 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${
                  isActive
                    ? isDeleted 
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' 
                      : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-white text-slate-400 hover:text-slate-700 hover:shadow-sm border border-slate-100'
                }`}
              >
                {sheet}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-6 border-b border-slate-50 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across records..."
              className="w-full pl-11 pr-10 py-3 sm:py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
            <div className="flex items-center gap-2 shrink-0 bg-slate-50 px-4 py-3 sm:py-4 rounded-2xl border border-slate-100">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                className="bg-transparent border-none text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600 focus:ring-0 cursor-pointer"
                value={filterVillage}
                onChange={e => setFilterVillage(e.target.value)}
              >
                {villages.map(v => (
                  <option key={v} value={v}>{v === 'All' ? 'Villages' : v}</option>
                ))}
              </select>
            </div>
            <div className="shrink-0 bg-emerald-50 text-emerald-700 px-4 py-3 sm:py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100">
              {filteredRows.length} Records
            </div>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE ──────────────────────────────────────────────── */}
      <div className="overflow-x-auto thin-scroll relative">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="sticky left-0 z-20 bg-slate-50/95 backdrop-blur-sm px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">
                #
              </th>
              {columns.map((col, idx) => {
                const isName = col.toLowerCase().includes('name');
                return (
                  <th
                    key={col}
                    className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap ${
                      isName ? 'sticky left-[45px] z-20 bg-slate-50/95 backdrop-blur-sm border-r border-slate-100' : ''
                    }`}
                  >
                    {col}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRows.length > 0 ? (
              filteredRows.map((row, i) => (
                <tr key={i} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 px-4 py-4 text-[10px] font-black text-slate-300 font-mono border-r border-slate-100">
                    {String(i + 1).padStart(3, '0')}
                  </td>
                  {columns.map((col, idx) => {
                    const val = row[col];
                    const isStatus = STATUS_COLS.has(col.toLowerCase());
                    const isName = col.toLowerCase().includes('name');
                    return (
                      <td 
                        key={col} 
                        className={`px-6 py-4 whitespace-nowrap ${
                          isName ? 'sticky left-[45px] z-10 bg-white group-hover:bg-slate-50/80 font-black text-slate-900 text-sm border-r border-slate-100 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]' : 'text-slate-600 text-sm font-medium'
                        }`}
                      >
                        {isStatus && val ? <Chip value={val} /> : formatCell(val)}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <X className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No records match your filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Mobile Interaction Hint */}
      <div className="sm:hidden px-6 py-3 bg-slate-50 flex items-center justify-center gap-2">
        <ChevronLeft className="w-3 h-3 text-slate-300 animate-pulse" />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Swipe left to see more columns</span>
        <ChevronRight className="w-3 h-3 text-slate-300 animate-pulse" />
      </div>
    </div>
  );
};

export default FarmerGrid;
