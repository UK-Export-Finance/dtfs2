/**
 * Formats the input by converting Markdown-style links `[text](url)` to GovUK-compliant hyperlinks.
 * - If the input is a string, replaces all Markdown links with `<a>` tags.
 * - If the input is an array, recursively formats each element.
 * - If the input is an object, recursively formats each property value.
 * - Returns the input unchanged if it is empty (empty string, empty array, or empty object).
 *
 * @param input - The value to format. Can be a string, array, or object.
 * @returns The formatted value, with Markdown links converted to GovUK hyperlinks.
 */
export const format = (input: string | object): string | object => {
  const isString = typeof input === 'string';
  const isObject = typeof input === 'object' && input !== null;
  const isArray = Array.isArray(input);

  const isStringEmpty = isString && !input?.length;
  const isObjectEmpty = isObject && !Object.entries(input)?.length;
  const isArrayEmpty = isArray && !input?.length;

  const isEmpty = isStringEmpty || isObjectEmpty || isArrayEmpty;

  if (isEmpty) {
    return input;
  }

  /**
   * 1. URL Pattern
   * convert all [text](link) markdown pattern to
   * GovUK compliant hyperlink
   */
  const urlPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

  if (isString) {
    return input.replace(urlPattern, "<a href='$2' class='govuk-link'>$1</a>");
  }

  if (isArray) {
    return input.map((value: string | object) => format(value));
  }

  if (isObject) {
    const formatted: Record<string, string | object> = {
      ...input,
    };

    for (const key in formatted) {
      if (Object.prototype.hasOwnProperty.call(formatted, key)) {
        formatted[key] = format(formatted[key] as string | object);
      }
    }

    return formatted;
  }

  return input;
};
