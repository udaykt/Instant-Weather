// weatherTypes.ts — shared TypeScript interfaces for the WeatherAPI response

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface AirQuality {
  'us-epa-index': number;
  co?: number;
  no2?: number;
  o3?: number;
  so2?: number;
  pm2_5?: number;
  pm10?: number;
}

export interface CurrentWeather {
  temp_c: number;
  temp_f: number;
  is_day?: number;
  feelslike_c: number;
  feelslike_f: number;
  humidity: number;
  wind_kph: number;
  wind_dir: string;
  wind_degree: number;
  pressure_mb: number;
  precip_mm: number;
  cloud: number;
  dewpoint_c: number;
  uv: number;
  vis_km: number;
  condition: WeatherCondition;
  air_quality?: AirQuality;
}

export interface HourData {
  time: string;
  temp_c: number;
  temp_f: number;
  condition: WeatherCondition;
  wind_kph: number;
  precip_mm: number;
  humidity: number;
  uv: number;
  chance_of_rain: number;
  chance_of_snow: number;
  is_day: number;
}

export interface ForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    avgtemp_c: number;
    daily_chance_of_rain: number;
    daily_chance_of_snow: number;
    totalprecip_mm: number;
    maxwind_kph: number;
    condition: WeatherCondition;
    uv: number;
  };
  astro: {
    sunrise: string;
    sunset: string;
    moon_phase: string;
  };
  hour?: HourData[];
}

export interface Alert {
  headline: string;
  severity: string;
  desc: string;
}

export interface WeatherLocation {
  name: string;
  country: string;
  region: string;
  localtime: string;
}

export interface WeatherResponse {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast?: {
    forecastday: ForecastDay[];
  };
  alerts?: {
    alert: Alert[];
  };
}

export interface TemperatureState {
  temp_c: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
}

export interface DaytimePhase {
  name: string;
  gradient: string;
  isLight: boolean;
}

export interface CityResult {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}
