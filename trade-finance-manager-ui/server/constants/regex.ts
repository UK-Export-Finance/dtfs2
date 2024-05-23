export const REGEX = {
  PARTY_URN: /^\d{8}$/,
  INT: /^-?\d+$/,
  YEAR: /^\d{4}$/,
  BANK_ID: /^\d+$/,
  CURRENCY_NUMBER_WITH_OPTIONAL_THOUSANDS_SEPARATOR_REGEX: /^\d{1,3}(,\d{3})*(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/,
} as const;
