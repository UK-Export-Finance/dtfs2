import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, AuditDetails, SignInTokens } from '@ukef/dtfs2-common';
import { isUserBlockedOrDisabled } from '../../../../helpers/portal-2fa/is-user-blocked-or-disabled';
import { getUserById } from '../../../../repositories/users-repo';

export const validateAccountSignInOTP = async (
  req: CustomExpressRequest<{ reqBody: { userId: string; securityCode: string; auditDetails: AuditDetails } }>,
  res: Response,
) => {
  const { userId } = req.body;

  const user = await getUserById(userId);

  if (!user || !user?.signInTokens?.length) {
    console.info('Unable to verify account sign in code - no account exists with the provided ID');

    return res.status(HttpStatusCode.NotFound).send({ message: 'User not found' });
  }

  const userIsBlockedOrDisabled = isUserBlockedOrDisabled(user);

  if (userIsBlockedOrDisabled) {
    return res.status(HttpStatusCode.Forbidden).send({ message: 'User is blocked or disabled' });
  }

  const hasValidToken = (signInToken: SignInTokens) => signInToken?.hashHex && signInToken?.saltHex && signInToken?.expiry;

  const latestSignInToken = user.signInTokens.findLastIndex((signInToken) => hasValidToken(signInToken));

  console.log('Latest sign in token index:', latestSignInToken);

  return res.status(HttpStatusCode.Ok).send({ latestSignInToken });
};
