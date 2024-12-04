import * as cheerio from 'cheerio';

/**
 * Decodes HTML entities in the provided string.
 * @param input - The string containing HTML entities to decode.
 * @returns The decoded string with HTML entities converted to their
 * corresponding characters, or undefined if input undefined.
 */
export const decodeHtmlEntities = (input?: string): string | undefined => {
  if (!input) {
    return input;
  }

  return cheerio.load(input).text();
};
