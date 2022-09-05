const { decimalsCount } = require('../../v1/helpers/number');

/**
 * formats facility value based on type
 * BSS - string and already formatted with 2 decimal places
 * GEF - number so needs to have 2 decimal places
 */
const facilityValueFormatted = (value) => {
  // BSS is string and formatted so can be returned
  if (typeof value === 'string') {
    return value;
  }
  // checks number of decimal places
  const totalDecimals = decimalsCount(value);
  // if not 2 decimal places, then set 2 decimal places
  const newValue = totalDecimals !== 2 ? value.toFixed(2) : value;

  return newValue;
};

module.exports = facilityValueFormatted;
