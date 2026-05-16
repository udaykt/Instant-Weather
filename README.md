<div align="center">

# Instant Weather

**A production-grade weather application built with TypeScript and Vite — real-time conditions, 5-day forecasts, air quality, and astro data for any city worldwide.**

[![Live](https://img.shields.io/badge/live-instant--weather.pages.dev-f38020?style=flat-square&logo=cloudflare&logoColor=white)](https://instant-weather.pages.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-f38020?style=flat-square&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![PWA](https://img.shields.io/badge/PWA-ready-5a0fc8?style=flat-square)](https://web.dev/progressive-web-apps/)

</div>

---

## Overview

Instant Weather surfaces real-time meteorological data through a clean, condition-reactive interface. The color system adapts to weather condition and time of day — rainy afternoons shift toward ocean blue, clear mornings toward warm gold. Every data point is validated at the edge before it reaches the client.

---

## Features

- **Current conditions** — temperature, feels-like, hi/lo, humidity, wind speed + direction, pressure, UV index, visibility, dew point, precipitation
- **5-day forecast** with daily rain/snow probability and wind summary
- **Hourly sparkline** — interactive temperature chart, tap or hover any hour
- **Air Quality Index** with per-pollutant breakdown panel
- **Astro data** — animated sun arc tracking sunrise/sunset, moon phase
- **Severe weather alerts** surfaced as a dismissable banner
- **Condition-reactive aurora theme** — CSS `@property` hue variable drives the entire palette
- **Unit toggle** — °C / °F with animated segmented control, persisted to localStorage
- **Share card** — exports the weather panel as a PNG (download or clipboard)
- **Installable PWA** — service worker, offline support, app manifest
- **Geolocation** on first load; city search with autocomplete; quick-city shortcuts

---

## Stack

| Layer      | Technology                                                          |
| ---------- | ------------------------------------------------------------------- |
| Language   | TypeScript 5 — strict mode                                          |
| Build      | Vite 5 (multi-page) + vite-plugin-pwa                               |
| Styling    | Vanilla CSS — `@property` design tokens, glassmorphism, 14 partials |
| Data       | WeatherAPI.com — proxied through Cloudflare Pages Functions         |
| Validation | Zod schemas on all API responses                                    |
| Hosting    | Cloudflare Pages + edge Functions                                   |
| Analytics  | Cloudflare Web Analytics — cookieless, no consent banner required   |
| Testing    | Vitest (unit) + Playwright (E2E)                                    |
| Tooling    | ESLint · Prettier · lint-staged · simple-git-hooks                  |

---

## Project structure

```
src/
├── main.ts                        entry — wiring, geolocation, city history
├── features/
│   ├── weather/
│   │   ├── forecastService.ts     API client with typed responses and error handling
│   │   ├── weatherRenderer.ts     render orchestrator
│   │   └── render/                one focused module per UI concern
│   │       ├── unitSystem.ts      °C/°F toggle + conversion
│   │       ├── sunArc.ts          SVG arc animation
│   │       ├── sparkline.ts       hourly temperature chart
│   │       ├── forecastCards.ts   5-day forecast row
│   │       ├── airQuality.ts      AQI + pollutant breakdown
│   │       ├── alerts.ts          severe weather banner
│   │       ├── moonPhase.ts       phase emoji + label
│   │       ├── aurora.ts          condition → hue mapping
│   │       └── weatherIcon.ts     icon resolution
│   ├── search/                    autocomplete input
│   ├── cities/                    quick-city sidebar
│   └── share/                     PNG export
├── shared/
│   ├── types/                     WeatherAPI response types
│   ├── schemas/                   Zod validation schemas
│   └── utils/                     formatting, country flags, motion
└── styles/                        14 cascade-ordered CSS partials

functions/
├── api/
│   ├── weather.js                 GET /api/weather?city=
│   ├── weather-coords.js          GET /api/weather-coords?lat=&lon=
│   └── search.js                  GET /api/search?q=
└── _lib/
    └── weatherProxy.js            edge proxy — API keys never reach the client
```

---

## Getting started

**Prerequisites:** Node.js 18+, a free [WeatherAPI.com](https://www.weatherapi.com/) key.

```bash
git clone https://github.com/udaykt/Instant-Weather.git
cd Instant-Weather
npm install
cp .env.example .env   # populate WEATHER_API_KEY
npm run dev            # → http://localhost:5173
```

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `npm run dev`       | Dev server with HMR             |
| `npm run build`     | Production build → `dist/`      |
| `npm run preview`   | Preview the production build    |
| `npm run typecheck` | Type-check without emitting     |
| `npm test`          | Unit tests via Vitest           |
| `npm run test:e2e`  | End-to-end tests via Playwright |
| `npm run lint`      | ESLint                          |

---

## Deployment

Hosted on Cloudflare Pages — every push to `master` triggers an automatic deployment.

To self-host:

1. Fork → Cloudflare Pages → **Connect to Git**
2. Build command: `npm run build` / Output directory: `dist`
3. Set the `WEATHER_API_KEYS` environment variable (see `.env.example`)
4. Optionally enable Cloudflare Web Analytics and add the beacon token to `index.html` and `weather.html`

API credentials are injected at the edge and never exposed to the browser.

---

## License

MIT © Uday
