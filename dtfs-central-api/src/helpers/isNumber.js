/**
 * Validates whether the given value is a number or not with the provided number of digits.
 * @param {Integer} value - The value to test for being a number.
 * @param {Integer} digits - The number of digits to test for. Defaults to `1`.
 * @returns {boolean} - `true` if the `value` is a number with the specified number of digits
 * or if `digits` is not provided and the `value` is a number.
 * `false` if the `value` is not a number or if `digits` is provided and the `value` is not a number with the specified number of digits.
 */
const isNumber = (value, digits = 1) => {
  if (value) {
    const regex = new RegExp(`^[0-9]{${digits}}$`);
    return regex.test(value);
  }

  return false;
};

module.exports = isNumber;
