const decimalsCount = (numb) => {
  const decimals = numb.toString().split('.')[1];
  if (decimals) {
    return decimals.length;
  }
  return 0;
};

const sanitizeCurrency = (originalValue = '') => {
  const sanitizedValue = originalValue.replace(/,(\d{3})/g, '$1');
  const isCurrency = Boolean(Number(sanitizedValue) || sanitizedValue === '0');

  return {
    sanitizedValue: isCurrency ? sanitizedValue : originalValue,
    isCurrency,
    decimalPlaces: decimalsCount(Number(sanitizedValue)) < 3,
  };
};

module.exports = sanitizeCurrency;
