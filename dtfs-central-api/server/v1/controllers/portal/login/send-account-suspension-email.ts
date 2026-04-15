import { isAxiosError } from 'axios';
import { PortalUser } from '@ukef/dtfs2-common';
import { EmailSendError } from '../../../../errors/email-send-error';
import { MissingUserFieldsError } from '../../../../errors/missing-user-fields-error';
import EMAIL_TEMPLATE_IDS from '../../../../constants/email-template-ids';
import externalApi from '../../../../external-api/api';

/**
 * Sends an account suspension notification email to the user via GOV.UK Notify.
 * Called when the user has exhausted all OTP send attempts and their account is suspended.
 * @param user the portal user to send the email to, must contain _id, email, firstname, and surname fields.
 */
export const sendAccountSuspensionEmail = async (user: PortalUser): Promise<void> => {
  console.info('Sending account suspension email to user %s', user._id);

  const { _id, email, firstname, surname } = user;

  // Sanitise the user ID by removing all non-alphanumeric, dash, and underscore characters to prevent log injection attacks
  const sanitisedId = String(_id).replace(/[^a-zA-Z0-9-_]/g, '');

  if (!email || !firstname || !surname) {
    console.error('Unable to send account suspension email: user %s is missing required fields', sanitisedId);
    throw new MissingUserFieldsError(sanitisedId);
  }

  const emailVariables = {
    firstName: firstname,
    lastName: surname,
  };

  try {
    await externalApi.sendEmail(EMAIL_TEMPLATE_IDS.PORTAL_ACCOUNT_SUSPENSION_NOTIFICATION_EMAIL, email, emailVariables);
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    const message = error instanceof Error ? error.message : String(error);

    console.error('Failed to send account suspension email to user %s: %s%s', sanitisedId, message, status ? ` (HTTP ${status})` : '');
    throw new EmailSendError(sanitisedId, message, status);
  }
};
