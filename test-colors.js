// Test color changing logic
const times_of_day = {
  early_morning: {
    name: "Early Morning",
    value: "background-image: linear-gradient(to bottom, #232526, #414345);",
  },
  dawn: {
    name: "Dawn",
    value: "background-image: linear-gradient(to bottom, #f7971e, #ffd200, #f7971e, #ffd200);",
  },
  morning: {
    name: "Morning",
    value: "background-image: linear-gradient(to bottom, #a1c4fd, #c2e9fb);",
  },
  late_morning: {
    name: "Late Morning",
    value: "background-image: linear-gradient(to bottom, #fceabb, #f8b500);",
  },
  afternoon: {
    name: "Afternoon",
    value: "background-image: linear-gradient(to bottom, #00c6fb, #005bea);",
  },
  late_afternoon: {
    name: "Late Afternoon",
    value: "background-image: linear-gradient(to bottom, #f7971e, #ffd200);",
  },
  early_evening: {
    name: "Early Evening",
    value: "background-image: linear-gradient(to bottom, #f857a6, #ff5858);",
  },
  evening: {
    name: "Evening",
    value: "background-image: linear-gradient(to bottom, #667db6, #0082c8, #0082c8, #667db6);",
  },
  dusk: {
    name: "Dusk",
    value: "background-image: linear-gradient(to bottom, #232526, #414345, #0f2027);",
  },
  night: {
    name: "Night",
    value: "background-image: linear-gradient(to bottom, #141e30, #243b55);",
  },
  midnight: {
    name: "Midnight",
    value: "background-image: linear-gradient(to bottom, #000428, #004e92);",
  },
  middle_of_the_night: {
    name: "Middle of the Night",
    value: "background-image: linear-gradient(to bottom, #000000, #434343);",
  },
  default: {
    name: "",
    value: "background-image: linear-gradient(to bottom, #83a4d4, #b6fbff);",
  },
};

function testColorLogic() {
  const now = new Date();
  let hour = now.getHours();
  let partOfDay = times_of_day.default;
  
  console.log('Current time:', now.toLocaleString());
  console.log('Current hour:', hour);
  
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
  
  console.log('Selected part of day:', partOfDay.name);
  console.log('CSS style:', partOfDay.value);
  
  // Test different hours
  console.log('\n--- Testing different hours ---');
  const testHours = [6, 9, 12, 15, 18, 21, 0];
  testHours.forEach(testHour => {
    let testPartOfDay = times_of_day.default;
    if (testHour >= 1 && testHour <= 2) testPartOfDay = times_of_day.middle_of_the_night;
    else if (testHour > 2 && testHour <= 5) testPartOfDay = times_of_day.early_morning;
    else if (testHour > 5 && testHour <= 6) testPartOfDay = times_of_day.dawn;
    else if (testHour > 6 && testHour <= 9) testPartOfDay = times_of_day.morning;
    else if (testHour > 9 && testHour <= 12) testPartOfDay = times_of_day.late_morning;
    else if (testHour > 12 && testHour <= 16) testPartOfDay = times_of_day.afternoon;
    else if (testHour > 16 && testHour <= 17) testPartOfDay = times_of_day.late_afternoon;
    else if (testHour > 17 && testHour <= 18) testPartOfDay = times_of_day.early_evening;
    else if (testHour > 18 && testHour <= 19) testPartOfDay = times_of_day.dusk;
    else if (testHour > 19 && hour <= 21) testPartOfDay = times_of_day.evening;
    else if (testHour > 21) testPartOfDay = times_of_day.night;
    
    console.log(`${testHour}:00 -> ${testPartOfDay.name}`);
  });
}

testColorLogic();
