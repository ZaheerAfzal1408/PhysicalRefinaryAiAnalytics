import React from 'react';

const Sparkline = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const w = 64, h = 24;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`
  ).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={w}
        cy={h - ((data[data.length - 1] - min) / range) * h}
        r="2.5"
        fill={color}
      />
    </svg>
  );
};

const COLORS = {
  normal: { border: '#22c55e', bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e', icon: '#dcfce7' },
  warning: { border: '#f59e0b', bg: '#fffbeb', text: '#d97706', dot: '#f59e0b', icon: '#fef3c7' },
  critical: { border: '#ef4444', bg: '#fef2f2', text: '#dc2626', dot: '#ef4444', icon: '#fee2e2' },
};

export const StatCard = ({ title, value, icon: Icon, level, subtitle, trend, onClick }) => {
  const lKey = String(level || 'normal').toLowerCase();
  const c = COLORS[lKey] || COLORS.normal;
  const trendDir = trend && trend.length >= 2
    ? trend[trend.length - 1] > trend[0] ? '↑' : trend[trend.length - 1] < trend[0] ? '↓' : '→'
    : null;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[22px] px-[22px] py-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex flex-col gap-3.5 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ borderTop: `5px solid ${c.border}` }}
    >
      <div className="flex justify-between items-start">
        <div className="rounded-[14px] p-2.5" style={{ background: c.icon, color: c.text }}>
          {Icon ? <Icon size={20} /> : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          )}
        </div>
        <span className="pulse-dot" style={{ '--dot-color': c.dot }} />
      </div>

      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mb-[3px]">{title}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-[30px] font-black text-slate-900 leading-none italic">{value}</div>
          {trendDir && (
            <span className="text-[13px] font-black" style={{ color: c.text }}>{trendDir}</span>
          )}
        </div>
        {subtitle && <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{subtitle}</div>}
      </div>

      {trend && trend.length >= 2 && <Sparkline data={trend} color={c.border} />}
    </div>
  );
};

export default StatCard;
