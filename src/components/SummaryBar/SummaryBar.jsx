import React from 'react';
import './SummaryBar.css';

const BARS = [
  { label: 'Critical Events', key: 'critical', color: '#ef4444', bg: '#fef2f2' },
  { label: 'Warnings',        key: 'warning',  color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Stable Logs',     key: 'normal',   color: '#22c55e', bg: '#f0fdf4' },
];

const SummaryBar = ({ logs }) => {
  const counts = { critical: 0, warning: 0, normal: 0 };
  (logs || []).forEach(l => {
    const lv = String(l.level || '').toLowerCase();
    if (lv === 'critical' || lv === 'error') counts.critical++;
    else if (lv === 'warning') counts.warning++;
    else counts.normal++;
  });

  return (
    <div className="summary-bar">
      {BARS.map(({ label, key, color, bg }) => (
        <div
          key={label}
          className="summary-bar__card"
          style={{ background: bg, borderTopColor: color }}
        >
          <div className="summary-bar__label" style={{ color }}>{label}</div>
          <div className="summary-bar__count">{counts[key]}</div>
        </div>
      ))}
    </div>
  );
};

export default SummaryBar;
