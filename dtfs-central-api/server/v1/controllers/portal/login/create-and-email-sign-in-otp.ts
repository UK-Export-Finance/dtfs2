import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { CustomExpressRequest, AuditDetails, PortalUser } from '@ukef/dtfs2-common';
import { isUserBlockedOrDisabled } from '../../../../helpers/portal-2fa/is-user-blocked-or-disabled';
import { incrementSignInOTPSendCount } from '../../../../helpers/portal-2fa/increment-sign-in-opt-sent-count';
import { generateOtp } from '../../../../helpers/portal-2fa/generate-otp';
import { PortalUsersRepo } from '../../../../repositories/users-repo';

export const createAndEmailSignInOTP = async (req: CustomExpressRequest<{ reqBody: { user: PortalUser; auditDetails: AuditDetails } }>, res: Response) => {
  const { user, auditDetails } = req.body;
  console.log('hereeeeeeeeeeeeeeeee');
  const doesUserExist = user && user._id && user.email && user.firstname && user.surname;

  if (!doesUserExist || !auditDetails) {
    return res.status(HttpStatusCode.NotFound).send({ message: 'User or auditDetails not found' });
  }

  const userIsBlockedOrDisabled = isUserBlockedOrDisabled(user);

  if (userIsBlockedOrDisabled) {
    return res.status(HttpStatusCode.Forbidden).send({ message: 'User is blocked or disabled' });
  }

  const userId = user._id.toString();
  const userSignInLinkSendDate = user.signInLinkSendDate ? new Date(user.signInLinkSendDate) : null;

  const newSignInLinkCount = await incrementSignInOTPSendCount({ userId, userSignInLinkSendDate, auditDetails });

  const { securityCode, salt: saltHex, hash: hashHex, expiry } = generateOtp();

  await PortalUsersRepo.saveSignInOTPTokenForUser({ userId, saltHex, hashHex, expiry, auditDetails });

  console.log(`Generated OTP for user ${user.email}. OTP: ${securityCode}. ${newSignInLinkCount}.`);

  return res.status(HttpStatusCode.Created).send({ securityCode });
};
