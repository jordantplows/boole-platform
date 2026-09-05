export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export function formatTime(seconds: number): string {
  if (seconds <= 0 || !isFinite(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function alignTable(rows: Array<[string, string]>, indent = 2): string {
  const maxLabel = Math.max(...rows.map(([l]) => l.length));
  return rows
    .map(([label, value]) => ' '.repeat(indent) + label.padEnd(maxLabel + 2) + value)
    .join('\n');
}
