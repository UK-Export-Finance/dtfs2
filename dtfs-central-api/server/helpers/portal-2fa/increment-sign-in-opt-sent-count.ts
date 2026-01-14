import { AuditDetails, OTP, STATUS_BLOCKED_REASON } from '@ukef/dtfs2-common';
import { PortalUsersRepo } from '../../repositories/users-repo';
import { isSignInDataStale } from './is-sign-in-data-stale';

type variables = {
  userId: string;
  signInOTPSendDate?: Date;
  auditDetails: AuditDetails;
};

/**
 * Increments the sign in OTP "send count" for the user.
 * The "send count" is the number of times the OTP has been sent to the user
 * if the sign in data is stale, resets the sign in data before incrementing the count
 * if the count exceeds the maximum allowed attempts, blocks the user
 * returns the number of remaining attempts
 * @param userId - ID of the user
 * @param signInOTPSendDate - date when the sign in OTP was last sent
 * @param auditDetails - the users audit details
 * @returns number of remaining attempts to send sign in OTP
 */
export const incrementSignInOTPSendCount = async ({ userId, signInOTPSendDate, auditDetails }: variables) => {
  try {
    console.info('Incrementing sign in OTP count for user %s', userId);

    const maxSignInOTPSendCount = OTP.MAX_SIGN_IN_ATTEMPTS;

    // if sign in data is stale, reset sign in data first
    const signInDataIsStale = isSignInDataStale(signInOTPSendDate);

    if (signInDataIsStale) {
      console.info('Sign in data is stale for user %s, resetting sign in data', userId);
      await PortalUsersRepo.resetSignInData({ userId, signInOTPSendDate, auditDetails });
    }

    // increment the sign in OTP send count
    const signInOTPSendCount = await PortalUsersRepo.incrementSignInOTPSendCount(userId, auditDetails);

    // if incrementing the count failed, throw an error
    if (!signInOTPSendCount) {
      throw new Error('Failed to increment sign in OTP send count');
    }

    if (signInOTPSendCount === 1) {
      await PortalUsersRepo.setSignInOTPSendDate({ userId, auditDetails });
    }

    const remainingAttempts = maxSignInOTPSendCount - signInOTPSendCount;

    /*
     * If the user is past their last attempt, block the user
     * This is because the signInOTPSendCount is greater than the max allowed attempts
     * and hence the remaining attempts will be -1
     */
    if (remainingAttempts === -1) {
      console.info('User %s has exceeded maximum sign in OTP send attempts, blocking user', userId);
      await PortalUsersRepo.blockUser({ userId, reason: STATUS_BLOCKED_REASON.EXCESSIVE_SIGN_IN_OTPS, auditDetails });
    }

    return remainingAttempts;
  } catch (error) {
    console.error('Error incrementing sign in OTP send count for user %s: %o', userId, error);

    throw new Error('Error incrementing sign in OTP send count');
  }
};
