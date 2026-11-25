import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion, useVisible } from '../lib/hooks';

// Cycle-level model of asynchronous_fifo.v (DEPTH 32, PTR_WIDTH 6).
type S = {
  mem: (number | null)[];
  wptr: number; rptr: number;           // 6-bit binary pointers
  rq1: number; rq2: number;             // gray(rptr) synchronised into wr_clk
  wq1: number; wq2: number;             // gray(wptr) synchronised into rd_clk
  data: number; out: number | null; wrBlocked: number; rdBlocked: number;
  last: string;
};
const gray = (b: number) => b ^ (b >> 1);
const bin = (g: number) => { let b = g; for (let s = 1; s < 6; s <<= 1) b ^= b >> s; return b & 63; };
const bits = (v: number, n = 6) => v.toString(2).padStart(n, '0');
const isFull = (s: S) => { const r = bin(s.rq2); return (s.wptr >> 5) !== (r >> 5) && (s.wptr & 31) === (r & 31); };
const isEmpty = (s: S) => bin(s.wq2) === s.rptr;
const init = (): S => ({ mem: Array(32).fill(null), wptr: 0, rptr: 0, rq1: 0, rq2: 0, wq1: 0, wq2: 0, data: 0xa0, out: null, wrBlocked: 0, rdBlocked: 0, last: 'reset' });

function wclk(s: S, wr: boolean): S {
  const n = { ...s, mem: s.mem.slice() };
  const full = isFull(s);
  if (wr && !full) { n.mem[s.wptr & 31] = s.data; n.wptr = (s.wptr + 1) & 63; n.data = (s.data + 1) & 0xff; n.last = `write ${s.data.toString(16).toUpperCase()}`; }
  else if (wr) { n.wrBlocked++; n.last = 'write blocked: full'; }
  else n.last = 'wr_clk edge';
  n.rq2 = s.rq1; n.rq1 = gray(s.rptr);
  return n;
}
function rclk(s: S, rd: boolean): S {
  const n = { ...s, mem: s.mem.slice() };
  const empty = isEmpty(s);
  if (rd && !empty) { n.out = s.mem[s.rptr & 31]; n.mem[s.rptr & 31] = null; n.rptr = (s.rptr + 1) & 63; n.last = `read ${n.out?.toString(16).toUpperCase()}`; }
  else if (rd) { n.rdBlocked++; n.last = 'read blocked: empty'; }
  else n.last = 'rd_clk edge';
  n.wq2 = s.wq1; n.wq1 = gray(s.wptr);
  return n;
}

export default function FifoViz() {
  const [s, setS] = useState<S>(init);
  const [auto, setAuto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useVisible(ref);
  const reduced = usePrefersReducedMotion();
  const full = isFull(s), empty = isEmpty(s);

  useEffect(() => {
    if (!auto || !visible) return;
    let k = 0;
    const id = setInterval(() => {
      k++;
      // wr_clk is 4× rd_clk (50 vs 12.5 MHz). Write in bursts, read continuously.
      setS((cur) => {
        let n = wclk(cur, Math.floor(k / 24) % 2 === 0);
        if (k % 4 === 0) n = rclk(n, Math.floor(k / 24) % 2 === 1 || k % 8 === 0);
        return n;
      });
    }, reduced ? 400 : 140);
    return () => clearInterval(id);
  }, [auto, visible, reduced]);

  const R = 92, cx = 150, cy = 120;
  const slot = (i: number) => {
    const a0 = ((i - 8) / 32) * Math.PI * 2, a1 = ((i - 7) / 32) * Math.PI * 2 - 0.02;
    const p = (a: number, r: number) => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
    return `M${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} L${p(a1, R - 22)} A${R - 22} ${R - 22} 0 0 0 ${p(a0, R - 22)} Z`;
  };
  const ptr = (i: number, r: number) => {
    const a = ((i - 7.5) / 32) * Math.PI * 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const wp = ptr(s.wptr & 31, R + 12), rp = ptr(s.rptr & 31, R - 34);

  const Dom = ({ title, color, rows, flag, flagOn }: { title: string; color: string; rows: [string, string][]; flag: string; flagOn: boolean }) => (
    <div style={{ border: `1px solid var(--line)`, borderTop: `2px solid ${color}`, borderRadius: 4, background: '#0b0e11', padding: '10px 12px', minWidth: 0 }}>
      <div className="mono" style={{ color, marginBottom: 8 }}>{title}</div>
      {rows.map(([k, v]) => (
        <div key={k} className="mono" style={{ display: 'flex', justifyContent: 'space-between', gap: 8, color: 'var(--text-2)', lineHeight: 1.9 }}>
          <span style={{ color: 'var(--muted)' }}>{k}</span><span>{v}</span>
        </div>
      ))}
      <div className="mono" style={{ marginTop: 6, color: flagOn ? 'var(--amber)' : 'var(--muted)' }}>{flag} = {flagOn ? 1 : 0}</div>
    </div>
  );

  return (
    <div className="panel" ref={ref}>
      <div className="panel__bar">
        <span className="panel__title">Dual-clock FIFO · 32 × 8</span>
        <span className="panel__tag">{s.last}</span>
      </div>
      <div className="panel__body">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr) minmax(0,1fr)', gap: 10, alignItems: 'center' }} className="fifo-grid">
          <Dom title="WRITE · 50 MHz" color="var(--accent)" flag="full" flagOn={full}
            rows={[['wptr', bits(s.wptr)], ['gray', bits(gray(s.wptr))], ['rq1 ← rptr', bits(s.rq1)], ['rq2 (sync)', bits(s.rq2)]]} />
          <svg viewBox="40 10 220 220" width="100%" role="img" aria-label={`FIFO ring with ${(s.wptr - s.rptr) & 63} words stored. full ${full ? 1 : 0}, empty ${empty ? 1 : 0}.`}>
            {s.mem.map((v, i) => (
              <path key={i} d={slot(i)} fill={v === null ? '#12161a' : 'rgba(95,216,238,.22)'} stroke="#2b333c" strokeWidth=".8" />
            ))}
            <circle cx={wp.x} cy={wp.y} r="5" fill="var(--accent)" />
            <circle cx={rp.x} cy={rp.y} r="5" fill="var(--lime)" />
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="20" fill="#e7e9eb">{(s.wptr - s.rptr) & 63}</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="8" fill="#7d8791">words held</text>
            <text x={cx} y={cy + 24} textAnchor="middle" fontSize="9" fill="var(--lime)">out {s.out === null ? '--' : s.out.toString(16).toUpperCase()}</text>
          </svg>
          <Dom title="READ · 12.5 MHz" color="var(--lime)" flag="empty" flagOn={empty}
            rows={[['rptr', bits(s.rptr)], ['gray', bits(gray(s.rptr))], ['wq1 ← wptr', bits(s.wq1)], ['wq2 (sync)', bits(s.wq2)]]} />
        </div>
        <style>{`@media (max-width:560px){.fifo-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}.fifo-grid>svg{grid-column:1/-1;order:-1;max-width:280px;justify-self:center}}`}</style>
        <div className="btn-row" style={{ marginTop: 14 }}>
          <button className="btn btn-sm" onClick={() => setS((c) => wclk(c, true))}>wr_clk ↑ · write</button>
          <button className="btn btn-sm" onClick={() => setS((c) => wclk(c, false))}>wr_clk ↑ · idle</button>
          <button className="btn btn-sm" onClick={() => setS((c) => rclk(c, true))}>rd_clk ↑ · read</button>
          <button className="btn btn-sm" onClick={() => setS((c) => rclk(c, false))}>rd_clk ↑ · idle</button>
          <button className="btn btn-sm btn--primary" aria-pressed={auto} onClick={() => setAuto((a) => !a)}>{auto ? 'Stop clocks' : 'Run both clocks'}</button>
          <button className="btn btn-sm" onClick={() => { setAuto(false); setS(init()); }}>Reset</button>
        </div>
        <div className="readouts">
          <div className="readout"><div className="readout__k">Writes blocked by full</div><div className="readout__v">{s.wrBlocked}</div></div>
          <div className="readout"><div className="readout__k">Reads blocked by empty</div><div className="readout__v">{s.rdBlocked}</div></div>
        </div>
      </div>
      <div className="panel__foot">
        Each pointer crosses domains as Gray code through two flip-flops, so a flag can only be pessimistic: after a write,
        empty stays high for two read-clock edges; after a read, full clears two write-clock edges later. Try it step by step.
      </div>
    </div>
  );
}
