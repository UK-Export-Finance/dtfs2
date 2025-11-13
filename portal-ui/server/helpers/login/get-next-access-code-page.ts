import { ATTEMPTS_LEFT, ACCESS_CODE, AccessCode, AttemptsLeft } from '@ukef/dtfs2-common';

/**
 * Gets the next access code page.
 * @param currentPage - the current access code page
 * @returns the next access code page details
 */
export const getNextAccessCodePage = (currentPage: AccessCode): { attemptsLeft?: AttemptsLeft; requestNewCodeUrl?: string; error?: boolean } => {
  switch (currentPage) {
    case ACCESS_CODE.CHECK_YOUR_EMAIL:
      return {
        requestNewCodeUrl: `/login/access-code/${ACCESS_CODE.CHECK_YOUR_EMAIL}`,
        attemptsLeft: ATTEMPTS_LEFT.THREE,
      };
    case ACCESS_CODE.NEW_ACCESS_CODE:
      return {
        requestNewCodeUrl: `/login/access-code/${ACCESS_CODE.NEW_ACCESS_CODE}`,
        attemptsLeft: ATTEMPTS_LEFT.TWO,
      };
    case ACCESS_CODE.ANOTHER_ACCESS_CODE:
      return {
        requestNewCodeUrl: `/login/access-code/${ACCESS_CODE.ANOTHER_ACCESS_CODE}`,
        attemptsLeft: ATTEMPTS_LEFT.ONE,
      };
    case ACCESS_CODE.SUSPENDED_ACCOUNT:
      return {
        requestNewCodeUrl: `/login/access-code/${ACCESS_CODE.SUSPENDED_ACCOUNT}`,
        attemptsLeft: ATTEMPTS_LEFT.ZERO,
      };
    default:
      return { error: true };
  }
};
