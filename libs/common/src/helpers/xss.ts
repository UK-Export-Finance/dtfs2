import sanitise from 'sanitize-html';
import { RequestInput } from '../types';

/**
 * Recursively sanitizes the provided input to prevent XSS attacks.
 * - If the input is a string, it is sanitized using the provided options (no allowed tags or attributes).
 * - If the input is an array, each element is sanitized.
 * - If the input is an object, each value is sanitized and returned in a new object.
 * - For other types, returns `null`.
 *
 * @param input - The input to sanitize. Can be a string, array, or object.
 * @returns The sanitized input, matching the original input type, or `null` for unsupported types.
 */
export const xssClean = (input: RequestInput): RequestInput => {
  const options = {
    allowedTags: [],
    allowedAttributes: {},
  };

  const isString = typeof input === 'string';

  if (isString) {
    return sanitise(input, options);
  }

  const isArray = Array.isArray(input);

  if (isArray) {
    return input.map((element: string) => xssClean(element));
  }

  const isObject = typeof input === 'object' && input !== null;

  if (isObject) {
    const keys = Object.keys(input);
    const cleaned: Record<string, RequestInput> = {};

    for (const [key, value] of keys) {
      cleaned[String(key)] = xssClean(String(value));
    }

    return cleaned;
  }

  return input;
};
