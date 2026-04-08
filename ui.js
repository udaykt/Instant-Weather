// ui.js
// Handles all DOM/UI updates

import { dateBuilder } from './utils.js';
import { updateWeatherIcon } from './weatherIcons.js';

// Time-based background themes
const TIMES_OF_DAY = {
  early_morning: {
    name: "Early Morning",
    value: "linear-gradient(to bottom, #232526, #414345)",
  },
  dawn: {
    name: "Dawn",
    value: "linear-gradient(to bottom, #f7971e, #ffd200, #f7971e, #ffd200)",
  },
  morning: {
    name: "Morning",
    value: "linear-gradient(to bottom, #a1c4fd, #c2e9fb)",
  },
  late_morning: {
    name: "Late Morning",
    value: "linear-gradient(to bottom, #fceabb, #f8b500)",
  },
  afternoon: {
    name: "Afternoon",
    value: "linear-gradient(to bottom, #00c6fb, #005bea)",
  },
  late_afternoon: {
    name: "Late Afternoon",
    value: "linear-gradient(to bottom, #f7971e, #ffd200)",
  },
  early_evening: {
    name: "Early Evening",
    value: "linear-gradient(to bottom, #f857a6, #ff5858)",
  },
  evening: {
    name: "Evening",
    value: "linear-gradient(to bottom, #667db6, #0082c8, #0082c8, #667db6)",
  },
  dusk: {
    name: "Dusk",
    value: "linear-gradient(to bottom, #ff6b6b, #4ecdc4, #45b7d1)",
  },
  night: {
    name: "Night",
    value: "linear-gradient(to bottom, #141e30, #243b55)",
  },
  midnight: {
    name: "Midnight",
    value: "linear-gradient(to bottom, #000428, #004e92)",
  },
  middle_of_the_night: {
    name: "Middle of the Night",
    value: "linear-gradient(to bottom, #000000, #434343)",
  },
  default: {
    name: "",
    value: "linear-gradient(to bottom, #83a4d4, #b6fbff)",
  },
};

// Apply background based on city's local time, not user's local time
function applyTimeBasedBackground(weatherData = null) {
  // Use city's local time if available, otherwise use user's time
  let now;
  let cityName = 'Local';
  
  if (weatherData && weatherData.timezone !== undefined) {
    // Calculate city's local time using timezone offset
    const userLocalTime = new Date();
    const utcTime = userLocalTime.getTime() + (userLocalTime.getTimezoneOffset() * 60000);
    now = new Date(utcTime + (weatherData.timezone * 1000));
    cityName = weatherData.name || 'Unknown';
    
    console.log(`[Background] City: ${cityName}`);
    console.log(`[Background] User local time: ${userLocalTime.toLocaleTimeString()}`);
    console.log(`[Background] Timezone offset: ${weatherData.timezone}s (${weatherData.timezone/3600}h)`);
    console.log(`[Background] City local time: ${now.toLocaleTimeString()}`);
    console.log(`[Background] City hour: ${now.getHours()}`);
  } else {
    // Fallback to user's local time
    now = new Date();
    console.log(`[Background] No timezone data, using user local time: ${now.toLocaleTimeString()} (hour: ${now.getHours()})`);
  }
  
  const hour = now.getHours();
  let partOfDay = TIMES_OF_DAY.default;
  
  // Determine time period
  if (hour >= 1 && hour <= 2) partOfDay = TIMES_OF_DAY.middle_of_the_night;
  else if (hour > 2 && hour <= 5) partOfDay = TIMES_OF_DAY.early_morning;
  else if (hour > 5 && hour <= 6) partOfDay = TIMES_OF_DAY.dawn;
  else if (hour > 6 && hour <= 9) partOfDay = TIMES_OF_DAY.morning;
  else if (hour > 9 && hour <= 12) partOfDay = TIMES_OF_DAY.late_morning;
  else if (hour > 12 && hour <= 16) partOfDay = TIMES_OF_DAY.afternoon;
  else if (hour > 16 && hour <= 17) partOfDay = TIMES_OF_DAY.late_afternoon;
  else if (hour > 17 && hour <= 18) partOfDay = TIMES_OF_DAY.early_evening;
  else if (hour > 18 && hour <= 19) partOfDay = TIMES_OF_DAY.dusk;
  else if (hour > 19 && hour <= 21) partOfDay = TIMES_OF_DAY.evening;
  else if (hour > 21) partOfDay = TIMES_OF_DAY.night;

  // Force background update by removing and reapplying styles
  const backgroundStyle = partOfDay.value;
  
  // Clear any existing background styles first
  document.body.style.removeProperty('background');
  document.documentElement.style.removeProperty('background');
  
  // Apply new background with !important to override any cached styles
  document.body.style.setProperty('background', backgroundStyle, 'important');
  document.documentElement.style.setProperty('background', backgroundStyle, 'important');
  
  // Update part-of-day text
  const partOfDayElement = document.querySelector('.day-phase');
  if (partOfDayElement) {
    partOfDayElement.textContent = partOfDay.name;
  }
  
  console.log(`[Background] ${cityName}: ${partOfDay.name} (${hour}:00) - ${backgroundStyle}`);
}

// Apply background immediately when script loads
if (typeof document !== 'undefined') {
  // Apply initial background with user's timezone
  applyTimeBasedBackground();
}

// Store current weather data for auto-updates
let currentWeatherData = null;

export function displayResults(weather, tempState, hideLoading) {
  console.log('[displayResults] Full weather object:', weather);
  console.log('[displayResults] Weather timezone:', weather.timezone);
  console.log('[displayResults] Weather name:', weather.name);
  
  if (!weather || !weather.main) {
    console.error('[displayResults] Missing weather or weather.main:', weather);
    return;
  }
  
  // Store current weather data for auto-updates
  currentWeatherData = weather;
  
  // Update background based on weather data timezone
  applyTimeBasedBackground(weather);
  let city = document.querySelector('.city-name');
  let country = document.querySelector('.country-name');
  const weatherDescElem = document.querySelector('.weather-text');
  if (!city) console.error('[displayResults] .city element not found');
  if (!country) console.error('[displayResults] .country element not found');
  if (!weatherDescElem) console.error('[displayResults] .weather-description element not found');
  city.innerHTML = `${weather.name}`;
  country.innerHTML = `${weather.sys.country}`;
  
  // Update coordinates display
  updateCoordinates(weather);
  
  if (weatherDescElem) {
    if (weather.weather && weather.weather[0] && weather.weather[0].description) {
      weatherDescElem.innerHTML = weather.weather[0].description;
    } else {
      weatherDescElem.innerHTML = 'N/A';
      console.error('[displayResults] weather.weather[0].description missing:', weather.weather);
    }
  }

  // Update weather icon
  if (weather.weather && weather.weather[0] && weather.weather[0].icon) {
    updateWeatherIcon(weather.weather[0].icon);
  }

  // Update weather badge
  updateWeatherBadge(weather);

  // Update date and time in UI
  const dateElem = document.querySelector('.date-display');
  const timeElem = document.querySelector('.time-display');
  if (dateElem && timeElem) {
    const now = new Date();
    dateElem.textContent = dateBuilder(now);
    timeElem.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Update data freshness indicator
  updateDataFreshness(weather);
  
  // Update day phase
  updateDayPhase(weather);

  // Update temperature values in shared state
  const temperature = document.querySelector('.temp-number');
  const tempUnit = document.querySelector('.temp-unit');
  const hi_low = document.querySelector('.feels-like');
  const sliderThumb = document.querySelector('.slider-thumb');

  // Store temperature values in both units
  tempState.temp_c = Math.round(weather.main.temp);
  tempState.temp_f = Math.round(weather.main.temp * 9/5 + 32);
  tempState.hi_low_c = Math.round(weather.main.feels_like);
  tempState.hi_low_f = Math.round(weather.main.feels_like * 9/5 + 32);
  
  // Get current unit from slider or default to Celsius
  let currentUnit = sliderThumb ? sliderThumb.getAttribute('data-unit') : 'C';
  
  // Ensure slider is properly initialized to Celsius if no valid unit is set
  if (sliderThumb && (!currentUnit || (currentUnit !== 'C' && currentUnit !== 'F'))) {
    sliderThumb.setAttribute('data-unit', 'C');
    currentUnit = 'C';
  }
  
  if (currentUnit === 'F') {
    temperature.textContent = `${tempState.temp_f}°`;
    tempUnit.textContent = '°F';
    hi_low.textContent = `Feels like ${tempState.hi_low_f}°F`;
  } else {
    temperature.textContent = `${tempState.temp_c}°`;
    tempUnit.textContent = '°C';
    hi_low.textContent = `Feels like ${tempState.hi_low_c}°C`;
  }

  // Update humidity, wind, and pressure in summary
  const humidityElem = document.querySelector('.humidity-value');
  const windElem = document.querySelector('.wind-value');
  const pressureElem = document.querySelector('.pressure-value');
  if (humidityElem && weather.main.humidity !== undefined) humidityElem.textContent = weather.main.humidity + '%';
  
  // Enhanced wind display with direction
  if (windElem && weather.wind.speed !== undefined) {
    const windSpeed = Math.round(weather.wind.speed * 3.6);
    const windDirection = weather.wind.deg ? getWindDirection(weather.wind.deg) : '';
    windElem.textContent = windDirection ? `${windSpeed} kph ${windDirection}` : `${windSpeed} kph`;
    
    // Update wind gust if available
    const windGustElem = document.querySelector('.wind-gust');
    if (windGustElem && weather.wind.gust) {
      const gustSpeed = Math.round(weather.wind.gust * 3.6);
      windGustElem.textContent = `Gusts: ${gustSpeed} kph`;
    } else if (windGustElem) {
      windGustElem.textContent = '';
    }
  }
  
  if (pressureElem && weather.main.pressure !== undefined) pressureElem.textContent = weather.main.pressure + ' mb';
    
    // Update pressure comparison if available
    const pressureComparisonElem = document.querySelector('.pressure-comparison');
    if (pressureComparisonElem) {
      let comparisonText = '';
      
      if (weather.main.sea_level && weather.main.grnd_level) {
        const seaLevel = weather.main.sea_level;
        const groundLevel = weather.main.grnd_level;
        const difference = Math.abs(seaLevel - groundLevel);
        
        if (difference > 1) {
          comparisonText = `Sea: ${seaLevel} / Ground: ${groundLevel} hPa`;
        }
      } else if (weather.main.sea_level) {
        comparisonText = `Sea level: ${weather.main.sea_level} hPa`;
      } else if (weather.main.grnd_level) {
        comparisonText = `Ground level: ${weather.main.grnd_level} hPa`;
      }
      
      pressureComparisonElem.textContent = comparisonText;
    }

  // Add high/low temperature display
  updateHighLowTemperatures(weather);
  
  // Add visibility and cloud coverage
  updateVisibilityAndClouds(weather);
  
  // Add precipitation display
  updatePrecipitation(weather);
  
  // Add dew point calculation
  updateDewPoint(weather);
  
  // Add wind direction
  updateWindDirection(weather);
  
  // Add weather alerts for severe conditions
  checkWeatherAlerts(weather);
  
  // Add sunrise/sunset times
  updateSunTimes(weather);
  
  // Update day/night indicator
  updateDayNightIndicator(weather);

  // Hide loading overlay after all UI updates are complete
  if (hideLoading && typeof hideLoading === 'function') {
    requestAnimationFrame(() => {
      hideLoading();
    });
  }
}

// Function to update day/night indicator
function updateDayNightIndicator(weather) {
  const indicator = document.querySelector('.day-night-indicator');
  if (!indicator) return;
  
  if (weather.sys && weather.sys.sunrise && weather.sys.sunset) {
    const now = Math.floor(Date.now() / 1000);
    const sunrise = weather.sys.sunrise;
    const sunset = weather.sys.sunset;
    
    if (now >= sunrise && now < sunset) {
      indicator.textContent = '☀️';
      indicator.title = 'Daytime';
    } else {
      indicator.textContent = '🌙';
      indicator.title = 'Nighttime';
    }
  } else {
    indicator.textContent = '☀️';
    indicator.title = 'Daytime';
  }
}

// Auto-update background every minute to handle time transitions
if (typeof document !== 'undefined') {
  setInterval(() => {
    applyTimeBasedBackground(currentWeatherData);
  }, 60000);
}

// Helper function to convert wind degrees to compass direction
function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 11.25) % 16];
}

// Function to update high/low temperatures
export function updateHighLowTemperatures(weather) {
  const highLowElem = document.querySelector('.temp-range');
  if (!highLowElem) return;
  
  if (weather.main.temp_min && weather.main.temp_max) {
    const sliderThumb = document.querySelector('.slider-thumb');
    const currentUnit = sliderThumb ? sliderThumb.getAttribute('data-unit') : 'C';
    
    if (currentUnit === 'F') {
      const high = Math.round(weather.main.temp_max * 9/5 + 32);
      const low = Math.round(weather.main.temp_min * 9/5 + 32);
      highLowElem.innerHTML = `<strong>Today:</strong> H ${high}°F / L ${low}°F`;
    } else {
      const high = Math.round(weather.main.temp_max);
      const low = Math.round(weather.main.temp_min);
      highLowElem.innerHTML = `<strong>Today:</strong> H ${high}°C / L ${low}°C`;
    }
  }
}

// Function to update visibility and cloud coverage
function updateVisibilityAndClouds(weather) {
  const visibilityElem = document.querySelector('.visibility-value');
  const cloudsElem = document.querySelector('.clouds-value');
  
  if (visibilityElem && weather.visibility) {
    const visibilityKm = (weather.visibility / 1000).toFixed(1);
    visibilityElem.textContent = `${visibilityKm} km`;
  }
  
  if (cloudsElem && weather.clouds && weather.clouds.all !== undefined) {
    cloudsElem.textContent = `${weather.clouds.all}%`;
  }
}

// Function to update weather badge
function updateWeatherBadge(weather) {
  const badgeElem = document.querySelector('.weather-tag');
  if (!badgeElem) return;
  
  if (weather.weather && weather.weather[0]) {
    const weatherMain = weather.weather[0].main;
    const weatherId = weather.weather[0].id;
    
    // Set badge text
    badgeElem.textContent = weatherMain;
    
    // Add color coding based on weather condition
    badgeElem.style.background = getWeatherBadgeColor(weatherId);
  }
}

// Function to get weather badge color based on weather ID
function getWeatherBadgeColor(weatherId) {
  // Weather condition codes from OpenWeatherMap
  if (weatherId >= 200 && weatherId < 300) {
    // Thunderstorm
    return 'rgba(138, 43, 226, 0.4)'; // Purple
  } else if (weatherId >= 300 && weatherId < 400) {
    // Drizzle
    return 'rgba(100, 149, 237, 0.4)'; // Cornflower blue
  } else if (weatherId >= 500 && weatherId < 600) {
    // Rain
    return 'rgba(30, 144, 255, 0.4)'; // Dodger blue
  } else if (weatherId >= 600 && weatherId < 700) {
    // Snow
    return 'rgba(173, 216, 230, 0.4)'; // Light blue
  } else if (weatherId >= 700 && weatherId < 800) {
    // Atmosphere (fog, mist, etc.)
    return 'rgba(169, 169, 169, 0.4)'; // Gray
  } else if (weatherId === 800) {
    // Clear
    return 'rgba(255, 215, 0, 0.4)'; // Gold
  } else if (weatherId > 800) {
    // Clouds
    return 'rgba(192, 192, 192, 0.4)'; // Silver
  }
  return 'rgba(255, 255, 255, 0.2)'; // Default
}

// Function to update coordinates display
function updateCoordinates(weather) {
  const coordsElem = document.querySelector('.coords-info');
  if (!coordsElem) return;
  
  if (weather.coord && weather.coord.lat && weather.coord.lon) {
    const lat = weather.coord.lat.toFixed(4);
    const lon = weather.coord.lon.toFixed(4);
    coordsElem.textContent = `(${lat}, ${lon})`;
  }
}

// Function to update data freshness indicator
function updateDataFreshness(weather) {
  const freshnessElem = document.querySelector('.freshness-indicator');
  if (!freshnessElem) return;
  
  if (weather.dt) {
    const dataTime = new Date(weather.dt * 1000);
    const now = new Date();
    const diffMinutes = Math.floor((now - dataTime) / 60000);
    
    if (diffMinutes < 1) {
      freshnessElem.textContent = 'Live';
    } else if (diffMinutes < 60) {
      freshnessElem.textContent = `Updated ${diffMinutes}m ago`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      freshnessElem.textContent = `Updated ${hours}h ago`;
    }
  }
}

// Function to update day phase
function updateDayPhase(weather) {
  const dayPhaseElem = document.querySelector('.day-phase');
  if (!dayPhaseElem) return;
  
  if (weather.sys && weather.sys.sunrise && weather.sys.sunset) {
    const now = Math.floor(Date.now() / 1000);
    const sunrise = weather.sys.sunrise;
    const sunset = weather.sys.sunset;
    
    if (now >= sunrise && now < sunset) {
      dayPhaseElem.textContent = 'Day';
    } else {
      dayPhaseElem.textContent = 'Night';
    }
  }
}

// Function to check for severe weather alerts
function checkWeatherAlerts(weather) {
  const alertOverlay = document.querySelector('.weather-alert-overlay');
  if (!alertOverlay) return;
  
  // Clear any existing alerts
  alertOverlay.innerHTML = '';
  alertOverlay.classList.remove('show');
  
  const alerts = [];
  
  // Check for severe weather conditions
  if (weather.weather && weather.weather[0]) {
    const weatherId = weather.weather[0].id;
    const weatherMain = weather.weather[0].main;
    const weatherDesc = weather.weather[0].description;
    
    // Thunderstorms (200-299)
    if (weatherId >= 200 && weatherId < 300) {
      alerts.push({
        type: 'danger',
        title: 'Thunderstorm Warning',
        message: `Severe thunderstorm detected: ${weatherDesc}`
      });
    }
    
    // Heavy rain (501-504)
    else if (weatherId >= 501 && weatherId <= 504) {
      alerts.push({
        type: 'warning',
        title: 'Heavy Rain Alert',
        message: `Heavy precipitation: ${weatherDesc}`
      });
    }
    
    // Extreme conditions
    else if (weatherId === 771 || weatherId === 772) {
      alerts.push({
        type: 'danger',
        title: 'Extreme Weather',
        message: `Dangerous conditions: ${weatherDesc}`
      });
    }
  }
  
  // Check for extreme temperatures
  if (weather.main && weather.main.temp) {
    const temp = weather.main.temp;
    if (temp > 40) {
      alerts.push({
        type: 'danger',
        title: 'Extreme Heat',
        message: `Dangerous temperature: ${Math.round(temp)}°C`
      });
    } else if (temp > 35) {
      alerts.push({
        type: 'warning',
        title: 'Heat Advisory',
        message: `High temperature: ${Math.round(temp)}°C`
      });
    } else if (temp < -10) {
      alerts.push({
        type: 'danger',
        title: 'Extreme Cold',
        message: `Dangerous temperature: ${Math.round(temp)}°C`
      });
    }
  }
  
  // Check for high wind speeds
  if (weather.wind && weather.wind.speed) {
    const windSpeed = weather.wind.speed * 3.6; // Convert to kph
    if (windSpeed > 80) {
      alerts.push({
        type: 'danger',
        title: 'High Wind Warning',
        message: `Dangerous wind: ${Math.round(windSpeed)} kph`
      });
    } else if (windSpeed > 60) {
      alerts.push({
        type: 'warning',
        title: 'Wind Advisory',
        message: `Strong wind: ${Math.round(windSpeed)} kph`
      });
    }
  }
  
  // Check for low visibility
  if (weather.visibility && weather.visibility < 1000) {
    alerts.push({
      type: 'warning',
      title: 'Low Visibility',
      message: `Poor visibility: ${(weather.visibility / 1000).toFixed(1)} km`
    });
  }
  
  // Display alerts if any
  if (alerts.length > 0) {
    const alert = alerts[0]; // Show only the most severe alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `weather-alert ${alert.type}`;
    alertDiv.innerHTML = `
      <div class="weather-alert-title">${alert.title}</div>
      <div class="weather-alert-message">${alert.message}</div>
      <button class="weather-alert-close">×</button>
    `;
    
    alertOverlay.appendChild(alertDiv);
    
    // Add close functionality
    const closeButton = alertDiv.querySelector('.weather-alert-close');
    closeButton.addEventListener('click', () => {
      alertOverlay.classList.remove('show');
      setTimeout(() => {
        alertOverlay.innerHTML = '';
      }, 300);
    });
    
    // Show alert with animation
    requestAnimationFrame(() => {
      alertOverlay.classList.add('show');
    });
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (alertOverlay.classList.contains('show')) {
        alertOverlay.classList.remove('show');
        setTimeout(() => {
          alertOverlay.innerHTML = '';
        }, 300);
      }
    }, 10000);
  }
}

// Function to update precipitation display
function updatePrecipitation(weather) {
  const precipElem = document.querySelector('.precipitation-value');
  if (!precipElem) return;
  
  let precipText = 'None';
  
  // Check for rain
  if (weather.rain && weather.rain['1h']) {
    precipText = `Rain: ${weather.rain['1h']} mm`;
  }
  // Check for snow
  else if (weather.snow && weather.snow['1h']) {
    precipText = `Snow: ${weather.snow['1h']} mm`;
  }
  
  precipElem.textContent = precipText;
}

// Function to calculate and update dew point
export function updateDewPoint(weather) {
  const dewPointElem = document.querySelector('.dewpoint-value');
  if (!dewPointElem) return;
  
  if (weather.main && weather.main.temp !== undefined && weather.main.humidity !== undefined) {
    // Calculate dew point using Magnus formula
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100.0);
    const dewPoint = (b * alpha) / (a - alpha);
    
    const sliderThumb = document.querySelector('.slider-thumb');
    const currentUnit = sliderThumb ? sliderThumb.getAttribute('data-unit') : 'C';
    
    if (currentUnit === 'F') {
      const dewPointF = Math.round(dewPoint * 9/5 + 32);
      dewPointElem.textContent = `${dewPointF}°F`;
    } else {
      dewPointElem.textContent = `${Math.round(dewPoint)}°C`;
    }
  } else {
    const sliderThumb = document.querySelector('.slider-thumb');
    const currentUnit = sliderThumb ? sliderThumb.getAttribute('data-unit') : 'C';
    dewPointElem.textContent = `--${currentUnit}`;
  }
}

// Function to update wind direction
function updateWindDirection(weather) {
  const windDirElem = document.querySelector('.winddir-value');
  if (!windDirElem) return;
  
  if (weather.wind && weather.wind.deg !== undefined) {
    const direction = getWindDirection(weather.wind.deg);
    windDirElem.textContent = direction;
  } else {
    windDirElem.textContent = '--';
  }
}

// Function to update sunrise/sunset times
function updateSunTimes(weather) {
  const sunTimesElem = document.querySelector('.sun-times');
  if (!sunTimesElem) return;
  
  let sunTimesText = '';
  if (weather.sys && weather.sys.sunrise && weather.sys.sunset) {
    const sunrise = new Date(weather.sys.sunrise * 1000);
    const sunset = new Date(weather.sys.sunset * 1000);
    const sunriseTime = sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    sunTimesText = `Sunrise: ${sunriseTime} | Sunset: ${sunsetTime}`;
  }
  
  sunTimesElem.textContent = sunTimesText;
}

