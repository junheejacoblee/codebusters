// ms -> "1:23.4"
export function formatTime(ms) {
  if (!ms && ms !== 0) return '—';
  const totalSeconds = ms / 1000;
  const mins = Math.floor(totalSeconds / 60);
  const secs = (totalSeconds % 60).toFixed(1).padStart(4, '0');
  return mins > 0 ? `${mins}:${secs}` : `${secs}s`;
}

// ms -> "1m 23s"
export function formatTimeVerbose(ms) {
  if (!ms && ms !== 0) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}
