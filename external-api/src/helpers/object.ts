/**
 * Checks if an object is empty.
 *
 * @param {object} input - The input object.
 * @returns {boolean} - Returns true if the object is empty, otherwise returns false.
 */
export const objectIsEmpty = (input: object): boolean => {
  if (input?.constructor?.name !== 'Object') {
    return true;
  }

  return Object.keys(input).length === 0;
};
