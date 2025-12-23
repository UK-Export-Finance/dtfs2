import { AuditDetails, OTP, STATUS_BLOCKED_REASON } from '@ukef/dtfs2-common';
import { PortalUsersRepo } from '../../repositories/users-repo';
import { isSignInDataStale } from './is-sign-in-data-stale';

type variables = {
  userId: string;
  signInOTPSendDate: Date | null;
  auditDetails: AuditDetails;
};

/**
 * increments the sign in OTP send count for the user
 * if the sign in data is stale, resets the sign in data before incrementing the count
 * if the count exceeds the maximum allowed attempts, blocks the user
 * returns the number of remaining attempts
 * @param userId - ID of the user
 * @param signInOTPSendDate - date when the sign in OTP was last sent
 * @param auditDetails
 * @returns number of remaining attempts to send sign in OTP
 */
export const incrementSignInOTPSendCount = async ({ userId, signInOTPSendDate, auditDetails }: variables) => {
  const maxSignInOTPSendCount = OTP.MAX_SIGN_IN_ATTEMPTS;

  // if sign in data is stale, reset sign in data first
  const signInDataIsStale = isSignInDataStale(signInOTPSendDate);

  if (signInDataIsStale) {
    await PortalUsersRepo.resetSignInData({ userId, signInOTPSendDate, auditDetails });
  }

  // increment the sign in OTP send count
  const signInOTPSendCount = await PortalUsersRepo.incrementSignInOTPSendCount(userId, auditDetails);

  // if incrementing the count failed, throw an error
  if (signInOTPSendCount === undefined || signInOTPSendCount === null) {
    throw new Error('Failed to increment sign in OTP send count');
  }

  if (signInOTPSendCount === 1) {
    await PortalUsersRepo.setSignInLinkSendDate({ userId, auditDetails });
  }

  const numberOfSendSignInOTPAttemptsRemaining = maxSignInOTPSendCount - signInOTPSendCount;

  /*
   * This is "-1" as when a user has a signInLinkCount of 0 after incrementSignInLinkSendCount,
   * they are on their last attempt.
   */
  if (numberOfSendSignInOTPAttemptsRemaining === -1) {
    await PortalUsersRepo.blockUser({ userId, reason: STATUS_BLOCKED_REASON.EXCESSIVE_SIGN_IN_OTPS, auditDetails });
  }

  return numberOfSendSignInOTPAttemptsRemaining;
};
