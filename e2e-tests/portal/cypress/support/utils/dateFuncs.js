const padDate = (dayOrMonth) => String(dayOrMonth).padStart(2, 0);

const nowPlusDays = (numberDays) => {
  const date = new Date();
  date.setDate(date.getDate() + numberDays);
  return date;
};

const nowPlusMonths = (numberMonths) => {
  const date = new Date();
  date.setMonth(date.getMonth() + numberMonths);
  return date;
};

const datePlusMonths = (date, numberMonths) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + numberMonths);
  return newDate;
};

module.exports = {
  padDate,
  nowPlusDays,
  nowPlusMonths,
  datePlusMonths,
};
