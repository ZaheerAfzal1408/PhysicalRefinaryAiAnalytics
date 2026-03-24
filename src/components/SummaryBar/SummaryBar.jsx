import React from 'react';

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
    <div className="grid grid-cols-3 gap-[14px] mb-7">
      {BARS.map(({ label, key, color, bg }) => (
        <div
          key={label}
          className="rounded-[18px] p-4 border-t-4"
          style={{ background: bg, borderTopColor: color }}
        >
          <div className="text-[9px] font-black uppercase tracking-[0.14em] mb-1" style={{ color }}>{label}</div>
          <div className="text-[30px] font-black text-slate-900 italic">{counts[key]}</div>
        </div>
      ))}
    </div>
  );
};

export default SummaryBar;
