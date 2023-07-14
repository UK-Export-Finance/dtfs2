import { regexes } from '../constants/regex.constants';
import validator from 'validator';

export const isValidInput = (regex: RegExp, input: string): boolean => regex.test(input);

export const isValidCurrency = (currencyCode: string): boolean => (currencyCode ? validator.isISO4217(currencyCode) : false);

export const isValidPostcode = (postcode: string): boolean => isValidInput(regexes.POSTCODE, postcode);

export const isValidCompaniesHouseNumber = (companiesHouseNumber: number): boolean =>
  isValidInput(regexes.COMPANIES_HOUSE_NUMBER, companiesHouseNumber.toString());

export const isValidIndustryId = (industryId: string): boolean => isValidInput(regexes.INDUSTRY_ID, industryId);

export const isValidPartyDbCompaniesNumber = (companyNumber: string): boolean => isValidInput(regexes.COMPANIES_HOUSE_NUMBER, companyNumber);

export const isValidDate = (date: string): boolean => (date ? validator.isDate(date, { format: 'YYYY-MM-DD' }) : false);

export const isValidPartyUrn = (partyUrn: string): boolean => isValidInput(regexes.PARTY_URN, partyUrn);
