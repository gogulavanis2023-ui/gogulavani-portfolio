import { additional } from '../data/projects';
import { useReveal } from '../lib/hooks';
import { ExternalIcon } from './Icons';

export default function More() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="section" style={{ paddingTop: 0 }} ref={ref} aria-labelledby="more-title">
      <div className="container">
        <div className="section__head" style={{ marginBottom: 40 }}>
          <div className="reveal">
            <span className="eyebrow">Also built</span>
            <h2 id="more-title" className="section__title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>Labs, robots and links.</h2>
          </div>
          <p className="section__lede reveal reveal-d1">
            Smaller and team projects. Each one is marked with where its evidence comes from: a public repository, a
            project report, or a resume entry with no surviving files.
          </p>
        </div>
        <div className="more">
          {additional.map((m, i) => (
            <div className="more__row reveal" key={m.title}>
              <div className="more__n">{String(i + 5).padStart(2, '0')}</div>
              <div>
                <h3 className="more__title">{m.title}</h3>
                <div className="more__domain">{m.domain}{m.team ? ` · ${m.team}` : ''}</div>
              </div>
              <div>
                <p className="more__summary">{m.summary}</p>
                <ul className="more__points">{m.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                <div className="chips">{m.stack.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
              </div>
              <div className="more__side">
                <span className="src-badge">{m.source}</span>
                {m.repo && (
                  <a className="btn btn-sm" href={m.repo} target="_blank" rel="noopener noreferrer" aria-label={`${m.title} repository on GitHub`}>
                    Code <ExternalIcon />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
