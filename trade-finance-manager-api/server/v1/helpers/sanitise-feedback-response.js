const sanitizeHtml = require('sanitize-html');

/**
 * Recursively sanitises a value, which can be a string, array, or object.
 * If the value is a string, it will be sanitised using the sanitize-html library.
 * If the value is an array, each element will be sanitised.
 * If the value is an object, each property value will be sanitised.
 * Non-string primitives (numbers, booleans, null, undefined) will be returned unchanged.
 * @param {unknown} value - The value to sanitise.
 * @returns {unknown} - The sanitised value.
 */
const sanitiseValue = (value) => {
  if (typeof value === 'string') {
    return sanitizeHtml(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitiseValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, sanitiseValue(nestedValue)]));
  }

  return value;
};

/**
 * Sanitises a feedback response object by recursively sanitising all values.
 * @param {Object} body - The feedback response object to sanitise.
 * @returns {Object} - The sanitised feedback response object.
 */
const sanitiseFeedbackResponse = (body) => {
  const obj = {};

  for (const [key, value] of Object.entries(body)) {
    obj[key] = sanitiseValue(value);
  }

  return obj;
};

module.exports = {
  sanitiseFeedbackResponse,
  sanitiseValue,
};
