# Deployment guide

## GitHub Pages (current setup)

The site is served at **https://gogulavanis2023-ui.github.io/gogulavani-portfolio/**.

How it works:
1. `vite.config.ts` sets `base: '/gogulavani-portfolio/'`, so every asset path includes the repository name.
2. The production build (`dist/`) is published to the `gh-pages` branch, and Pages serves that branch (Settings → Pages → Source: Deploy from a branch → `gh-pages` / root).
3. Routing uses URL hashes (`#/project/fir-filter`), so deep links work on GitHub Pages without any server configuration.

### Redeploy after a change

From the repository root (Git Bash):

```bash
npm run build
cd dist
git init -b gh-pages
git add -A
git commit -m "Deploy"
git push -f https://github.com/gogulavanis2023-ui/gogulavani-portfolio.git gh-pages
cd ..
```

GitHub Pages updates within a minute or two.

### Optional: automatic deploys with GitHub Actions

`docs/github-actions-deploy.yml` is a ready-made workflow that builds and deploys on every push to `main`. To enable it:

1. Give the GitHub CLI permission to manage workflows: `gh auth refresh -s workflow`
2. Move the file to `.github/workflows/deploy.yml`, then commit and push.
3. In Settings → Pages, set Source to **GitHub Actions**.

## Renaming the repository

If the repository is renamed, update `base` in `vite.config.ts` and the absolute URLs in `index.html` (canonical, `og:url`, `og:image`, `twitter:image`), then push.

## Custom domain (optional)

1. Add the domain in Settings → Pages → Custom domain. GitHub creates the `CNAME` record for you.
2. Point a DNS `CNAME` record at `gogulavanis2023-ui.github.io`.
3. Change `base` in `vite.config.ts` to `'/'`, update the absolute URLs in `index.html`, and push.

## Alternative hosts

Both of these work with the same build output. In each case, set `base: '/'` in `vite.config.ts` first.

| Host | Settings |
|---|---|
| Vercel | Framework preset: Vite · Build: `npm run build` · Output: `dist` |
| Netlify | Build: `npm run build` · Publish directory: `dist` |
