// utils.js
// General-purpose helper functions

const dateCache = {};

export function dateBuilder(d) {
  const dateKey = d.toDateString();
  if (dateCache[dateKey]) {
    return dateCache[dateKey];
  }
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const day = days[d.getDay()];
  const date = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const formattedDate = `${day} ${date} ${month} ${year}`;
  dateCache[dateKey] = formattedDate;
  return formattedDate;
}
