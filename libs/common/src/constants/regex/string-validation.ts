/**
 * Matches a whole number or a decimal number with up to 2 decimal places.
 * Used for validating simple currency values without thousand separators.
 *
 * Examples:
 * - `1234` (whole number)
 * - `12.50` (two decimal places)
 * - `0.99` (two decimal places)
 *
 * Does not match:
 * - `12.345` (more than 2 decimal places)
 * - `.99` (doesn't start with a digit)
 * - `12.` (trailing decimal point with no digits)
 */
export const CURRENCY_NUMBER_REGEX = /^\d+(\.\d{1,2})?$/;

/**
 * Matches a whole or decimal number with optional comma-grouped thousands separators.
 * Allows up to 2 decimal places after the optional thousands groups.
 *
 * Examples:
 * - `1234` (no separators)
 * - `1,234` (single thousands separator)
 * - `1,234.56` (separator with decimal places)
 *
 * Does not match:
 * - `12,34` (incorrect thousands grouping)
 * - `1234,` (trailing comma with no digits)
 */
export const MONETARY_VALUE_WITH_OPTIONAL_THOUSANDS_SEPARATORS_REGEX = /^(\d+|\d{1,3}(,\d{3})+)(\.\d{1,2})?$/;

/**
 * Matches a UKEF ID consisting of exactly 10 digits.
 *
 * Examples:
 * - `1234567890` (exactly 10 digits)
 *
 * Does not match:
 * - `123456789` (fewer than 10 digits)
 * - `12345678901` (more than 10 digits)
 */
export const UKEF_ID_REGEX = /^[0-9]{10}$/;

/**
 * Factory function that builds a regex pattern string matching an email address
 * ending with the given domain.
 *
 * Examples:
 * - `UKEF_EMAIL_REGEX_PATTERN('ukexportfinance.gov.uk')` → `@ukexportfinance.gov.uk$`
 *   matches `name@ukexportfinance.gov.uk`
 *
 * Does not match:
 * - `name@other.gov.uk` (different domain)
 *
 * @param domain - The domain to match (e.g., 'ukexportfinance.gov.uk')
 * @returns A regex pattern string for validating emails on the given domain
 */
export const UKEF_EMAIL_REGEX_PATTERN = (domain: string): string => `@${domain}$`;
