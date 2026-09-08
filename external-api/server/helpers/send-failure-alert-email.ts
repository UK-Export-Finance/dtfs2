import { sendEmail } from '../v1/controllers/email.controller';

// Who is supposed to receive operational alerts? Is there already a shared operations/support mailbox?
const sendToEmailAddress = process.env.UKEF_INTERNAL_NOTIFICATION ?? '';

/**
 * Sends a Notify alert for a failed eStore or ACBS payload/job.
 *
 * The helper keeps the failure handling in one place and avoids letting a Notify
 * error mask the original application failure.
 *
 * @param templateId - GOV.UK Notify template id to use for the alert.
 * @param jobName - Name of the scheduled job that failed.
 * @param dealIdentifier - Optional deal identifier for the failed job.
 * @param errorMessage - Failure details to include in the notification.
 */
export const sendFailureAlertEmail = async (templateId: string, jobName: string, errorMessage: string, dealIdentifier?: string): Promise<void> => {
  const emailVariables = {
    ...(typeof dealIdentifier !== 'undefined' ? { dealIdentifier } : {}),
    message: errorMessage,
    jobName,
  };

  try {
    await sendEmail(templateId, sendToEmailAddress, emailVariables);
  } catch (error) {
    console.error('Failed to send failure alert email. templateId=%s job=%s recipient=%s error=%o', templateId, jobName, sendToEmailAddress, error);
  }
};
