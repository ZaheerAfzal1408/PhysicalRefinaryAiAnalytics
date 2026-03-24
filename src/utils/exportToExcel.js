const fmt = (val) => (val === null || val === undefined || val === '') ? 'N/A' : String(val);
const fmtNum = (val) => { const n = parseFloat(val); return isNaN(n) ? 'N/A' : n; };
const fmtDate = (raw) => {
  if (!raw) return 'N/A';
  const d = new Date(raw);
  if (isNaN(d)) return fmt(raw);
  // "DD/MM/YYYY  HH:MM:SS"
  const date = d.toLocaleDateString('en-GB');   // 10/03/2026
  const time = d.toLocaleTimeString('en-GB');   // 14:32:05
  return `${date}  ${time}`;
};

// Build anomaly detail string for critical rows
const buildAnomalyDetail = (log) => {
  const parts = [];
  const count = log.anomaly_count ?? (log.anomalies?.length || 0);
  if (count > 0) parts.push(`Count: ${count}`);

  // Also parse anomalies JSON array if present
  try {
    const arr = typeof log.anomalies === 'string' ? JSON.parse(log.anomalies) : log.anomalies;
    if (Array.isArray(arr) && arr.length > 0) {
      arr.forEach((a, i) => {
        const sub = [];
        if (a.level_feet != null) sub.push(`Level: ${parseFloat(a.level_feet).toFixed(3)} ft`);
        if (a.threshold != null) sub.push(`Limit: ${parseFloat(a.threshold).toFixed(3)}`);
        if (a.mse != null) sub.push(`Error: ${Number(a.mse).toExponential(2)}`);
        if (sub.length) parts.push(`[${i + 1}] ${sub.join(', ')}`);
      });
    }
  } catch (_) { }

  return parts.length ? parts.join(' | ') : 'N/A';
};

export const exportRoomLogsToExcel = (room, logs) => {
  if (!window.XLSX) {
    alert('Excel library not loaded. Add SheetJS to your index.html.');
    return;
  }

  const XLSX = window.XLSX;
  const wb = XLSX.utils.book_new();

  // ─────────────────────────────────────────────────────────────────────────────
  // Sheet 1 — Main Logs
  // ─────────────────────────────────────────────────────────────────────────────

  const HEADERS = [
    'Date & Time',
    'Tank Name',
    'Status Log',
    'Overall Status Level',
    'Latest Level (ft)',
    'Anomaly Count',
    'Total Logs',
  ];

  const totalLogs = logs.length;

  const dataRows = logs.map((log, idx) => {
    const level = String(log.level || log.status || '').toLowerCase();
    const isCritical = level === 'critical' || level === 'error';

    // Status cell: if critical, expand with anomaly details
    const statusValue = isCritical
      ? `CRITICAL — ${buildAnomalyDetail(log)}`
      : fmt(log.status || log.level);

    return [
      fmtDate(log.created_at || log.timestamp),   // A — Date & Time
      fmt(log.tank_name || room.tank_name),       // B — Tank Name
      statusValue,                                  // C — Status
      fmt(log.level),                               // D — Current Level
      fmtNum(log.level_feet),                       // E — Level ft
      fmt(log.anomaly_count ?? (log.anomalies?.length || 0)), // F — Count
      idx === 0 ? totalLogs : '',                   // G — Total Logs (only on first row)
    ];
  });

  const logsSheet = XLSX.utils.aoa_to_sheet([HEADERS, ...dataRows]);

  // Column widths
  logsSheet['!cols'] = [
    { wch: 22 },  // Date & Time
    { wch: 16 },  // Room Name
    { wch: 72 },  // Status (extra wide — holds anomaly detail)
    { wch: 20 },  // Current Level
    { wch: 18 },  // Level ft
    { wch: 16 },  // Anomaly Count
    { wch: 12 },  // Total Logs
  ];

  // Freeze header row
  logsSheet['!freeze'] = { xSplit: 0, ySplit: 1 };

  // Auto-wrap Status column (C) so long anomaly text stays readable
  const range = XLSX.utils.decode_range(logsSheet['!ref'] || 'A1');
  for (let R = 1; R <= range.e.r; R++) {
    const cell = logsSheet[XLSX.utils.encode_cell({ r: R, c: 2 })]; // column C
    if (cell) cell.s = { alignment: { wrapText: true, vertical: 'top' } };
  }

  XLSX.utils.book_append_sheet(wb, logsSheet, 'Logs');

  // ─────────────────────────────────────────────────────────────────────────────
  // Sheet 2 — Summary
  // ─────────────────────────────────────────────────────────────────────────────
  const critical = logs.filter(l => ['critical', 'error'].includes(String(l.level || '').toLowerCase())).length;
  const warnings = logs.filter(l => String(l.level || '').toLowerCase() === 'warning').length;
  const normal = logs.filter(l => String(l.level || '').toLowerCase() === 'normal').length;

  const summaryData = [
    ['Tank Level AI Analytics — Export Report'],
    ['Generated', new Date().toLocaleString()],
    [''],
    ['TANK SUMMARY'],
    ['Tank Name', fmt(room.tank_name)],
    ['Overall Status', fmt(room.level)],
    ['Latest Level (ft)', fmtNum(room.level_feet)],
    ['Overall Anomalies', logs.reduce((sum, l) => sum + (l.anomalies?.length || 0), 0)],
    [''],
    ['LOG COUNTS'],
    ['Critical / Error', critical],
    ['Warnings', warnings],
    ['Normal', normal],
    [''],
    ['Date Range',
      logs.length > 0
        ? `${fmtDate(logs[logs.length - 1]?.created_at || logs[logs.length - 1]?.timestamp)}  →  ${fmtDate(logs[0]?.created_at || logs[0]?.timestamp)}`
        : 'N/A'
    ],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 22 }, { wch: 50 }];
  summarySheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // ─────────────────────────────────────────────────────────────────────────────
  // Download
  // ─────────────────────────────────────────────────────────────────────────────
  const filename = `${room.tank_name}_logs_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
};