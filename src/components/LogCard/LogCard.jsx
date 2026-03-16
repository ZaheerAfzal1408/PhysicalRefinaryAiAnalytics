import React, { useState } from 'react';
import { getLC } from '../../constants';
import { Spark } from '../ui/Primitives/Primitives';
import './LogCard.css';

const LogCard = ({ log, idx }) => {
  const [expanded, setExpanded] = useState(false);
  const lc           = getLC(log.level);
  const rawDate      = log.created_at || log.timestamp || log.time || log.anomaly_time || '';
  const logDate      = rawDate ? new Date(rawDate) : null;
  const dateStr      = logDate && !isNaN(logDate) ? logDate.toLocaleString() : 'Unknown time';
  const displayTemp  = log.temperature  || log.anomaly_temp  || log.temp  || 'N/A';
  const displayHumid = log.humidity     || log.anomaly_humid || log.humid || 'N/A';
  const baseTemp     = parseFloat(displayTemp) || 0;
  const tempTrend    = [baseTemp + 1.5, baseTemp + 0.8, baseTemp + 0.3, baseTemp - 0.1, baseTemp];

  return (
    <div
      className="log-card room-card-fadein"
      style={{ '--delay': `${idx * 0.05}s`, borderLeft: `10px solid ${lc.hex}` }}
    >
      <div
        className="log-card__header"
        onClick={() => setExpanded(x => !x)}
      >
        <div className="log-card__row">

          {/* Left: level + metrics */}
          <div className="log-card__left">
            <div className="log-card__meta">
              <span className="log-card__level-badge" style={{ background: lc.hex }}>
                {log.level || 'Normal'}
              </span>
              <span className="log-card__date">{dateStr}</span>
            </div>
            <div className="log-card__metrics">
              {[
                { label: 'Temperature', value: `${displayTemp}°C`, color: lc.hex,    data: tempTrend },
                { label: 'Humidity',    value: `${displayHumid}%`, color: '#818cf8', data: tempTrend.map(v => v + 38) },
              ].map(({ label, value, color, data }) => (
                <div key={label}>
                  <div className="log-card__metric-label">{label}</div>
                  <div className="log-card__metric-value">{value}</div>
                  <Spark data={data} color={color} width={72} height={22} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: anomaly summary + chevron */}
          <div className="log-card__right">
            {log.anomalies && log.anomalies.length > 0 ? (
              <div className="log-card__anomaly-box">
                <div className="log-card__anomaly-title">
                  {log.anomalies.length} Anomal{log.anomalies.length === 1 ? 'y' : 'ies'}
                </div>
                {log.anomalies.slice(0, 2).map((a, i) => (
                  <div key={i} className="log-card__anomaly-item" style={{ color: lc.textHex }}>
                    T: {a.t || 'N/A'}° · H: {a.h || 'N/A'}%
                  </div>
                ))}
                {log.anomalies.length > 2 && (
                  <div className="log-card__anomaly-more">+{log.anomalies.length - 2} more</div>
                )}
              </div>
            ) : (
              <span className="log-card__stable">Condition Stable</span>
            )}
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={lc.textHex} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={`log-card__chevron${expanded ? ' log-card__chevron--open' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded anomaly breakdown */}
      {expanded && log.anomalies && log.anomalies.length > 0 && (
        <div className="log-card__expanded">
          <div className="log-card__expanded-inner">
            <div className="log-card__expanded-title">Full Anomaly Breakdown</div>
            <div className="log-card__breakdown-grid">
              {log.anomalies.map((a, i) => (
                <div
                  key={i}
                  className="log-card__breakdown-item"
                  style={{ background: lc.bg, borderLeftColor: lc.hex }}
                >
                  <div className="log-card__breakdown-reading">
                    T: {a.t || 'N/A'}° | H: {a.h || 'N/A'}%
                  </div>
                  {a.time && (
                    <div className="log-card__breakdown-time">
                      @ {new Date(a.time).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogCard;
