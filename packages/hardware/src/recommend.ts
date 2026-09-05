import type { HardwareInfo } from './detect.js';

export interface Recommendation {
  params: string;
  quant: string;
  fileSizeEstimate: number;
  headroom: number;
  memoryAvailable: number;
  usable: boolean;
}

export const HEADROOM = 2 * 1024 ** 3;

export const BPW: Record<string, number> = {
  Q2_K: 3.35,
  Q3_K_M: 3.91,
  Q4_K_M: 4.85,
  Q5_K_M: 5.69,
  Q6_K: 6.57,
  Q8_0: 8.50,
};

const QUANT_RANK = ['Q8_0', 'Q6_K', 'Q5_K_M', 'Q4_K_M', 'Q3_K_M', 'Q2_K'];
const MODEL_SIZES = ['1B', '3B', '7B', '8B', '13B', '34B', '70B'] as const;

export function parseParamCount(s: string): number {
  const m = s.match(/^([\d.]+)B$/i);
  return m ? parseFloat(m[1]) * 1e9 : 0;
}

export function estimateFileSize(paramCount: number, quant: string): number {
  const bpw = BPW[quant] ?? BPW.Q4_K_M;
  return Math.ceil(paramCount * bpw / 8);
}

export function pickQuant(
  quants: string[],
  paramCount: number,
  availableBytes: number,
): { quant: string; sizeEstimate: number } | null {
  const sorted = [...quants].sort((a, b) => (BPW[b] ?? 0) - (BPW[a] ?? 0));
  for (const quant of sorted) {
    const size = estimateFileSize(paramCount, quant);
    if (size <= availableBytes) {
      return { quant, sizeEstimate: size };
    }
  }
  return null;
}

export function recommend(hw: HardwareInfo): Recommendation {
  const available = hw.ram.available - HEADROOM;

  if (available <= 0) {
    return {
      params: '0',
      quant: 'none',
      fileSizeEstimate: 0,
      headroom: 0,
      memoryAvailable: Math.max(0, hw.ram.available),
      usable: false,
    };
  }

  for (let i = MODEL_SIZES.length - 1; i >= 0; i--) {
    const params = MODEL_SIZES[i];
    const paramCount = parseParamCount(params);
    const picked = pickQuant(QUANT_RANK, paramCount, available);
    if (picked) {
      return {
        params,
        quant: picked.quant,
        fileSizeEstimate: picked.sizeEstimate,
        headroom: available - picked.sizeEstimate,
        memoryAvailable: available,
        usable: true,
      };
    }
  }

  return {
    params: '0',
    quant: 'none',
    fileSizeEstimate: 0,
    headroom: 0,
    memoryAvailable: available,
    usable: false,
  };
}
