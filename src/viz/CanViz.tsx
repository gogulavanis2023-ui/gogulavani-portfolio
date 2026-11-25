import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion, useVisible } from '../lib/hooks';

type NodeId = 'N1' | 'N2' | 'N3' | 'ATK' | 'FOR';
type Scenario = 'normal' | 'A' | 'B' | 'C';
type Wave = { key: number; from: NodeId; id: number; start: number; attack: boolean };
type Log = { key: number; t: number; id: number; text: string; alarm: boolean };

// Bench from Simulation2_Digital_Twin_Testbed.py: N1 0x100 every 20 ms, N2 0x200 every 40 ms, N3 0x300 every 100 ms.
const NODES: Record<NodeId, { x: number; label: string; sub: string }> = {
  N1: { x: 90, label: 'N1', sub: '0x100 · 20 ms' },
  N2: { x: 205, label: 'N2', sub: '0x200 · 40 ms' },
  N3: { x: 320, label: 'N3', sub: '0x300 · 100 ms' },
  ATK: { x: 445, label: 'ATK', sub: 'unseen device' },
  FOR: { x: 560, label: 'FOR', sub: 'foreign (e.g. OBD)' },
};
const GUARD_X = 320;
const SLOW = 25; // 1 ms of bus time = 25 ms on screen

const SCEN: Record<Scenario, { label: string; desc: string; latency?: string }> = {
  normal: { label: 'Normal', desc: 'Only enrolled ECUs transmit. Every frame’s physical sender matches the owner of its ID.' },
  A: { label: 'A · Masquerade', desc: 'N1 is silenced and an unseen device sends 0x100. Its fingerprint fails the open-set check.', latency: '0.12 s' },
  B: { label: 'B · Spoof', desc: 'A compromised N3 injects extra 0x100 frames (30 % of 0x100 traffic) while N1 keeps running. Per-ID CUSUM accumulates the mismatches.', latency: '7.27 s' },
  C: { label: 'C · Foreign', desc: 'N3 is silenced and a foreign device sends 0x300. Its fingerprint is outside every enrolled class.', latency: '0.70 s' },
};

function schedule(s: Scenario): { from: NodeId; id: number; period: number; phase: number; attack: boolean }[] {
  const n1 = { from: 'N1' as NodeId, id: 0x100, period: 20, phase: 0, attack: false };
  const n2 = { from: 'N2' as NodeId, id: 0x200, period: 40, phase: 7, attack: false };
  const n3 = { from: 'N3' as NodeId, id: 0x300, period: 100, phase: 13, attack: false };
  if (s === 'A') return [{ ...n1, from: 'ATK', attack: true }, n2, n3];
  if (s === 'B') return [n1, n2, n3, { from: 'N3', id: 0x100, period: 46.7, phase: 11, attack: true }]; // ≈ 30 % of 0x100 traffic
  if (s === 'C') return [n1, n2, { ...n3, from: 'FOR', attack: true }];
  return [n1, n2, n3];
}

function verdict(w: Wave, s: Scenario): { text: string; alarm: boolean } {
  const hex = `0x${w.id.toString(16).toUpperCase()}`;
  if (!w.attack) return { text: `${hex} · sender ${w.from} ✓ owner`, alarm: false };
  if (s === 'B') return { text: `${hex} · physically N3 → SENDER MISMATCH`, alarm: true };
  return { text: `${hex} · UNKNOWN DEVICE (open-set reject)`, alarm: true };
}

export default function CanViz() {
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [waves, setWaves] = useState<Wave[]>([]);
  const [log, setLog] = useState<Log[]>([]);
  const [now, setNow] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useVisible(ref);
  const reduced = usePrefersReducedMotion();
  const keyRef = useRef(0);

  useEffect(() => { setWaves([]); setLog([]); setNow(0); }, [scenario]);

  useEffect(() => {
    if (!visible || reduced) return;
    const sched = schedule(scenario);
    const next = sched.map((q) => q.phase);
    let raf = 0;
    let busT = 0;
    let last = performance.now();
    let live: (Wave & { logged: boolean })[] = [];
    let logBuf: Log[] = [];
    const tick = (t: number) => {
      const dt = Math.min(50, t - last) / SLOW;
      last = t;
      busT += dt;
      sched.forEach((q, i) => {
        while (busT >= next[i]) {
          live.push({ key: keyRef.current++, from: q.from, id: q.id, start: next[i], attack: q.attack, logged: false });
          next[i] += q.period;
        }
      });
      live = live.filter((w) => busT - w.start < 12);
      // Log a frame once its wavefront reaches the guardian tap.
      const arrived = live.filter((w) => !w.logged && (busT - w.start) * 60 >= Math.abs(NODES[w.from].x - GUARD_X));
      if (arrived.length) {
        arrived.forEach((w) => (w.logged = true));
        logBuf = [...arrived.map((w) => ({ key: w.key, t: w.start, id: w.id, ...verdict(w, scenario) })).reverse(), ...logBuf].slice(0, 6);
        setLog(logBuf);
      }
      setNow(busT);
      setWaves(live.slice());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scenario, visible, reduced]);

  const active = new Set(schedule(scenario).map((q) => q.from));
  const silenced: NodeId[] = scenario === 'A' ? ['N1'] : scenario === 'C' ? ['N3'] : [];

  return (
    <div className="panel" ref={ref}>
      <div className="panel__bar">
        <span className="panel__title">Guardian on a 125 kbit/s bus</span>
        <span className="panel__tag">slowed {SLOW}×</span>
      </div>
      <div className="panel__body">
        <div className="ctl">
          <div className="seg" role="group" aria-label="Attack scenario">
            {(Object.keys(SCEN) as Scenario[]).map((s) => (
              <button key={s} aria-pressed={s === scenario} onClick={() => setScenario(s)}>{SCEN[s].label}</button>
            ))}
          </div>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: '.9rem', margin: '0 0 10px', minHeight: '3em' }}>{SCEN[scenario].desc}</p>
        <div className="scroll-x">
          <svg viewBox="0 0 640 250" width="100%" style={{ minWidth: 480 }} role="img" aria-label={`CAN bus with nodes N1, N2, N3 and a guardian. Scenario: ${SCEN[scenario].label}.`}>
            {/* bus with terminations */}
            <path d="M30 120H610" stroke="#3a434d" strokeWidth="2" />
            <path d="M30 130H610" stroke="#2b333c" strokeWidth="2" />
            <text x="614" y="124" fontSize="8" fill="#7d8791">H</text>
            <text x="614" y="134" fontSize="8" fill="#7d8791">L</text>
            {[22, 602].map((x) => (
              <g key={x}><rect x={x} y="116" width="8" height="18" fill="none" stroke="#8a939c" /><text x={x + 4} y="146" fontSize="7" fill="#8a939c" textAnchor="middle">120Ω</text></g>
            ))}
            {/* broadcast wavefronts */}
            {waves.map((w) => {
              const r = Math.max(0, (now - w.start) * 60);
              const x0 = NODES[w.from].x;
              const fade = Math.max(0, 1 - (now - w.start) / 12);
              const col = w.attack ? '242,180,90' : '95,216,238';
              return (
                <g key={w.key} opacity={fade}>
                  <path d={`M${Math.max(30, x0 - r)} 125H${Math.min(610, x0 + r)}`} stroke={`rgba(${col},.9)`} strokeWidth="4" />
                  <text x={x0} y={108 - ((w.key % 2) * 0)} fontSize="9" textAnchor="middle" fill={`rgb(${col})`}>0x{w.id.toString(16).toUpperCase()}</text>
                </g>
              );
            })}
            {/* nodes */}
            {(Object.keys(NODES) as NodeId[]).map((k) => {
              const n = NODES[k];
              const on = active.has(k);
              const attackNode = k === 'ATK' || k === 'FOR';
              const off = silenced.includes(k);
              const stroke = off ? '#3a434d' : on ? (attackNode ? 'var(--amber)' : 'var(--accent)') : '#2b333c';
              return (
                <g key={k} opacity={on || !attackNode ? 1 : 0.35}>
                  <path d={`M${n.x} 62V120M${n.x + 6} 62V130`} stroke={stroke} strokeWidth="1" />
                  <rect x={n.x - 40} y="22" width="80" height="40" rx="3" fill="#12161a" stroke={stroke} />
                  <text x={n.x} y="39" fontSize="12" textAnchor="middle" fill={off ? '#8a939c' : '#e7e9eb'}>{n.label}{off ? ' (off)' : ''}</text>
                  <text x={n.x} y="55" fontSize="9.5" textAnchor="middle" fill="#7d8791">{n.sub}</text>
                </g>
              );
            })}
            {/* guardian */}
            <path d={`M${GUARD_X} 130V170M${GUARD_X + 6} 120V170`} stroke="var(--lime)" />
            <rect x={GUARD_X - 150} y="170" width="300" height="70" rx="3" fill="#0f1310" stroke="var(--lime)" />
            <text x={GUARD_X} y="188" fontSize="11" textAnchor="middle" fill="var(--lime)">GUARDIAN · STM32F103 + MCP2515</text>
            <text x={GUARD_X} y="207" fontSize="9.5" textAnchor="middle" fill="#b4bbc2">dual ADC → bit sync → 15 features → SVM</text>
            <text x={GUARD_X} y="223" fontSize="9.5" textAnchor="middle" fill="#b4bbc2">→ open-set check → ID owner → CUSUM → alarm</text>
          </svg>
        </div>
        <div style={{ border: '1px solid var(--line)', borderRadius: 4, background: '#0b0e11', padding: '8px 12px', minHeight: 150, marginTop: 8 }} aria-live="polite">
          <div className="mono" style={{ color: 'var(--muted)', marginBottom: 6 }}>guardian log</div>
          {reduced && <div className="mono" style={{ color: 'var(--text-2)' }}>Animation paused (reduced motion). {SCEN[scenario].desc}</div>}
          {log.map((l) => (
            <div key={l.key} className="mono" style={{ color: l.alarm ? 'var(--amber)' : 'var(--text-2)', lineHeight: 1.9 }}>
              t={l.t.toFixed(1).padStart(6, ' ')} ms &nbsp; {l.text}
            </div>
          ))}
        </div>
        <div className="readouts">
          <div className="readout"><div className="readout__k">Detection latency</div><div className={`readout__v ${SCEN[scenario].latency ? 'warn' : ''}`}>{SCEN[scenario].latency ?? '—'}</div></div>
          <div className="readout"><div className="readout__k">False alarms (normal)</div><div className="readout__v ok">0</div></div>
          <div className="readout"><div className="readout__k">Open-set detection</div><div className="readout__v">99.5 %</div></div>
        </div>
      </div>
      <div className="panel__foot">
        Frame-by-frame verdicts illustrate the guardian’s decision logic. Latencies and accuracy are the digital-twin
        simulation results (results.json), not hardware measurements.
      </div>
    </div>
  );
}
