import validator from 'validator';
import { REGEX } from '../constants/regex.constants';

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
export const isValidPostcode = (postcode: string): boolean => isValidInput(REGEX.POSTCODE, postcode);

/**
  Validates if a value is a valid industry id using a predefined regex

 * @param industryId - the value to validate
 * @returns Boolean - true if valid, false if not
 */
export const isValidIndustryId = (industryId: string): boolean => isValidInput(REGEX.INDUSTRY_ID, industryId);

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
export const isValidPartyUrn = (partyUrn: string): boolean => isValidInput(REGEX.PARTY_URN, partyUrn);

/**
  Validates if a value is a valid exporter name using a predefined regex

 * @param exporterName - the value to validate as a number
 * @returns Boolean - true if valid, false if not
 */
export const isValidExporterName = (exporterName: string): boolean => isValidInput(REGEX.EXPORTER_NAME, exporterName);

/**
  Validates if a value is a valid exporter name using a predefined regex

 * @param siteName - the value to validate as a number
 * @returns Boolean - true if valid, false if not
 */
export const isValidSiteId = (siteName: string): boolean => isValidInput(REGEX.SITE_NAME, siteName);
