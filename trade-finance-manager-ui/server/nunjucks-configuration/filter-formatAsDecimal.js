const formatAsDecimal = (str) => {
  const isEmpty = !(str && str.trim().length > 0);
  let amount = 0;
  if (!isEmpty) {
    amount = parseFloat(str, 10);
    amount = amount.toFixed(2);
  }
  return isEmpty ? '-' : amount;
};

module.exports = formatAsDecimal;
