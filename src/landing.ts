// landing.ts — entry point for index.html

const GRADIENTS: string[] = [
  'linear-gradient(to bottom, #000428, #004e92)',  // 0  midnight
  'linear-gradient(to bottom, #000000, #434343)',  // 1  middle of night
  'linear-gradient(to bottom, #000000, #434343)',  // 2
  'linear-gradient(to bottom, #232526, #414345)',  // 3  early morning
  'linear-gradient(to bottom, #232526, #414345)',  // 4
  'linear-gradient(to bottom, #232526, #414345)',  // 5
  'linear-gradient(to bottom, #f7971e, #ffd200)',  // 6  dawn
  'linear-gradient(to bottom, #a1c4fd, #c2e9fb)',  // 7  morning
  'linear-gradient(to bottom, #a1c4fd, #c2e9fb)',  // 8
  'linear-gradient(to bottom, #a1c4fd, #c2e9fb)',  // 9
  'linear-gradient(to bottom, #fceabb, #f8b500)',  // 10 late morning
  'linear-gradient(to bottom, #fceabb, #f8b500)',  // 11
  'linear-gradient(to bottom, #fceabb, #f8b500)',  // 12
  'linear-gradient(to bottom, #00c6fb, #005bea)',  // 13 afternoon
  'linear-gradient(to bottom, #00c6fb, #005bea)',  // 14
  'linear-gradient(to bottom, #00c6fb, #005bea)',  // 15
  'linear-gradient(to bottom, #00c6fb, #005bea)',  // 16
  'linear-gradient(to bottom, #f7971e, #ffd200)',  // 17 late afternoon
  'linear-gradient(to bottom, #f857a6, #ff5858)',  // 18 early evening
  'linear-gradient(to bottom, #232526, #414345)',  // 19 dusk
  'linear-gradient(to bottom, #667db6, #0082c8)',  // 20 evening
  'linear-gradient(to bottom, #667db6, #0082c8)',  // 21
  'linear-gradient(to bottom, #141e30, #243b55)',  // 22 night
  'linear-gradient(to bottom, #141e30, #243b55)',  // 23
];

document.body.style.backgroundImage = GRADIENTS[new Date().getHours()] ?? GRADIENTS[0];
