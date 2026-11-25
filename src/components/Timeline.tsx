import { useState } from 'react';
import { timeline } from '../data/timeline';
import { useReveal } from '../lib/hooks';

export default function Timeline() {
  const ref = useReveal<HTMLElement>();
  const [open, setOpen] = useState<string | null>('Research Intern');
  return (
    <section id="experience" className="section grid-bg" ref={ref} aria-labelledby="exp-title" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="container">
        <div className="section__head">
          <div className="reveal">
            <span className="eyebrow">02 · Experience</span>
            <h2 id="exp-title" className="section__title">From sensors<br />to silicon.</h2>
          </div>
          <p className="section__lede reveal reveal-d1">
            Research at IIT Madras, embedded firmware in industry, and the coursework and research in between. Newest first.
          </p>
        </div>
        <ol className="tl">
          {timeline.map((t) => {
            const isOpen = open === t.title;
            return (
              <li key={t.title} className={`tl__item reveal${isOpen ? ' is-open' : ''}`}>
                <div className="tl__when">{t.when}</div>
                <div className="tl__body">
                  <div className="tl__kind">{t.kind}</div>
                  <h3 className="tl__title">{t.title}</h3>
                  <div className="tl__org">{t.org}</div>
                  <p className="tl__detail">{t.detail}</p>
                  {t.points && (
                    <>
                      <button className="tl__toggle" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : t.title)}>
                        {isOpen ? '− Hide details' : '+ Show details'}
                      </button>
                      {isOpen && <ul className="tl__points">{t.points.map((p) => <li key={p}>{p}</li>)}</ul>}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
