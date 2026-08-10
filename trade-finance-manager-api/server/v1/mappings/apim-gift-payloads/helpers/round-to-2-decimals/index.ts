/**
 * Round a numeric value to 2 decimal places.
 * @param {number} value - The value to round.
 * @returns {number} The rounded value.
 */
export const roundTo2Decimals = (value: number): number => Math.round(value * 100) / 100;
