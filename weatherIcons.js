// weatherIcons.js
// Maps OpenWeatherMap weather conditions to appropriate icons

export function getWeatherIcon(weatherCode, isDay = true) {
  const iconMap = {
    // Clear sky
    '01d': 'day/113.png',
    '01n': 'night/113.png',
    
    // Few clouds
    '02d': 'day/116.png',
    '02n': 'night/116.png',
    
    // Scattered clouds
    '03d': 'day/119.png',
    '03n': 'night/119.png',
    
    // Broken clouds
    '04d': 'day/122.png',
    '04n': 'night/122.png',
    
    // Shower rain
    '09d': 'day/356.png',
    '09n': 'night/356.png',
    
    // Rain
    '10d': 'day/353.png',
    '10n': 'night/353.png',
    
    // Thunderstorm
    '11d': 'day/389.png',
    '11n': 'night/389.png',
    
    // Snow
    '13d': 'day/338.png',
    '13n': 'night/338.png',
    
    // Mist
    '50d': 'day/143.png',
    '50n': 'night/143.png'
  };
  
  return iconMap[weatherCode] || 'day/113.png';
}

export function updateWeatherIcon(iconCode) {
  const iconElement = document.getElementById('icon');
  if (iconElement && iconCode) {
    const iconPath = getWeatherIcon(iconCode);
    iconElement.src = `assets/weather/64x64/${iconPath}`;
    iconElement.alt = `Weather icon for ${iconCode}`;
  }
}
