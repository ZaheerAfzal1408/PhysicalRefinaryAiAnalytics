import React, { useState } from 'react';
import { W, TIME_PERIODS, INTERVALS, windowLabel } from '../../../constants/index';
import { Btn } from '../Primitives/Primitives';
import './TimeFrameModal.css';

const TimeFrameModal = ({ timeWindow, groupInterval, onApply, onClose }) => {
  const [localWindow, setLocalWindow] = useState(timeWindow || W.H24);
  const [localInt, setLocalInt] = useState(groupInterval || 30 * 60 * 1000);

  const summaryWindow = windowLabel(localWindow);
  const summaryInt = INTERVALS.find(i => i.ms === localInt)?.label || '30m';

  return (
    <div className="tfm-overlay" onClick={onClose}>
      <div className="tfm-card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="tfm-header">
          <div className="tfm-header__left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="tfm-header__title">Time Frame Settings</span>
          </div>
          <button className="tfm-close-btn" onClick={onClose}>&#x2715;</button>
        </div>

        {/* Select Time Period */}
        <div className="tfm-section">
          <div className="tfm-section__label">Select Time Period</div>
          <div className="tfm-grid">
            {TIME_PERIODS.map(({ label, ms }) => (
              <Btn key={label} active={localWindow === ms} onClick={() => setLocalWindow(ms)}>
                {label}
              </Btn>
            ))}
          </div>
        </div>

        {/* Grouping Interval */}
        <div className="tfm-section">
          <div className="tfm-section__label">Grouping Interval</div>
          <div className="tfm-grid">
            {INTERVALS.map(({ label, ms }) => {
              const disabled = localWindow !== W.ALL && ms >= localWindow;
              return (
                <Btn
                  key={label}
                  active={localInt === ms && !disabled}
                  disabled={disabled}
                  onClick={() => setLocalInt(ms)}
                >
                  {label}
                </Btn>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="tfm-summary">
          <div className="tfm-summary__title">Summary</div>
          <div className="tfm-summary__window">{summaryWindow}</div>
          <div className="tfm-summary__interval">Grouping interval: {summaryInt}</div>
        </div>

        {/* Actions */}
        <div className="tfm-actions">
          <button className="tfm-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="tfm-btn-apply"
            onClick={() => { onApply({ window: localWindow, interval: localInt }); onClose(); }}
          >
            Apply
          </button>
        </div>

      </div>
    </div>
  );
};

export default TimeFrameModal;