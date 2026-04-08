// weatherApi.js
// Handles all weather API interactions via secure backend proxy

const isLocal = typeof window !== 'undefined' && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const apiBase = isLocal ? "http://localhost:5000" : "";

export function getResultsByCity(city) {
  let cityValue = city && city.trim() ? city : 'Hyderabad';
  const url = `${apiBase}/api/weather?city=${encodeURIComponent(cityValue)}`;
  console.log('[getResultsByCity] Fetching:', url);
  return fetch(url)
    .then((response) => {
      console.log('[getResultsByCity] Response status:', response.status);
      console.log('[getResultsByCity] Response ok:', response.ok);
      
      if (!response.ok) {
        // Create enhanced error with status code and potential error details
        return response.json().then(errorData => {
          const enhancedError = new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
          enhancedError.status = response.status;
          enhancedError.errorData = errorData;
          enhancedError.type = 'api_error';
          throw enhancedError;
        }).catch(() => {
          // If JSON parsing fails, create basic error
          const basicError = new Error(`HTTP ${response.status}: Server error`);
          basicError.status = response.status;
          basicError.type = 'api_error';
          throw basicError;
        });
      }
      return response.json();
    }).catch((err) => {
      console.error('[getResultsByCity] Fetch error:', err);
      
      // Enhance error with type information if not already present
      if (!err.type) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          err.type = 'network_error';
        } else if (err.message.includes('CORS')) {
          err.type = 'cors_error';
        } else {
          err.type = 'fetch_error';
        }
      }
      
      throw err;
    });
}

export function getResultsByCoords(lat, lon) {
  const url = `${apiBase}/api/weather-coords?lat=${lat}&lon=${lon}`;
  console.log('[getResultsByCoords] Fetching:', url);
  return fetch(url)
    .then((response) => {
      console.log('[getResultsByCoords] Response status:', response.status);
      console.log('[getResultsByCoords] Response ok:', response.ok);
      
      if (!response.ok) {
        // Create enhanced error with status code and potential error details
        return response.json().then(errorData => {
          const enhancedError = new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
          enhancedError.status = response.status;
          enhancedError.errorData = errorData;
          enhancedError.type = 'api_error';
          throw enhancedError;
        }).catch(() => {
          // If JSON parsing fails, create basic error
          const basicError = new Error(`HTTP ${response.status}: Server error`);
          basicError.status = response.status;
          basicError.type = 'api_error';
          throw basicError;
        });
      }
      return response.json();
    }).catch((err) => {
      console.error('[getResultsByCoords] Fetch error:', err);
      
      // Enhance error with type information if not already present
      if (!err.type) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          err.type = 'network_error';
        } else if (err.message.includes('CORS')) {
          err.type = 'cors_error';
        } else {
          err.type = 'fetch_error';
        }
      }
      
      throw err;
    });
}
