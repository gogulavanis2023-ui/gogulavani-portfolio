import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../lib/hooks';

type Trace = { pts: [number, number][]; seg: number[]; len: number; w: number };
type Pulse = { trace: number; s: number; speed: number; size: number };

// Deterministic PRNG so the board layout is stable between renders.
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function route(w: number, h: number, seed: number): Trace[] {
  const rnd = mulberry32(seed);
  const step = 22;
  const count = Math.round(Math.min(70, (w * h) / 16000));
  const traces: Trace[] = [];
  for (let i = 0; i < count; i++) {
    // Start on a grid point, mostly on the right two-thirds where the hero is open.
    let x = Math.round((w * (0.25 + rnd() * 0.85)) / step) * step;
    let y = Math.round((h * rnd()) / step) * step;
    const pts: [number, number][] = [[x, y]];
    let dir = rnd() < 0.5 ? -1 : 1; // horizontal direction
    const segs = 2 + Math.floor(rnd() * 4);
    for (let s = 0; s < segs; s++) {
      if (s % 2 === 0) {
        x += dir * step * (2 + Math.floor(rnd() * 8));
      } else {
        // 45-degree jog, like a real routed trace
        const d = step * (1 + Math.floor(rnd() * 3));
        const vy = rnd() < 0.5 ? -1 : 1;
        x += dir * d;
        y += vy * d;
      }
      pts.push([x, y]);
      if (rnd() < 0.15) dir = -dir;
    }
    const seg: number[] = [];
    let len = 0;
    for (let k = 1; k < pts.length; k++) {
      const l = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      seg.push(l);
      len += l;
    }
    traces.push({ pts, seg, len, w: rnd() < 0.2 ? 2 : 1 });
  }
  return traces;
}

function pointAt(t: Trace, s: number): [number, number] {
  let rem = s;
  for (let k = 0; k < t.seg.length; k++) {
    if (rem <= t.seg[k]) {
      const f = rem / t.seg[k];
      const [x0, y0] = t.pts[k];
      const [x1, y1] = t.pts[k + 1];
      return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f];
    }
    rem -= t.seg[k];
  }
  return t.pts[t.pts.length - 1];
}

export default function PcbCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let w = 0, h = 0, dpr = 1;
    let traces: Trace[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let running = true;
    const mouse = { x: -9999, y: -9999 };
    const rnd = mulberry32(7);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      traces = route(w, h, 1729);
      pulses = traces.filter((_, i) => i % 2 === 0).map((_, i) => ({
        trace: i * 2, s: rnd() * 400, speed: 40 + rnd() * 70, size: 18 + rnd() * 26,
      }));
      draw(0);
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      // Traces
      for (const t of traces) {
        const mid = t.pts[Math.floor(t.pts.length / 2)];
        const near = Math.max(0, 1 - Math.hypot(mid[0] - mouse.x, mid[1] - mouse.y) / 260);
        ctx.strokeStyle = `rgba(${Math.round(43 + 52 * near)}, ${Math.round(51 + 165 * near)}, ${Math.round(60 + 178 * near)}, ${0.55 + near * 0.35})`;
        ctx.lineWidth = t.w;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(t.pts[0][0], t.pts[0][1]);
        for (let k = 1; k < t.pts.length; k++) ctx.lineTo(t.pts[k][0], t.pts[k][1]);
        ctx.stroke();
        // Vias / pads at both ends
        for (const p of [t.pts[0], t.pts[t.pts.length - 1]]) {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
          ctx.fillStyle = '#0a0c0e';
          ctx.fill();
          ctx.strokeStyle = near > 0.2 ? 'rgba(95,216,238,.7)' : 'rgba(60,70,80,.9)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      // Pulses
      if (!reduced) {
        for (const p of pulses) {
          const t = traces[p.trace];
          if (!t) continue;
          p.s += p.speed * dt;
          if (p.s > t.len + p.size) p.s = -p.size - rnd() * 300;
          if (p.s < 0) continue;
          const a = pointAt(t, Math.max(0, p.s - p.size));
          const b = pointAt(t, Math.min(t.len, p.s));
          const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
          g.addColorStop(0, 'rgba(95,216,238,0)');
          g.addColorStop(1, 'rgba(95,216,238,0.95)');
          ctx.strokeStyle = g;
          ctx.lineWidth = t.w + 1;
          ctx.beginPath();
          // Follow the trace between a and b by sampling.
          const n = 8;
          for (let i = 0; i <= n; i++) {
            const q = pointAt(t, Math.max(0, p.s - p.size) + ((Math.min(t.len, p.s) - Math.max(0, p.s - p.size)) * i) / n);
            if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
          }
          ctx.stroke();
        }
      }
    };

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (running) draw(dt);
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (running = e.isIntersecting));
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      if (reduced) draw(0);
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    resize();
    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  return <canvas ref={ref} className="hero__canvas" aria-hidden="true" />;
}
