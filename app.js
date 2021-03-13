const api = {
  key: "Yzg4MmI3MmNlNmQ2NGVhOWE0ODEyMTAxMTIxMDcwMw==",
  base: "https://api.weatherapi.com/v1/current.json?",
};

var temperature = document.querySelector(`.temperature-reading`);
var metric = document.querySelector(`.temperature-degree`);
var hi_low = document.querySelector(`.temperature-real-feel`);
var temp_c = 36,
  temp_f = 97,
  hi_low_c = 27,
  hi_low_f = 88;
var locDate;
const searchbox = document.querySelector(".search-box");
searchbox.addEventListener("keypress", setQuery);

function setQuery(out) {
  if (out.keyCode == 13) {
    getResults(searchbox.value, metric.value);
    //console.log(searchbox.value);
  }
}

function getResults(query, metric) {
  fetch(`${api.base}key=${atob(api.key)}&q=${query}&aqi=yes`)
    .then((weather) => {
      return weather.json();
    })
    .then(displayResults);
}

function displayResults(weather, metric) {
  console.log(weather);
  let city = document.querySelector(`.location .city`);
  let country = document.querySelector(`.location .country`);
  city.innerHTML = `${weather.location.name}`;
  country.innerHTML = `${weather.location.country}`;

  let morning =
    " background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(100, 100, 200, 0.8));";
  let afternoon =
    " background-image: linear-gradient(to bottom, rgba(100, 50, 255, 0.2), rgba(100, 255, 0, 0.8));";
  let evening =
    " background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(200, 100, 0, 0.8));";
  let night =
    " background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8));";

  let now = new Date();
  let date = document.querySelector(`.loc-date .date`);
  //console.log(date.value);
  date.innerHTML = dateBuilder(now);

  let time = `${weather.location.localtime}`;
  console.log(document.getElementById(`.time`));
  if (time.slice(10, 13) < 12)
    document.querySelector(`.time`).textContent = time.slice(10) + ` AM`;
  else document.querySelector(`.time`).textContent = time.slice(10) + ` PM`;
  time = time.replace(" ", "T");
  locDate = new Date(time);
  if (locDate.getHours() > 6 && locDate.getHours() < 12) {
    document.getElementById(`main-block`).style = morning;
  } else if (locDate.getHours() > 12 && locDate.getHours() < 18) {
    document.getElementById(`main-block`).style = afternoon;
  } else if (locDate.getHours() > 18 && locDate.getHours() < 21) {
    document.getElementById(`main-block`).style = evening;
  } else {
    document.getElementById(`main-block`).style = night;
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
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let months = [
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
    "December",
  ];

  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();

  return `${day} ${date} ${month} ${year},`;
}
