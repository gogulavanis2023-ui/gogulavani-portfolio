import { skills, learning } from '../data/skills';
import { useReveal } from '../lib/hooks';

export default function Skills() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="skills" className="section" ref={ref} aria-labelledby="skills-title">
      <div className="container">
        <div className="section__head">
          <div className="reveal">
            <span className="eyebrow">03 · Skills</span>
            <h2 id="skills-title" className="section__title">Evidence,<br />not percentages.</h2>
          </div>
          <p className="section__lede reveal reveal-d1">
            Every skill below names the project that demonstrates it, so you can check the work instead of trusting a
            progress bar.
          </p>
        </div>
        <div className="skills reveal">
          {skills.map((g) => (
            <div className="skillgroup" key={g.group}>
              <h3 className="skillgroup__h">{g.group}</h3>
              <p className="skillgroup__b">{g.blurb}</p>
              {g.skills.map((s) => (
                <div className="skill" key={s.name}>
                  <div className="skill__name">{s.name}</div>
                  <div className="skill__ev">↳ {s.evidence}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="learning reveal">
          <span className="eyebrow" style={{ color: 'var(--muted)' }}>Currently learning</span>
          {learning.map((l) => <span className="chip" key={l}>{l}</span>)}
        </div>
      </div>
    </section>
  );
}
