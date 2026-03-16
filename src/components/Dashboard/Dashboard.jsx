import React, { useState } from 'react';
import StatCard from '../StatCard/StatCard';
import Chatbot from '../Chatbot/Chatbot';
import './Dashboard.css';

// ── Tiny sparkline ────────────────────────────────────────────────
const Spark = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const w = 72, h = 26;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`
  ).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * h} r="3" fill={color} />
    </svg>
  );
};

// ── Level config ──────────────────────────────────────────────────
const LC = {
  normal:   { border: '#22c55e', bg: '#f0fdf4', text: '#16a34a', badge: '#dcfce7', dot: '#22c55e', label: 'Normal' },
  warning:  { border: '#f59e0b', bg: '#fffbeb', text: '#d97706', badge: '#fef3c7', dot: '#f59e0b', label: 'Warning' },
  critical: { border: '#ef4444', bg: '#fef2f2', text: '#dc2626', badge: '#fee2e2', dot: '#ef4444', label: 'Critical' },
  error:    { border: '#ef4444', bg: '#fef2f2', text: '#dc2626', badge: '#fee2e2', dot: '#ef4444', label: 'Critical' },
};

const getLC = (lvl) => LC[String(lvl || '').toLowerCase()] || LC.normal;

// ── Status icon ───────────────────────────────────────────────────
const StatusIcon = ({ level, size = 28 }) => {
  const l = String(level || '').toLowerCase();
  if (l === 'critical' || l === 'error') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
  if (l === 'warning') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
};

// ── Alert strip ───────────────────────────────────────────────────
const AlertStrip = ({ rooms }) => {
  const active = rooms.filter(r => {
    const l = String(r.level || '').toLowerCase();
    return l === 'critical' || l === 'error' || l === 'warning';
  });
  if (!active.length) return null;

  return (
    <div className="alert-strip">
      <span className="alert-strip__label">Active Alerts</span>
      {active.map((r, i) => {
        const lc = getLC(r.level);
        return (
          <div
            key={i}
            className="alert-strip__badge"
            style={{ background: lc.bg, border: `1px solid ${lc.border}40` }}
          >
            <span className="pulse-dot" style={{ '--dot-color': lc.dot }} />
            <span className="alert-strip__room-name">{r.coldroom_name}</span>
            <span className="alert-strip__temp" style={{ color: lc.text }}>{r.anomaly_temp}°C</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Room card ─────────────────────────────────────────────────────
const RoomCard = ({ room, onSelectRoom, idx }) => {
  const lc = getLC(room.level);

  const fakeTemp = parseFloat(room.anomaly_temp) || 0;
  const trend = [fakeTemp + 2, fakeTemp + 1.2, fakeTemp + 0.5, fakeTemp + 0.1, fakeTemp];

  return (
    <div
      className="room-card room-card-fadein"
      style={{ '--delay': `${idx * 0.1}s`, borderTop: `10px solid ${lc.border}` }}
      onClick={() => onSelectRoom(room)}
    >
      {/* Top: icon + badge */}
      <div className="room-card__top">
        <div className="room-card__icon-wrap" style={{ background: lc.bg, color: lc.text }}>
          <StatusIcon level={room.level} size={28} />
        </div>
        <div className="room-card__badge-wrap">
          <span className="pulse-dot" style={{ '--dot-color': lc.dot }} />
          <span
            className="room-card__badge"
            style={{ background: lc.badge, color: lc.text }}
          >
            {lc.label}
          </span>
        </div>
      </div>

      {/* Room name */}
      <h3 className="room-card__name">{room.coldroom_name}</h3>

      {/* Metric tiles */}
      <div className="room-card__metrics">
        {[
          { label: 'Temperature', value: `${room.anomaly_temp || room.temperature || 'N/A'}°C`, t: trend },
          { label: 'Humidity',    value: `${room.anomaly_humid || room.humidity || 'N/A'}%`,    t: trend.map(v => v + 40) },
        ].map(({ label, value, t }) => (
          <div key={label} className="room-card__metric-tile">
            <div className="room-card__metric-label">{label}</div>
            <div className="room-card__metric-value">{value}</div>
            <Spark data={t} color={lc.border} />
          </div>
        ))}
      </div>

      {/* Thermal bar */}
      <div className="room-card__thermal">
        <div className="room-card__thermal-header">
          <span className="room-card__thermal-label">Thermal Load</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: lc.text }}>
            {Math.abs(parseFloat(room.anomaly_temp || room.temperature) || 0).toFixed(1)}°
          </span>
        </div>
        <div className="room-card__thermal-track">
          <div
            className="room-card__thermal-fill"
            style={{
              width: `${Math.min(100, (Math.abs(parseFloat(room.anomaly_temp || room.temperature) || 0) / 30) * 100)}%`,
              background: lc.border,
            }}
          />
        </div>
      </div>

      {/* Incident log */}
      <div className="room-card__incident">
        <div className="room-card__incident-header">
          <span className="room-card__incident-title">Incident Log</span>
          {room.anomaly_time && (
            <span className="room-card__incident-time">
              {new Date(room.anomaly_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="room-card__incident-body">
          {(room.anomaly_temp || room.temperature)
            ? `T: ${room.anomaly_temp || room.temperature}°C | H: ${room.anomaly_humid || room.humidity || 'N/A'}%`
            : <span className="room-card__incident-empty">No anomalies recorded</span>}
        </div>
      </div>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────
const Dashboard = ({ rooms, onSelectRoom }) => {
  const critical = rooms.filter(r => { const l = String(r.level || '').toLowerCase(); return l === 'critical' || l === 'error'; }).length;
  const warnings = rooms.filter(r => String(r.level || '').toLowerCase() === 'warning').length;
  const normal   = rooms.filter(r => String(r.level || '').toLowerCase() === 'normal').length;

  return (
    <div className="dashboard">
      <div className="dashboard__inner">

        {/* Header */}
        <div className="dashboard__header fadein-up">
          <div>
            <h1 className="dashboard__title">
              Coldroom<span className="dashboard__title-accent">AI</span> Analytics
            </h1>
            <p className="dashboard__subtitle">
              <span className="pulse-dot" style={{ '--dot-color': '#22c55e' }} />
              Live System Monitoring · {rooms.length} Units Active
            </p>
          </div>
          <div className="dashboard__clock">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Stat cards */}
        <div className="dashboard__stats">
          <StatCard title="Total Units" value={rooms.length} level="normal"   subtitle="Coldrooms overview" trend={[2, 3, 3, rooms.length, rooms.length]} />
          <StatCard title="Critical"    value={critical}     level="critical" subtitle="Immediate action"   trend={[0, 0, 1, critical, critical]} />
          <StatCard title="Warnings"    value={warnings}     level="warning"  subtitle="Under watch"        trend={[0, 1, 1, warnings, warnings]} />
          <StatCard title="Nominal"     value={normal}       level="normal"   subtitle="Running clean"      trend={[2, 2, 2, normal, normal]} />
        </div>

        {/* Alert strip */}
        <AlertStrip rooms={rooms} />

        {/* Cards grid */}
        <div className="dashboard__cards">
          {rooms.map((room, idx) => (
            <RoomCard key={idx} idx={idx} room={room} onSelectRoom={onSelectRoom} />
          ))}
        </div>
      </div>

      <Chatbot rooms={rooms} />
    </div>
  );
};

export default Dashboard;
