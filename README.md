# Balcony Solar Feasibility Calculator

**Live:** [solar.electrifyeverythingnow.com](https://solar.electrifyeverythingnow.com)

Find out if plug-in solar makes sense for your home. Pick your state, select your utility, and get an instant payback estimate — no signup required.

Part of [ElectrifyEverythingNow.com](https://electrifyeverythingnow.com).

## Features

- Interactive US map color-coded by peak sun hours
- Utility rate lookup for top providers in every state
- Instant payback period, annual savings, and 10/20-year projections
- Color-coded verdict (No Brainer / Great Investment / Worth Considering / Tough ROI)
- Optional zip-code refinement via NREL PVWatts API
- Mobile-friendly, no backend, no login

## Local Development

```bash
npm install --legacy-peer-deps
npm run dev
```

Optionally set `NEXT_PUBLIC_NREL_API_KEY` with a free key from [developer.nrel.gov](https://developer.nrel.gov/signup/) to enable the "Refine My Estimate" feature.

## Stack

- Next.js 16 (static export) + React 19
- Tailwind CSS v4
- react-simple-maps (US choropleth)
- TypeScript, Vitest

## Deployment

Hosted on Cloudflare Pages. Pushes to `main` auto-deploy.

### Panel Checker

`/panel-checker` uses an OpenAI vision model via a Cloudflare Pages Function
(`functions/api/analyze-panel.ts`). The OpenAI key must be set as a Pages
secret — it is never exposed to the browser. See
[docs/panel-checker.md](docs/panel-checker.md) for full setup, including:

```bash
npx wrangler pages secret put OPENAI_API_KEY
```
