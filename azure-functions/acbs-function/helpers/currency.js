const stripCommas = (value) => String(value).replace(/,/g, '');
/**
 * @description Rounds a number to 2 decimal places.
 * Number cooersion is as per the built in Number function,
 * with the exception of removing commas from strings before parsing.
 * @param {unknown} value value to round to 2 decimal places
 * @returns {number} value rounded to 2 decimal places
 * @example
 * to2Decimals(15);
 * // returns 15
 * @example
 * to2Decimals(15.123);
 * // returns 15.12
 * @example
 * to2Decimals('15');
 * // returns 15
 * @example
 * to2Decimals(null);
 * // returns 0
 * @example
 * to2Decimals(undefined);
 * // returns NaN
 */
const to2Decimals = (value) => Number(Number(typeof value === 'string' ? stripCommas(value) : value).toFixed(2));

module.exports = {
  to2Decimals,
  stripCommas,
};
