import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────────────────── */

// Keys added internally by the transformer — never show these
const INTERNAL_KEYS = new Set(['_numericAcre', '_numericYield', 'rowNumber']);

// Given an array of row objects, return the ordered list of visible column names
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

// Format a cell value for display
const formatCell = (val) => {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return String(val);
};

/* ── Cell chip for procurement/status fields ─────────────────────────── */
const Chip = ({ value }) => {
  const v = String(value).toLowerCase();
  let cls = 'bg-slate-100 text-slate-600';
  if (v.includes('procured'))        cls = 'bg-emerald-100 text-emerald-700';
  else if (v.includes('new'))        cls = 'bg-blue-100 text-blue-700';
  else if (v.includes('not purch'))  cls = 'bg-amber-100 text-amber-700';
  else if (v.includes('sold'))       cls = 'bg-purple-100 text-purple-700';
  else if (v.includes('confirmed'))  cls = 'bg-emerald-100 text-emerald-700';
  else if (v.includes('yet'))        cls = 'bg-amber-100 text-amber-700';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${cls}`}>
      {String(value)}
    </span>
  );
};

const STATUS_COLS = new Set([
  'procurement status', 'procurement_status', 'status',
]);

/* ══════════════════════════════════════════════════════════════════════ */
const FarmerGrid = ({ farmers = [], deletedFarmers = [] }) => {
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterVillage, setFilterVillage] = useState('All');
  const [activeSheet, setActiveSheet]   = useState('ALL');

  /* ── Tabs: ALL + each unique supervisor + Deleted Farmers ──────────── */
  const sheets = useMemo(() => {
    const supervisors = [
      ...new Set(farmers.map(f =>
        f['Assingned to'] || f['Assigned to'] || f['Assigned To'] || ''
      ).filter(Boolean))
    ].sort();
    return ['ALL', ...supervisors, 'Deleted Farmers'];
  }, [farmers]);

  /* ── Active row set ────────────────────────────────────────────────── */
  const activeRows = useMemo(() => {
    if (activeSheet === 'Deleted Farmers') return deletedFarmers;
    if (activeSheet === 'ALL') return farmers;
    return farmers.filter(f =>
      (f['Assingned to'] || f['Assigned to'] || f['Assigned To'] || '') === activeSheet
    );
  }, [farmers, deletedFarmers, activeSheet]);

  /* ── Columns: derived from the active row set ──────────────────────── */
  const columns = useMemo(() => deriveColumns(activeRows), [activeRows]);

  /* ── Village filter options ────────────────────────────────────────── */
  const villages = useMemo(() => {
    const vs = [...new Set(activeRows.map(f => f['Village'] || '').filter(Boolean))].sort();
    return ['All', ...vs];
  }, [activeRows]);

  // Reset village filter when sheet changes
  React.useEffect(() => { setFilterVillage('All'); }, [activeSheet]);

  /* ── Filtered rows ─────────────────────────────────────────────────── */
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

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">

      {/* ── Sheet Tabs ────────────────────────────────────────────────── */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 pt-2 px-2 gap-1 scrollbar-hide">
        {sheets.map(sheet => (
          <button
            key={sheet}
            onClick={() => setActiveSheet(sheet)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeSheet === sheet
                ? sheet === 'Deleted Farmers'
                  ? 'bg-white text-rose-600 border-rose-500 shadow-sm'
                  : 'bg-white text-emerald-700 border-emerald-500 shadow-sm'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100/60'
            }`}
          >
            {sheet === 'ALL' ? '📋 ALL' : sheet === 'Deleted Farmers' ? '🗑️ Deleted Farmers' : `👤 ${sheet}`}
          </button>
        ))}
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search across all columns…"
            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2.5">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Village filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              value={filterVillage}
              onChange={e => setFilterVillage(e.target.value)}
            >
              {villages.map(v => (
                <option key={v} value={v}>{v === 'All' ? 'All Villages' : v}</option>
              ))}
            </select>
          </div>

          {/* Row count */}
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
            {filteredRows.length} rows
          </span>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                #
              </th>
              {columns.map(col => (
                <th
                  key={col}
                  className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.length > 0 ? (
              filteredRows.map((row, i) => (
                <tr
                  key={i}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    activeSheet === 'Deleted Farmers' ? 'bg-rose-50/20' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">{i + 1}</td>
                  {columns.map(col => {
                    const val = row[col];
                    const isStatus = STATUS_COLS.has(col.toLowerCase());
                    return (
                      <td key={col} className="px-4 py-3 whitespace-nowrap max-w-xs">
                        {isStatus && val ? (
                          <Chip value={val} />
                        ) : (
                          <span className={`text-sm ${
                            col === 'Farmer name' || col === 'Farmer Name'
                              ? 'font-semibold text-slate-800'
                              : 'text-slate-600'
                          }`}>
                            {formatCell(val)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-16 text-center text-slate-400"
                >
                  {searchTerm || filterVillage !== 'All'
                    ? 'No rows match the current filters.'
                    : 'No data in this sheet yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FarmerGrid;
