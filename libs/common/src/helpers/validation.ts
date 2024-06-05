import { COMPANY_REGISTRATION_NUMBER } from '..';
import { isString } from './string';

/**
 * @param value - the value to check
 * @param context - provides context in the error message if value is not a string. Usually would be the name
 *  of the variable being passed in
 */
export const asString = (value: unknown, context: string): string => {
  if (!isString(value)) {
    throw new Error(`Expected ${context} to be a string, but was ${typeof value}`);
  }

  return value;
};

export const matchesRegex = (regex: RegExp, input: string): boolean => regex.test(input);

export const isValidCompanyRegistrationNumber = (registrationNumber: string): boolean =>
  matchesRegex(COMPANY_REGISTRATION_NUMBER.REGEX, registrationNumber.toString());
