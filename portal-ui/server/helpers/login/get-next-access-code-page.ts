import { ACCESS_CODE } from '@ukef/dtfs2-common';
import { LANDING_PAGES } from '../../constants/landing-pages';

/**
 * Gets the next access code page.
 * @param currentPage - the current access code page
 * @returns the next access code page details
 */
export const getNextAccessCodePage = (attemptsLeft: number): { requestNewCodeUrl: string } => {
  switch (attemptsLeft) {
    case 3:
      return {
        requestNewCodeUrl: `/login/${ACCESS_CODE.CHECK_YOUR_EMAIL}`,
      };
    case 2:
      return {
        requestNewCodeUrl: `/login/${ACCESS_CODE.NEW_ACCESS_CODE}`,
      };
    case 1:
      return {
        requestNewCodeUrl: `/login/${ACCESS_CODE.ANOTHER_ACCESS_CODE}`,
      };
    case 0:
      return {
        requestNewCodeUrl: `/login/${ACCESS_CODE.SUSPENDED_ACCOUNT}`,
      };
    default:
      return { requestNewCodeUrl: LANDING_PAGES.LOGIN };
  }
};
