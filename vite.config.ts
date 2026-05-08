/// <reference types="vitest" />
/// <reference types="node" />
import { defineConfig, loadEnv, type Plugin } from 'vite';

// Vite dev-server plugin: handles /api/* directly so only `npm run dev` is needed.
// In production, Netlify/Vercel intercept these same paths with serverless functions.
function devApiPlugin(apiKey: string): Plugin {
  const WEATHER_BASE = 'https://api.weatherapi.com/v1';

  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) { next(); return; }

        const { pathname, searchParams } = new URL(req.url, 'http://localhost');
        res.setHeader('Content-Type', 'application/json');

        try {
          let upstreamUrl: string;

          if (pathname === '/api/weather') {
            const city = searchParams.get('city');
            if (!city) { res.statusCode = 400; res.end(JSON.stringify({ error: 'city required' })); return; }
            upstreamUrl = `${WEATHER_BASE}/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=5&aqi=yes&alerts=no`;
          } else if (pathname === '/api/weather-coords') {
            const lat = searchParams.get('lat');
            const lon = searchParams.get('lon');
            if (!lat || !lon) { res.statusCode = 400; res.end(JSON.stringify({ error: 'lat and lon required' })); return; }
            upstreamUrl = `${WEATHER_BASE}/forecast.json?key=${apiKey}&q=${lat},${lon}&days=5&aqi=yes&alerts=no`;
          } else if (pathname === '/api/search') {
            const q = searchParams.get('q');
            if (!q) { res.statusCode = 400; res.end(JSON.stringify({ error: 'q required' })); return; }
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
    plugins: [devApiPlugin(env.WEATHER_API_KEY)],
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main:    'index.html',
          weather: 'weather.html',
        },
      },
    },
    test: {
      environment: 'node',
      globals: true,
    },
  };
});
