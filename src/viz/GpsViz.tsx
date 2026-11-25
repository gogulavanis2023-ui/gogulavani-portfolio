import { useEffect, useMemo, useRef, useState } from 'react';
import { acquisitionPlan, CA_TAPS, caCode, lfsrInit, lfsrStep, TRUE_OFFSET, type LfsrState } from '../lib/dsp';
import { usePrefersReducedMotion, useVisible } from '../lib/hooks';

const W = 460;
const fmtTime = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${Math.round(s % 60)} s` : `${s.toFixed(1)} s`);

function SearchSpace() {
  const [N, setN] = useState(8);
  const [period, setPeriod] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = usePrefersReducedMotion();
  const plan = useMemo(() => acquisitionPlan(N), [N]);
  const locked = period >= plan.periods;

  useEffect(() => { setPeriod(0); setPlaying(false); }, [N]);

  useEffect(() => {
    if (!playing) return;
    if (reduced) { setPeriod(plan.periods); setPlaying(false); return; }
    let raf = 0;
    const start = performance.now();
    const dur = 900 + Math.min(4200, plan.periods * 6); // longer searches take visibly longer
    const tick = (now: number) => {
      const f = Math.min(1, (now - start) / dur);
      setPeriod(Math.round(f * plan.periods));
      if (f < 1) raf = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, plan.periods, reduced]);

  const x = (off: number) => (off / 1023) * W;
  const slices = Array.from({ length: N }, (_, i) => {
    const start = i * plan.range;
    const tested = Math.min(period, plan.range);
    const isLockSlice = i === plan.slice;
    const head = isLockSlice && locked ? TRUE_OFFSET : start + ((period - 1 + plan.range) % plan.range) + 1;
    return { i, start, tested, isLockSlice, head };
  });

  return (
    <div>
      <div className="ctl">
        <label htmlFor="gps-n">Active correlators N = <b style={{ color: 'var(--accent)' }}>{N}</b></label>
      </div>
      <input id="gps-n" type="range" min={1} max={32} value={N} onChange={(e) => setN(+e.target.value)} aria-describedby="gps-n-help" />
      <p id="gps-n-help" className="mono" style={{ color: 'var(--muted)', margin: '2px 0 12px', overflowWrap: 'anywhere' }}>
        sw[4:0] on the board · range per slice = ⌊1023 / N⌋ = {plan.range}
      </p>

      <svg viewBox={`0 0 ${W} 112`} width="100%" role="img" aria-label={`Code-phase search space split into ${N} slices of ${plan.range} offsets. True offset ${TRUE_OFFSET}.`}>
        <text x="0" y="12" fontSize="11" fill="#7d8791">code phase 0</text>
        <text x={W} y="12" fontSize="11" fill="#7d8791" textAnchor="end">1023</text>
        {slices.map((s) => (
          <g key={s.i}>
            <rect x={x(s.start)} y={22} width={Math.max(1, x(plan.range) - 1.5)} height={44} fill={s.i % 2 ? '#1c232a' : '#252e37'} />
            <rect x={x(s.start)} y={22} width={x(s.tested)} height={44} fill={s.isLockSlice && locked ? 'rgba(185,231,105,.35)' : 'rgba(95,216,238,.28)'} />
            {period > 0 && <rect x={x(s.head) - 1} y={18} width={2} height={52} fill={s.isLockSlice && locked ? 'var(--lime)' : 'var(--accent)'} />}
          </g>
        ))}
        <line x1={x(TRUE_OFFSET)} x2={x(TRUE_OFFSET)} y1={72} y2={84} stroke="var(--lime)" strokeWidth="1.5" />
        <text x={x(TRUE_OFFSET)} y={100} fontSize="11" fill="var(--lime)" textAnchor="middle">true offset 800</text>
      </svg>
      <p className="mono" style={{ color: 'var(--muted)', margin: '4px 0 0' }}>
        {N} slice{N > 1 ? 's' : ''} × {plan.range} offsets · each slice tests one offset per 1023-chip period
      </p>

      <div className="btn-row" style={{ marginTop: 12 }}>
        <button className="btn btn-sm btn--primary" onClick={() => { setPeriod(0); setPlaying(true); }} disabled={playing}>
          {period > 0 ? 'Run again' : 'Run acquisition'}
        </button>
      </div>

      <div className="readouts" aria-live="polite">
        <div className="readout"><div className="readout__k">Periods elapsed</div><div className="readout__v">{period}</div></div>
        <div className="readout"><div className="readout__k">Periods to lock</div><div className="readout__v">{plan.periods}</div></div>
        <div className="readout"><div className="readout__k">At 500 Hz chip clk</div><div className="readout__v">{fmtTime(plan.seconds)}</div></div>
        <div className="readout"><div className="readout__k">Status</div><div className={`readout__v ${locked ? 'ok' : ''}`}>{locked ? `LOCK · slice ${plan.slice}` : playing ? 'searching…' : 'idle'}</div></div>
      </div>
    </div>
  );
}

function Lfsr() {
  const [prn, setPrn] = useState(1);
  const [sim, setSim] = useState<{ s: LfsrState; chips: number[]; n: number }>({ s: lfsrInit(), chips: [], n: 0 });
  const [auto, setAuto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useVisible(ref);
  const [a, b] = CA_TAPS[prn];
  const octal = useMemo(() => parseInt(caCode(prn, 10).join(''), 2).toString(8), [prn]);
  const state = sim.s;
  const chips = sim.chips;

  const reset = (p = prn) => { setPrn(p); setSim({ s: lfsrInit(), chips: [], n: 0 }); };
  const step = () =>
    setSim((cur) => {
      const r = lfsrStep(cur.s, prn);
      return { s: r.next, chips: [...cur.chips, r.chip].slice(-40), n: cur.n + 1 };
    });

  useEffect(() => {
    if (!auto || !visible) return;
    const id = setInterval(step, 260);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, visible, prn]);

  const Reg = ({ bits, label, taps, out }: { bits: number[]; label: string; taps: number[]; out: number[] }) => (
    <g>
      <text x="0" y="-8" fontSize="10" fill="#7d8791">{label}</text>
      {bits.map((v, i) => (
        <g key={i} transform={`translate(${i * 40} 0)`}>
          <rect width="34" height="30" rx="2" fill={v ? 'rgba(95,216,238,.18)' : '#12161a'} stroke={taps.includes(i + 1) ? 'var(--accent)' : out.includes(i + 1) ? 'var(--lime)' : '#2b333c'} />
          <text x="17" y="20" textAnchor="middle" fontSize="13" fill={v ? '#e7e9eb' : '#8a939c'}>{v}</text>
          <text x="17" y="44" textAnchor="middle" fontSize="8" fill="#8a939c">{i + 1}</text>
        </g>
      ))}
    </g>
  );

  return (
    <div ref={ref}>
      <div className="ctl">
        <label>PRN</label>
        <div className="seg" role="group" aria-label="Satellite PRN">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
            <button key={p} aria-pressed={p === prn} onClick={() => reset(p)}>{p}</button>
          ))}
        </div>
      </div>
      <div className="scroll-x">
        <svg viewBox="0 0 420 190" width="100%" style={{ minWidth: 360 }} role="img" aria-label={`G1 and G2 shift registers for PRN ${prn}. G2 phase taps ${a} and ${b}.`}>
          <g transform="translate(10 22)"><Reg bits={state.g1} label="G1 · taps 3, 10 · output stage 10" taps={[3, 10]} out={[10]} /></g>
          <g transform="translate(10 98)"><Reg bits={state.g2} label={`G2 · taps 2,3,6,8,9,10 · phase select ${a} ⊕ ${b}`} taps={[a, b]} out={[]} /></g>
          <text x="10" y="172" fontSize="10" fill="#7d8791">C/A out</text>
          {chips.map((c, i) => (
            <rect key={i} x={70 + i * 8.5} y={162 + (c ? 0 : 8)} width="8" height="2" fill={c ? 'var(--accent)' : '#8a939c'} />
          ))}
        </svg>
      </div>
      <div className="btn-row">
        <button className="btn btn-sm" onClick={step}>Clock once</button>
        <button className="btn btn-sm" aria-pressed={auto} onClick={() => setAuto((v) => !v)}>{auto ? 'Pause' : 'Run clock'}</button>
        <button className="btn btn-sm" onClick={() => reset()}>Reset</button>
      </div>
      <div className="readouts">
        <div className="readout"><div className="readout__k">First 10 chips (octal)</div><div className="readout__v ok">{octal}</div></div>
        <div className="readout"><div className="readout__k">Chips generated</div><div className="readout__v">{sim.n}</div></div>
      </div>
    </div>
  );
}

export default function GpsViz() {
  const [tab, setTab] = useState<'search' | 'lfsr'>('search');
  return (
    <div className="panel">
      <div className="panel__bar">
        <span className="panel__title">Acquisition engine · interactive</span>
        <div className="seg" role="tablist" aria-label="View">
          <button role="tab" aria-selected={tab === 'search'} aria-pressed={tab === 'search'} onClick={() => setTab('search')}>Search</button>
          <button role="tab" aria-selected={tab === 'lfsr'} aria-pressed={tab === 'lfsr'} onClick={() => setTab('lfsr')}>G1/G2</button>
        </div>
      </div>
      <div className="panel__body">{tab === 'search' ? <SearchSpace /> : <Lfsr />}</div>
      <div className="panel__foot">
        {tab === 'search'
          ? 'Timing follows correlator_slice.v: the slice holding offset 800 steps one delay per 1023-chip period until the agreement count reaches 950. Animation time is compressed.'
          : 'Bit-exact C/A generator from the GPS ICD (PRN 1 starts 1440 octal). Used here as the reference model the RTL is checked against.'}
      </div>
    </div>
  );
}
