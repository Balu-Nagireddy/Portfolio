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

The app is configured with Vite `base: '/Portfolio/'` so assets resolve correctly on GitHub Pages for this repository.

Deployment is handled by GitHub Actions. After pushing to `main`, configure GitHub Pages to deploy from Actions if it is not already enabled.

## Local setup

```bash
npm install
npm run dev
```
