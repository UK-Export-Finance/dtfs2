const setEmptyIfNull = (value) => {
  if (value === null || value === undefined) return '';
  return value;
};

module.exports = setEmptyIfNull;
