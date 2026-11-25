import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../lib/hooks';

// Decorative package + die. The cell wavefront runs diagonally across the die,
// the way data moves through a pipelined array, and a clock / data pair
// is drawn underneath like a scope capture.
export default function DieVisual() {
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = wrap.current!;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  const N = 10;
  const cells = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const hot = (r * 7 + c * 3) % 11 === 0;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={128 + c * 14.4}
          y={128 + r * 14.4}
          width={11.2}
          height={11.2}
          rx={1}
          className="die-cell"
          style={{ animationDelay: `${((r + c) * 0.11).toFixed(2)}s`, fill: hot ? 'rgba(95,216,238,.22)' : undefined }}
        />,
      );
    }

  const pins = [];
  for (let i = 0; i < 14; i++) {
    const p = 96 + i * 14.8;
    pins.push(<rect key={`t${i}`} x={p} y={52} width={6} height={22} rx={1} />);
    pins.push(<rect key={`b${i}`} x={p} y={326} width={6} height={22} rx={1} />);
    pins.push(<rect key={`l${i}`} x={52} y={p} width={22} height={6} rx={1} />);
    pins.push(<rect key={`r${i}`} x={326} y={p} width={22} height={6} rx={1} />);
  }

  return (
    <div className="die" ref={wrap} aria-hidden="true">
      <style>{`
        .die svg { transform: perspective(900px) rotateX(var(--rx, 6deg)) rotateY(var(--ry, -10deg)); transition: transform .6s cubic-bezier(.2,.7,.1,1); }
        .die-cell { fill: rgba(255,255,255,.035); stroke: rgba(95,216,238,.12); stroke-width: .6; animation: cell 3.6s ease-in-out infinite; }
        @keyframes cell { 0%, 70%, 100% { fill: rgba(255,255,255,.035); } 12% { fill: rgba(95,216,238,.55); } 30% { fill: rgba(95,216,238,.12); } }
        .scope-trace { stroke-dasharray: 520; stroke-dashoffset: 520; animation: scope 4s linear infinite; }
        @keyframes scope { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) { .die-cell, .scope-trace { animation: none; stroke-dashoffset: 0; } }
      `}</style>
      <svg viewBox="0 0 400 470">
        <defs>
          <linearGradient id="pkg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1f252c" />
            <stop offset="1" stopColor="#0f1215" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="rgba(95,216,238,.22)" />
            <stop offset="1" stopColor="rgba(95,216,238,0)" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="url(#glow)" />
        <g fill="#3a434d">{pins}</g>
        <rect x="74" y="74" width="252" height="252" rx="10" fill="url(#pkg)" stroke="#2b333c" />
        <rect x="112" y="112" width="176" height="176" rx="3" fill="#0b0e11" stroke="rgba(95,216,238,.35)" />
        {cells}
        <circle cx="92" cy="92" r="4" fill="none" stroke="#3a434d" />
        <text x="200" y="312" textAnchor="middle" fill="#7d8791" fontSize="9" letterSpacing="2">RTL → SILICON</text>

        {/* scope capture */}
        <g transform="translate(40 384)">
          <rect width="320" height="74" rx="3" fill="rgba(10,12,14,.7)" stroke="#20262d" />
          <path d="M0 24.5H320M0 50.5H320" stroke="#1a1f25" />
          <text x="8" y="14" fill="#7d8791" fontSize="8">CLK</text>
          <text x="8" y="44" fill="#7d8791" fontSize="8">DATA</text>
          <path className="scope-trace" d="M32 30h12v-12h12v12h12v-12h12v12h12v-12h12v12h12v-12h12v12h12v-12h12v12h12v-12h12v12h12v-12h12v12h12v-12h12v12h12v-12h12v12h12v-12h12v12h12" fill="none" stroke="var(--accent)" strokeWidth="1.4" />
          <path className="scope-trace" style={{ animationDelay: '.3s' }} d="M32 62h24v-12h48v12h24v-12h24v12h48v-12h24v12h24v-12h48v12h12" fill="none" stroke="var(--lime)" strokeWidth="1.4" opacity=".85" />
        </g>
      </svg>
    </div>
  );
}
