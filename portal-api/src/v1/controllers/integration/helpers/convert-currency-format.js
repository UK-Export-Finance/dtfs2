const { sanitizeCurrency } = require('../../../../utils/number');

const santizeCurrencyFormat = (currency) => {
  const value = currency || '';
  const { isCurrency, sanitizedValue } = sanitizeCurrency(value);
  return isCurrency ? sanitizedValue : value;
};

module.exports = santizeCurrencyFormat;
