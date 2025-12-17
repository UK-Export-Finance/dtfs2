import { AuditDetails, OTP, STATUS_BLOCKED_REASON } from '@ukef/dtfs2-common';
import { PortalUsersRepo } from '../../repositories/users-repo';

type variables = {
  userId: string;
  userSignInLinkSendDate: Date | null;
  auditDetails: AuditDetails;
};

export const incrementSignInOTPSendCount = async ({ userId, userSignInLinkSendDate, auditDetails }: variables) => {
  const maxSignInOTPSendCount = OTP.MAX_SIGN_IN_ATTEMPTS;

  await PortalUsersRepo.resetSignInData({ userId, userSignInLinkSendDate, auditDetails });

  const signInOTPSendCount = await PortalUsersRepo.incrementSignInOTPSendCount(userId, auditDetails);

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
    // throw new UserBlockedError(userId);
  }

  return numberOfSendSignInOTPAttemptsRemaining;
};
