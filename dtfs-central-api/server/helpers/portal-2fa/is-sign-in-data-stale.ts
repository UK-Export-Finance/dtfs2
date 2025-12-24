import { OTP } from '@ukef/dtfs2-common';

/**
 * Checks if sign in data is stale based on the signInOTPSendDate
 * Sign in data is considered stale if the signInOTPSendDate is older than 12 hours from the current time
 * returns true if stale, false otherwise
 * @param signInOTPSendDate - date when the sign in OTP was sent
 * @returns boolean indicating if sign in data is stale
 */
export const isSignInDataStale = (signInOTPSendDate: Date | null): boolean => {
  console.info('Checking if sign in data is stale');

  const currentDate = Date.now();

  const signInOTPSendDateAsNumber = signInOTPSendDate ? signInOTPSendDate.getTime() : null;

  const signInOTPSendDateStaleDate = currentDate - OTP.TIME_TO_RESET_SIGN_IN_OTP_SEND_COUNT_IN_MILLISECONDS;

  return Boolean(signInOTPSendDateAsNumber && signInOTPSendDateAsNumber < signInOTPSendDateStaleDate);
};
