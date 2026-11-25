import { useEffect } from 'react';
import { useRoute } from './lib/hooks';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Strip from './components/Strip';
import Work from './components/Work';
import More from './components/More';
import Timeline from './components/Timeline';
import Skills from './components/Skills';
import Education from './components/Education';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProjectDetail from './components/ProjectDetail';
import { featured } from './data/projects';

export default function App() {
  const route = useRoute();
  const project = route.page === 'project' ? featured.find((p) => p.slug === route.slug) : undefined;

  useEffect(() => {
    if (route.page === 'project') {
      window.scrollTo({ top: 0 });
      document.title = project ? `${project.title} | Gogulavani S` : 'Project not found | Gogulavani S';
    } else {
      document.title = 'Gogulavani S | FPGA, RTL and Embedded Systems Engineer';
      if (route.anchor) {
        // Wait one frame so the home sections exist before scrolling to them.
        requestAnimationFrame(() => document.getElementById(route.anchor!)?.scrollIntoView());
      }
    }
  }, [route, project]);

  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        {route.page === 'project' ? (
          <ProjectDetail project={project} />
        ) : (
          <>
            <Hero />
            <Strip />
            <Work />
            <More />
            <Timeline />
            <Skills />
            <Education />
            <Contact />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
