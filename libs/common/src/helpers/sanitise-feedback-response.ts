import { AnyObject } from '../types';
import { sanitiseValue } from './sanitise-value';

/**
 * Sanitises a feedback response object by recursively sanitising all values.
 * @param {AnyObject} body - The feedback response object to sanitise.
 * @returns {AnyObject} - The sanitised feedback response object.
 */
export const sanitiseFeedbackResponse = (body: AnyObject): AnyObject => {
  const obj: AnyObject = {};

  for (const [key, value] of Object.entries(body)) {
    obj[key] = sanitiseValue(value);
  }

  return obj;
};
