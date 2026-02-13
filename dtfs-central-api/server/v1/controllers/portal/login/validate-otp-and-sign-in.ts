import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, AuditDetails, issueValid2FAJWT } from '@ukef/dtfs2-common';
import { isUserBlockedOrDisabled } from '../../../../helpers/portal-2fa/is-user-blocked-or-disabled';
import { validateOtp } from '../../../../helpers/portal-2fa/validate-otp';
import { getUserById, PortalUsersRepo } from '../../../../repositories/users-repo';

/**
 * Validates the OTP and signs in the user if the OTP is valid.
 * If no user or no sign-in tokens are found, returns a 404 Not Found response.
 * If the user is blocked or disabled, returns a 403 Forbidden response.
 * If the OTP is valid, issues a JWT, updates the last login and resets sign-in data, and returns a 200 OK response with the user and token.
 * If the OTP is invalid, expired, or not found, returns the appropriate response based on the validation result.
 * @param req - request including userId, signInOTPCode, and auditDetails
 * @param res - response object
 * @returns status and response based on OTP validation
 */
export const validateOTPAndSignIn = async (
  req: CustomExpressRequest<{ reqBody: { userId: string; signInOTPCode: string; auditDetails: AuditDetails } }>,
  res: Response,
) => {
  try {
    console.info('Validating OTP and signing in user %s', req.body.userId);

    const { userId, signInOTPCode, auditDetails } = req.body;

    const user = await getUserById(userId);

    // If no user or no sign-in tokens are found, return 404 Not Found
    if (!user || !user?.signInTokens?.length) {
      console.error('Unable to verify account sign in code - no account exists with the provided ID: %s', userId);

      return res.status(HttpStatusCode.NotFound).send({ message: 'User not found' });
    }

    const userIsBlockedOrDisabled = isUserBlockedOrDisabled(user);

    // If the user is blocked or disabled, return 403 Forbidden
    if (userIsBlockedOrDisabled) {
      console.error('User %s is blocked or disabled', user.email);
      return res.status(HttpStatusCode.Forbidden).send({ message: 'User is blocked or disabled' });
    }

    // Validate the OTP and returns success or failure response
    const otpResponse = validateOtp(signInOTPCode, user);

    /**
     * If the OTP is valid,
     * issue a JWT, update last login and reset sign-in data,
     * and return 200 OK with user and token and success flag
     */
    if (otpResponse.success && otpResponse.isValid) {
      console.info(`User %s provided a valid OTP, issuing JWT and signing in`, user.email);

      const { sessionIdentifier, ...tokenObject } = issueValid2FAJWT(user);

      await PortalUsersRepo.updateLastLoginAndResetSignInData({ userId, sessionIdentifier, auditDetails });

      return res.status(HttpStatusCode.Ok).send({ user, tokenObject, success: true });
    }

    // If the OTP is invalid, expired, or not found, return the appropriate response
    console.error('Unable to verify account sign in code for user %s', user.email);
    return res.status(otpResponse.statusCode).send(otpResponse);
  } catch (error) {
    console.error('Error validating OTP and signing in user %s: %o', req.body.userId, error);

    return res.status(HttpStatusCode.InternalServerError).send({ message: error instanceof Error ? error.message : 'An unexpected error occurred' });
  }
};
