import { format, parseISO } from 'date-fns';

export function exportHistoryToCSV(historyEntries, projectName) {
  const headers = [
    'Date',
    'Time',
    'User',
    'Action',
    'Artist',
    'Previous Dates',
    'New Dates',
    'Previous Rate',
    'New Rate',
    'Duration Change'
  ];

  const rows = historyEntries.map(entry => {
    const date = parseISO(entry.timestamp);
    const action = entry.action;
    const changes = entry.changes;
    
    let artistName = '-';
    let prevDates = '-';
    let newDates = '-';
    let prevRate = '-';
    let newRate = '-';
    let durationChange = '-';
    
    if (action === 'created' && changes.after) {
      artistName = changes.after.artistName || '-';
      newDates = `${format(parseISO(changes.after.startDate), 'MMM d')} - ${format(parseISO(changes.after.endDate), 'MMM d')}`;
      newRate = changes.after.dailyRate ? `$${changes.after.dailyRate}` : '-';
      durationChange = changes.after.duration ? `${changes.after.duration} days` : '-';
    } else if (action === 'deleted' && changes.before) {
      artistName = changes.before.artistName || '-';
      prevDates = `${format(parseISO(changes.before.startDate), 'MMM d')} - ${format(parseISO(changes.before.endDate), 'MMM d')}`;
      prevRate = changes.before.dailyRate ? `$${changes.before.dailyRate}` : '-';
      durationChange = changes.before.duration ? `-${changes.before.duration} days` : '-';
    } else if (action === 'updated') {
      artistName = changes.after?.artistName || changes.before?.artistName || '-';
      
      if (changes.before) {
        prevDates = `${format(parseISO(changes.before.startDate), 'MMM d')} - ${format(parseISO(changes.before.endDate), 'MMM d')}`;
        prevRate = changes.before.dailyRate ? `$${changes.before.dailyRate}` : '-';
      }
      
      if (changes.after) {
        newDates = `${format(parseISO(changes.after.startDate), 'MMM d')} - ${format(parseISO(changes.after.endDate), 'MMM d')}`;
        newRate = changes.after.dailyRate ? `$${changes.after.dailyRate}` : '-';
      }
      
      if (changes.before?.duration && changes.after?.duration) {
        const diff = changes.after.duration - changes.before.duration;
        durationChange = diff === 0 ? 'No change' : `${diff > 0 ? '+' : ''}${diff} days`;
      }
    }
    
    return [
      format(date, 'yyyy-MM-dd'),
      format(date, 'HH:mm:ss'),
      entry.userEmail,
      entry.action.charAt(0).toUpperCase() + entry.action.slice(1),
      artistName,
      prevDates,
      newDates,
      prevRate,
      newRate,
      durationChange
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName.replace(/[^a-z0-9]/gi, '_')}_history_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}