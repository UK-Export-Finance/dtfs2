import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, AuditDetails, PortalUser, isProduction } from '@ukef/dtfs2-common';
import { isUserBlockedOrDisabled } from '../../../../helpers/portal-2fa/is-user-blocked-or-disabled';
import { incrementSignInOTPSendCount } from '../../../../helpers/portal-2fa/increment-sign-in-opt-sent-count';
import { generateOtp } from '../../../../helpers/portal-2fa/generate-otp';
import { PortalUsersRepo } from '../../../../repositories/users-repo';

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

    console.info('Creating and emailing sign in OTP for user %s', req.body.user._id);

    const userIsBlockedOrDisabled = isUserBlockedOrDisabled(user);

    if (userIsBlockedOrDisabled) {
      console.error('User %s is blocked or disabled', user._id);
      return res.status(HttpStatusCode.Forbidden).send({ message: 'User is blocked or disabled' });
    }

    const userId = user._id.toString();

    const signInOTPSendDate = user.signInOTPSendDate ? new Date(user.signInOTPSendDate) : undefined;

    const signInOTPSendCount = await incrementSignInOTPSendCount({ userId, signInOTPSendDate, auditDetails });

    const { securityCode, salt: saltHex, hash: hashHex, expiry } = generateOtp();

    console.info('Saving sign in OTP for user %s', user._id);
    await PortalUsersRepo.saveSignInOTPTokenForUser({ userId, saltHex, hashHex, expiry, auditDetails });

    if (!isProduction()) {
      console.info('Sign in OTP code for user: %s is: %s', user.email, securityCode);
    }

    return res.status(HttpStatusCode.Created).send({ signInOTPSendCount });
  } catch (error) {
    console.error('Failed to create and email sign in OTP for user %s: %o', req.body.user._id, error);

    return res.status(HttpStatusCode.InternalServerError).send({ message: error instanceof Error ? error.message : 'An unexpected error occurred' });
  }
};
