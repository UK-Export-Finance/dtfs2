import { PortalUser } from '@ukef/dtfs2-common';
import EMAIL_TEMPLATE_IDS from '../../constants/email-template-ids';
import externalApi from '../../external-api/api';

/**
 * Sends the sign-in OTP security code to the user's email address via GOV.UK Notify.
 * @param user - the Portal user to send the access code to
 * @param securityCode - the one-time security code to include in the email
 */
export const sendSignInOtpEmail = async (user: PortalUser, securityCode: string): Promise<void> => {
  const { _id, email, firstname, surname } = user;

  if (!email || !firstname || !surname) {
    console.error('Unable to send access code email: user %s is missing required fields', _id);
    return;
  }

  const emailVariables = {
    firstName: firstname,
    lastName: surname,
    securityCode,
  };

  try {
    await externalApi.sendEmail(EMAIL_TEMPLATE_IDS.PORTAL_ACCESS_CODE_EMAIL, email, emailVariables);
  } catch (error) {
    console.error('Failed to send access code email to user %s: %o', _id, error);
  }
};
