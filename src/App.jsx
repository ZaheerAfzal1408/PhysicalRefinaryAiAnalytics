import React, { useState } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import DetailView from './components/DetailView/DetailView';
import { useTankData } from './hooks/useTankData';
import './tank.css';

export default function App() {
  const { history, allHistory, loading, error, rawDebug, fetchData, buildRoomLogs } = useTankData();
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleSelectRoom = (room) => setSelectedRoom(buildRoomLogs(room));

  // ── Loading ───────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0f172a', gap: 16 }}>
      <div className="spin-icon" style={{ fontSize: 32 }}>⚙</div>
      <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.22em', color: '#475569', textTransform: 'uppercase' }}>Syncing Database…</div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0f172a', gap: 20, padding: 32 }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <div style={{ fontSize: 14, fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Connection Error</div>
      <div style={{ fontSize: 12, color: '#94a3b8', maxWidth: 440, textAlign: 'center', lineHeight: 1.7 }}>{error}</div>
      {rawDebug && (
        <details style={{ maxWidth: 560, width: '100%' }}>
          <summary style={{ fontSize: 10, color: '#475569', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>Raw API Response</summary>
          <pre style={{ background: '#1e293b', color: '#94a3b8', padding: 16, borderRadius: 12, fontSize: 11, overflowX: 'auto', marginTop: 8 }}>{rawDebug}</pre>
        </details>
      )}
      <button onClick={fetchData} style={{ marginTop: 8, padding: '10px 28px', borderRadius: 14, background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Retry</button>
    </div>
  );

  // ── Empty ─────────────────────────────────────────────────────
  if (history.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0f172a', gap: 16, padding: 32 }}>
      <div style={{ fontSize: 32 }}>📭</div>
      <div style={{ fontSize: 13, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>No rooms found in database</div>
      {rawDebug && (
        <details style={{ maxWidth: 560, width: '100%' }}>
          <summary style={{ fontSize: 10, color: '#475569', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>Raw API Response</summary>
          <pre style={{ background: '#1e293b', color: '#94a3b8', padding: 16, borderRadius: 12, fontSize: 11, overflowX: 'auto', marginTop: 8 }}>{rawDebug}</pre>
        </details>
      )}
      <button onClick={fetchData} style={{ marginTop: 8, padding: '10px 28px', borderRadius: 14, background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Retry</button>
    </div>
  );

  // ── Main ──────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ width: '100%', margin: '0 auto', padding: '0 24px' }}>
        {selectedRoom === null ? (
          <Dashboard rooms={history} onSelectRoom={handleSelectRoom} />
        ) : (
          <div style={{ padding: '32px 24px' }}>
            <DetailView
              room={selectedRoom}
              allHistory={allHistory}
              onBack={() => setSelectedRoom(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}