import { useState, useEffect, useCallback } from 'react';

const LIVE_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || null;
const POLL_INTERVAL_MS = 60_000; // re-fetch every 60 seconds

export const useSheetData = () => {
  const [data, setData]           = useState({ active: [], deleted: [], initial: [] });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchData = useCallback(async () => {
    if (!LIVE_URL) {
      // No URL configured – don't show mock, just show empty state
      setData({ active: [], deleted: [], initial: [] });
      setIsUsingMock(false);
      setError('No Google Sheets URL configured. Add VITE_GOOGLE_SHEETS_URL to your .env file.');
      setLoading(false);
      return;
    }

    try {
      // Use native fetch – more reliable with Google's redirect/CORS chain than axios
      const response = await fetch(LIVE_URL, {
        method: 'GET',
        redirect: 'follow', // follow Google's 302 redirect automatically
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
        // Google sometimes returns HTML (e.g. sign-in page) when the script isn't public
        const text = await response.text();
        if (text.trim().startsWith('<')) {
          throw new Error(
            'Google Apps Script returned an HTML page instead of JSON. ' +
            'Make sure the script is deployed with "Anyone" access (not "Anyone with a Google account").'
          );
        }
      }

      const json = await response.json();

      // ── Debug: log all top-level keys from Apps Script ──────────────────
      if (!Array.isArray(json) && typeof json === 'object') {
        console.log('[useSheetData] Apps Script response keys:', Object.keys(json));
      }

      // ── Detect supported response shapes ──────────────────────────────────
      // Shape A: Flat array             → old single-sheet script
      // Shape B: { value: [...] }       → Apps Script default JSON wrapper
      // Shape C: { allFarmers, deletedFarmers, initialFarmers } → new multi-sheet script
      let active  = [];
      let deleted = [];
      let initial = [];

      if (json && json.error) {
        throw new Error(`Apps Script error: ${json.error}`);
      } else if (Array.isArray(json)) {
        // Shape A
        active = json;
      } else if (json && typeof json === 'object') {
        // Shape C takes priority, then Shape B fallback for active
        active  = json.allFarmers     || json.all      || json.ALL     || json.value || [];
        deleted = json.deletedFarmers || json.deleted  || json.Deleted || [];
        initial = json.initialFarmers || json.initial  || json.Initial || json.INITIAL || [];
        console.log(`[useSheetData] Loaded: ${active.length} active, ${deleted.length} deleted, ${initial.length} initial`);
      } else {
        throw new Error('Unexpected response format from Apps Script.');
      }

      // Filter out truly empty rows – robust check for any identification column
      const cleanRow = (r) => {
        if (!r) return false;
        const searchKeys = ['farmer name', 'farmer name ', 'farmer', 'name'];
        const val = Object.keys(r).find(k => searchKeys.includes(k.trim().toLowerCase()));
        return val ? String(r[val]).trim() !== '' : true; // Keep if we can't find a name col, filter if we can and it's empty
      };

      setData({ 
        active: active.filter(cleanRow), 
        deleted: deleted.filter(cleanRow),
        initial: initial.filter(cleanRow)
      });
      setIsUsingMock(false);
      setError(null);
      setLastFetched(new Date());

    } catch (err) {
      console.error('[useSheetData] Fetch failed:', err);
      setError(err.message || 'Failed to load data from Google Sheets.');
      // Do NOT fall back to mock – show real error so the user knows
      // (data stays as whatever it was before, so the UI doesn't blank out on a transient error)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, loading, error, isUsingMock, lastFetched, refetch: fetchData };
};
