import { UKEF } from '@ukef/constants';
import { REGEX } from '@ukef/constants/regex';

/**
 * Checks if a given email address has a UKEF domain.
 *
 * @param {string} email - The email address to check.
 * @returns {boolean} - Returns true if the email belongs to the UKEF domain, otherwise false.
 */
export const isUkefEmail = (email: string): boolean => {
  const domain = new RegExp(REGEX.UKEF_EMAIL_REGEX_PATTERN(UKEF.DOMAIN));
  const match = email.trim().match(domain);

  return Boolean(match?.length);
};
