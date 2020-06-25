const { sanitizeCurrency } = require('../../../../utils/number');

const santizeCurrencyFormat = (value) => {
  const { isCurrency, sanitizedValue } = sanitizeCurrency(value);
  return isCurrency ? sanitizedValue : value;
};

module.exports = santizeCurrencyFormat;
