const formatDate = (day, month, year) => {
  const dateStr = `${day}-${month}-${year}`;
  if (/(\d{2}-\d{2}-\d{4})?/.test(dateStr) && Date.parse(`${year}-${month}-${day}`)) {
    return dateStr;
  }
  return '';
};

module.exports = {
  formatDate,
};
