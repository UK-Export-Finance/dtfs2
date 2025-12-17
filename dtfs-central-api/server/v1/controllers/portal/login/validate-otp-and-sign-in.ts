import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, AuditDetails } from '@ukef/dtfs2-common';
import { isUserBlockedOrDisabled } from '../../../../helpers/portal-2fa/is-user-blocked-or-disabled';
import { validateOtp } from '../../../../helpers/portal-2fa/validate-otp';
import { getUserById } from '../../../../repositories/users-repo';

export const validateOTPAndSignIn = async (
  req: CustomExpressRequest<{ reqBody: { userId: string; signInOTPCode: string; auditDetails: AuditDetails } }>,
  res: Response,
) => {
  const { userId, signInOTPCode } = req.body;

  const user = await getUserById(userId);

  if (!user || !user?.signInTokens?.length) {
    console.info('Unable to verify account sign in code - no account exists with the provided ID');

    return res.status(HttpStatusCode.NotFound).send({ message: 'User not found' });
  }

  const userIsBlockedOrDisabled = isUserBlockedOrDisabled(user);

  if (userIsBlockedOrDisabled) {
    return res.status(HttpStatusCode.Forbidden).send({ message: 'User is blocked or disabled' });
  }

  const otpResponse = validateOtp(signInOTPCode, user);

  if (otpResponse.success && otpResponse.isValid) {
    console.info(`User ${user.email} successfully signed in with OTP.`);

    return res.status(HttpStatusCode.Ok).send({ message: 'OTP is valid' });
  }

  console.info('Unable to verify account sign in code');
  return res.status(otpResponse.statusCode).send({ message: 'OTP is invalid' });
};
