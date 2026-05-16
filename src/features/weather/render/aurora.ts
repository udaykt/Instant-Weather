// aurora.ts — maps a WeatherAPI condition code to the dynamic aurora hue
// that tints the whole glass theme.

export function conditionToHue(code: number): number {
  if (code === 1000 || code === 1003) return 35;
  if (code === 1006 || code === 1009) return 220;
  if (code === 1030 || code === 1135 || code === 1147) return 210;
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 270;
  if (
    [
      1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249,
      1252, 1255, 1258, 1261, 1264,
    ].includes(code)
  )
    return 195;
  return 200;
}
