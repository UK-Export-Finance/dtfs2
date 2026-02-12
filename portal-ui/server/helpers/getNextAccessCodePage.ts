import { ACCESS_CODE_PAGES } from '@ukef/dtfs2-common';
import { LANDING_PAGES } from '../constants/landing-pages';

/**
 * Gets the next access code page based on the number of attempts left.
 * @param attemptsLeft - The number of access code attempts remaining.
 * @returns The path of the next access code page, or the default login page
 */
export const getNextAccessCodePage = (attemptsLeft: number): string => {
  switch (attemptsLeft) {
    case 2:
      return `/login/${ACCESS_CODE_PAGES.CHECK_YOUR_EMAIL}`;
    case 1:
      return `/login/${ACCESS_CODE_PAGES.NEW_ACCESS_CODE}`;
    case 0:
      return `/login/${ACCESS_CODE_PAGES.ANOTHER_ACCESS_CODE}`;
    case -1:
      return `/login/${ACCESS_CODE_PAGES.SUSPENDED_ACCOUNT}`;
    default:
      return LANDING_PAGES.LOGIN;
  }
};
