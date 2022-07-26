export const muscleGroupsObject = {
  "upper body": [
    "chest",
    "shoulders",
    "traps",
    "front delts",
    "medial delts",
    "rear delts",
    "lats",
    "upper back",
  ],
  arms: ["biceps", "triceps", "forearms"],
  "lower body": ["core", "obliques", "back", "abs"],
  legs: ["quads", "glutes", "hamstrings", "adductors", "abductors", "calves"],
};
export const muscleGroups = Object.keys(muscleGroupsObject);
export const muscles = muscleGroups.reduce((muscles, muscleGroupName) => {
  return muscleGroupsObject[muscleGroupName].reduce(
    (muscles, muscleGroupMuscle) => {
      return muscles.concat({
        name: muscleGroupMuscle,
        group: muscleGroupName,
        index: muscles.length,
      });
    },
    muscles
  );
}, []);

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
