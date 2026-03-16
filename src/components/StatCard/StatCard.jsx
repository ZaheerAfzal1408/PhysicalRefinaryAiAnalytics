import React from 'react';
import './StatCard.css';

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
      className={`stat-card${onClick ? ' stat-card--clickable' : ''}`}
      style={{ borderTop: `5px solid ${c.border}` }}
    >
      <div className="stat-card__top">
        <div className="stat-card__icon-wrap" style={{ background: c.icon, color: c.text }}>
          {Icon ? <Icon size={20} /> : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          )}
        </div>
        <span className="pulse-dot" style={{ '--dot-color': c.dot }} />
      </div>

      <div>
        <div className="stat-card__label">{title}</div>
        <div className="stat-card__value-row">
          <div className="stat-card__value">{value}</div>
          {trendDir && (
            <span className="stat-card__trend-dir" style={{ color: c.text }}>{trendDir}</span>
          )}
        </div>
        {subtitle && <div className="stat-card__subtitle">{subtitle}</div>}
      </div>

      {trend && trend.length >= 2 && <Sparkline data={trend} color={c.border} />}
    </div>
  );
};

export default StatCard;
