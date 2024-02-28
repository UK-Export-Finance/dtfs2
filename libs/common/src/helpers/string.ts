/**
 * Checks whether the provided value is a `string`
 */
export const isString = (value: unknown): value is string => typeof value === 'string' || value instanceof String;

/**
 *  Checks whether the provided value is `null`, `undefined`, or an empty
 *  (0 length, or whitespace only) `string`.
 */
export const isNullUndefinedOrEmptyString = (value: unknown): boolean => !value || (isString(value) && !value.trim().length);

/**
 * Checks whether the provided value is non-empty (non-0 length and
 * non-whitespace only) `string`.
 */
export const isNonEmptyString = (value: unknown): value is string => isString(value) && !isNullUndefinedOrEmptyString(value);
