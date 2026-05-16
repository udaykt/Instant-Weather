<div align="center">

# Instant Weather

**Real-time weather, 5-day forecast, air quality and astro data for any city — wrapped in an animated aurora glass UI.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-instant--weather.pages.dev-f38020?style=flat-square&logo=cloudflare&logoColor=white)](https://instant-weather.pages.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?style=flat-square)](https://web.dev/progressive-web-apps/)

</div>

---

## What it does

Search any city in the world and get:

- Live conditions — temperature, feels-like, hi/lo, humidity, wind speed + direction, pressure, UV index, visibility, dew point, precipitation
- 5-day forecast cards with per-day rain/snow chance
- Interactive hourly temperature sparkline (hover or tap any hour)
- Air Quality Index with pollutant breakdown
- Sunrise/sunset with an animated sun arc, moon phase
- Severe-weather alerts banner
- Dynamic aurora theme that retints to the current weather condition and time of day
- °C / °F toggle (remembered across sessions)
- Share the panel as a PNG (download or copy to clipboard)

Works offline as an installable PWA. Fully responsive — tested down to iPhone SE.

---

## Tech stack

| Layer             | Choice                                                       |
| ----------------- | ------------------------------------------------------------ |
| Language          | TypeScript 5 (strict)                                        |
| Build             | Vite 5 multi-page + vite-plugin-pwa                          |
| Styling           | Hand-authored CSS with design-token system + glassmorphism   |
| Data              | WeatherAPI.com via an edge proxy                             |
| Schema validation | Zod on every API response                                    |
| Hosting           | Cloudflare Pages + Pages Functions                           |
| Analytics         | Cloudflare Web Analytics (cookieless, no GDPR banner needed) |
| Quality           | ESLint · Prettier · Vitest · Playwright                      |

---

## Architecture

```
src/
  main.ts                      app wiring + geolocation + recent cities
  features/
    weather/
      forecastService.ts       typed API client, cache, quota error handling
      weatherRenderer.ts       render orchestrator
      render/                  one module per UI concern
        unitSystem · sunArc · sparkline · forecastCards
        airQuality · alerts · moonPhase · weatherIcon · aurora
    search/                    city autocomplete
    cities/                    quick-city sidebar (recents + popular defaults)
    share/                     PNG share card
  shared/
    types · schemas · utils · countryFlags
  styles/                      14 cascade-ordered CSS partials
functions/
  api/weather.js               GET /api/weather?city=
  api/weather-coords.js        GET /api/weather-coords?lat=&lon=
  api/search.js                GET /api/search?q=
  _lib/weatherProxy.js         shared proxy + key rotation + failover
```

The browser never sees an API key. All WeatherAPI calls route through the edge proxy, which rotates a pool of keys and fails over automatically when one hits its quota. Responses are edge-cached (10 min) so repeat lookups don't burn API calls.

---

## Local development

```bash
git clone https://github.com/udaykt/Instant-Weather.git
cd Instant-Weather
npm install
cp .env.example .env      # add your WeatherAPI key
npm run dev               # http://localhost:5173
```

| Script              | Purpose                    |
| ------------------- | -------------------------- |
| `npm run dev`       | Dev server with HMR        |
| `npm run build`     | Production build → `dist/` |
| `npm run typecheck` | `tsc --noEmit`             |
| `npm test`          | Unit tests (Vitest)        |
| `npm run lint`      | ESLint                     |
| `npm run test:e2e`  | Playwright end-to-end      |

---

## Deployment

Hosted on Cloudflare Pages. Pushes to `master` auto-deploy.

To self-host:

1. Fork the repo → Cloudflare Pages → Connect to Git
2. Build command: `npm run build` · Output directory: `dist`
3. Add environment variable `WEATHER_API_KEYS` = comma-separated pool of [WeatherAPI.com](https://www.weatherapi.com/) free keys
4. Enable Web Analytics in the Cloudflare dashboard and add the token to `index.html` + `weather.html`

---

## License

MIT © Uday
