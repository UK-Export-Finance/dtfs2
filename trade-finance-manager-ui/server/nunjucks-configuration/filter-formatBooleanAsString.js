const formatBooleanAsString = (boolean) => {
  if (boolean) {
    return 'Yes';
  }

  if (boolean === false) {
    return 'No';
  }

  return '-';
};

module.exports = formatBooleanAsString;
