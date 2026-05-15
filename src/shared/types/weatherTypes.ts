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
  feelslike_c: number;
  feelslike_f: number;
  humidity: number;
  wind_kph: number;
  pressure_mb: number;
  condition: WeatherCondition;
  air_quality?: AirQuality;
}

export interface ForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: WeatherCondition;
  };
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
