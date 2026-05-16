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
  is_day: z.number().optional(),
  feelslike_c: z.number(),
  feelslike_f: z.number(),
  humidity: z.number(),
  wind_kph: z.number(),
  wind_dir: z.string(),
  wind_degree: z.number(),
  pressure_mb: z.number(),
  precip_mm: z.number(),
  cloud: z.number(),
  dewpoint_c: z.number(),
  uv: z.number(),
  vis_km: z.number(),
  condition: WeatherConditionSchema,
  air_quality: AirQualitySchema.optional(),
});

const HourDataSchema = z.object({
  time: z.string(),
  temp_c: z.number(),
  temp_f: z.number(),
  condition: WeatherConditionSchema,
  wind_kph: z.number(),
  precip_mm: z.number(),
  humidity: z.number(),
  uv: z.number(),
  chance_of_rain: z.number(),
  chance_of_snow: z.number(),
  is_day: z.number(),
});

const ForecastDaySchema = z.object({
  date: z.string(),
  day: z.object({
    maxtemp_c: z.number(),
    mintemp_c: z.number(),
    avgtemp_c: z.number(),
    daily_chance_of_rain: z.number(),
    daily_chance_of_snow: z.number(),
    totalprecip_mm: z.number(),
    maxwind_kph: z.number(),
    condition: WeatherConditionSchema,
    uv: z.number(),
  }),
  astro: z.object({
    sunrise: z.string(),
    sunset: z.string(),
    moon_phase: z.string(),
  }),
  hour: z.array(HourDataSchema).default([]),
});

const AlertSchema = z.object({
  headline: z.string(),
  severity: z.string(),
  desc: z.string(),
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
  alerts: z.object({ alert: z.array(AlertSchema) }).optional(),
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
