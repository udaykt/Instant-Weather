<div align="center">

# 🌤️ Instant Weather

**Real-time weather, 5-day forecast, air quality and astro data for any city — wrapped in an animated glass UI.**

[![Live Demo](https://img.shields.io/badge/demo-live-3fb950?style=flat-square)](https://instant-weather.pages.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-f38020?style=flat-square&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?style=flat-square)](https://web.dev/progressive-web-apps/)

<!-- Replace with a real screenshot/GIF: docs/preview.png -->
<img src="docs/preview.png" alt="Instant Weather preview" width="800" />

</div>

---

## ✨ Features

- **Live conditions** — temperature, feels-like, hi/lo, humidity, wind, pressure, dew point, UV, visibility, precipitation.
- **5-day & hourly forecast** with an interactive temperature sparkline (hover/tap any hour).
- **Air Quality Index** with a pollutant breakdown popover.
- **Astro** — sunrise/sunset with a sun that travels its arc, plus moon phase.
- **Severe-weather alerts** banner.
- **Dynamic aurora theme** that retints to the current condition and time of day.
- **°C / °F** with an animated segmented toggle; choice is remembered.
- **Geolocation** on first load, city search with autocomplete, quick-city shortcuts.
- **Share** the panel as a PNG (download or copy to clipboard).
- **Installable PWA**, offline-capable, fully responsive (tested down to iPhone 16), reduced-motion aware.

## 🧱 Tech Stack

| Layer      | Choice                                                           |
| ---------- | ---------------------------------------------------------------- |
| Language   | TypeScript (strict)                                              |
| Build      | Vite 5 (multi-page) + `vite-plugin-pwa`                          |
| Styling    | Hand-authored CSS, design-token system, glassmorphism            |
| Data       | [WeatherAPI.com](https://www.weatherapi.com/) via a server proxy |
| Validation | Zod schemas on every API response                                |
| Hosting    | Cloudflare Pages + Pages Functions (edge)                        |
| Analytics  | Cloudflare Web Analytics (cookieless)                            |
| Quality    | ESLint, Prettier, Vitest, Playwright                             |

## 🏗️ Architecture

```
src/
  main.ts                     app wiring
  features/
    weather/
      forecastService.ts      typed API client + cache + quota errors
      weatherRenderer.ts      orchestrator
      render/                 one focused module per UI concern
        unitSystem · sunArc · sparkline · forecastCards
        airQuality · alerts · moonPhase · weatherIcon · aurora · dom
    search/  cities/  share/
  shared/  types · schemas · utils
  styles/                     14 cascade-ordered CSS partials
functions/
  api/{weather,weather-coords,search}.js   Cloudflare Pages Functions
  _lib/weatherProxy.js                     shared proxy + key rotation
```

The browser never sees an API key — all WeatherAPI calls go through the
edge proxy, which **rotates a pool of keys** and **fails over automatically**
when one hits its quota. Successful responses are edge-cached so repeat
lookups don't burn calls; when every key is exhausted the UI shows a
friendly "try again later" message.

## 🚀 Local Development

```bash
git clone https://github.com/udaykt/Instant-Weather.git
cd Instant-Weather
npm install
cp .env.example .env      # add your WeatherAPI key(s)
npm run dev               # http://localhost:5173/weather.html
```

The Vite dev server proxies `/api/*` itself, so no separate backend is
needed locally.

| Script              | Purpose                   |
| ------------------- | ------------------------- |
| `npm run dev`       | Dev server (HMR)          |
| `npm run build`     | Production build → `dist` |
| `npm run preview`   | Preview the build         |
| `npm run typecheck` | `tsc --noEmit`            |
| `npm test`          | Unit tests (Vitest)       |
| `npm run lint`      | ESLint                    |

## ☁️ Deployment (Cloudflare Pages)

1. Connect the repo in the Cloudflare dashboard → **Pages**.
2. Build command `npm run build`, output directory `dist`.
3. Add environment variable **`WEATHER_API_KEYS`** = `key1,key2,key3`
   (comma-separated pool — add as many free keys as you have for more
   monthly headroom).
4. (Optional) Enable **Web Analytics** and paste the token into the
   `data-cf-beacon` script in `index.html` / `weather.html`.

`functions/` is picked up automatically as Pages Functions — no extra
config. `wrangler.toml` documents the build output directory.

## 🔑 API Limits

WeatherAPI's free plan is generous but finite (and caps forecast depth).
The key-rotation pool multiplies headroom, edge caching cuts duplicate
calls, and the app degrades gracefully with a clear message instead of
breaking when limits are reached.

## 📣 Showcasing on GitHub

- Pin this repo; add a crisp `docs/preview.png` and a short demo GIF at the top.
- Fill the repo **About**: description, live URL, topics
  (`weather`, `typescript`, `vite`, `pwa`, `cloudflare-pages`).
- Add a **social preview image** (Settings → Social preview).
- Keep the live demo link green and working — it gets clicked first.

## 📄 License

MIT © Uday
