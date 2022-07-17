export const dateToString = (date) => {
  return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
};

export const stringToDate = (string) => {
  const [year, month, day] = string.split("-");
  console.log("stringToDate", year, month, day);
  const date = new Date();
  date.setUTCFullYear(year);
  date.setUTCMonth(month);
  date.setUTCDate(day);
  console.log(date);
  return date;
};
