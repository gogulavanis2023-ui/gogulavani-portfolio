type P = { title?: string };
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const GitHubIcon = ({ title }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden={!title} role={title ? 'img' : undefined}>
    {title && <title>{title}</title>}
    <path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

export const LinkedInIcon = ({ title }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden={!title} role={title ? 'img' : undefined}>
    {title && <title>{title}</title>}
    <path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);

export const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...base}><path d="M12 3v12m0 0-5-5m5 5 5-5M4 19h16" /></svg>
);
export const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...base}><path d="M5 12h14m0 0-6-6m6 6-6 6" /></svg>
);
export const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...base}><path d="M19 12H5m0 0 6-6m-6 6 6 6" /></svg>
);
export const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...base}><path d="M14 4h6v6m0-6-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
);
export const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...base}><path d="M3 6h18v12H3zM3 7l9 6 9-6" /></svg>
);

export const LogoMark = () => (
  <svg className="nav__logo-mark" viewBox="0 0 32 32" aria-hidden="true">
    <rect x="8" y="8" width="16" height="16" rx="1.5" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
    <g stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 8V4M16 8V4M20 8V4M12 24v4M16 24v4M20 24v4M8 12H4M8 16H4M8 20H4M24 12h4M24 16h4M24 20h4" />
    </g>
    <rect x="13" y="13" width="6" height="6" fill="var(--accent)" opacity=".85" />
  </svg>
);
