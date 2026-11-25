import { featured, type Project } from '../data/projects';
import { BASE } from '../data/profile';
import { Viz } from './Work';
import { ArrowIcon, ArrowLeftIcon, GitHubIcon } from './Icons';

const sections = [
  ['overview', 'Overview'],
  ['problem', 'Problem'],
  ['approach', 'Engineering approach'],
  ['architecture', 'Architecture'],
  ['interactive', 'Interactive model'],
  ['stack', 'Hardware & tools'],
  ['method', 'Methodology'],
  ['results', 'Results'],
  ['limits', 'Limitations'],
  ['future', 'Future work'],
] as const;

export default function ProjectDetail({ project: p }: { project?: Project }) {
  if (!p) {
    return (
      <section className="detail">
        <div className="container">
          <a className="detail__back" href="#/work"><ArrowLeftIcon /> All projects</a>
          <h1 className="detail__title">Project not found</h1>
          <p className="detail__lede">That case study doesn’t exist. Head back to the project list.</p>
        </div>
      </section>
    );
  }
  const i = featured.findIndex((f) => f.slug === p.slug);
  const next = featured[(i + 1) % featured.length];
  const n = (k: number) => String(k + 1).padStart(2, '0');

  return (
    <article className="detail">
      <div className="container">
        <a className="detail__back" href="#/work"><ArrowLeftIcon /> All projects</a>
        <div className="project__index">
          <b>{p.index}</b><span>{p.domain}</span>
          <span className={`status${p.status === 'In progress' ? ' status--progress' : ''}`}>{p.status}</span>
        </div>
        <h1 className="detail__title">{p.title}</h1>
        <p className="detail__lede">{p.short}</p>
        <div className="mono" style={{ color: 'var(--muted)', marginBottom: 28 }}>{p.context}</div>
        <div className="btn-row">
          <a className="btn btn--primary" href={p.repo} target="_blank" rel="noopener noreferrer"><GitHubIcon /> View repository</a>
          <a className="btn" href="#interactive" onClick={(e) => { e.preventDefault(); document.getElementById('interactive')?.scrollIntoView({ behavior: 'smooth' }); }}>Try the model</a>
        </div>

        <div className="facts" style={{ marginTop: 48, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
          {p.facts.map((f) => (
            <div className="fact" key={f.label} style={{ paddingLeft: 16, paddingRight: 16, borderRight: '1px solid var(--line)' }}>
              <div className="fact__value">{f.value}</div>
              <div className="fact__label">{f.label}</div>
              {f.note && <div className="fact__note">{f.note}</div>}
            </div>
          ))}
        </div>

        <div className="detail__layout">
          <nav aria-label="On this page">
            <ul className="toc">
              {sections.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <section id="overview" className="dsec"><h2><span>{n(0)}</span>Overview</h2><p>{p.overview}</p></section>
            <section id="problem" className="dsec"><h2><span>{n(1)}</span>Problem statement</h2><p>{p.problem}</p></section>
            <section id="approach" className="dsec">
              <h2><span>{n(2)}</span>Engineering approach</h2>
              <ol>{p.approach.map((a) => <li key={a}>{a}</li>)}</ol>
            </section>
            <section id="architecture" className="dsec">
              <h2><span>{n(3)}</span>{p.architecture.heading}</h2>
              {p.architecture.body && <p>{p.architecture.body}</p>}
              <ul>{p.architecture.bullets?.map((b) => <li key={b} style={{ fontFamily: 'var(--font-mono)', fontSize: '.86rem' }}>{b}</li>)}</ul>
            </section>
            <section id="interactive" className="dsec">
              <h2><span>{n(4)}</span>Interactive model</h2>
              <Viz kind={p.viz} />
            </section>
            <section id="stack" className="dsec">
              <h2><span>{n(5)}</span>Hardware & tools</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 24 }}>
                <div><div className="mono" style={{ color: 'var(--accent)' }}>Hardware</div><ul>{p.hardware.map((h) => <li key={h}>{h}</li>)}</ul></div>
                <div><div className="mono" style={{ color: 'var(--accent)' }}>Software & tools</div><ul>{p.software.map((h) => <li key={h}>{h}</li>)}</ul></div>
              </div>
            </section>
            <section id="method" className="dsec">
              <h2><span>{n(6)}</span>Implementation methodology</h2>
              <ol>{p.methodology.map((m) => <li key={m}>{m}</li>)}</ol>
            </section>
            <section id="results" className="dsec">
              <h2><span>{n(7)}</span>Results</h2>
              {p.results.intro && <p>{p.results.intro}</p>}
              {p.results.table && (
                <div className="table-wrap">
                  <table>
                    <thead><tr>{p.results.table.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
                    <tbody>{p.results.table.rows.map((r) => <tr key={r.join()}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
              {p.results.notes?.map((t) => <p key={t}>{t}</p>)}
              {p.figures && (
                <div className="figs" style={{ marginTop: 24 }}>
                  {p.figures.map((f) => (
                    <figure className="fig" key={f.src}>
                      <img src={`${BASE}${f.src}`} alt={f.caption} loading="lazy" decoding="async" />
                      <figcaption>{f.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </section>
            <section id="limits" className="dsec">
              <h2><span>{n(8)}</span>Limitations</h2>
              {p.limitations.map((l) => <div className="callout" key={l}>{l}</div>)}
            </section>
            <section id="future" className="dsec">
              <h2><span>{n(9)}</span>Future improvements</h2>
              <ul>{p.future.map((f) => <li key={f}>{f}</li>)}</ul>
            </section>
            <div className="detail__next">
              <a className="btn" href={p.repo} target="_blank" rel="noopener noreferrer"><GitHubIcon /> Source on GitHub</a>
              <a className="btn btn--primary" href={`#/project/${next.slug}`}>Next: {next.title} <ArrowIcon /></a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
