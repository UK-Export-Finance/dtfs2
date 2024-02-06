import { isString } from '../utils/string';

/**
 * @param value - the value to check
 * @param [context] - provides context in the error message if value is not a string. Usually would be the name of the
 *  variable being passed in
 */
export const asString = (value: unknown, context?: string): string => {
  if (!isString(value)) {
    throw new Error(`Expected ${context ?? 'value'} to be a string, but was ${typeof value}`);
  }

  return value;
};
