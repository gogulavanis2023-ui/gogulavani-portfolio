import PcbCanvas from './PcbCanvas';
import DieVisual from './DieVisual';
import { ArrowIcon, DownloadIcon, GitHubIcon, LinkedInIcon } from './Icons';
import { profile } from '../data/profile';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-name">
      <PcbCanvas />
      <div className="container hero__grid">
        <div className="load-in">
          <div className="hero__meta">
            <span className="eyebrow">ECE · VIT Vellore · Class of 2027</span>
            <span className="status">Open to FPGA / RTL / Embedded roles</span>
          </div>
          <h1 id="hero-name" className="hero__name">
            Gogulavani<span className="thin"> S</span>
          </h1>
          <p className="hero__headline">
            Building intelligent hardware, <em>from RTL to real-world systems.</em>
          </p>
          <p className="hero__intro">{profile.intro}</p>
          <div className="btn-row">
            <a className="btn btn--primary" href="#/work">
              View projects <ArrowIcon />
            </a>
            <a className="btn" href={profile.resume.file} download={profile.resume.downloadName}>
              <DownloadIcon /> Download resume
            </a>
          </div>
          <div className="hero__socials">
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              <GitHubIcon /> GitHub
            </a>
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                <LinkedInIcon /> LinkedIn
              </a>
            )}
            <span className="mono" style={{ color: 'var(--muted)', alignSelf: 'center' }}>
              {profile.locations.join(' · ')}
            </span>
          </div>
        </div>
        <div className="hero__aside load-in">
          <DieVisual />
        </div>
      </div>
      <a className="hero__scroll mono" href="#/work" aria-label="Scroll to projects">
        <span>scroll</span>
        <i />
      </a>
    </section>
  );
}
