import * as cheerio from 'cheerio';

/**
 * Decodes HTML entities in the provided string.
 * @param input - The string containing HTML entities to decode.
 * @returns The decoded string with HTML entities converted to their corresponding characters.
 */
export const decodeHtmlEntities = (input?: string): string => {
  if (!input) {
    return '';
  }

  return cheerio.load(input).text();
};
