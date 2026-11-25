import { useEffect, useState } from 'react';
import { LogoMark, DownloadIcon } from './Icons';
import { profile } from '../data/profile';

const links = [
  { href: '#/work', id: 'work', label: 'Work', n: '01' },
  { href: '#/experience', id: 'experience', label: 'Experience', n: '02' },
  { href: '#/skills', id: 'skills', label: 'Skills', n: '03' },
  { href: '#/contact', id: 'contact', label: 'Contact', n: '04' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`nav${scrolled || open ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container nav__inner">
        <a className="nav__logo" href="#/" onClick={() => setOpen(false)} aria-label="Gogulavani S, home">
          <LogoMark />
          <span>Gogulavani S</span>
        </a>
        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
        </button>
        <nav id="nav-menu" className="nav__menu" aria-label="Primary">
          <ul className="nav__links">
            {links.map((l) => (
              <li key={l.id}>
                <a href={l.href} onClick={() => setOpen(false)}>
                  <span>{l.n}</span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a className="btn btn-sm" href={profile.resume.file} download={profile.resume.downloadName}>
            <DownloadIcon /> Resume
          </a>
        </nav>
      </div>
    </header>
  );
}
