/**
 * Determines whether the provided object has any enumerable own properties and is not null.
 *
 * @param input - The object to check for entries.
 * @returns `true` if the object has at least one own property, otherwise `false`.
 */
export const hasEntries = (input: unknown): boolean => {
  if (input && typeof input === 'object' && input !== null) {
    return Boolean(Object.entries(input)?.length);
  }

  return false;
};
