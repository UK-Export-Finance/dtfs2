import { AuditDetails, OTP, STATUS_BLOCKED_REASON, PortalUser } from '@ukef/dtfs2-common';
import { PortalUsersRepo } from '../../repositories/users-repo';
import { sendSignInOtpEmail } from './send-sign-in-otp-email';

type variables = {
  user: PortalUser;
  securityCode: string;
  auditDetails: AuditDetails;
};

/**
 * Sends email to the user with the sign in OTP code and increments the sign in OTP "send count" for the user.
 * The "send count" is the number of times the OTP has been sent to the user
 * if the count exceeds the maximum allowed attempts, blocks the user
 * returns the number of remaining attempts
 * @param userId - ID of the user
 * @param signInOTPSendDate - date when the sign in OTP was last sent
 * @param securityCode - the sign in OTP code to be sent to the user
 * @param auditDetails - the users audit details
 * @returns number of remaining attempts to send sign in OTP
 */
export const sendEmailAndIncrementSignInOTPSendCount = async ({ user, securityCode, auditDetails }: variables) => {
  const userId = user._id.toString();

  try {
    console.info('Sending email and incrementing sign in OTP count for user %s', userId);

    const maxSignInOTPSendCount = OTP.MAX_SIGN_IN_ATTEMPTS;
    const initialSignInOTPSendCount = user.signInOTPSendCount ?? 0;

    /**
     * If the user has not exceeded the maximum sign in OTP send attempts,
     * then send the sign in OTP email to the user
     * if the email sending fails, it will fall into the catch block
     * and will not increment the sign in OTP send count
     */
    if (initialSignInOTPSendCount < maxSignInOTPSendCount) {
      await sendSignInOtpEmail(user, securityCode);
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
     * and hence the remaining attempts will be -1 or lower
     */
    if (remainingAttempts <= -1) {
      console.info('User %s has exceeded maximum sign in OTP send attempts, blocking user', userId);
      await PortalUsersRepo.blockUser({ userId, reason: STATUS_BLOCKED_REASON.EXCESSIVE_SIGN_IN_OTPS, auditDetails });
    }

    return remainingAttempts;
  } catch (error) {
    console.error('Error incrementing sign in OTP send count for user %s: %o', userId, error);

    throw new Error('Error incrementing sign in OTP send count');
  }
};
