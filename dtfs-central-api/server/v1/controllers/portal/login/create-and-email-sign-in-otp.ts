import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, AuditDetails, PortalUser, isProduction } from '@ukef/dtfs2-common';
import { isUserBlockedOrDisabled } from '../../../../helpers/portal-2fa/is-user-blocked-or-disabled';
import { incrementSignInOTPSendCount } from '../../../../helpers/portal-2fa/increment-sign-in-opt-sent-count';
import { generateOtp } from '../../../../helpers/portal-2fa/generate-otp';
import { PortalUsersRepo } from '../../../../repositories/users-repo';
import { sendSignInOtpEmail } from '../../../../helpers/portal-2fa/send-sign-in-otp-email';
import { sendAccountSuspensionEmail } from './send-account-suspension-email';

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

    const signInOTPSendCount = await incrementSignInOTPSendCount({ userId, signInOTPSendDate, auditDetails });

    if (signInOTPSendCount === -1) {
      console.info('User %s account suspended due to excessive OTP requests, sending suspension email', sanitisedUserId);
      try {
        await sendAccountSuspensionEmail(user);
      } catch (emailError) {
        // Log the failure but still return -1 so the user is shown the suspended account page.
        console.error('Failed to send account suspension email to user %s: %o', sanitisedUserId, emailError);
      }
      return res.status(HttpStatusCode.Created).send({ signInOTPSendCount: -1 });
    }

    const { securityCode, salt: saltHex, hash: hashHex, expiry } = generateOtp();

    console.info('Saving sign in OTP for user %s', sanitisedUserId);
    await PortalUsersRepo.saveSignInOTPTokenForUser({ userId, saltHex, hashHex, expiry, auditDetails });

    if (!isProduction()) {
      console.info('🔑 Sign in OTP code for user: %s is: %s', user.email, securityCode);
    }

    await sendSignInOtpEmail(user, securityCode);

    return res.status(HttpStatusCode.Created).send({ signInOTPSendCount });
  } catch (error) {
    const sanitisedUserId = req.body.user?._id ? String(req.body.user._id).replace(/[^a-zA-Z0-9_-]/g, '') : 'unknown';

    console.error('Failed to create and email sign in OTP for user %s: %o', sanitisedUserId, error);

    return res.status(HttpStatusCode.InternalServerError).send({ message: error instanceof Error ? error.message : 'An unexpected error occurred' });
  }
};
