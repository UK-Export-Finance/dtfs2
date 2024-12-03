const formatAsCurrency = (str) => {
  const isEmpty = !(str && str.trim().length > 0);
  let amount = 0;
  if (!isEmpty) {
    amount = parseFloat(str, 10);
    amount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
  return isEmpty ? '-' : amount;
};

module.exports = formatAsCurrency;
