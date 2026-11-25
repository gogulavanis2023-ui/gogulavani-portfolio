import { profile } from '../data/profile';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner mono">
        <span>© 2026 {profile.name}</span>
        <span>Designed and built from scratch · React + TypeScript</span>
        <a href="#/" style={{ textDecoration: 'none' }}>Back to top ↑</a>
      </div>
    </footer>
  );
}
