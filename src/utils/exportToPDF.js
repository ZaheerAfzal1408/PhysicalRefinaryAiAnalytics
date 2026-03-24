import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportRoomLogsToPDF = (room, logs) => {
  const doc = new jsPDF();

  // Title Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(`Tank Level AI Diagnostics - ${(room.tank_name || '').replace(/_/g, ' ').toUpperCase()}`, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Total Logs Exported: ${logs.length}`, 14, 34);

  // Table Data Mapping
  const tableData = logs.map((log) => {
    const timeStr = new Date(log.timestamp || log.created_at || log.anomaly_time || '').toLocaleString();
    const lFeet = log.level_feet != null ? parseFloat(log.level_feet).toFixed(3) : 'N/A';
    const rawStatus = (log.level || 'Normal').toUpperCase();
    const threshStr = log.threshold != null ? parseFloat(log.threshold).toFixed(3) : '-';
    const mseStr = log.mse != null ? Number(log.mse).toExponential(2) : '-';

    return [
      timeStr,
      lFeet,
      threshStr,
      mseStr,
      rawStatus
    ];
  });

  autoTable(doc, {
    startY: 42,
    head: [['Timestamp', 'Level (ft)', 'Threshold (ft)', 'AI Error (MSE)', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], halign: 'left', fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { textColor: [15, 23, 42], fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.raw === 'CRITICAL' || data.cell.raw === 'ERROR') {
          data.cell.styles.textColor = [239, 68, 68];
        } else if (data.cell.raw === 'WARNING') {
          data.cell.styles.textColor = [245, 158, 11];
        } else {
          data.cell.styles.textColor = [34, 197, 94];
        }
      }
    }
  });

  doc.save(`${room.tank_name}_Diagnostics.pdf`);
};
