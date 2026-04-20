import { useState, useEffect, useCallback } from 'react';

const LIVE_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || null;
const POLL_INTERVAL_MS = 60_000; // re-fetch every 60 seconds

export const useSheetData = () => {
  const [data, setData]           = useState({ active: [], deleted: [] });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchData = useCallback(async () => {
    if (!LIVE_URL) {
      // No URL configured – don't show mock, just show empty state
      setData({ active: [], deleted: [] });
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

      // ── Detect the two supported response shapes ──────────────────────────
      // Shape A (new):  { allFarmers: [...], deletedFarmers: [...] }
      // Shape B (old):  flat array of farmer objects
      let active  = [];
      let deleted = [];

      if (json && json.error) {
        throw new Error(`Apps Script error: ${json.error}`);
      } else if (Array.isArray(json)) {
        // Shape B – flat array (old script, only active farmers)
        active  = json;
        deleted = [];
      } else if (json && Array.isArray(json.allFarmers)) {
        // Shape A – new structured response
        active  = json.allFarmers     || [];
        deleted = json.deletedFarmers || [];
      } else {
        throw new Error('Unexpected response format from Apps Script.');
      }

      // Filter out truly empty rows just in case
      const cleanRow = (r) =>
        r &&
        (r['Farmer name'] || r['Farmer Name'] || '').toString().trim() !== '';

      setData({ active: active.filter(cleanRow), deleted: deleted.filter(cleanRow) });
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
