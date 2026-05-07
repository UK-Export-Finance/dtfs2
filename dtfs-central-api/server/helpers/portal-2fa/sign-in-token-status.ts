import { PortalUser, SIGN_IN_OTP_STATUS } from '@ukef/dtfs2-common';
import { doesUserHaveSignInTokens } from './does-user-have-sign-in-tokens';
import { verifyHash } from './verify-hash';
import { isSignInOtpInDate } from './is-sign-in-otp-in-date';

/**
 * Checks status of sign in token provided
 * if no tokens found, returns NOT_FOUND
 * if token invalid, returns INVALID
 * if token expired, returns EXPIRED
 * if token valid, returns VALID
 * @param user - user object
 * @param signInCode - provided sign in code
 * @returns status of the sign in token
 */
export const signInTokenStatus = (user: PortalUser, signInCode: string) => {
  const { _id: userId } = user;

  console.info('Checking sign in token status for user %s', userId);

  const userHasSignInTokens = doesUserHaveSignInTokens(user);

  // if no tokens found then return not found
  if (!user?.signInTokens || !userHasSignInTokens) {
    console.error('No sign in tokens found for user %s', userId);
    return SIGN_IN_OTP_STATUS.NOT_FOUND;
  }

  const { signInTokens } = user;
  const latestToken = signInTokens[signInTokens.length - 1];

  // if any of the required fields are missing, return not found
  if (!latestToken?.hashHex || !latestToken?.saltHex || !latestToken?.expiry) {
    console.error('Latest sign in token is missing required fields for user %s', userId);
    return SIGN_IN_OTP_STATUS.NOT_FOUND;
  }

  // verify if the OTP code is correct compared to stored database hash
  const isOtpCorrect = verifyHash(signInCode, latestToken.saltHex, latestToken.hashHex, userId.toString());

  if (!isOtpCorrect) {
    console.error('Sign in OTP is invalid for user %s', userId);
    return SIGN_IN_OTP_STATUS.INVALID;
  }

  // checks if the sign in token is still in date
  const signInTokenInDate = isSignInOtpInDate(latestToken.expiry);

  if (!signInTokenInDate) {
    console.error('Sign in OTP is expired for user %s', userId);
    return SIGN_IN_OTP_STATUS.EXPIRED;
  }

  console.info('Sign in OTP is valid for user %s', userId);
  return SIGN_IN_OTP_STATUS.VALID;
};
