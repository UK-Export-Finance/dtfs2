const isNumeric = (value) =>
  (typeof value === 'number') && value === Number(value) && Number.isFinite(value);

const isInteger = (value) => Number.isInteger(value);

const decimalsCount = (numb) => {
  const decimals = numb.toString().split('.')[1];
  if (decimals) {
    return decimals.length;
  }
  return 0;
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

module.exports = {
  isNumeric,
  isInteger,
  decimalsCount,
  roundNumber,
};
