export const CURRENCY = {
  GBP: 'GBP',
  EUR: 'EUR',
  USD: 'USD',
  JPY: 'JPY',
  AED: 'AED',
  AED_TEXT: 'AED - U.A.E. Dirham',
} as const;

/**
 * Regular expression group to match valid currency codes.
 * This regex captures any of the currency codes defined in the CURRENCY enum.
 * Example matches: "GBP", "USD", etc.
 */
export const CURRENCY_REGEX_GROUP = `(?<currency>${Object.values(CURRENCY).join('|')})`;
export const CURRENCY_REGEX = new RegExp(CURRENCY_REGEX_GROUP);
