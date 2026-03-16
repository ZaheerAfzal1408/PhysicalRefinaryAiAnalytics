const fmt     = (val) => (val === null || val === undefined || val === '') ? 'N/A' : String(val);
const fmtNum  = (val) => { const n = parseFloat(val); return isNaN(n) ? 'N/A' : n; };
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
  if (log.anomaly_temp  != null && log.anomaly_temp  !== '') parts.push(`Temp: ${fmtNum(log.anomaly_temp)}°C`);
  if (log.anomaly_humid != null && log.anomaly_humid !== '') parts.push(`Humidity: ${fmtNum(log.anomaly_humid)}%`);
  if (log.anomaly_count != null && log.anomaly_count !== '') parts.push(`Count: ${log.anomaly_count}`);
  if (log.reconstruction_error != null && log.reconstruction_error !== '')
    parts.push(`Recon Error: ${parseFloat(log.reconstruction_error).toFixed(4)}`);
  if (log.intense != null && log.intense !== '') parts.push(`Intense: ${log.intense}`);

  // Also parse anomalies JSON array if present
  try {
    const arr = typeof log.anomalies === 'string' ? JSON.parse(log.anomalies) : log.anomalies;
    if (Array.isArray(arr) && arr.length > 0) {
      arr.forEach((a, i) => {
        const sub = [];
        if (a.type)  sub.push(a.type);
        if (a.value != null) sub.push(`val: ${a.value}`);
        if (a.threshold != null) sub.push(`thresh: ${a.threshold}`);
        if (sub.length) parts.push(`[${i + 1}] ${sub.join(', ')}`);
      });
    }
  } catch (_) {}

  return parts.length ? parts.join(' | ') : 'N/A';
};

export const exportRoomLogsToExcel = (room, logs) => {
  if (!window.XLSX) {
    alert('Excel library not loaded. Add SheetJS to your index.html.');
    return;
  }

  const XLSX = window.XLSX;
  const wb   = XLSX.utils.book_new();

  // ─────────────────────────────────────────────────────────────────────────────
  // Sheet 1 — Main Logs
  // Columns: Date & Time | Room Name | Status | Current Level | Temp | Humidity | Total Logs
  // If status = Critical → show full anomaly details in Status cell
  // ─────────────────────────────────────────────────────────────────────────────

  const HEADERS = [
    'Date & Time',
    'Room Name',
    'Status',
    'Current Level',
    'Temperature (°C)',
    'Humidity (%)',
    'Total Logs',
  ];

  const totalLogs = logs.length;

  const dataRows = logs.map((log, idx) => {
    const level      = String(log.level  || log.status || '').toLowerCase();
    const isCritical = level === 'critical' || level === 'error';

    // Status cell: if critical, expand with anomaly details
    const statusValue = isCritical
      ? `CRITICAL — ${buildAnomalyDetail(log)}`
      : fmt(log.status || log.level);

    return [
      fmtDate(log.created_at || log.timestamp),   // A — Date & Time
      fmt(log.coldroom_name || room.coldroom_name), // B — Room Name
      statusValue,                                  // C — Status
      fmt(log.level),                               // D — Current Level
      fmtNum(log.temperature ?? log.anomaly_temp),  // E — Temperature
      fmtNum(log.humidity    ?? log.anomaly_humid),  // F — Humidity
      idx === 0 ? totalLogs : '',                   // G — Total Logs (only on first row)
    ];
  });

  const logsSheet = XLSX.utils.aoa_to_sheet([HEADERS, ...dataRows]);

  // Column widths
  logsSheet['!cols'] = [
    { wch: 22 },  // Date & Time
    { wch: 16 },  // Room Name
    { wch: 52 },  // Status (wide — holds anomaly detail)
    { wch: 16 },  // Current Level
    { wch: 18 },  // Temperature
    { wch: 14 },  // Humidity
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
  const critical = logs.filter(l => ['critical','error'].includes(String(l.level||'').toLowerCase())).length;
  const warnings = logs.filter(l => String(l.level||'').toLowerCase() === 'warning').length;
  const normal   = logs.filter(l => String(l.level||'').toLowerCase() === 'normal').length;

  const summaryData = [
    ['ColdRoom AI Analytics — Export Report'],
    ['Generated', new Date().toLocaleString()],
    [''],
    ['ROOM SUMMARY'],
    ['Room Name',        fmt(room.coldroom_name)],
    ['Current Level',    fmt(room.level)],
    ['Temperature (°C)', fmtNum(room.temperature)],
    ['Humidity (%)',     fmtNum(room.humidity)],
    [''],
    ['LOG COUNTS'],
    ['Critical / Error', critical],
    ['Warnings',         warnings],
    ['Normal',           normal],
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
  const filename = `${room.coldroom_name}_logs_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
};