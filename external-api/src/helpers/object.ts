/**
 * Checks if an object is empty or not.
 *
 * @param obj - The object to be checked for emptiness.
 * @returns Returns `true` if the object is empty, otherwise returns `false`.
 *
 * @example
 * const obj1 = {}; // empty object
 * const obj2 = { name: 'John', age: 30 }; // non-empty object
 *
 * console.log(objectIsEmpty(obj1)); // true
 * console.log(objectIsEmpty(obj2)); // false
 */
export const objectIsEmpty = (obj: any): boolean => {
  if (!obj) {
    return true;
  }

  if (Object.keys(obj).length === 0 && obj.constructor === Object) {
    return true;
  }

  return false;
};
