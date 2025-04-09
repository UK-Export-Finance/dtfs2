/**
 * Removes all HTML tags from a given string.
 *
 * @param string - The input string that may contain HTML tags.
 * @param replace - The replace string, defaults to ''.
 * @returns A new string with all HTML tags stripped out.
 */
export const stripHtml = (string: string, replace: string = ''): string => string.replace(/<[^>]*>/g, replace);
