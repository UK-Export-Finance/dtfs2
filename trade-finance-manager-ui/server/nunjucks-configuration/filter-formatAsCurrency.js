const formatAsCurrency = (str) => {
  const currencyString = String(str);
  const isEmpty = !(currencyString && currencyString.trim().length > 0);

  let amount = 0;

  if (!isEmpty) {
    amount = parseFloat(currencyString, 10);
    amount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
  return isEmpty ? '-' : amount;
};

module.exports = formatAsCurrency;
