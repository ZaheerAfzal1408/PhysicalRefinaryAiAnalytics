import React, { useState } from 'react';
import { W, INTERVALS, windowLabel } from '../../constants/index';
import { buildLogs } from '../../utils';
import { exportRoomLogsToExcel } from '../../utils/exportToExcel';
import TimeFrameModal from '../ui/TimeFrameModal/TimeFrameModal';
import SummaryBar from '../SummaryBar/SummaryBar';
import LogCard from '../LogCard/LogCard';
import './DetailView.css';

const DetailView = ({ room, allHistory, onBack }) => {
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [timeWindow, setTimeWindow] = useState(W.H24);
  const [groupInt, setGroupInt] = useState(30 * 60 * 1000);

  const allLogs = buildLogs(allHistory, room.tank_name, timeWindow);

  const filteredLogs = allLogs.filter(log => {
    if (filter === 'all') return true;
    const lv = String(log.level || '').toLowerCase();
    if (filter === 'critical') return lv === 'critical' || lv === 'error';
    return lv === filter;
  });

  const handleApply = ({ window: w, interval }) => {
    setTimeWindow(w);
    setGroupInt(interval);
  };

  const summIntLabel = INTERVALS.find(i => i.ms === groupInt)?.label || '30m';

  // Filter tab config: [key, label, activeColor]
  const filterTabs = [
    ['all', 'All', '#4f46e5'],
    ['critical', 'Critical', '#ef4444'],
    ['warning', 'Warning', '#f59e0b'],
    ['normal', 'Normal', '#22c55e'],
  ];

  return (
    <div>
      {showModal && (
        <TimeFrameModal
          timeWindow={timeWindow}
          groupInterval={groupInt}
          onApply={handleApply}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Back button */}
      <button className="detail-back-btn" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
        </svg>
        Back to Dashboard
      </button>

      <div className="detail-card">

        {/* Header */}
        <div className="detail-card__header">
          <div className="detail-card__title-block">
            <h2 className="detail-card__title">{room.tank_name}</h2>
            <p className="detail-card__subtitle">Diagnostic History &amp; Event Logs</p>
          </div>
          <div className="detail-card__counts">
            {[['Total', allLogs.length, '#4f46e5'], ['Showing', filteredLogs.length, '#0f172a']].map(([k, v, c]) => (
              <div key={k} className="detail-card__count-pill">
                <div className="detail-card__count-label">{k}</div>
                <div className="detail-card__count-value" style={{ color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="detail-toolbar">
          <div className="detail-toolbar__info">
            <span className="detail-toolbar__info-label">Viewing:</span>
            <span className="detail-toolbar__window">{windowLabel(timeWindow)}</span>
            <span className="detail-toolbar__dot">·</span>
            <span className="detail-toolbar__meta">Interval: {summIntLabel}</span>
            <span className="detail-toolbar__dot">·</span>
            <span className="detail-toolbar__meta">{allLogs.length} records</span>
          </div>
          <div className="detail-toolbar__actions">
            {/* Export to Excel */}
            <button
              className="btn-export"
              onClick={() => exportRoomLogsToExcel(room, allLogs)}
              disabled={allLogs.length === 0}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Excel
            </button>

            {/* Time Frame */}
            <button className="btn-timeframe" onClick={() => setShowModal(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Time Frame
            </button>
          </div>
        </div>

        <SummaryBar logs={allLogs} />

        {/* Level filter tabs */}
        <div className="detail-filters">
          {filterTabs.map(([key, label, color]) => (
            <button
              key={key}
              className="detail-filter-tab"
              onClick={() => setFilter(key)}
              style={{
                background: filter === key ? color : '#f8fafc',
                color: filter === key ? '#fff' : '#94a3b8',
                borderColor: filter === key ? color : '#e2e8f0',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Log list */}
        <div className="detail-log-list">
          {filteredLogs.length === 0
            ? <div className="detail-log-empty">No logs match this filter</div>
            : filteredLogs.map((log, idx) => (
              <LogCard key={`${log.tank_name}-${idx}`} log={log} idx={idx} />
            ))
          }
        </div>
      </div>
    </div>

  );
};

export default DetailView;
