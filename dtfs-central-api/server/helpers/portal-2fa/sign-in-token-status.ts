import { PortalUser, SIGN_IN_OTP_STATUS } from '@ukef/dtfs2-common';
import { doesUserHaveSignInTokens } from './does-user-have-sign-in-tokens';
import { verifyHash } from './verify-hash';
import { isSignInOtpInDate } from './is-sign-in-otp-in-date';

export const signInTokenStatus = (user: PortalUser, signInCode: string) => {
  const userHasSignInTokens = doesUserHaveSignInTokens(user);

  if (!user?.signInTokens || !userHasSignInTokens) {
    return SIGN_IN_OTP_STATUS.NOT_FOUND;
  }

  const databaseSignInTokens = [...user.signInTokens];
  const signInTokensLength = databaseSignInTokens.length - 1;

  const latestSignInToken = databaseSignInTokens[signInTokensLength];

  if (!latestSignInToken?.hashHex || !latestSignInToken?.saltHex || !latestSignInToken?.expiry) {
    return SIGN_IN_OTP_STATUS.NOT_FOUND;
  }

  const isOtpCorrect = verifyHash(signInCode, latestSignInToken.saltHex, latestSignInToken.hashHex);

  if (!isOtpCorrect) {
    return SIGN_IN_OTP_STATUS.INVALID;
  }

  const signInTokenInDate = isSignInOtpInDate(latestSignInToken.expiry);

  if (!signInTokenInDate) {
    return SIGN_IN_OTP_STATUS.EXPIRED;
  }

  return SIGN_IN_OTP_STATUS.VALID;
};
