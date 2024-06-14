/**
 * Validates whether the given value is a number or not with the provided number of digits.
 * This function does not validate decimal numbers.
 * @param value - The value to test for being a number.
 * @param [digits] - The number of digits to test for. Defaults to `1`.
 * @returns `true` if the `value` is a number with the specified number of digits
 * or if `digits` is not provided and the `value` is a number.
 * `false` if the `value` is not a number or if `digits` is provided and the `value` is not a number with the specified number of digits.
 */
export const isNumber = (value: unknown, digits = 1): boolean => {
  const valueIsStringOrNumber = typeof value === 'string' || typeof value === 'number';
  if (valueIsStringOrNumber) {
    const regex = new RegExp(`^[0-9]{${digits}}$`);
    return regex.test(value.toString());
  }
  return false;
};
