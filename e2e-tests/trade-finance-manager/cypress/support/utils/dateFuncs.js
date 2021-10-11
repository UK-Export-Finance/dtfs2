const padDate = (dayOrMonth) => String(dayOrMonth).padStart(2, 0);

const formatDate = (date) => {
  const [day, month, year] = [
    padDate(date.getDate()),
    padDate(date.getMonth() + 1),
    date.getFullYear(),
  ];

  return `${day}/${month}/${year}`;
};

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

module.exports = {
  formatDate,
  padDate,
  nowPlusDays,
  nowPlusMonths,
};
