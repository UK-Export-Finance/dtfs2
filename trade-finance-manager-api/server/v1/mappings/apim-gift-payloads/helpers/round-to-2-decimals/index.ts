/**
 * Round a numeric value to 2 decimal places.
 * Applies a tiny epsilon before rounding to reduce IEEE-754
 * half-up edge case errors (for example, 1.005).
 * @param {number} value - The value to round.
 * @returns {number} The rounded value.
 */
export const roundTo2Decimals = (value: number): number => {
  const sign = Math.sign(value) || 1;
  const absoluteValue = Math.abs(value);

  return sign * (Math.round((absoluteValue + Number.EPSILON) * 100) / 100);
};
