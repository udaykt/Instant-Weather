// ui.js
// Handles all DOM/UI updates

import { dateBuilder } from './utils.js';

export function displayResults(weather, tempState) {
  console.log(weather);
  let city = document.querySelector('.location .city');
  let country = document.querySelector('.location .country');
  city.innerHTML = `${weather.location.name}`;
  country.innerHTML = `${weather.location.country}`;

    // Time-of-day background and label logic
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

  let time = `${weather.location.localtime}`;
  let hour = Number(time.split(" ")[1].split(":")[0]);
  let partOfDay = times_of_day.default;
  if (hour >= 1 && hour <= 2) partOfDay = times_of_day.middle_of_the_night;
  else if (hour > 2 && hour <= 5) partOfDay = times_of_day.early_morning;
  else if (hour > 5 && hour <= 6) partOfDay = times_of_day.dawn;
  else if (hour > 6 && hour <= 9) partOfDay = times_of_day.morning;
  else if (hour > 9 && hour <= 12) partOfDay = times_of_day.late_morning;
  else if (hour > 12 && hour <= 16) partOfDay = times_of_day.afternoon;
  else if (hour > 16 && hour <= 17) partOfDay = times_of_day.late_afternoon;
  else if (hour > 17 && hour <= 18) partOfDay = times_of_day.early_evening;
  else if (hour > 18 && hour <= 19) partOfDay = times_of_day.dusk;
  else if (hour > 19 && hour <= 21) partOfDay = times_of_day.evening;
  else if (hour > 21) partOfDay = times_of_day.night;

  document.getElementById('main-block').style = partOfDay.value;
  document.querySelector('.part-of-day').textContent = partOfDay.name;

  // Update temperature values in shared state
  const temperature = document.querySelector('.temperature-reading');
  const hi_low = document.querySelector('.temperature-real-feel');

  temperature.innerHTML = `${Math.round(weather.current.temp_c)}°`;
  tempState.temp_c = Math.round(weather.current.temp_c);
  tempState.temp_f = Math.round(weather.current.temp_f);
  hi_low.innerHTML = `Feels like ${Math.round(weather.current.feelslike_c)}°C`;
  tempState.hi_low_c = Math.round(weather.current.feelslike_c);
  tempState.hi_low_f = Math.round(weather.current.feelslike_f);
}

export function getMetric(m, tempState) {
  const metric = document.querySelector('.temperature-degree');
  const temperature = document.querySelector('.temperature-reading');
  const hi_low = document.querySelector('.temperature-real-feel');
  if (m === 'C') {
    metric.value = 'F';
    metric.innerHTML = 'F';
    temperature.textContent = `${tempState.temp_f}°`;
    hi_low.textContent = `Feels like ${tempState.hi_low_f}°F`;
  } else {
    metric.value = 'C';
    metric.innerHTML = 'C';
    temperature.textContent = `${tempState.temp_c}°`;
    hi_low.textContent = `Feels like ${tempState.hi_low_c}°C`;
  }
}

export function updateTimeOfDayUI(timeOfDay) {
  document.getElementById('main-block').style = timeOfDay.value;
  document.querySelector('.part-of-day').textContent = timeOfDay.name;
}
