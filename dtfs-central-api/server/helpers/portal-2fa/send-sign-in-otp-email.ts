import { PortalUser } from '@ukef/dtfs2-common';
import { isAxiosError } from 'axios';
import EMAIL_TEMPLATE_IDS from '../../constants/email-template-ids';
import externalApi from '../../external-api/api';

/**
 * Sends the sign-in OTP security code to the user's email address via GOV.UK Notify.
 * @param user - the Portal user to send the access code to
 * @param securityCode - the one-time security code to include in the email
 */
export const sendSignInOtpEmail = async (user: PortalUser, securityCode: string): Promise<void> => {
  const { _id, email, firstname, surname } = user;

  // Sanitise the user ID by removing all non-alphanumeric, dash, and underscore characters to prevent log injection attacks
  const sanitisedId = String(_id).replace(/[^a-zA-Z0-9-_]/g, '');

  if (!email || !firstname || !surname) {
    console.error('Unable to send access code email: user %s is missing required fields', sanitisedId);
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
    const status = isAxiosError(error) ? error.response?.status : undefined;
    const message = error instanceof Error ? error.message : String(error);

    console.error('Failed to send access code email to user %s: %s%s', sanitisedId, message, status ? ` (HTTP ${status})` : '');
  }
};
