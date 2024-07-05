const formatBooleanAsString = (bool) => {
  if (bool) {
    return 'Yes';
  }

  if (bool === false) {
    return 'No';
  }

  return '-';
};

module.exports = formatBooleanAsString;
