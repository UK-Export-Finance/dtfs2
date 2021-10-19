const setEmptyIfNull = (value) => {
  if (value === null) return '';
  return value;
};

module.exports = setEmptyIfNull;
