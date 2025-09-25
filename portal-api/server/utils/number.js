const { decimalsCount } = require('@ukef/dtfs2-common/frontend');

const isNumeric = (value) => typeof value === 'number' && value === Number(value) && Number.isFinite(value);

const isInteger = (value) => Number.isInteger(value);

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

const sanitizeCurrency = (currency) => {
  const originalValue = currency ? String(currency) : '';

  const sanitizedValue = originalValue.replace(/,(\d{3})/g, '$1');
  const isCurrency = Boolean(Number(sanitizedValue) || sanitizedValue === '0');

  return {
    sanitizedValue: isCurrency ? sanitizedValue : originalValue,
    isCurrency,
    decimalPlaces: decimalsCount(Number(sanitizedValue)) < 3,
  };
};

const formattedNumber = (numb, minimumFractionDigits = 2) => numb.toLocaleString('en', { minimumFractionDigits });

module.exports = {
  isNumeric,
  isInteger,
  stripDecimals,
  roundNumber,
  sanitizeCurrency,
  formattedNumber,
};
