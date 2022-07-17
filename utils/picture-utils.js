export const dateToString = (date) => {
  return `${date.getUTCFullYear()}-${date
    .getUTCMonth()
    .toString()
    .padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
};
