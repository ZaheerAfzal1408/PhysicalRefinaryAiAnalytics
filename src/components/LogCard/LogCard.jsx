import React, { useState, useEffect, useRef } from 'react';
import { getLC } from '../../constants';
import { BarChart, Bar, AreaChart, Area, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const LineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const BarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const InternalTankGraphic = ({ levelFeet, hex }) => {
  const maxFt = 20; 
  const val = parseFloat(levelFeet) || 0;
  const percent = Math.min(100, Math.max(0, (val / maxFt) * 100));

  return (
    <div className="w-[70px] h-[160px] max-sm:w-[60px] max-sm:h-[130px] rounded-xl border-[3px] border-slate-300 bg-slate-50 relative overflow-hidden shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)]">
      <div className="absolute inset-x-0 bottom-0 transition-[height] duration-1500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[inset_0_6px_10px_rgba(255,255,255,0.2)]" style={{ height: `${percent}%`, background: hex }}>
        <div className="absolute top-[-4px] inset-x-0 h-2 bg-inherit brightness-[1.15] rounded-full" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-black text-base max-sm:text-sm z-10 leading-none" style={{ color: percent > 50 ? '#fff' : '#475569', textShadow: percent > 50 ? '0 1px 3px rgba(0,0,0,0.4)': 'none' }}>
        {val.toFixed(1)}<span className="text-[9px] font-extrabold mt-[3px]" style={{ color: percent > 50 ? 'rgba(255,255,255,0.8)': '#94a3b8' }}>FT</span>
      </div>
    </div>
  )
}

const LogCard = ({ log, idx }) => {
  const lc = getLC(log.level);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const rawDate = log.timestamp || log.created_at || log.time || log.anomaly_time || '';
  const logDate = rawDate ? new Date(rawDate) : null;
  const dateStr = logDate && !isNaN(logDate) ? logDate.toLocaleString() : 'Unknown time';

  const displayLevel = log.level_feet != null ? parseFloat(log.level_feet) : null;
  const levelStr = displayLevel != null ? `${displayLevel.toFixed(3)} ft` : 'N/A';

  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#fff', padding: '14px 18px', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 12px 24px -4px rgb(0 0 0 / 0.1)' }}>
          <div style={{ color: '#475569', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{label}</div>
          <div style={{ color: '#0f172a', fontWeight: 900, fontSize: '18px', marginBottom: '4px' }}>
            Level: {parseFloat(data.level).toFixed(3)} ft
          </div>
          {data.threshold != null && (
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 700 }}>Limit: {parseFloat(data.threshold).toFixed(3)} ft</div>
          )}
          {data.mse != null && (
            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontWeight: 800 }}>
              AI Diff: {Number(data.mse).toExponential(2)}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="group bg-white rounded-[28px] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] border border-slate-200 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.04)] room-card-fadein"
      style={{ '--delay': `${idx * 0.05}s`, borderLeft: `10px solid ${lc.hex}` }}
      ref={containerRef}
    >
      <div className="flex items-center p-8 gap-9 max-[1100px]:flex-wrap max-[1100px]:items-start max-[1100px]:gap-6 max-[1100px]:p-6 max-sm:p-5 max-sm:gap-4">
         {/* 1. Visual Tank */}
         <div className="shrink-0">
           <InternalTankGraphic levelFeet={log.level_feet} hex={lc.hex} />
         </div>

         {/* 2. Text Meta Details */}
         <div className="flex-[0_0_240px] max-[1100px]:flex-1 max-[1100px]:min-w-[200px] flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap max-sm:flex-col max-sm:items-start max-sm:gap-2">
              <span className="px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.1em] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.1)]" style={{ background: lc.hex }}>
                {log.level || 'Normal'}
              </span>
              <span className="text-xs font-bold text-slate-500 max-sm:text-[11px]">{dateStr}</span>
            </div>
            
            <div>
              <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] mb-1">Logged Level</div>
              <div className="text-[26px] max-sm:text-[22px] font-black text-slate-900 tracking-[-0.02em] leading-none">{levelStr}</div>
            </div>

            <div className="mt-1">
              {log.anomalies && log.anomalies.length > 0 ? (
                <div className="bg-slate-50 rounded-full px-4 py-2 border border-slate-300 inline-flex items-center transition-colors duration-200 group-hover:bg-white group-hover:border-slate-400 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  <div className="text-[11px] font-extrabold text-slate-600 uppercase tracking-[0.05em] m-0">
                    {log.anomalies.length} Anomal{log.anomalies.length === 1 ? 'y' : 'ies'} Detected
                  </div>
                </div>
              ) : (
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] px-4 py-2 bg-slate-50 rounded-full border-2 border-dashed border-slate-300 inline-block">Pattern Stable</span>
              )}
            </div>
         </div>

         {/* 3. Bar Chart */}
         <div className="flex-1 min-w-0 h-[240px] max-[1100px]:h-[240px] max-sm:h-[200px] border-l border-dashed border-slate-200 max-[1100px]:border-l-0 max-[1100px]:mt-2 max-sm:mt-4 pl-8 max-[1100px]:pl-0 max-[1100px]:w-full relative">
           {log.anomalies && log.anomalies.length > 0 ? (
             isVisible && (() => {
               const chartData = [...log.anomalies].reverse().map(a => ({
                 time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                 level: a.level_feet != null ? parseFloat(a.level_feet) : 0,
                 threshold: a.threshold,
                 mse: a.mse
               }));
               const maxThreshold = Math.max(0, ...chartData.map(a => parseFloat(a.threshold) || 0));
               
               return (
                 <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                   <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                     {chartType === 'bar' ? (
                       <ResponsiveContainer width="100%" height="100%" debounce={100}>
                         <BarChart data={chartData} margin={{ top: 15, right: 0, left: -20, bottom: 5 }}>
                           <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} minTickGap={20} />
                           <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(1)} domain={['auto', 'auto']} />
                           <Tooltip cursor={{ fill: '#f1f5f9' }} content={renderTooltip} />
                           {maxThreshold > 0 && (
                             <ReferenceLine
                               y={maxThreshold} stroke="#8b5cf6" strokeDasharray="4 6" strokeWidth={2}
                               label={{ position: 'insideTopLeft', value: 'AI PREDICTIVE BASELINE LIMIT', fill: '#8b5cf6', fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', dy: -10 }}
                             />
                           )}
                           <Bar dataKey="level" radius={[4, 4, 0, 0]} maxBarSize={20} isAnimationActive={false}>
                             {chartData.map((entry, index) => {
                               const isCritical = entry.threshold != null && entry.level >= entry.threshold;
                               return <Cell key={`cell-${index}`} fill={isCritical ? '#ef4444' : lc.hex} />;
                             })}
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                     ) : (
                       <ResponsiveContainer width="100%" height="100%" debounce={100}>
                         <AreaChart data={chartData} margin={{ top: 15, right: 0, left: -20, bottom: 5 }}>
                           <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} minTickGap={20} />
                           <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(1)} domain={['auto', 'auto']} />
                           <Tooltip content={renderTooltip} />
                           {maxThreshold > 0 && (
                             <ReferenceLine
                               y={maxThreshold} stroke="#8b5cf6" strokeDasharray="4 6" strokeWidth={2}
                             />
                           )}
                           <Area type="monotone" dataKey="level" stroke={lc.hex} fillOpacity={0.15} fill={lc.hex} strokeWidth={3} isAnimationActive={false} />
                         </AreaChart>
                       </ResponsiveContainer>
                     )}
                   </div>
                   <button 
                     className="absolute top-[-16px] max-sm:top-[-22px] right-0 bg-slate-50 border border-slate-300 rounded-lg p-2 cursor-pointer flex items-center justify-center text-slate-500 transition-all duration-200 z-10 hover:bg-white hover:border-indigo-600 hover:text-indigo-600 hover:shadow-[0_4px_10px_rgba(79,70,229,0.1)]"
                     onClick={(e) => { e.stopPropagation(); setChartType(t => t === 'bar' ? 'line' : 'bar'); }}
                     title={`Switch to ${chartType === 'bar' ? 'Line Graph' : 'Bar Graph'}`}
                     style={{ zIndex: 10 }}
                   >
                     {chartType === 'bar' ? <LineIcon /> : <BarIcon />}
                   </button>
                 </div>
               );
             })()
           ) : (
             <div className="flex items-center justify-center h-full text-slate-400 text-xs font-extrabold uppercase tracking-[0.1em] bg-slate-50 rounded-2xl border border-dashed border-slate-300">No Deviation Timeline Recorded</div>
           )}
         </div>
      </div>
    </div>
  );
};

export default LogCard;