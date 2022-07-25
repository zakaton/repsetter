export const muscleGroups = ["chest", "arms", "legs"];
export const muscles = [
  { name: "pecs", group: "chest" },
  { name: "bicep", group: "arms" },
  { name: "tricep", group: "arms" },
  { name: "forearm", group: "arms" },
  { name: "thighs", group: "legs" },
];
muscles.forEach((muscle, index) => {
  muscle.index = index;
});

export const exerciseFeatures = [
  "reps",
  "weight",
  "speed",
  "level",
  "duration",
];

const kilogramToPoundRatio = 2.2046;
export const kilogramsToPounds = (kilograms) =>
  kilograms * kilogramToPoundRatio;
export const poundsToKilograms = (pounds) => pounds / kilogramToPoundRatio;
