import React, { useState } from 'react';
import StatCard from '../StatCard/StatCard';
import Chatbot from '../Chatbot/Chatbot';

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
  normal: { border: '#22c55e', bg: '#f0fdf4', text: '#16a34a', badge: '#dcfce7', dot: '#22c55e', label: 'Normal' },
  warning: { border: '#f59e0b', bg: '#fffbeb', text: '#d97706', badge: '#fef3c7', dot: '#f59e0b', label: 'Warning' },
  critical: { border: '#ef4444', bg: '#fef2f2', text: '#dc2626', badge: '#fee2e2', dot: '#ef4444', label: 'Critical' },
  error: { border: '#ef4444', bg: '#fef2f2', text: '#dc2626', badge: '#fee2e2', dot: '#ef4444', label: 'Critical' },
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
    <div className="bg-white rounded-[20px] px-[22px] py-4 border-[1.5px] border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] mb-8 flex flex-wrap gap-2.5 items-center">
      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 mr-1">Active Alerts</span>
      {active.map((r, i) => {
        const lc = getLC(r.level);
        return (
          <div
            key={i}
            className="flex items-center gap-[7px] rounded-xl px-3 py-[5px]"
            style={{ background: lc.bg, border: `1px solid ${lc.border}40` }}
          >
            <span className="pulse-dot" style={{ '--dot-color': lc.dot }} />
            <span className="text-[11px] font-extrabold text-slate-900">{(r.tank_name || r.tank_id || '').replace(/_/g, ' ')}</span>
            <span className="text-[10px] font-bold" style={{ color: lc.text }}>{r.level_feet != null ? parseFloat(r.level_feet).toFixed(3) : 'N/A'} ft</span>
          </div>
        );
      })}
    </div>
  );
};


// ── Room card ─────────────────────────────────────────────────────
const RoomCard = ({ room, onSelectRoom, idx }) => {
  const lc = getLC(room.level);
  const isCritical = room.level?.toLowerCase() === 'critical' || room.level?.toLowerCase() === 'error';

  const fakeTemp = parseFloat(room.anomaly_temp || room.level_feet) || 0;
  const trend = [fakeTemp + 2, fakeTemp + 1.2, fakeTemp + 0.5, fakeTemp + 0.1, fakeTemp];

  let aiInsight = "All parameters are within normal limits. Tank operation is stable.";
  if (isCritical) {
    aiInsight = `Immediate attention required. Tank level has breached safety limits.`;
  } else if (room.level?.toLowerCase() === 'warning') {
    aiInsight = `Unusual level variations detected. Monitoring for potential issues.`;
  }

  return (
    <div
      className={`group bg-white rounded-[36px] max-sm:rounded-[28px] p-8 max-sm:px-5 max-sm:py-6 cursor-pointer transition-all duration-[350ms] hover:-translate-y-1.5 hover:shadow-[0_24px_64px_rgba(0,0,0,0.12),0_4px_20px_rgba(0,0,0,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.07)] room-card-fadein ${isCritical ? 'relative overflow-hidden after:content-[""] after:absolute after:inset-y-0 after:-left-full after:w-1/2 after:right-0 after:bg-gradient-to-r after:from-transparent after:via-red-500/10 after:to-transparent after:animate-radar-sweep after:pointer-events-none' : ''
        }`}
      style={{ '--delay': `${idx * 0.1}s`, borderTop: `10px solid ${lc.border}` }}
      onClick={() => onSelectRoom(room)}
    >
      <div className="flex justify-between items-start mb-5">
        <div className="rounded-[18px] p-3" style={{ background: lc.bg, color: lc.text }}>
          <StatusIcon level={room.level} size={28} />
        </div>
        <div className="flex items-center gap-2">
          <span className="pulse-dot" style={{ '--dot-color': lc.dot }} />
          <span
            className="text-[10px] font-black uppercase tracking-[0.14em] px-3 py-[5px] rounded-full"
            style={{ background: lc.badge, color: lc.text }}
          >
            {lc.label}
          </span>
        </div>
      </div>

      <h3 className="text-[26px] max-sm:text-[22px] font-black tracking-[-0.03em] italic uppercase mb-[18px] transition-colors duration-[250ms] whitespace-nowrap overflow-hidden text-ellipsis text-slate-900 group-hover:text-indigo-600">
        {(room.tank_name || room.tank_id || '').replace(/_/g, ' ')}
      </h3>

      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        <div className="bg-slate-50 rounded-2xl px-3.5 py-3">
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.14em] mb-[3px]">Level Feet</div>
          <div className="text-[20px] font-black text-slate-900 mb-1.5">
            {room.level_feet != null ? parseFloat(room.level_feet).toFixed(3) : 'N/A'} ft
          </div>
          <Spark data={trend} color={lc.border} />
        </div>
      </div>

      <div className="mb-[18px]">
        <div className="flex justify-between mb-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em]">Thermal Load</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: lc.text }}>
            {Math.abs(parseFloat(room.anomaly_temp || room.level_feet) || 0).toFixed(1)}ft
          </span>
        </div>
        <div className="bg-slate-200 rounded-full overflow-hidden h-[5px]">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-in-out"
            style={{
              width: `${Math.min(100, (Math.abs(parseFloat(room.anomaly_temp || room.level_feet) || 0) / 30) * 100)}%`,
              background: lc.border,
            }}
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl py-3 px-4 mb-[18px]">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.15em]">Incident Log</span>
          {room.created_at && (
            <span className="text-[9px] font-bold text-slate-600">
              {new Date(room.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="text-[13px] font-black text-slate-50 italic">
          {room.level_feet != null
            ? `Level: ${parseFloat(room.level_feet).toFixed(3)} ft`
            : <span className="text-slate-600">No level data</span>}
        </div>
      </div>

      <div className="mt-5 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-[20px] border border-slate-200 relative overflow-hidden before:content-[''] before:absolute before:inset-y-0 before:left-0 before:w-[5px] before:bg-gradient-to-b before:from-indigo-500 before:to-purple-500">
        <div className="flex items-center text-[11px] font-black text-indigo-500 uppercase tracking-[0.1em] mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" />
          </svg>
          AI Model Analysis

        </div>
        <div className="text-[13px] font-semibold text-slate-600 leading-snug italic">
          {aiInsight}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.1em] pt-[18px] border-t border-dashed border-slate-200 group-hover:text-indigo-600">
        <span>Click to view detailed AI stats & logs</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

// ── Dashboard Main ────────────────────────────────────────────────
const Dashboard = ({ rooms, onSelectRoom }) => {
  const critical = rooms.filter(r => { const l = String(r.level || '').toLowerCase(); return l === 'critical' || l === 'error'; }).length;
  const warnings = rooms.filter(r => String(r.level || '').toLowerCase() === 'warning').length;
  const normal = rooms.filter(r => String(r.level || '').toLowerCase() === 'normal').length;

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-10 max-sm:px-4 max-sm:py-6">
      <div className="max-w-[1300px] mx-auto">
        <div className="flex justify-between items-end mb-9">
          <div>
            <h1 className="text-[38px] font-black text-slate-900 tracking-[-0.04em] italic uppercase leading-none">
              Tank Level<span className="text-indigo-600">AI</span> Analytics
            </h1>
            <p className="flex items-center gap-2 mt-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              <span className="pulse-dot" style={{ '--dot-color': '#22c55e' }} />
              Live System Monitoring · {rooms.length} Units Active
            </p>
          </div>
          <div className="bg-white rounded-2xl px-[18px] py-[10px] border-[1.5px] border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.12em]">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-[14px] mb-7">
          <StatCard title="Total Units" value={rooms.length} level="normal" subtitle="Tanks overview" trend={[2, 3, 3, rooms.length, rooms.length]} />
          <StatCard title="Critical" value={critical} level="critical" subtitle="Immediate action" trend={[0, 0, 1, critical, critical]} />
          <StatCard title="Warnings" value={warnings} level="warning" subtitle="Under watch" trend={[0, 1, 1, warnings, warnings]} />
          <StatCard title="Normal" value={normal} level="normal" subtitle="Running clean" trend={[2, 2, 2, normal, normal]} />
        </div>

        <AlertStrip rooms={rooms} />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-6">
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