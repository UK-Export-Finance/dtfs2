/**
 * Rounds a number to a specified number of digits.
 * @param value value to round
 * @param digits number of digits to round to, defaults to 2 if not provided
 * @returns rounded number
 */
export const roundNumber = (value: number, digits?: number) => {
  let modifiedValue = value;
  let d;

  if (!digits) {
    d = 2;
  } else {
    d = digits;
  }

  modifiedValue *= 10 ** d;
  modifiedValue = Math.round(modifiedValue);
  modifiedValue /= 10 ** d;
  return modifiedValue;
};
