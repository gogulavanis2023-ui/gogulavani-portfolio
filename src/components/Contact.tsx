import { profile } from '../data/profile';
import { useReveal } from '../lib/hooks';
import { DownloadIcon, GitHubIcon, LinkedInIcon, MailIcon } from './Icons';

export default function Contact() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="contact" className="section contact grid-bg" ref={ref} aria-labelledby="contact-title">
      <div className="container">
        <span className="eyebrow reveal">04 · Contact</span>
        <h2 id="contact-title" className="contact__big reveal">
          Hiring for FPGA, RTL<br />or embedded? <a href={`mailto:${profile.email}`}>Let’s talk.</a>
        </h2>
        <p className="section__lede reveal" style={{ maxWidth: '60ch' }}>
          I’m looking for full-time roles from 2027, and internships with a path to a full-time offer, in FPGA and RTL
          design, design verification, embedded firmware and automotive electronics.
        </p>
        <div className="btn-row reveal" style={{ marginTop: 32 }}>
          <a className="btn btn--primary" href={`mailto:${profile.email}`}><MailIcon /> Email me</a>
          <a className="btn" href={profile.resume.file} download={profile.resume.downloadName}><DownloadIcon /> Download resume</a>
          <a className="btn" href={profile.github} target="_blank" rel="noopener noreferrer"><GitHubIcon /> GitHub</a>
          {profile.linkedin && <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer"><LinkedInIcon /> LinkedIn</a>}
        </div>
        <div className="contact__grid reveal">
          <div className="contact__cell">
            <div className="contact__k">Email</div>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </div>
          <div className="contact__cell">
            <div className="contact__k">GitHub</div>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">github.com/gogulavanis2023-ui</a>
          </div>
          {profile.linkedin && (
            <div className="contact__cell">
              <div className="contact__k">LinkedIn</div>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">{profile.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>
            </div>
          )}
          <div className="contact__cell">
            <div className="contact__k">Location preference</div>
            <span>{profile.locations.join(' · ')}, India</span>
          </div>
          <div className="contact__cell">
            <div className="contact__k">Resume</div>
            <a href={profile.resume.file} download={profile.resume.downloadName}>{profile.resume.label}</a>
            <div className="mono" style={{ color: 'var(--muted)', marginTop: 4 }}>Updated {profile.resume.updated}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
