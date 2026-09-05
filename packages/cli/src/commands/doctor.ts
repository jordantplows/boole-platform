import { detect, recommend } from '@boole/hardware';
import { alignTable, formatBytes } from '../format.js';

export default async function doctor(): Promise<void> {
  const hw = await detect();
  const rec = recommend(hw);

  const gpuLabel = hw.gpu.backend === 'none'
    ? 'none'
    : `${hw.gpu.devices[0] || hw.gpu.backend} (${hw.gpu.backend})`;

  const rows: Array<[string, string]> = [
    ['OS', hw.os],
    ['Arch', hw.arch],
    ['Node', hw.nodeVersion],
    ['RAM', `${formatBytes(hw.ram.total)} total, ${formatBytes(hw.ram.available)} available`],
    ['GPU', gpuLabel],
  ];

  if (hw.gpu.vram) {
    rows.push([
      'VRAM',
      `${formatBytes(hw.gpu.vram.total)} total, ${formatBytes(hw.gpu.vram.free)} free`,
    ]);
  }

  rows.push(
    ['Binaries', hw.binaries],
    ['Cache', `${hw.cache.path} (${formatBytes(hw.cache.sizeBytes)})`],
  );

  process.stderr.write('\n' + alignTable(rows) + '\n\n');

  if (rec.usable) {
    process.stderr.write(
      `  Verdict     can run ${rec.params} ${rec.quant} (~${formatBytes(rec.fileSizeEstimate)})\n` +
      `              ${formatBytes(rec.memoryAvailable)} usable, ${formatBytes(rec.headroom)} headroom\n\n`,
    );
    process.exit(0);
  } else {
    process.stderr.write(
      `  Verdict     not enough memory for inference\n` +
      `              ${formatBytes(hw.ram.available)} total available, need >2 GB free\n\n`,
    );
    process.exit(1);
  }
}
