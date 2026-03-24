import { useState, useEffect, useRef } from 'react';
import { N8N_URL } from '../constants';
import { extractHistory, processItem, sortByTimestamp, extractRoomNumber, superClean } from '../utils';

export const useTankData = () => {
  const [history,      setHistory]      = useState([]);
  const [allHistory,   setAllHistory]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [rawDebug,     setRawDebug]     = useState(null);
  const timerRef = useRef(null);

  const fetchData = async () => {
    setError(null);
    try {
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 10000);
      const res        = await fetch(N8N_URL, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

      const rawJson    = await res.json();
      const rawHistory = extractHistory(rawJson, setRawDebug);

      if (!Array.isArray(rawHistory) || rawHistory.length === 0) {
        console.warn('[Tank] Empty history from webhook');
        setLoading(false);
        return;
      }

      const processed = rawHistory.map(processItem);
      console.log('[Tank] Sample processed record:', processed[0]);
      setAllHistory(processed);

      // One entry per room (latest), sorted by room number
      const map = new Map();
      processed.forEach(item => map.set(item.tank_name, item));
      const rooms = Array.from(map.values()).sort((a, b) => {
        const nA = extractRoomNumber(a.tank_name);
        const nB = extractRoomNumber(b.tank_name);
        if (nA !== nB) return nA - nB;
        return String(a.tank_name).localeCompare(b.tank_name);
      });

      console.log(`[Tank] ${rooms.length} rooms:`, rooms.map(r => `${r.tank_name}(${r.level})`));
      setHistory(rooms);
      setLoading(false);

    } catch (err) {
      console.error('[Tank] Fetch error:', err);
      setError(err.name === 'AbortError'
        ? 'Request timed out (10s). Check your n8n webhook is running.'
        : (err.message || 'Unknown fetch error'));
      setLoading(false);
    }
  };

  // Build room logs when user selects a room (used by App to pass selectedRoom)
  const buildRoomLogs = (room) => {
    const logs = allHistory
      .filter(h => h.tank_name === room.tank_name)
      .map((log, idx) => ({
        ...log,
        _originalIndex: idx,
        anomalies: (log._rawAnomalies || []).map(a => ({
          t:    superClean(a.temperature || a.temp  || ''),
          h:    superClean(a.humidity    || a.humid || ''),
          time: superClean(a.created_at  || a.timestamp || a.time || ''),
        })),
      }))
      .sort(sortByTimestamp);

    console.log('[Tank] Room logs built:', logs.length, 'entries');
    return { ...room, logs };
  };

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, 15000);
    return () => clearInterval(timerRef.current);
  }, []);

  return { history, allHistory, loading, error, rawDebug, fetchData, buildRoomLogs };
};