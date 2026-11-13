export const isNumeric = (value) => {
  if (typeof value === 'number' && value === Number(value) && Number.isFinite(value)) {
    return true;
  }

  return false;
};

export const roundNumber = (value, digits) => {
  let modifiedValue = value;
  let modifiedDigits = digits;

  if (!digits) {
    modifiedDigits = 2;
  }

  modifiedValue *= 10 ** modifiedDigits;
  modifiedValue = Math.round(modifiedValue);
  modifiedValue /= 10 ** modifiedDigits;
  return modifiedValue;
};
