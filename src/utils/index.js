import { W } from '../constants';

// ── String cleaner ────────────────────────────────────────────────
export const superClean = (val) => {
  if (val === null || val === undefined) return '';
  if (Array.isArray(val)) return superClean(val[0]);
  if (typeof val === 'object') {
    const k = Object.keys(val)[0];
    return k ? superClean(val[k]) : '';
  }
  return String(val);
};

// ── Extract history from various n8n response shapes ─────────────
export const extractHistory = (rawJson, setDebug) => {
  const debugStr = JSON.stringify(rawJson, null, 2).slice(0, 800);
  if (setDebug) setDebug(debugStr);
  console.log('[Tank] Raw response:', debugStr);

  if (Array.isArray(rawJson) && rawJson[0]?.json?.history) return rawJson[0].json.history;
  if (Array.isArray(rawJson) && rawJson[0]?.history)       return rawJson[0].history;
  if (Array.isArray(rawJson) && rawJson[0]?.tank_name) return rawJson;
  if (rawJson?.json?.history) return rawJson.json.history;
  if (rawJson?.history)       return rawJson.history;
  if (rawJson?.data)          return Array.isArray(rawJson.data) ? rawJson.data : [];
  if (Array.isArray(rawJson)) return rawJson;
  return [];
};

// ── Normalize one raw DB record into a clean flat object ──────────
export const processItem = (item) => {
  let anomaly = item.anomalies || item.anomaly || {};
  if (typeof anomaly === 'string') {
    try { anomaly = JSON.parse(anomaly); } catch { anomaly = {}; }
  }
  const anomalyArr   = Array.isArray(anomaly) ? anomaly : (anomaly && Object.keys(anomaly).length ? [anomaly] : []);
  const firstAnomaly = anomalyArr[0] || {};
  const rawLevel     = superClean(item.level || item.status || firstAnomaly.level || '');

  return {
    ...item,
    tank_name: superClean(item.tank_name) || 'Unknown Room',
    level:         rawLevel || 'Normal',
    temperature:   superClean(item.temperature  || firstAnomaly.temperature || firstAnomaly.temp  || '0'),
    humidity:      superClean(item.humidity     || firstAnomaly.humidity    || firstAnomaly.humid || '0'),
    timestamp:     superClean(item.created_at   || item.timestamp || ''),
    anomaly_temp:  superClean(firstAnomaly.temperature || firstAnomaly.temp  || item.temperature  || '0'),
    anomaly_humid: superClean(firstAnomaly.humidity    || firstAnomaly.humid || item.humidity     || '0'),
    anomaly_time:  superClean(firstAnomaly.timestamp   || firstAnomaly.time  || item.timestamp    || ''),
    _rawAnomalies: anomalyArr,
  };
};

// ── Sort comparator by timestamp (latest first) ───────────────────
export const sortByTimestamp = (a, b) => {
  const rA = a.created_at || a.timestamp || '';
  const rB = b.created_at || b.timestamp || '';
  const tA = rA ? new Date(rA).getTime() : NaN;
  const tB = rB ? new Date(rB).getTime() : NaN;
  if (!isNaN(tA) && !isNaN(tB)) return tB - tA;
  if (!isNaN(tA)) return -1;
  if (!isNaN(tB)) return 1;
  return (b._originalIndex || 0) - (a._originalIndex || 0);
};

// ── Filter records within time window using created_at ────────────
export const isWithinWindow = (record, windowMs) => {
  if (windowMs === W.ALL) return true;
  const raw = record.created_at || record.timestamp || '';
  if (!raw) return true;
  const t = new Date(raw).getTime();
  return !isNaN(t) && Date.now() - t <= windowMs;
};

// ── Build sorted+filtered log list for a room ─────────────────────
export const buildLogs = (allHistory, roomName, windowMs) => {
  return (allHistory || [])
    .filter(h => h.tank_name === roomName)
    .filter(h => isWithinWindow(h, windowMs))
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
};

// ── Extract number from room name for natural sort ────────────────
export const extractRoomNumber = (name) => {
  const match = String(name || '').match(/(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
};