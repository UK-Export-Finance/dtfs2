/**
 * Replaces new line characters with <br> tags.
 *
 * This is useful when wanting to display text that may contain linebreaks
 * in HTML.
 *
 * @param str The string to replace new line characters in.
 * @returns The string with new line characters replaced with <br> tags.
 */
export const replaceNewLinesWithBrTags = (str: string) => str.replaceAll('\n', '<br>');
