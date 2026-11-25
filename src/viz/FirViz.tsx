import { useEffect, useRef, useState } from 'react';
import { firGolden, parseMem16 } from '../lib/dsp';
import { usePrefersReducedMotion, useVisible } from '../lib/hooks';
import { BASE } from '../data/profile';

// Measured v1 figures (Vivado post-route + SAIF power, see repository reports).
const MODES = [
  { p: 1, cyc: 49, msps: 2.04, dyn: 0.04, nj: 19.6 },
  { p: 2, cyc: 25, msps: 4.0, dyn: 0.041, nj: 10.3 },
  { p: 4, cyc: 13, msps: 7.69, dyn: 0.034, nj: 4.4 },
  { p: 8, cyc: 7, msps: 14.29, dyn: 0.038, nj: 2.7 },
];

type Data = { h: number[]; x: number[]; y: number[]; mismatches: number };

function Datapath({ p }: { p: number }) {
  const lanes = 8;
  return (
    <svg viewBox="0 0 640 230" width="100%" role="img" aria-label={`Datapath with ${p} of 8 MAC lanes active, ${48 / p} taps per lane.`}>
      <style>{`.flow{stroke-dasharray:4 6;animation:flow 1s linear infinite}@keyframes flow{to{stroke-dashoffset:-20}}@media (prefers-reduced-motion:reduce){.flow{animation:none}}`}</style>
      {/* input ROM + delay line */}
      <rect x="8" y="90" width="70" height="50" rx="3" fill="#12161a" stroke="#2b333c" />
      <text x="43" y="112" textAnchor="middle" fontSize="10" fill="#b4bbc2">input</text>
      <text x="43" y="126" textAnchor="middle" fontSize="10" fill="#b4bbc2">ROM</text>
      <path d="M78 115h22" stroke="var(--accent)" className="flow" />
      <rect x="100" y="20" width="96" height="190" rx="3" fill="#12161a" stroke="#2b333c" />
      <text x="148" y="38" textAnchor="middle" fontSize="10" fill="#b4bbc2">delay line</text>
      <text x="148" y="52" textAnchor="middle" fontSize="9" fill="#7d8791">48 × 16 b</text>
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={112 + (i % 3) * 25} y={64 + Math.floor(i / 3) * 34} width="20" height="26" rx="1" fill="rgba(95,216,238,.08)" stroke="#2b333c" />
      ))}
      {/* MAC lanes */}
      {Array.from({ length: lanes }, (_, j) => {
        const on = j < p;
        const y = 20 + j * 24;
        return (
          <g key={j}>
            <path d={`M196 ${y + 9}h34`} stroke={on ? 'var(--accent)' : '#2b333c'} className={on ? 'flow' : undefined} />
            <rect x="230" y={y} width="110" height="18" rx="2" fill={on ? 'rgba(95,216,238,.16)' : '#101317'} stroke={on ? 'var(--accent)' : '#2b333c'} />
            <text x="285" y={y + 12.5} textAnchor="middle" fontSize="9" fill={on ? '#e7e9eb' : '#7d8791'}>
              MAC {j} {on ? `· ${48 / p} taps` : '· idle'}
            </text>
            <path d={`M340 ${y + 9}h30`} stroke={on ? 'var(--accent)' : '#2b333c'} className={on ? 'flow' : undefined} />
          </g>
        );
      })}
      <rect x="370" y="20" width="96" height="190" rx="3" fill="#12161a" stroke="#2b333c" />
      <text x="418" y="108" textAnchor="middle" fontSize="10" fill="#b4bbc2">pipelined</text>
      <text x="418" y="122" textAnchor="middle" fontSize="10" fill="#b4bbc2">adder tree</text>
      <path d="M466 115h24" stroke="var(--accent)" className="flow" />
      <rect x="490" y="90" width="72" height="50" rx="3" fill="#12161a" stroke="#2b333c" />
      <text x="526" y="112" textAnchor="middle" fontSize="10" fill="#b4bbc2">round</text>
      <text x="526" y="126" textAnchor="middle" fontSize="10" fill="#b4bbc2">sat16</text>
      <path d="M562 115h24" stroke="var(--lime)" className="flow" />
      <text x="600" y="119" fontSize="11" fill="var(--lime)">y</text>
      <text x="8" y="226" fontSize="9" fill="#7d8791">16 b × Q1.15 → 32 b products → 40 b accumulator · idle lanes hold operands, zero coefficient</text>
    </svg>
  );
}

function Scope({ data }: { data: Data | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const visible = useVisible(ref);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const c = ref.current;
    if (!c || !data) return;
    const ctx = c.getContext('2d')!;
    let raf = 0;
    let off = 0;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = c.clientWidth, h = c.clientHeight;
      if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#1a1f25';
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo((w * i) / 8, 0); ctx.lineTo((w * i) / 8, h); ctx.stroke(); }
      for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, (h * i) / 4); ctx.lineTo(w, (h * i) / 4); ctx.stroke(); }
      const span = 250;
      const plot = (arr: number[], color: string, width: number) => {
        ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
        for (let i = 0; i <= span; i++) {
          const v = arr[(Math.floor(off) + i) % arr.length];
          const X = (i / span) * w, Y = h / 2 - (v / 32768) * (h * 0.46);
          if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
        }
        ctx.stroke();
      };
      plot(data.x, 'rgba(180,187,194,.35)', 1);
      plot(data.y, '#5fd8ee', 1.6);
      if (!reduced && visible) { off = (off + 0.6) % data.x.length; raf = requestAnimationFrame(draw); }
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [data, visible, reduced]);

  return <canvas ref={ref} style={{ width: '100%', height: 150, display: 'block' }} role="img" aria-label="Test input (grey) and filter output (cyan) computed from the project's coefficient and input files." />;
}

export default function FirViz() {
  const [p, setP] = useState(8);
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState(false);
  const m = MODES.find((q) => q.p === p)!;

  useEffect(() => {
    Promise.all(['coeffs', 'input', 'golden'].map((f) => fetch(`${BASE}data/${f}.mem`).then((r) => { if (!r.ok) throw 0; return r.text(); })))
      .then(([c, i, g]) => {
        const h = parseMem16(c), x = parseMem16(i), gold = parseMem16(g);
        const y = firGolden(h, x);
        setData({ h, x, y, mismatches: y.reduce((n, v, k) => n + (v !== gold[k] ? 1 : 0), 0) });
      })
      .catch(() => setErr(true));
  }, []);

  return (
    <div className="panel">
      <div className="panel__bar">
        <span className="panel__title">Reconfigurable datapath · v1 measured</span>
        <span className="panel__tag">Basys 3 · 100 MHz</span>
      </div>
      <div className="panel__body">
        <div className="ctl">
          <label id="fir-p">Active MAC lanes (sw[1:0])</label>
          <div className="seg" role="group" aria-labelledby="fir-p">
            {MODES.map((q) => (
              <button key={q.p} aria-pressed={q.p === p} onClick={() => setP(q.p)}>P = {q.p}</button>
            ))}
          </div>
        </div>
        <div className="scroll-x"><div style={{ minWidth: 460 }}><Datapath p={p} /></div></div>
        <div className="readouts" aria-live="polite">
          <div className="readout"><div className="readout__k">Cycles / output</div><div className="readout__v">{m.cyc}</div></div>
          <div className="readout"><div className="readout__k">Throughput</div><div className="readout__v">{m.msps} MS/s</div></div>
          <div className="readout"><div className="readout__k">Dynamic power</div><div className="readout__v">{m.dyn.toFixed(3)} W</div></div>
          <div className="readout"><div className="readout__k">Energy / output</div><div className="readout__v">≈ {m.nj} nJ</div></div>
        </div>
        <div style={{ marginTop: 18, border: '1px solid var(--line)', borderRadius: 4, padding: 10, background: '#0b0e11' }}>
          <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', color: 'var(--muted)', marginBottom: 6 }}>
            <span><span style={{ color: '#b4bbc2' }}>━</span> x: 0.2 + 12 + 46 MHz &nbsp; <span style={{ color: 'var(--accent)' }}>━</span> y: filtered</span>
            <span>
              {err ? 'data unavailable' : !data ? 'computing…' : (
                <span style={{ color: data.mismatches === 0 ? 'var(--lime)' : 'var(--amber)' }}>
                  ✓ {data.x.length - data.mismatches} / {data.x.length} match golden.mem
                </span>
              )}
            </span>
          </div>
          <Scope data={data} />
        </div>
      </div>
      <div className="panel__foot">
        The waveform is computed in your browser from the repository's coeffs.mem and input.mem with the same fixed-point
        arithmetic as the RTL, then compared sample-by-sample with golden.mem. Figures above are the measured v1 results.
      </div>
    </div>
  );
}
