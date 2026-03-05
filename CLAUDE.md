# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static personal academic website deployed via GitHub Pages. No build step, no framework, no package manager — edit files and push.

**Live at:** `https://paul-antoineletolguenec.github.io`

## Structure

```
index.html          # Single-page site (all sections inline)
css/style.css       # All styles (design tokens via CSS variables in :root)
js/flowfield.js     # Perlin noise particle system (canvas background)
js/main.js          # Navbar scroll, email clipboard copy, scroll reveal
assets/             # PDFs (CV, slides) and publication images
```

## Development

Preview locally with any static server:
```bash
python3 -m http.server 8080
# or
npx serve .
```

Deploy by pushing to `main` — GitHub Pages serves the repo root directly.

## Git Identity Rules — STRICT

**Always** use the personal GitHub account for all commits and pushes on this repo:
- `user.name` = `Paul-antoineLeTolguenec`
- `user.email` = `57451716+Paul-antoineLeTolguenec@users.noreply.github.com`

**Never** commit with:
- The Mirakl account (`paul-antoine.le-tolguenec@mirakl.com` / `Paul-antoineLeTolguenec-Mirakl`)
- `Co-Authored-By: Claude` or any Anthropic reference in commit messages

Two git hooks enforce this automatically:
- `.git/hooks/pre-commit` — blocks if git user email contains `mirakl.com`
- `.git/hooks/commit-msg` — blocks if message contains `Co-Authored-By: Claude`

## Architecture

- **Single page:** all sections (`#hero`, `#projects`, `#blog`, `#publications`, `#footer`) are in `index.html`
- **Design tokens:** CSS custom properties defined in `:root` in `style.css` (`--cyan`, `--bg`, `--card-bg`, etc.) — use these for any new styling
- **Animation patterns:**
  - Hero elements: CSS `@keyframes fadeUp` with staggered `animation-delay`
  - Scroll reveals: `.reveal` class + IntersectionObserver in `main.js` adding `.visible`
- **Cards:** two card types — `.card` (blog/seminars, flat padding) and `.proj-card` (projects, with image header via `.proj-visual`)
- **Publication cards:** `.pub-card` uses a 2-column grid (image left, content right); collapses to 1-col on mobile
- **Venue badges:** color-coded via modifier classes (`.pub-venue--neurips`, `--preprint`, `--award`, `--acm`)
- **Flow field:** self-contained IIFE in `flowfield.js`, fixed canvas behind all content (`z-index: 0`), 500 particles driven by 2D Perlin noise with mouse attraction
