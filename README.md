# Bala Brahmareddy Nagireddy Portfolio

Live site: https://balu-nagireddy.github.io/Portfolio/

This repository now uses React + Vite and is set up for GitHub Pages deployment through GitHub Actions.

## Stack

- React
- Vite
- Plain CSS
- GitHub Pages
- GitHub Actions

## Content coverage

The portfolio presents professional experience and public GitHub work, including:

- AI-Powered Microservices Automation Platform
- Scalable Databricks ELT Pipeline & AWS Integration
- VeriDedup
- Sales Forecasting ML
- Java Full Stack Development
- Blood Donor Finder

## Scripts

- `npm run dev` — start local dev server
- `npm run build` — production build
- `npm run preview` — preview built app locally

## Project structure

- `src/` — React app source
- `src/data/portfolio.js` — portfolio content
- `.github/workflows/deploy.yml` — GitHub Pages deployment workflow
- `Profile1.png` — profile image bundled by Vite

## Deployment

The app uses Vite `base: './'` (relative), so the same build works on GitHub Pages (served under `/Portfolio/`) **and** on Vercel (served from root) without changes.

**GitHub Pages** — handled by GitHub Actions (`.github/workflows/deploy.yml`). In the repo's Settings → Pages, set "Source" to **Deploy from a GitHub Action**. After that, every push to `main` rebuilds and republishes the site to `https://balu-nagireddy.github.io/Portfolio/`.

**Vercel** — `vercel.json` is configured (`framework: vite`, `outputDirectory: dist`, SPA rewrite). Import the repo at vercel.com and it deploys automatically, or run `npx vercel`.

## Local setup

```bash
npm install
npm run dev
```
