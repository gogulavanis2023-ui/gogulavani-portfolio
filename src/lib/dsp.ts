// Bit-accurate reference models used by the interactive visualisations.

/** Parse a $readmemh-style file of 16-bit two's-complement words. */
export function parseMem16(text: string): number[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      const v = parseInt(w, 16);
      return v >= 0x8000 ? v - 0x10000 : v;
    });
}

/** FIR golden model, identical to fir_design.py: y = sat16((Σ h[k]·x[n−k] + 2^14) >> 15), zero history. */
export function firGolden(h: number[], x: number[]): number[] {
  const y: number[] = new Array(x.length);
  for (let n = 0; n < x.length; n++) {
    let acc = 0; // max |acc| < 2^31 · 48 fits a JS double exactly (< 2^53)
    for (let k = 0; k < h.length; k++) {
      const i = n - k;
      if (i >= 0) acc += h[k] * x[i];
    }
    const v = Math.floor((acc + 16384) / 32768); // arithmetic >> 15
    y[n] = Math.max(-32768, Math.min(32767, v));
  }
  return y;
}

/** GPS C/A code generator, reference model from the GPS ICD (stages 1..10, output stage 10). */
export type LfsrState = { g1: number[]; g2: number[] };
export const CA_TAPS: Record<number, [number, number]> = {
  1: [2, 6], 2: [3, 7], 3: [4, 8], 4: [5, 9], 5: [1, 9], 6: [2, 10], 7: [1, 8], 8: [2, 9],
};
export function lfsrInit(): LfsrState {
  return { g1: new Array(10).fill(1), g2: new Array(10).fill(1) };
}
export function lfsrStep(s: LfsrState, prn: number): { next: LfsrState; chip: number; g1out: number; g2sel: number } {
  const [a, b] = CA_TAPS[prn];
  const g1out = s.g1[9];
  const g2sel = s.g2[a - 1] ^ s.g2[b - 1];
  const chip = g1out ^ g2sel;
  const f1 = s.g1[2] ^ s.g1[9];
  const f2 = s.g2[1] ^ s.g2[2] ^ s.g2[5] ^ s.g2[7] ^ s.g2[8] ^ s.g2[9];
  return { next: { g1: [f1, ...s.g1.slice(0, 9)], g2: [f2, ...s.g2.slice(0, 9)] }, chip, g1out, g2sel };
}
export function caCode(prn: number, n = 1023): number[] {
  let s = lfsrInit();
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const r = lfsrStep(s, prn);
    out.push(r.chip);
    s = r.next;
  }
  return out;
}

/**
 * Acquisition timing derived from correlator_top.v / correlator_slice.v:
 * range = floor(1023 / N); slice i covers offsets i·range+1 … i·range+range;
 * each 1023-chip period tests one offset; locked_offset = range_start + d + 1.
 */
export const TRUE_OFFSET = 800; // delay_line DELAY_CHIPS
export const CHIP_HZ = 500; // 100 MHz / (2 · 100 000)
export function acquisitionPlan(N: number) {
  const range = Math.floor(1023 / N);
  const slice = Math.floor((TRUE_OFFSET - 1) / range);
  const d = TRUE_OFFSET - 1 - slice * range;
  const periods = d + 1;
  const seconds = (periods * 1023) / CHIP_HZ;
  return { range, slice, periods, seconds };
}
