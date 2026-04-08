// app.js (refactored as ES module)
import { getResultsByCity, getResultsByCoords } from './weatherApi.js';
import { displayResults, getMetric } from './ui.js';

// Shared state for temperature values
const tempState = {
  temp_c: 36,
  temp_f: 97,
  hi_low_c: 27,
  hi_low_f: 88
};

// Initialize the app
if (typeof window !== 'undefined') {
  window.onload = function() {
    // Show loading overlay
    showLoading();
    // Start loading weather data immediately
    currentLocation();
  };
}

function showLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('hidden');
  }
}

function hideLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden');
  }
}

if (typeof document !== 'undefined') {
    const searchbox = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-btn');

    if (searchbox) {
        searchbox.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                showLoading();
                getResultsByCity(searchbox.value).then(weather => {
                    displayResults(weather, tempState);
                    hideLoading();
                }).catch(err => {
                    hideLoading();
                    showError(err);
                });
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            if (searchbox) {
                showLoading();
                getResultsByCity(searchbox.value).then(weather => {
                    displayResults(weather, tempState);
                    hideLoading();
                }).catch(err => {
                    hideLoading();
                    showError(err);
                });
            }
        });
    }
}

if (typeof document !== 'undefined') {
    const tempDegree = document.querySelector('.unit-toggle');
    if (tempDegree) {
        tempDegree.addEventListener('click', function() {
            getMetric(this.value, tempState);
        });
    }
}

function currentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, geoError);
  } else {
    // Fallback: use default city if geolocation is not available
    getResultsByCity('Hyderabad').then(weather => {
        displayResults(weather, tempState);
        hideLoading();
    }).catch(err => {
        hideLoading();
        showError(err);
    });
  }
}

function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  getResultsByCoords(lat, lon).then(weather => {
    displayResults(weather, tempState);
    hideLoading();
  }).catch(err => {
    hideLoading();
    showError(err);
  });
}

function geoError(error) {
  console.error('Geolocation error:', error);
  // Fallback to default city
  getResultsByCity('Hyderabad').then(weather => {
    displayResults(weather, tempState);
    hideLoading();
  }).catch(err => {
    hideLoading();
    showError(err);
  });
}

function setQuery(event) {
  if (event.keyCode === 13) {
    const searchbox = document.querySelector('.search-input');
    if (searchbox) {
      showLoading();
      getResultsByCity(searchbox.value).then(weather => {
        displayResults(weather, tempState);
        hideLoading();
      }).catch(err => {
        hideLoading();
        showError(err);
      });
    }
  }
}

function showError(err) {
    // Remove any existing error messages first
    const existingErrors = document.querySelectorAll('.error-overlay');
    existingErrors.forEach(error => error.remove());
    
    // Create error overlay
    const errorOverlay = document.createElement('div');
    errorOverlay.classList.add('error-overlay');
    
    // Create error content container
    const errorContent = document.createElement('div');
    errorContent.classList.add('error-content');
    
    // Enhanced error message handling
    let errorMessage = 'Could not fetch weather data. Please try again later.';
    let errorTitle = 'Weather Error';
    
    if (err) {
        console.log('Error details:', {
            type: err.type,
            status: err.status,
            message: err.message,
            errorData: err.errorData
        });
        
        switch (err.type) {
            case 'api_error':
                errorTitle = 'API Error';
                if (err.status === 404) {
                    errorMessage = 'City not found. Please check the spelling and try again.';
                } else if (err.status === 400) {
                    errorMessage = 'Invalid request. Please check your input and try again.';
                } else if (err.status === 500) {
                    errorMessage = 'Server error. The weather service is temporarily unavailable.';
                } else if (err.status >= 429) {
                    errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
                } else {
                    errorMessage = `API Error (${err.status}): ${err.errorData?.error || 'Unknown server error'}`;
                }
                break;
                
            case 'network_error':
                errorTitle = 'Connection Error';
                errorMessage = 'Unable to connect to the weather service. Please check your internet connection and ensure the backend server is running.';
                break;
                
            case 'cors_error':
                errorTitle = 'CORS Error';
                errorMessage = 'Cross-origin request blocked. Please check server configuration.';
                break;
                
            case 'fetch_error':
                errorTitle = 'Fetch Error';
                errorMessage = 'Failed to fetch weather data. The service might be temporarily unavailable.';
                break;
                
            default:
                if (err.message.includes('Network response was not ok')) {
                    errorTitle = 'Network Error';
                    errorMessage = 'The weather service returned an error. Please try again later.';
                } else if (err.message.includes('Failed to fetch')) {
                    errorTitle = 'Connection Error';
                    errorMessage = 'Unable to connect to weather service. Please check your internet connection.';
                } else {
                    errorTitle = 'Error';
                    errorMessage = err.message || 'An unexpected error occurred while fetching weather data.';
                }
        }
    }
    
    // Create error title
    const errorTitleElement = document.createElement('div');
    errorTitleElement.classList.add('error-title');
    errorTitleElement.textContent = errorTitle;
    
    // Create error message text
    const errorText = document.createElement('div');
    errorText.classList.add('error-message-text');
    errorText.textContent = errorMessage;
    
    // Create error details (for debugging)
    if (err && (err.status || err.type)) {
        const errorDetails = document.createElement('div');
        errorDetails.classList.add('error-details');
        errorDetails.textContent = `Status: ${err.status || 'N/A'} | Type: ${err.type || 'Unknown'}`;
        errorContent.appendChild(errorDetails);
    }
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.classList.add('error-close-button');
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close error message');
    
    // Assemble error content
    errorContent.appendChild(errorTitleElement);
    errorContent.appendChild(errorText);
    errorContent.appendChild(closeButton);
    errorOverlay.appendChild(errorContent);
    
    // Add to document
    document.body.appendChild(errorOverlay);
    
    // Trigger animation
    requestAnimationFrame(() => {
        errorOverlay.classList.add('show');
    });
    
    // Close button functionality
    closeButton.addEventListener('click', () => {
        errorOverlay.remove();
    });
    
    // Click outside to close
    errorOverlay.addEventListener('click', (e) => {
        if (e.target === errorOverlay) {
            errorOverlay.remove();
        }
    });
    
    // Auto-remove after 10 seconds for complex errors
    const timeoutId = setTimeout(() => {
        if (errorOverlay && errorOverlay.parentNode) {
            errorOverlay.remove();
        }
    }, 10000);
    
    // Clear timeout if manually closed
    errorOverlay.addEventListener('click', () => {
        clearTimeout(timeoutId);
    });
    
    console.error('Weather fetch error:', err);
}

