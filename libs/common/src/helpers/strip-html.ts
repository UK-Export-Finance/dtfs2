import { REGEX } from '@ukef/constants/regex';

/**
 * Removes all HTML tags from a given string.
 *
 * @param string - The input string that may contain HTML tags.
 * @param replace - The replace string, defaults to ''.
 * @returns A new string with all HTML tags stripped out.
 */
export const stripHtml = (string: string, replace: string = ''): string => string.replace(REGEX.HTML_TAG_REGEX, replace);
