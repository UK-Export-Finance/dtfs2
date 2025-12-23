/**
 * Checks if sign in data is stale based on the signInOTPSendDate
 * Sign in data is considered stale if the signInOTPSendDate is older than 12 hours from the current time
 * returns true if stale, false otherwise
 * @param signInOTPSendDate - date when the sign in OTP was sent
 * @returns boolean indicating if sign in data is stale
 */
export const isSignInDataStale = (signInOTPSendDate: Date | null): boolean => {
  const TIME_TO_RESET_SIGN_IN_LINK_SEND_COUNT_IN_MILLISECONDS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  const currentDate = Date.now();
  const signInOTPSendDateAsNumber = signInOTPSendDate ? signInOTPSendDate.getTime() : null;

  const signInOTPSendDateStaleDate = currentDate - TIME_TO_RESET_SIGN_IN_LINK_SEND_COUNT_IN_MILLISECONDS;

  return Boolean(signInOTPSendDateAsNumber && signInOTPSendDateAsNumber < signInOTPSendDateStaleDate);
};
