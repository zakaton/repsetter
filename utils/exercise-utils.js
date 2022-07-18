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

const kilogramToPoundRatio = 2.2046;
export const kilogramsToPounds = (kilograms) =>
  kilograms * kilogramToPoundRatio;
export const poundsToKilograms = (pounds) => pounds / kilogramToPoundRatio;

export const timeToDate = (time) => {
  const [hours, minutes, seconds] = time.split(":");
  console.log("timeToDate", hours, minutes);
  const date = new Date();
  date.setHours(hours, minutes, seconds);
  return date;
};
