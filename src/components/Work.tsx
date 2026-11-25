import { lazy, Suspense } from 'react';
import { featured, type Project } from '../data/projects';
import { useReveal } from '../lib/hooks';
import { ArrowIcon, GitHubIcon } from './Icons';

const GpsViz = lazy(() => import('../viz/GpsViz'));
const FirViz = lazy(() => import('../viz/FirViz'));
const CanViz = lazy(() => import('../viz/CanViz'));
const FifoViz = lazy(() => import('../viz/FifoViz'));

export function Viz({ kind }: { kind: Project['viz'] }) {
  const C = { gps: GpsViz, fir: FirViz, can: CanViz, fifo: FifoViz }[kind];
  return (
    <Suspense fallback={<div className="panel" style={{ minHeight: 360 }} aria-busy="true" />}>
      <C />
    </Suspense>
  );
}

function FeaturedProject({ p }: { p: Project }) {
  return (
    <article className="project" aria-labelledby={`p-${p.slug}`}>
      <div className="project__text reveal">
        <div className="project__index">
          <b>{p.index}</b>
          <span>{p.domain}</span>
          <span className={`status${p.status === 'In progress' ? ' status--progress' : ''}`}>{p.status}</span>
        </div>
        <h3 id={`p-${p.slug}`} className="project__title">{p.title}</h3>
        <div className="project__context">{p.context}</div>
        <p className="project__short">{p.short}</p>
        <div className="facts">
          {p.facts.map((f) => (
            <div className="fact" key={f.label}>
              <div className="fact__value">{f.value}</div>
              <div className="fact__label">{f.label}</div>
              {f.note && <div className="fact__note">{f.note}</div>}
            </div>
          ))}
        </div>
        <div className="chips" style={{ marginBottom: 24 }}>
          {p.stack.map((s) => <span className="chip" key={s}>{s}</span>)}
        </div>
        <div className="btn-row">
          <a className="btn btn--primary" href={`#/project/${p.slug}`}>
            Case study <ArrowIcon />
          </a>
          <a className="btn" href={p.repo} target="_blank" rel="noopener noreferrer">
            <GitHubIcon /> Repository
          </a>
        </div>
      </div>
      <div className="reveal reveal-d1">
        <Viz kind={p.viz} />
      </div>
    </article>
  );
}

export default function Work() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="work" className="section" ref={ref} aria-labelledby="work-title">
      <div className="container">
        <div className="section__head">
          <div className="reveal">
            <span className="eyebrow">01 · Selected work</span>
            <h2 id="work-title" className="section__title">Hardware you can<br />interrogate.</h2>
          </div>
          <p className="section__lede reveal reveal-d1">
            Four projects, each with a working model you can drive. The diagrams are built from each repository’s
            RTL, data files and reports, and every number is traceable to a Vivado report, a simulation log or a
            results file. Simulation-only results are labelled.
          </p>
        </div>
        {featured.map((p) => <FeaturedProject key={p.slug} p={p} />)}
      </div>
    </section>
  );
}
