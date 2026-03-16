import React from 'react';
import './Primitives.css'

// ── Sparkline SVG ─────────────────────────────────────────────────
export const Spark = ({ data, color, width = 80, height = 28 }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`
  ).join(' ');
  const lastY = height - ((data[data.length - 1] - min) / range) * height;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={lastY} r="2.5" fill={color} />
    </svg>
  );
};

// ── Dark-theme button (used in modals) ────────────────────────────
export const Btn = ({ active, disabled, onClick, children }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`modal-btn${active ? ' modal-btn--active' : ''}${disabled ? ' modal-btn--disabled' : ''}`}
  >
    {children}
  </button>
);