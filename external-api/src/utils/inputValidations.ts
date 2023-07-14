import { regexes } from 'src/constants/regex.constants';
import validator from 'validator';

export const isValidInput = (regex: RegExp, input: string): Boolean => regex.test(input);

export const isValidCurrency = (currencyCode: string): Boolean => (currencyCode ? validator.isISO4217(currencyCode) : false);

export const isValidPostcode = (postcode: string): Boolean => isValidInput(regexes.POSTCODE, postcode);

export const isValidCompaniesHouseNumber = (companiesHouseNumber: number): Boolean => isValidInput(regexes.COMPANIES_HOUSE_NUMBER, companiesHouseNumber.toString());

export const isValidIndustryId = (industryId: string): Boolean => isValidInput(regexes.INDUSTRY_ID, industryId);

export const isValidPartyDbCompaniesNumber = (companyNumber: string): Boolean => isValidInput(regexes.COMPANIES_HOUSE_NUMBER, companyNumber);

export const isValidDate = (date: string): Boolean => (date ? validator.isDate(date, { format: 'YYYY-MM-DD' }) : false);

export const isValidPartyUrn = (partyUrn: string): Boolean => isValidInput(regexes.PARTY_URN, partyUrn);
