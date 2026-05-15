import { z } from 'zod';

const WeatherConditionSchema = z.object({
  text: z.string(),
  icon: z.string(),
  code: z.number(),
});

const AirQualitySchema = z.object({
  'us-epa-index': z.number(),
  co: z.number().optional(),
  no2: z.number().optional(),
  o3: z.number().optional(),
  so2: z.number().optional(),
  pm2_5: z.number().optional(),
  pm10: z.number().optional(),
});

const CurrentWeatherSchema = z.object({
  temp_c: z.number(),
  temp_f: z.number(),
  feelslike_c: z.number(),
  feelslike_f: z.number(),
  humidity: z.number(),
  wind_kph: z.number(),
  pressure_mb: z.number(),
  condition: WeatherConditionSchema,
  air_quality: AirQualitySchema.optional(),
});

const ForecastDaySchema = z.object({
  date: z.string(),
  day: z.object({
    maxtemp_c: z.number(),
    mintemp_c: z.number(),
    condition: WeatherConditionSchema,
  }),
});

const WeatherLocationSchema = z.object({
  name: z.string(),
  country: z.string(),
  region: z.string(),
  localtime: z.string(),
});

export const WeatherResponseSchema = z.object({
  location: WeatherLocationSchema,
  current: CurrentWeatherSchema,
  forecast: z.object({ forecastday: z.array(ForecastDaySchema) }).optional(),
});

export const CityResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  region: z.string(),
  country: z.string(),
  lat: z.number(),
  lon: z.number(),
  url: z.string(),
});

export const CityResultsSchema = z.array(CityResultSchema);
