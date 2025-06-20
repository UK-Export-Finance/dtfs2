/**
 * Rounds a number to a specified number of digits.
 * @param value value to round
 * @param digits number of digits to round to, defaults to 2 if not provided
 * @returns rounded number
 */
export const roundNumber = (value: number, digits = 2) => {
  let modifiedValue = value;

  modifiedValue *= 10 ** digits;
  modifiedValue = Math.round(modifiedValue);
  modifiedValue /= 10 ** digits;
  return modifiedValue;
};
