import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, AuditDetails, PortalUser, isProduction } from '@ukef/dtfs2-common';
import { isUserBlockedOrDisabled } from '../../../../helpers/portal-2fa/is-user-blocked-or-disabled';
import { sendEmailAndIncrementSignInOTPSendCount } from '../../../../helpers/portal-2fa/send-email-and-increment-sign-in-otp-sent-count';
import { generateOtp } from '../../../../helpers/portal-2fa/generate-otp';
import { PortalUsersRepo } from '../../../../repositories/users-repo';
import { sendAccountSuspensionEmail } from './send-account-suspension-email';
import { isSignInDataStale } from '../../../../helpers/portal-2fa/is-sign-in-data-stale';

/**
 * Creates and emails a sign-in OTP to the user.
 * Checks if the user exists and is not blocked or disabled.
 * Increments the sign-in OTP send count and resets sign-in data if stale.
 * Generates a new OTP, saves it to the database, and logs it to the console.
 * @param req request object containing user and audit details
 * @param res response object
 * @returns response with signInOTPSendCount or error message
 */
export const createAndEmailSignInOTP = async (req: CustomExpressRequest<{ reqBody: { user: PortalUser; auditDetails: AuditDetails } }>, res: Response) => {
  try {
    const { user, auditDetails } = req.body;

    const doesUserExist = user && user._id && user.email && user.firstname && user.surname;

    if (!doesUserExist || !auditDetails) {
      console.error('User or auditDetails not found');

      return res.status(HttpStatusCode.NotFound).send({ message: 'User or auditDetails not found' });
    }

    const userId = user._id.toString();
    const sanitisedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '');

    console.info('Creating and emailing sign in OTP for user %s', sanitisedUserId);

    const userIsBlockedOrDisabled = isUserBlockedOrDisabled(user);

    if (userIsBlockedOrDisabled) {
      console.error('User %s is blocked or disabled', sanitisedUserId);
      return res.status(HttpStatusCode.Forbidden).send({ message: 'User is blocked or disabled' });
    }

    const signInOTPSendDate = user.signInOTPSendDate ? new Date(user.signInOTPSendDate) : undefined;

    // if sign in data is stale, reset sign in data first
    const signInDataIsStale = isSignInDataStale(signInOTPSendDate);

    if (signInDataIsStale) {
      console.info('Sign in data is stale for user %s, resetting sign in data', userId);
      await PortalUsersRepo.resetSignInData({ userId, signInOTPSendDate, auditDetails });
    }

    /**
     * Generate a new OTP, save it to the database.
     */
    const { securityCode, salt: saltHex, hash: hashHex, expiry } = generateOtp();

    console.info('Saving sign in OTP for user %s', sanitisedUserId);
    await PortalUsersRepo.saveSignInOTPTokenForUser({ userId, saltHex, hashHex, expiry, auditDetails });

    const signInOTPSendCount = await sendEmailAndIncrementSignInOTPSendCount({ user, securityCode, auditDetails });

    /**
     * If the user has exceeded the maximum sign in OTP send attempts,
     * then the remaining attempts returned here will be -1 or lower.
     * Send an account suspension email and return a response indicating that the account is suspended.
     */
    if (signInOTPSendCount <= -1) {
      console.info('User %s account suspended due to excessive OTP requests, sending suspension email', sanitisedUserId);
      try {
        await sendAccountSuspensionEmail(user);
      } catch (emailError) {
        // Log the failure but still return -1 so the user is shown the suspended account page.
        console.error('Failed to send account suspension email to user %s: %o', sanitisedUserId, emailError);
      }
      return res.status(HttpStatusCode.Created).send({ signInOTPSendCount: -1 });
    }

    if (!isProduction()) {
      console.info('🔑 Sign in OTP code for user: %s is: %s', user.email, securityCode);
    }

    return res.status(HttpStatusCode.Created).send({ signInOTPSendCount });
  } catch (error) {
    const sanitisedUserId = req.body.user?._id ? String(req.body.user._id).replace(/[^a-zA-Z0-9_-]/g, '') : 'unknown';

    console.error('Failed to create and email sign in OTP for user %s: %o', sanitisedUserId, error);

    return res.status(HttpStatusCode.InternalServerError).send({ message: error instanceof Error ? error.message : 'An unexpected error occurred' });
  }
};
