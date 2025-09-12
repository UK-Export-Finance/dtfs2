const setEmptyIfNull = (value) => {
  if (!value) return '';
  return value;
};

module.exports = setEmptyIfNull;
