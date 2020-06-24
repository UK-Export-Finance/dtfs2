const toDecimal = (num, decimalPlaces = 2) => (Number.isInteger(num) ? Number(num).toFixed(decimalPlaces) : num);

module.exports = {
  toDecimal,
};
