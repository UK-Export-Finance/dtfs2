import Joi from 'joi';
import validator from 'validator';

export const isValidCurrency = (currencyCode: string) => (currencyCode ? validator.isISO4217(currencyCode) : false);

export const isValidPostcode = (postcode: string) => {};

export const isValidCompaniesHouseNumber = (companiesHouseNumber: string) => {};

export const isValidPartyDbCompaniesNumber = (companyNumber: string) => {};

export const isValidDate = (date: string) => (date ? validator.isDate(date, { format: 'YYYY-MM-DD' }) : false);

export const isValidPartyUrn = (partyUrn: string) => {
  const partyUrnRegex = /^\d{8}$/;

  return partyUrnRegex.test(partyUrn);
};
