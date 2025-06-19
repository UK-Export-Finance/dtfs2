export const isNumeric = (value) => {
  if (typeof value === 'number' && value === Number(value) && Number.isFinite(value)) {
    return true;
  }
  return false;
};

export const roundNumber = (value, digits) => {
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
