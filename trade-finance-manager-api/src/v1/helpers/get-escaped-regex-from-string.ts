import escapeStringRegexp from 'escape-string-regexp';

/**
 * Get escaped regex from string
 * Returns a regex expression of a string with escaped special characters
 * @param string string to escape
 * @returns regex expression of a string with escaped special characters
 * @example
 * ```
 * getEscapedRegexFromString('test*');
 * //=> /^test\*$/i
 * ```
 */
export const getEscapedRegexFromString = (string: string) => new RegExp(`^${escapeStringRegexp(string)}$`, 'i');
