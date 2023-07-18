import { regexes } from '../constants/regex.constants';
import validator from 'validator';

/**
  Helper function to validate a given value against a given regex

 * @param regex - the regex to validate against
 * @param value - the value to validate
 * @returns Boolean - true if valid, false if not
 */
export const isValidInput = (regex: RegExp, input: string): boolean => regex.test(input);

/**
  Validates if a value is a valid ISO 4217 currency code

 * @param currencyCode - the value to validate
 * @returns Boolean - true if valid, false if not
 */
export const isValidCurrency = (currencyCode: string): boolean => (currencyCode ? validator.isISO4217(currencyCode) : false);

/**
  Validates if a value is a valid postcode using a predefined regex

 * @param postcode - the value to validate
 * @returns Boolean - true if valid, false if not
 */
export const isValidPostcode = (postcode: string): boolean => isValidInput(regexes.POSTCODE, postcode);

/**
  Validates if a value is a valid companies house number using a predefined regex

 * @param companiesHouseNumber - the value to validate as a number
 * @returns Boolean - true if valid, false if not
 */
export const isValidCompaniesHouseNumber = (companiesHouseNumber: string): boolean =>
  isValidInput(regexes.COMPANIES_HOUSE_NUMBER, companiesHouseNumber.toString());

/**
  Validates if a value is a valid industry id using a predefined regex

 * @param industryId - the value to validate
 * @returns Boolean - true if valid, false if not
 */
export const isValidIndustryId = (industryId: string): boolean => isValidInput(regexes.INDUSTRY_ID, industryId);

/**
  Validates if a value is a valid date of the form 'YYYY-MM-DD'

 * @param date - the value to validate as a number
 * @returns Boolean - true if valid, false if not
 */
export const isValidDate = (date: string): boolean => (date ? validator.isDate(date, { format: 'YYYY-MM-DD' }) : false);

/**
  Validates if a value is a valid party urn using a predefined regex

 * @param partyUrn - the value to validate as a number
 * @returns Boolean - true if valid, false if not
 */
export const isValidPartyUrn = (partyUrn: string): boolean => isValidInput(regexes.PARTY_URN, partyUrn);
