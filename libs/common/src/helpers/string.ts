/**
 * Checks if a value is a string.
 *
 * @param value - The value to check.
 * @returns True if the value is a string, otherwise false.
 */
export const isString = (value: unknown): value is string => typeof value === 'string' || value instanceof String;

/**
 * Checks if the given value is null, undefined, or an empty string.
 *
 * @param value - The value to check.
 * @returns `true` if the value is null, undefined, or an empty string; otherwise, `false`.
 */
export const isNullUndefinedOrEmptyString = (value: unknown): boolean => !value || (isString(value) && !value.trim().length);

/**
 * Checks if the given value is a non-empty string.
 *
 * This function first verifies if the value is a string using the `isString` function,
 * and then ensures that the string is neither null, undefined, nor empty using the
 * `isNullUndefinedOrEmptyString` function.
 *
 * @param value - The value to check.
 * @returns True if the value is a non-empty string, otherwise false.
 */
export const isNonEmptyString = (value: unknown): value is string => isString(value) && !isNullUndefinedOrEmptyString(value);

/**
 * Replaces all special characters in a given string with a specified replacement string.
 * Optionally preserves the file extension if specified.
 *
 * @param {string} value - The input string to be sanitized.
 * @param {string} [replace=''] - The string to replace special characters with. Defaults to an empty string.
 * @param {boolean} [fileExtension=false] - Whether to preserve the file extension. Defaults to false.
 * @returns {string} - The sanitized string with special characters replaced.
 */
export const replaceAllSpecialCharacters = (value: string, replace: string = '', fileExtension: boolean = false): string => {
  if (!value) {
    return '';
  }

  let name: string = value;
  let extension: string = '';
  let hasExtension: boolean = false;

  /**
   * This regular expression ensure replace consecutive strings are removed
   * This also applies to leading and trailing replace string characters.
   */
  const noConsecutiveRegEx = new RegExp(`(^${replace}+|${replace}+$)`, 'g');

  // 1. Preserve file extension
  if (fileExtension) {
    const extensionBegining = value.lastIndexOf('.');
    extension = value.substring(extensionBegining);

    // Ensure non null-extension i.e. '.'
    hasExtension = extensionBegining > 0 && extension.length > 1;
    name = hasExtension ? value.substring(0, extensionBegining) : value;
  }

  // 2. Convert accented characters to non-accented characters
  const nonAccentedCharacters = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 3. Removes all special characters
  const noSpecialCharacters = nonAccentedCharacters.replace(/[^a-zA-Z0-9]+/g, replace);

  // 4. Removes and returns all consecutive replacement characters
  const sanitisedName = noSpecialCharacters.replace(noConsecutiveRegEx, '');

  return fileExtension && hasExtension ? `${sanitisedName}${extension}` : sanitisedName;
};

/**
 * Formats a given string to be compatible with SharePoint by replacing special characters
 * and reserved filenames.
 *
 * @param {string} value - The input string to be formatted.
 * @param {string} [replace='_'] - The character to replace special characters with. Defaults to '_'.
 * @param {boolean} [fileExtension=false] - Whether to preserve the file extension. Defaults to false.
 * @returns {string} - The formatted string.
 *
 * @example
 * ```typescript
 * formatForSharePoint('example&file.txt'); // Returns 'exampleandfile.txt'
 * formatForSharePoint('example&file.txt', '-', true); // Returns 'example-and-file.txt'
 * ```
 */
export const formatForSharePoint = (value: string, replace: string = '_', fileExtension: boolean = false): string => {
  if (!value) {
    return '';
  }

  // 1. Replaces '&' with 'and'
  const noAmperstand = value.replace(/&/g, 'and');

  // 2. Remove reserved SharePoint and Windows filenames
  // Reference: https://support.microsoft.com/en-us/office/restrictions-and-limitations-in-onedrive-and-sharepoint-64883a5d-228e-48f5-b3d2-eb39e07630fa
  const noReservedNames = noAmperstand.replace(/(^_vti_.*|\.lock|CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9]|desktop\.ini)/gi, '');

  // 3. Replace special characters with replacement vaue and trim excess characters.
  return replaceAllSpecialCharacters(noReservedNames, replace, fileExtension);
};
