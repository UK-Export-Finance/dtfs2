const isNumeric = (value) =>
  (typeof value === 'number') && value === Number(value) && Number.isFinite(value);

const isInteger = (value) => Number.isInteger(value);

const isDecimalPlaces = (value, decimalPlaces = 2) => Number(value).toFixed(decimalPlaces) === value;

const decimalsCount = (numb) => {
  const decimals = numb.toString().split('.')[1];
  if (decimals) {
    return decimals.length;
  }
  return 0;
};

const stripDecimals = (numb) => {
  const withoutDecimals = numb.toString().split('.')[0];
  return Number(withoutDecimals);
};

const roundNumber = (value, digits) => {
  let modifiedValue = value;
  let d = digits;

  if (!digits) {
    d = 2;
  }

  modifiedValue *= 10 ** d;
  modifiedValue = Math.round(modifiedValue);
  modifiedValue /= 10 ** d;
  return modifiedValue;
};

const sanitizeCurrency = (originalValue = '') => {
  const sanitizedValue = originalValue.replace(/,(\d{3})/g, '$1');

  return {
    originalValue,
    sanitizedValue,
    isCurrency: sanitizedValue !== '' && (isInteger(Number(sanitizedValue)) || isDecimalPlaces(sanitizedValue)),
  };
};

module.exports = {
  isNumeric,
  isInteger,
  isDecimalPlaces,
  decimalsCount,
  stripDecimals,
  roundNumber,
  sanitizeCurrency,
};
