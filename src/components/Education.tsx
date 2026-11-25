import { profile, interests } from '../data/profile';
import { useReveal } from '../lib/hooks';

export default function Education() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="section" style={{ paddingTop: 0 }} ref={ref} aria-labelledby="edu-title">
      <div className="container">
        <span className="eyebrow reveal">Education</span>
        <h2 id="edu-title" className="section__title reveal" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', margin: '18px 0 40px' }}>
          Vellore Institute of Technology
        </h2>
        <div className="edu reveal">
          <div className="edu__card">
            <div className="mono" style={{ color: 'var(--muted)' }}>{profile.years} · Vellore, Tamil Nadu</div>
            <h3 style={{ fontSize: '1.5rem', margin: '12px 0 8px' }}>{profile.degree}</h3>
            <p style={{ color: 'var(--text-2)', margin: '0 0 20px' }}>
              Coursework and labs across digital design, FPGA-based system design, VLSI, microcontrollers, DSP, communication
              systems and optical and wireless communication.
            </p>
            <div className="chips">{interests.map((i) => <span className="chip" key={i}>{i}</span>)}</div>
          </div>
          <div className="edu__card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <div className="mono" style={{ color: 'var(--muted)' }}>CGPA</div>
              <div className="edu__big">8.05<small>/ 10</small></div>
            </div>
            <div>
              <div className="mono" style={{ color: 'var(--muted)', marginBottom: 6 }}>Graduating</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>2027</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
