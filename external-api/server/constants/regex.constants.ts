/* eslint-disable no-useless-escape */
export const REGEX = {
  POSTCODE: /^[A-Za-z]{1,2}[0-9Rr][0-9A-Za-z]?[0-9][ABD-HJLNP-UW-Zabd-hjlnp-uw-z]{2}$/,
  COMPANIES_HOUSE_NUMBER_REGEX: /^(([A-Z]{2}|[A-Z]\d{1}|\d{2})(\d{5,6}|\d{4,5}[A-Z]))$/,
  INDUSTRY_ID: /^\d{5}$/,
  PARTY_URN: /^\d{8}$/,
  EXPORTER_NAME: /^[^\"*<>?/\\\\|]+$/,
  SITE_NAME: /^[^,&!@~#$%*:;()+./\\[\]\-]+$/,
};
