// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderForecast, formatTemperature } from '../src/features/weather/weatherRenderer';
import type { WeatherResponse, TemperatureState } from '../src/shared/types/weatherTypes';

function setupDOM() {
  document.body.innerHTML = `
    <div id="main-block">
      <span class="city"></span>
      <span class="country"></span>
      <div class="weather-description"></div>
      <img id="icon" />
      <div class="part-of-day"></div>
      <span class="date"></span>
      <span class="time"></span>
      <div class="temperature-reading"></div>
      <button class="temperature-degree" value="C">C</button>
      <div class="temperature-real-feel"></div>
      <div class="humidity-value"></div>
      <div class="wind-value"></div>
      <div class="pressure-value"></div>
      <div id="aqi-badge"></div>
      <div id="forecast-cards"></div>
    </div>
  `;
}

const mockWeather: WeatherResponse = {
  location: {
    name: 'London',
    country: 'UK',
    region: 'City of London',
    localtime: '2026-05-15 14:00',
  },
  current: {
    temp_c: 18,
    temp_f: 64.4,
    feelslike_c: 16,
    feelslike_f: 60.8,
    humidity: 70,
    wind_kph: 15,
    pressure_mb: 1012,
    condition: {
      text: 'Partly cloudy',
      icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      code: 1003,
    },
    air_quality: { 'us-epa-index': 1 },
  },
  forecast: {
    forecastday: [
      {
        date: '2026-05-15',
        day: {
          maxtemp_c: 20,
          mintemp_c: 12,
          condition: {
            text: 'Sunny',
            icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
            code: 1000,
          },
        },
      },
    ],
  },
};

describe('renderForecast', () => {
  beforeEach(setupDOM);

  it('updates city and country', () => {
    const currentConditions: TemperatureState = {
      temp_c: 0,
      temp_f: 0,
      feelslike_c: 0,
      feelslike_f: 0,
    };
    renderForecast(mockWeather, currentConditions);
    expect(document.querySelector('.city')?.textContent).toBe('London');
    expect(document.querySelector('.country')?.textContent).toBe('UK');
  });

  it('sets temperature reading', () => {
    const currentConditions: TemperatureState = {
      temp_c: 0,
      temp_f: 0,
      feelslike_c: 0,
      feelslike_f: 0,
    };
    renderForecast(mockWeather, currentConditions);
    expect(document.querySelector('.temperature-reading')?.textContent).toBe('18°');
  });

  it('sets weather description', () => {
    const currentConditions: TemperatureState = {
      temp_c: 0,
      temp_f: 0,
      feelslike_c: 0,
      feelslike_f: 0,
    };
    renderForecast(mockWeather, currentConditions);
    expect(document.querySelector('.weather-description')?.textContent).toBe('Partly cloudy');
  });

  it('sets stats — humidity, wind, pressure', () => {
    const currentConditions: TemperatureState = {
      temp_c: 0,
      temp_f: 0,
      feelslike_c: 0,
      feelslike_f: 0,
    };
    renderForecast(mockWeather, currentConditions);
    expect(document.querySelector('.humidity-value')?.textContent).toBe('70%');
    expect(document.querySelector('.wind-value')?.textContent).toBe('15 kph');
    expect(document.querySelector('.pressure-value')?.textContent).toBe('1012 mb');
  });

  it('populates currentConditions with rounded values', () => {
    const currentConditions: TemperatureState = {
      temp_c: 0,
      temp_f: 0,
      feelslike_c: 0,
      feelslike_f: 0,
    };
    renderForecast(mockWeather, currentConditions);
    expect(currentConditions.temp_c).toBe(18);
    expect(currentConditions.temp_f).toBe(64);
    expect(currentConditions.feelslike_c).toBe(16);
    expect(currentConditions.feelslike_f).toBe(61);
  });

  it('renders forecast cards', () => {
    const currentConditions: TemperatureState = {
      temp_c: 0,
      temp_f: 0,
      feelslike_c: 0,
      feelslike_f: 0,
    };
    renderForecast(mockWeather, currentConditions);
    expect(document.querySelectorAll('.forecast-card').length).toBe(1);
  });

  it('removes skeleton classes after display', () => {
    document.querySelector('.city')?.classList.add('skeleton-text');
    document.querySelector('.temperature-reading')?.classList.add('skeleton-text');
    const currentConditions: TemperatureState = {
      temp_c: 0,
      temp_f: 0,
      feelslike_c: 0,
      feelslike_f: 0,
    };
    renderForecast(mockWeather, currentConditions);
    expect(document.querySelector('.city')?.classList.contains('skeleton-text')).toBe(false);
    expect(
      document.querySelector('.temperature-reading')?.classList.contains('skeleton-text'),
    ).toBe(false);
  });

  it('sets AQI badge for Good air quality', () => {
    const currentConditions: TemperatureState = {
      temp_c: 0,
      temp_f: 0,
      feelslike_c: 0,
      feelslike_f: 0,
    };
    renderForecast(mockWeather, currentConditions);
    expect(document.getElementById('aqi-badge')?.textContent).toContain('Good');
  });
});

describe('formatTemperature', () => {
  beforeEach(setupDOM);

  it('switches from C to F', () => {
    const currentConditions: TemperatureState = {
      temp_c: 18,
      temp_f: 64,
      feelslike_c: 16,
      feelslike_f: 61,
    };
    formatTemperature('C', currentConditions);
    expect(document.querySelector('.temperature-reading')?.textContent).toBe('64°');
    expect(document.querySelector('.temperature-degree')?.textContent).toBe('F');
    expect(document.querySelector('.temperature-real-feel')?.textContent).toBe('Feels like 61°F');
  });

  it('switches from F back to C', () => {
    const currentConditions: TemperatureState = {
      temp_c: 18,
      temp_f: 64,
      feelslike_c: 16,
      feelslike_f: 61,
    };
    formatTemperature('F', currentConditions);
    expect(document.querySelector('.temperature-reading')?.textContent).toBe('18°');
    expect(document.querySelector('.temperature-degree')?.textContent).toBe('C');
    expect(document.querySelector('.temperature-real-feel')?.textContent).toBe('Feels like 16°C');
  });
});
