const api = {
  // NOTE: For production, never expose your API key in frontend code!
  key: "Yzg4MmI3MmNlNmQ2NGVhOWE0ODEyMTAxMTIxMDcwMw==", // base64 encoded
  base: "https://api.weatherapi.com/v1/current.json?",
};

window.onload = currentLocation; // Assign function reference, not invocation

const temperature = document.querySelector('.temperature-reading');
const metric = document.querySelector('.temperature-degree');
const hi_low = document.querySelector('.temperature-real-feel');
let temp_c = 36,
    temp_f = 97,
    hi_low_c = 27,
    hi_low_f = 88;
let locDate;

const searchbox = document.querySelector('.search-box');
searchbox.addEventListener('keypress', setQuery);

function currentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, geoError);
  } else {
    // Fallback: use default city if geolocation is not available
    getResultsByCity('Hyderabad');
  }
}

function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  getResultsByCoords(lat, lon);
}

function geoError(error) {
  console.error('Geolocation error:', error);
  // Fallback to default city
  getResultsByCity('Hyderabad');
}

function setQuery(event) {
  if (event.keyCode === 13) {
    getResultsByCity(searchbox.value);
  }
}

function getResultsByCoords(lat, lon) {
  fetch(`${api.base}key=${atob(api.key)}&q=${lat},${lon}&aqi=yes`)
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(displayResults)
    .catch(err => {
      console.error('Weather fetch error:', err);
      // Optionally show error to user
    });
}

function getResultsByCity(city) {
  let cityValue = city && city.trim() ? city : 'Hyderabad';
  fetch(`${api.base}key=${atob(api.key)}&q=${cityValue}&aqi=yes`)
    .then((response) => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(displayResults)
    .catch(err => {
      console.error('Weather fetch error:', err);
      // Optionally show error to user
    });
}


function displayResults(weather) {
  console.log(weather);
  let city = document.querySelector(`.location .city`);
  let country = document.querySelector(`.location .country`);
  city.innerHTML = `${weather.location.name}`;
  country.innerHTML = `${weather.location.country}`;

  const times_of_day = {
    early_morning: {
      name: "Early Morning",
      value: "background-image: linear-gradient(to bottom, #D38312, #A83279);",
    },
    dawn: {
      name: "Dawn",
      value: "background-image: linear-gradient(to bottom, #ff4b1f, #1fddff);",
    },
    morning: {
      name: "Morning",
      value: "background-image: linear-gradient(to bottom, #E5E5BE, #003973);",
    },
    late_morning: {
      name: "Late Morning",
      value: "background-image: linear-gradient(to bottom, #00d2ff, #928DAB);",
    },
    afternoon: {
      name: "Afternoon",
      value: "background-image: linear-gradient(to bottom, #c0c0aa, #1cefff);",
    },
    late_afternoon: {
      name: "Late Afternoon",
      value: "background-image: linear-gradient(to bottom, #2196f3, #f44336);",
    },
    early_evening: {
      name: "Early Evening",
      value:
        "background-image: linear-gradient(to bottom, #833ab4, #fd1d1d, #fcb045);",
    },
    evening: {
      name: "Evening",
      value: "background-image: linear-gradient(to bottom, #434343, #000000);",
    },
    dusk: {
      name: "Dusk",
      value: "background-image: linear-gradient(to bottom, #BA8B02, #181818);",
    },
    night: {
      name: "Night",
      value: "background-image: linear-gradient(to bottom, #9a8478, #1e130c);",
    },
    midnight: {
      name: "Midnight",
      value: "background-image: linear-gradient(to bottom, #414345, #232526);",
    },
    middle_of_the_night: {
      name: "Middle of the Night",
      value: "background-image: linear-gradient(to bottom, #190A05, #870000);",
    },
    default: {
      name: "",
      value: "background-image: linear-gradient(to bottom, #4286f4, #373B44);",
    },
  };

  let now = new Date();
  let date = document.querySelector(`.loc-date .date`);

  date.innerHTML = dateBuilder(now);

  let time = `${weather.location.localtime}`;
  //console.log(time);
  let spaceIndex = time.indexOf(" ");
  let colonIndex = time.indexOf(":");
  var hour = time.slice(spaceIndex, colonIndex);

  if (time.slice(spaceIndex, colonIndex) < 12)
    document.querySelector(`.time`).textContent =
      time.slice(spaceIndex) + ` AM`;
  else
    document.querySelector(`.time`).textContent =
      time.slice(spaceIndex) + ` PM`;

  //var hour = locDate.getHours();
  //console.log(hour);
  switch (true) {
    case hour >= 1 && hour <= 2:
      document.getElementById(`main-block`).style =
        times_of_day.middle_of_the_night.value;
      document.querySelector(`.part-of-day`).textContent =
        times_of_day.middle_of_the_night.name;
      console.log(hour);
      break;
    case hour > 2 && hour <= 5:
      document.getElementById(`main-block`).style =
        times_of_day.early_morning.value;
      document.querySelector(`.part-of-day`).textContent =
        times_of_day.early_morning.name;
      console.log(hour);
      break;
    case hour > 5 && hour <= 6:
      document.getElementById(`main-block`).style = times_of_day.dawn.value;
      document.querySelector(`.part-of-day`).textContent =
        times_of_day.dawn.name;
      console.log(hour);
      break;
    case hour > 6 && hour <= 9:
      document.getElementById(`main-block`).style = times_of_day.morning.value;
      document.querySelector(`.part-of-day`).textContent =
        times_of_day.morning.name;
      console.log(hour);
      break;
    case hour > 9 && hour <= 12:
      document.getElementById(`main-block`).style =
        times_of_day.late_morning.value;
      document.querySelector(`.part-of-day`).textContent =
        times_of_day.late_morning.name;
      console.log(hour);
      break;
    case hour > 12 && hour <= 16:
      document.getElementById(`main-block`).style =
        times_of_day.afternoon.value;
      document.querySelector(`.part-of-day`).textContent =
        times_of_day.afternoon.name;
      console.log(hour);
      break;
    case hour > 16 && hour <= 17:
      document.getElementById(`main-block`).style =
        times_of_day.late_afternoon.value;
      document.querySelector(`.part-of-day`).textContent =
        times_of_day.late_afternoon.name;
      console.log(hour);
      break;
    case hour > 17 && hour <= 18:
      document.getElementById(`main-block`).style =
        times_of_day.early_evening.value;
      document.querySelector(`.part-of-day`).textContent =
        times_of_day.early_evening.name;
      console.log(hour);
      break;
    case hour > 18 && hour <= 19:
      document.getElementById(`main-block`).style = times_of_day.dusk.value;
      document.querySelector(`.part-of-day`).textContent =
        times_of_day.dusk.name;
      console.log(hour);
      break;
    case hour > 19 && hour <= 21:
      document.getElementById(`main-block`).style = times_of_day.evening.value;
      document.querySelector(`.part-of-day`).textContent =
        times_of_day.evening.name;
      console.log(hour);
      break;
    case hour > 21 :
      document.getElementById(`main-block`).style =
        times_of_day.night.value;
      document.querySelector(`.part-of-day`).textContent =
        times_of_day.night.name;
      console.log(hour);
      break;   
    default:
      document.getElementById(`main-block`).style = times_of_day.default.value;
      document.querySelector(`.part-of-day`).textContent =
        times_of_day.default.name;
      console.log(hour);
      break;
  }

  temperature.innerHTML = `${Math.round(weather.current.temp_c)}°`;
  temp_c = `${Math.round(weather.current.temp_c)}`;
  temp_f = `${Math.round(weather.current.temp_f)}`;

  let weather_condition = document.querySelector(`.weather-description`);
  weather_condition.innerHTML = `${weather.current.condition.text}`;

  hi_low.innerHTML = `Feels like ${Math.round(weather.current.feelslike_c)}°C`;
  hi_low_c = `${Math.round(weather.current.feelslike_c)}`;
  hi_low_f = `${Math.round(weather.current.feelslike_f)}`;

  let loc = `${weather.current.condition.icon}`;
  $(".weather-icon").attr("src", `../assets/${loc.slice(20)}`);

  let humidity = document.querySelector(`.humidity-value`);
  humidity.innerHTML = `${weather.current.humidity}%`;

  let wind = document.querySelector(`.wind-value`);
  wind.innerHTML = `${weather.current.wind_kph} kph`;

  let pressure = document.querySelector(`.pressure-value`);
  pressure.innerHTML = `${weather.current.pressure_mb} mb`;
}

function getMetric(m) {
  if (m == "C") {
    //console.log(`Feels like ${hi_low_f}`)
    metric.value = "F";
    metric.innerHTML = "F";
    temperature.textContent = `${temp_f}°`;
    hi_low.textContent = `Feels like ${hi_low_f}°F`;
  } else {
    //console.log(`Feels like f${hi_low_c}`)
    metric.value = "C";
    metric.innerHTML = "C";
    temperature.textContent = `${temp_c}°`;
    hi_low.textContent = `Feels like ${hi_low_c}°C`;
  }
}
function dateBuilder(d) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const day = days[d.getDay()];
  const date = String(d.getDate()).padStart(2, '0'); // Pad with leading zero
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${date} ${month} ${year}`;
}
