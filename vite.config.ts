/// <reference types="vitest" />
/// <reference types="node" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

// Vite dev-server plugin: handles /api/* directly so only `npm run dev` is needed.
// In production, Netlify/Vercel intercept these same paths with serverless functions.
function devApiPlugin(apiKey: string): Plugin {
  const WEATHER_BASE = 'https://api.weatherapi.com/v1';

  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          next();
          return;
        }

        const { pathname, searchParams } = new URL(req.url, 'http://localhost');
        res.setHeader('Content-Type', 'application/json');

        try {
          let upstreamUrl: string;

          if (pathname === '/api/weather') {
            const city = searchParams.get('city');
            if (!city) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'city required' }));
              return;
            }
            upstreamUrl = `${WEATHER_BASE}/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=5&aqi=yes&alerts=no`;
          } else if (pathname === '/api/weather-coords') {
            const lat = searchParams.get('lat');
            const lon = searchParams.get('lon');
            if (!lat || !lon) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'lat and lon required' }));
              return;
            }
            upstreamUrl = `${WEATHER_BASE}/forecast.json?key=${apiKey}&q=${lat},${lon}&days=5&aqi=yes&alerts=no`;
          } else if (pathname === '/api/search') {
            const q = searchParams.get('q');
            if (!q) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'q required' }));
              return;
            }
            upstreamUrl = `${WEATHER_BASE}/search.json?key=${apiKey}&q=${encodeURIComponent(q)}`;
          } else {
            next();
            return;
          }

          const upstream = await fetch(upstreamUrl);
          const data = await upstream.json();
          res.statusCode = upstream.ok ? 200 : upstream.status;
          res.end(JSON.stringify(data));
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // loadEnv with '' prefix reads ALL .env vars (not just VITE_ prefixed)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tsconfigPaths(),
      devApiPlugin(env.WEATHER_API_KEY),
      VitePWA({
        registerType: 'autoUpdate',
        // manifest: false keeps public/manifest.json and the <link> tags in HTML as-is
        manifest: false,
        workbox: {
          // Pre-cache all built JS/CSS/HTML/fonts/images
          globPatterns: ['**/*.{js,css,html,png,ttf}'],
          runtimeCaching: [
            {
              // Network-first for API calls — always want fresh weather data
              urlPattern: /^\/api\//,
              handler: 'NetworkFirst',
              options: { cacheName: 'api-cache', networkTimeoutSeconds: 10 },
            },
            {
              // Cache-first for WeatherAPI icon CDN
              urlPattern: /cdn\.weatherapi\.com\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'weather-icons',
                expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: 'index.html',
          weather: 'weather.html',
        },
      },
    },
    test: {
      environment: 'node',
      globals: true,
      exclude: ['node_modules/**', 'tests/e2e/**'],
      environmentMatchGlobs: [['tests/ui.test.ts', 'happy-dom']],
    },
  };
});
