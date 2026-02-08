function normalizeTimestamp(ts: unknown): Date | null {
  if (!ts) return null;
  
  if (typeof ts === 'number') {
    const msTs = ts > 10000000000 ? ts : ts * 1000;
    return new Date(msTs);
  }
  
  if (typeof ts === 'string') {
    const cleanTs = ts.replace(' MST', '').replace(' MDT', '');
    return new Date(cleanTs);
  }
  
  if (ts instanceof Date) {
    return ts;
  }
  
  return null;
}

export function formatTime(ts: unknown): string {
  const date = normalizeTimestamp(ts);
  if (!date || isNaN(date.getTime())) {
    return typeof ts === 'string' ? ts : '';
  }
  
  return date.toLocaleString('en-US', { 
    month: 'numeric', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  }).replace(',', '');
}

export function formatTimeWithSeconds(ts: unknown): string {
  const date = normalizeTimestamp(ts);
  if (!date || isNaN(date.getTime())) {
    return typeof ts === 'string' ? ts : '';
  }
  
  return date.toLocaleString('en-US', { 
    month: 'numeric', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  }).replace(',', '');
}

export function formatChartTime(ts: unknown): string {
  const date = normalizeTimestamp(ts);
  if (!date || isNaN(date.getTime())) {
    return typeof ts === 'string' ? ts : '';
  }
  
  return date.toLocaleString('en-US', { 
    month: 'numeric', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  }).replace(',', '').replace(' ', '\n');
}
