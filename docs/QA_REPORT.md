# QA report

Tested 26 Nov 2026 against the local dev server and the live site at https://gogulavanis2023-ui.github.io/gogulavani-portfolio/.

## Build
| Check | Result |
|---|---|
| `tsc -b` (strict) | ✅ 0 errors |
| `vite build` | ✅ 0 errors, 0 warnings; JS 66.5 kB gzip (main) + 4 lazy visualisation chunks of 2–3 kB each; CSS 5.3 kB gzip |
| Runtime dependencies | react, react-dom only |

## Responsive layout
Each page was loaded in a frame of each exact width and checked for horizontal overflow and out-of-bounds elements.

| Page | 360 | 390 | 768 | 1024 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| Home | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GPS case study | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| FIR case study | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CAN case study | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| FIFO case study | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Results tables on the case-study pages scroll inside their own container on phones, by design. Screenshots were also reviewed at 390 and 1440.

Fixed during testing:
- Grid tracks that couldn't shrink (`1fr` → `minmax(0, 1fr)`)
- Long tags that didn't wrap
- The mobile menu collapsing to zero height (`backdrop-filter` created a containing block for the fixed menu)
- The hero name wrapping
- Alternating project layout putting the diagram in the narrow column
- An unsized back-link icon
- Grey gaps in wrapped readout and skill grids

## Functional
| Check | Result |
|---|---|
| Navigation links (desktop and mobile menu; menu closes, scroll lock released) | ✅ |
| Hash routes and deep links on GitHub Pages (`#/project/<slug>`), page titles update | ✅ |
| 8 GitHub links (profile and 7 repos) | ✅ all HTTP 200 |
| Resume download | ✅ HTTP 200, `application/pdf`, valid `%PDF` header, filename `Gogulavani_S_Resume_FPGA_RTL_Embedded.pdf` |
| Contact | ✅ `mailto:` link. No form is included, because there is no backend to receive messages. |
| Console errors (local and live) | ✅ none |

## Technical accuracy of the interactive models
| Model | Verification |
|---|---|
| FIR | Browser output is computed from `coeffs.mem` + `input.mem` and compared with `golden.mem`: **1000 / 1000 match**, both locally and on the live site |
| GPS search | N = 8 gives range 127, lock in slice 6 after 38 periods, matching the `correlator_slice.v` arithmetic (N = 1 → 800 periods, N = 32 → 25) |
| C/A code generator | PRN 1 first 10 chips = 1440 (octal), matching the GPS ICD |
| Async FIFO | 40 writes into an empty FIFO with no reads → 32 held, 8 blocked by `full` (same as the testbench); after writes, `empty` clears on the 2nd read-clock edge (2-FF sync latency) |
| CAN | Scenario alarm types and latencies taken from `results.json` |

## Accessibility
- One `h1` with a logical heading order; header, nav, main and footer landmarks; `lang="en"`; skip link
- 0 images without alt text, 0 unnamed buttons or links, every `role="img"` SVG labelled
- Contrast checked numerically: lowest text ratio 5.0 : 1 (WCAG AA). Two low-contrast diagram greys were raised.
- Touch targets at least 36 px (timeline toggle raised to 40 px)
- `prefers-reduced-motion`: CSS and JS paths stop the trace animation, scroll reveals, scope and auto-running models. The code paths were reviewed but not tested in an emulated reduced-motion browser.

## SEO and social
- Title, description, canonical, Open Graph and Twitter card tags; JSON-LD `Person`
- `og-image.png` is 1200 × 630, served with HTTP 200

## Performance (live, warm cache)
- First contentful paint ≈ 0.52 s; DOMContentLoaded 37 ms; 17 requests
- Animations pause when off-screen; device-pixel ratio capped at 2

## Known limitations
- No LinkedIn link yet. Add the URL in `src/data/profile.ts`.
- Automatic deploys through GitHub Actions need the CLI `workflow` scope (see DEPLOYMENT.md). Deploys currently go through the `gh-pages` branch.
