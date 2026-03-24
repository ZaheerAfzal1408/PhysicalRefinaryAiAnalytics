import React, { useState } from 'react';
import { W, INTERVALS, windowLabel } from '../../constants/index';
import { buildLogs } from '../../utils';
import { exportRoomLogsToExcel } from '../../utils/exportToExcel';
import TimeFrameModal from '../ui/TimeFrameModal/TimeFrameModal';
import SummaryBar from '../SummaryBar/SummaryBar';
import LogCard from '../LogCard/LogCard';
import { getLC } from '../../constants';
import { exportRoomLogsToPDF } from '../../utils/exportToPDF';

const DetailView = ({ room, allHistory, onBack }) => {
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [timeWindow, setTimeWindow] = useState(W.H24);
  const [groupInt, setGroupInt] = useState(30 * 60 * 1000);
  const [visibleCount, setVisibleCount] = useState(20);

  const allLogs = buildLogs(allHistory, room.tank_name, timeWindow);

  const filteredLogs = allLogs.filter(log => {
    if (filter === 'all') return true;
    const lv = String(log.level || '').toLowerCase();
    if (filter === 'critical') return lv === 'critical' || lv === 'error';
    return lv === filter;
  });

  const currentLogs = filteredLogs.slice(0, visibleCount);

  const handleFilterChange = (key) => {
    setFilter(key);
    setVisibleCount(20);
  };

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
      <button className="flex items-center gap-2 mb-7 bg-transparent border-none cursor-pointer text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 p-0 transition-colors duration-200 hover:text-indigo-600" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-white rounded-[40px] p-9 max-md:px-6 max-md:py-7 shadow-[0_8px_40px_rgba(0,0,0,0.07)]">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-end gap-5 mb-8 max-md:flex-col max-md:items-start max-md:gap-6">
          <div className="border-l-[6px] border-indigo-600 pl-[18px]">
            <h2 className="text-[40px] max-md:text-[28px] max-md:break-words font-black text-slate-900 uppercase italic tracking-[-0.03em] leading-none m-0">
              {(room.tank_name || '').replace(/_/g, ' ')}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] mt-2 italic">Diagnostic History & Event Logs</p>
          </div>
          <div className="flex gap-3 items-center max-md:w-full max-md:flex-wrap">
            {[['Total', allLogs.length, '#4f46e5'], ['Showing', filteredLogs.length, '#0f172a']].map(([k, v, c]) => (
              <div key={k} className="bg-slate-50 rounded-[18px] px-5 py-3 border border-slate-200 text-center max-md:flex-1">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.14em] mb-1">{k}</div>
                <div className="text-[24px] font-black italic leading-none" style={{ color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-2.5 mb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.16em]">Viewing:</span>
            <span className="text-[11px] font-black text-indigo-600">{windowLabel(timeWindow)}</span>
            <span className="text-[9px] text-slate-300">·</span>
            <span className="text-[9px] text-slate-400 font-bold">Interval: {summIntLabel}</span>
            <span className="text-[9px] text-slate-300">·</span>
            <span className="text-[9px] text-slate-400 font-bold">{allLogs.length} records</span>
          </div>
          
          <div className="flex gap-2">
            {/* Export PDF */}
            <button
              className="group flex items-center gap-[7px] px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] border-[1.5px] border-indigo-600 bg-indigo-600 text-white cursor-pointer transition-colors duration-200 hover:bg-indigo-700 hover:border-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => exportRoomLogsToPDF(room, allLogs)}
              disabled={allLogs.length === 0}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export PDF
            </button>

            {/* Export to Excel */}
            <button
              className="flex items-center gap-[7px] px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] border-[1.5px] border-green-200 bg-green-50 text-green-600 cursor-pointer transition-colors duration-200 hover:bg-green-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
            <button className="flex items-center gap-[7px] px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] border-[1.5px] border-slate-200 bg-slate-100 text-indigo-600 cursor-pointer transition-colors duration-200 hover:bg-indigo-600 hover:text-white" onClick={() => setShowModal(true)}>
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
        <div className="flex gap-2 flex-wrap mb-6">
          {filterTabs.map(([key, label, color]) => (
            <button
              key={key}
              className="text-[10px] font-black uppercase tracking-[0.14em] px-4 py-[7px] rounded-xl cursor-pointer transition-colors duration-200 border-[1.5px]"
              onClick={() => handleFilterChange(key)}
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
        <div className="grid grid-cols-1 gap-4">
          {currentLogs.length === 0
            ? <div className="text-center py-15 text-[12px] font-black text-slate-300 uppercase tracking-[0.14em] italic">No logs match this filter</div>
            : currentLogs.map((log, idx) => (
              <LogCard key={`${log.tank_name}-${idx}`} log={log} idx={idx} />
            ))
          }
        </div>
        
        {visibleCount < filteredLogs.length && (
          <div className="text-center mt-6">
            <button
              onClick={() => setVisibleCount(c => c + 20)}
              className="px-6 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-indigo-600 font-black uppercase text-[10px] tracking-[0.14em] cursor-pointer hover:bg-slate-100 transition-colors"
            >
              Load More Logs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailView;
