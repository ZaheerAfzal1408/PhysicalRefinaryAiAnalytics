// ── API ───────────────────────────────────────────────────────────
export const N8N_URL = 'https://n8n.srv800629.hstgr.cloud/webhook/get-tank-data';

// ── Time windows (ms) ─────────────────────────────────────────────
export const W = {
  H1: 1 * 60 * 60 * 1000,
  H6: 6 * 60 * 60 * 1000,
  H12: 12 * 60 * 60 * 1000,
  H24: 24 * 60 * 60 * 1000,
  D7: 7 * 24 * 60 * 60 * 1000,
  D30: 30 * 24 * 60 * 60 * 1000,
  D90: 90 * 24 * 60 * 60 * 1000,
  ALL: Infinity,
};

export const TIME_PERIODS = [
  { label: '1h', ms: W.H1 },
  { label: '6h', ms: W.H6 },
  { label: '12h', ms: W.H12 },
  { label: '24h', ms: W.H24 },
  { label: '7d', ms: W.D7 },
  { label: '30d', ms: W.D30 },
  { label: '90d', ms: W.D90 },
  { label: 'All', ms: W.ALL },
];

export const INTERVALS = [
  { label: '5m', ms: 5 * 60 * 1000 },
  { label: '15m', ms: 15 * 60 * 1000 },
  { label: '30m', ms: 30 * 60 * 1000 },
  { label: '1h', ms: 60 * 60 * 1000 },
  { label: '6h', ms: 6 * 60 * 60 * 1000 },
  { label: '12h', ms: 12 * 60 * 60 * 1000 },
  { label: '1d', ms: 24 * 60 * 60 * 1000 },
  { label: '1w', ms: 7 * 24 * 60 * 60 * 1000 },
];

// ── Level colours ─────────────────────────────────────────────────
export const LC = {
  normal: { hex: '#22c55e', bg: '#f0fdf4', textHex: '#16a34a', border: '#22c55e', badge: '#dcfce7', dot: '#22c55e', label: 'Normal' },
  warning: { hex: '#f59e0b', bg: '#fffbeb', textHex: '#d97706', border: '#f59e0b', badge: '#fef3c7', dot: '#f59e0b', label: 'Warning' },
  critical: { hex: '#ef4444', bg: '#fef2f2', textHex: '#dc2626', border: '#ef4444', badge: '#fee2e2', dot: '#ef4444', label: 'Critical' },
  error: { hex: '#ef4444', bg: '#fef2f2', textHex: '#dc2626', border: '#ef4444', badge: '#fee2e2', dot: '#ef4444', label: 'Critical' },
};

export const getLC = (lvl) => LC[String(lvl || '').toLowerCase()] || LC.normal;

export const windowLabel = (ms) => {
  if (ms === W.ALL) return 'All time';
  const p = TIME_PERIODS.find(p => p.ms === ms);
  return p ? `Last ${p.label}` : 'Custom';
};