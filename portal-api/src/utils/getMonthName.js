const getMonthName = (monthNumber) => {
  // date is set to 1st Jan to avoid bug when today's month has more days than target month
  const date = new Date(2023, 1, 1);
  // offset by 1 as January = 1 in Database
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('default', { month: 'long' });
};

module.exports = { getMonthName };
