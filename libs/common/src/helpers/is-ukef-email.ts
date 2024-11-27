import { UKEF } from '../constants';

/**
 * Checks if the given email belongs to the UKEF domain.
 *
 * @param {string} email - The email address to check.
 * @returns {boolean} - Returns true if the email belongs to the UKEF domain, otherwise false.
 */
export const isUkefEmail = (email: string): boolean => {
  const domain = new RegExp(`@${UKEF.DOMAIN}$`);
  const match = email.match(domain);

  return Boolean(match?.length);
};
