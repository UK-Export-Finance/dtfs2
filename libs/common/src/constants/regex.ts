export const CURRENCY_NUMBER_REGEX = /^\d+(\.\d{1,2})?$/;

/**
 * Regular expression for validating currency numbers with optional thousands separators.
 * Matches numbers with optional commas as thousand separators and up to 2 decimal places.
 * Examples: "1234", "1,234", "1,234.56"
 */
export const CURRENCY_NUMBER_WITH_OPTIONAL_THOUSANDS_SEPARATORS_REGEX = /^(\d+|\d{1,3}(,\d{3})+)(\.\d{1,2})?$/;
