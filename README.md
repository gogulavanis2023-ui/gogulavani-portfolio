# gogulavani-portfolio

Source code for my engineering portfolio website.

**Live site:** https://gogulavanis2023-ui.github.io/gogulavani-portfolio/

It presents my FPGA, RTL, embedded and automotive projects through interactive models that you can operate in the browser. Each model is built from its project's own RTL, data files and reports, so the site shows how each design works rather than only describing it.

## What's inside

| Section | What it shows |
|---|---|
| Hero | Procedurally routed PCB traces with travelling signal pulses (pointer-reactive) and a die visual with subtle 3D tilt |
| GPS C/A acquisition | Search-space partitioning and periods-to-lock for N = 1…32 correlators, using the arithmetic in `correlator_top.v` / `correlator_slice.v`; a bit-exact G1/G2 C/A code generator (PRN 1 = 1440 octal) |
| Reconfigurable FIR | Datapath view for P = 1/2/4/8 with measured cycles, throughput, power and energy; the filter is computed live in the browser from `coeffs.mem` / `input.mem` and checked sample-by-sample against `golden.mem` |
| CAN voltage-fingerprinting IDS | Broadcast bus with N1/N2/N3, an attacker and a foreign device; masquerade, spoofing and foreign-device scenarios with the guardian's verdict log; latencies from the digital-twin `results.json` |
| Async FIFO | Cycle-level model of `asynchronous_fifo.v`: binary/Gray pointers, both 2-FF synchronisers, and pessimistic full/empty flags, stepped clock by clock |
| Case-study pages | Problem, approach, architecture, interactive model, hardware/tools, methodology, results, limitations and future work for each featured project |
| Experience, skills, education, contact | An interactive timeline; evidence-based skills (each skill names the project that shows it); resume download |

Every figure on the site is traceable to a Vivado/Quartus report, a simulation log or a results file in the project repositories. Simulation-only results are labelled as such.

## Tech stack

- React 18 + TypeScript, built with Vite 5
- Hand-written CSS (design tokens, no UI framework)
- Canvas 2D and SVG for all graphics, with no 3D or animation libraries
- Visualisations are lazy-loaded chunks; the total JS is about 67 kB gzipped

## Project structure

```
src/
  data/          profile, projects, timeline, skills (all site content lives here)
  lib/dsp.ts     bit-accurate reference models (FIR golden model, C/A code LFSR, acquisition timing)
  lib/hooks.ts   hash router, reduced-motion, scroll-reveal and visibility hooks
  components/    page sections, hero canvas, project detail page
  viz/           the four interactive project models
public/
  data/          coeffs.mem, input.mem, golden.mem, can_results.json (copied from the project repos)
  img/           project figures
  resume/        resume PDF
  og-image.png   social preview
resume-src/      HTML sources for the resume PDF and the social preview image
```

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173/gogulavani-portfolio/
npm run build      # production build into dist/
npm run preview    # serve the production build
```

## Editing content

- Personal details, the resume path and the LinkedIn URL: `src/data/profile.ts`. Set `linkedin` to the full profile URL and LinkedIn buttons appear across the site.
- Projects: `src/data/projects.ts`
- Timeline: `src/data/timeline.ts`
- Skills: `src/data/skills.ts`
- Resume: edit `resume-src/resume.html`, export it to PDF, and save it as `public/resume/Gogulavani_S_Resume.pdf`.

## Accessibility and performance

- Semantic landmarks, one `h1`, labelled SVG diagrams and controls, keyboard-reachable everything, and a skip link
- All text meets WCAG AA contrast (lowest ratio 5.0 : 1)
- `prefers-reduced-motion` disables the trace animation, the scroll reveals and the auto-running models
- Animations pause when off-screen (IntersectionObserver)

## Deployment

The production build is published to GitHub Pages from the `gh-pages` branch. See [DEPLOYMENT.md](DEPLOYMENT.md) for redeploying, and for the optional GitHub Actions workflow in `docs/`.
