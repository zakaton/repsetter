export const weightEvents = [
  { name: "none", color: "rgb(255, 191, 102)" },
  { name: "changed clothes", color: "rgb(240, 15, 247)" },
  { name: "ate", color: "rgb(83, 242, 78)" },
  { name: "drank", color: "rgb(73, 242, 234)" },
  { name: "urinated", color: "rgb(252, 255, 59)" },
  { name: "pooped", color: "rgb(117, 86, 0)" },
  { name: "worked out", color: "rgb(255, 81, 69)" },
];

export let weightEventColors = {};
weightEvents.forEach(({ name, color }) => (weightEventColors[name] = color));
