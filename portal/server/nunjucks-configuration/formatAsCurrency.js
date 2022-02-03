const formatAsCurrency = (value) => {
  if (value) {
    const str = String(value);
    const isEmpty = !str.trim().length > 0;

    let amount = 0;

    if (!isEmpty) {
      amount = parseFloat(str);
      amount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    return amount;
  }

  return null;
};

module.exports = formatAsCurrency;
