const formatBooleanAsString = (bool) => {
  if (typeof bool === 'boolean') {
    return bool ? 'Yes' : 'No';
  }
  return '-';
};

module.exports = formatBooleanAsString;
