import { ACCESS_CODE_PAGES } from '@ukef/dtfs2-common';
import { LANDING_PAGES } from '../constants/landing-pages';

/**
 * Gets the next access code page.
 * @param attemptsLeft - the attemptsLeft
 * @returns the next access code page details
 */
export const getNextAccessCodePage = (attemptsLeft: number): { nextAccessCodePage: string } => {
  switch (attemptsLeft) {
    case 2:
      return {
        nextAccessCodePage: `/login/${ACCESS_CODE_PAGES.CHECK_YOUR_EMAIL}`,
      };
    case 1:
      return {
        nextAccessCodePage: `/login/${ACCESS_CODE_PAGES.NEW_ACCESS_CODE}`,
      };
    case 0:
      return {
        nextAccessCodePage: `/login/${ACCESS_CODE_PAGES.ANOTHER_ACCESS_CODE}`,
      };
    case -1:
      return {
        nextAccessCodePage: `/login/${ACCESS_CODE_PAGES.SUSPENDED_ACCOUNT}`,
      };
    default:
      return { nextAccessCodePage: LANDING_PAGES.LOGIN };
  }
};
