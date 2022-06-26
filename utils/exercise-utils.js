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