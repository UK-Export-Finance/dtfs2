/**
 * Converts a string value to its boolean representation.
 *
 * Returns `false` if the input is empty, `'undefined'`, `'null'`, `'false'`, or `'0'`.
 * Returns `true` for any other non-empty string.
 *
 * @param value - The string to convert to boolean.
 * @returns The boolean representation of the input string.
 */
export const stringToBoolean = (value: string): boolean => {
  const trimmed = value.trim();

  if (!trimmed || trimmed === '' || trimmed === 'undefined' || trimmed === 'null' || trimmed === 'false' || trimmed === '0') {
    return false;
  }

  return true;
};
