import { useEffect, useRef, useState } from 'react';

/** Simple hash router: '#/project/<slug>' opens a detail page, anything else is home. */
export function useRoute() {
  const read = () => {
    const h = window.location.hash;
    const m = h.match(/^#\/project\/([a-z0-9-]+)/);
    return m ? { page: 'project' as const, slug: m[1] } : { page: 'home' as const, anchor: h.replace(/^#\/?/, '') };
  };
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function usePrefersReducedMotion() {
  const q = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** Adds `is-visible` once the element scrolls into view (CSS handles the transition). */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('is-visible'), io.unobserve(e.target))),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    el.querySelectorAll('.reveal').forEach((n) => io.observe(n));
    if (el.classList.contains('reveal')) io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Runs a callback on animation frames while the element is on screen. */
export function useVisible<T extends HTMLElement>(ref: React.RefObject<T>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return setVisible(true);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return visible;
}
