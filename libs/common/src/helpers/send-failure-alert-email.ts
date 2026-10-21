type SendEmail = (templateId: string, sendToEmailAddress: string, emailVariables: Record<string, string>) => void | Promise<void>;

/**
 * Sends a failure alert email and swallows notification errors.
 *
 * @param sendEmail - Email sender used to deliver the alert.
 * @param templateId - GOV.UK Notify template id to use for the alert.
 * @param jobName - Name of the job that failed.
 * @param errorMessage - Failure details to include in the notification.
 * @param dealIdentifier - Optional deal identifier for the failed job.
 */
export const sendFailureAlertEmail = async (
  sendEmail: SendEmail,
  templateId: string,
  jobName: string,
  errorMessage: string,
  dealIdentifier?: string,
): Promise<void> => {
  const sendToEmailAddress = process.env.UKEF_INTERNAL_NOTIFICATION ?? '';

  const emailVariables = {
    ...(typeof dealIdentifier !== 'undefined' ? { dealIdentifier } : {}),
    message: errorMessage,
    jobName,
  };

  try {
    const response = await sendEmail(templateId, sendToEmailAddress, emailVariables);

    if (response === null) {
      console.error(
        'Failed to send failure alert email. templateId=%s job=%s recipient=%s error=%o',
        templateId,
        jobName,
        sendToEmailAddress,
        new Error('sendEmail returned null'),
      );
    }
  } catch (error) {
    console.error('Failed to send failure alert email. templateId=%s job=%s recipient=%s error=%o', templateId, jobName, sendToEmailAddress, error);
  }
};
