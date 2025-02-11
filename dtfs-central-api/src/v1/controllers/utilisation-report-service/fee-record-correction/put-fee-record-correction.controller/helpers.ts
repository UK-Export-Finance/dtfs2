import { getTfmUiUrl, getUkefGefReportingEmailRecipients } from '@ukef/dtfs2-common';
import externalApi from '../../../../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../../../../constants/email-template-ids';
import { getBankById } from '../../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../../errors';

/**
 * Sends the fee record correction received emails to the bank.
 * @param emails - The email addresses to send the emails to
 * @param paymentOfficerTeamName - The name of the payment officer team
 * @param exporter - The exporter of the fee record the correction applies to
 */
export const sendCorrectionReceivedBankNotificationEmails = async (emails: string[], paymentOfficerTeamName: string, exporter: string) => {
  await Promise.all(
    emails.map((email) =>
      externalApi.sendEmail(EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_RECEIVED_BANK_NOTIFICATION, email, {
        recipient: paymentOfficerTeamName,
        exporterName: exporter,
      }),
    ),
  );
};

/**
 * Sends the fee record correction received emails to the UKEF GEF reporting team.
 * @param exporter - The exporter of the fee record the correction applies to
 * @param bankName - The name of the bank
 */
export const sendCorrectionReceivedUkefNotificationEmails = async (exporter: string, bankName: string) => {
  const gefReportingEmails = getUkefGefReportingEmailRecipients();
  const tfmHomepageUrl = getTfmUiUrl();
  await Promise.all(
    gefReportingEmails.map((email) =>
      externalApi.sendEmail(EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_RECEIVED_UKEF_NOTIFICATION, email, {
        bankName,
        exporterName: exporter,
        tfmHomepageUrl,
      }),
    ),
  );
};

/**
 * Sends the fee record correction received emails
 * - The bank receives an email with a confirmation of their submission
 * - The PDC team receives an email notification to inform them the
 *    bank has submitted the correction
 * @param exporter - The exporter of the fee record
 * @param bankId - The id of the bank
 * @returns A promise that resolves to an object containing the email addresses
 * that were notified.
 */
export const sendFeeRecordCorrectionReceivedEmails = async (exporter: string, bankId: string): Promise<{ emails: string[] }> => {
  const bank = await getBankById(bankId);

  if (!bank) {
    console.error('Bank not found: %s', bankId);
    throw new NotFoundError(`Bank not found: ${bankId}`);
  }

  const { emails } = bank.paymentOfficerTeam;

  try {
    // TODO: DO NOT COMMIT
    // await sendCorrectionReceivedBankNotificationEmails(emails, teamName, exporter);

    // await sendCorrectionReceivedUkefNotificationEmails(exporter, bank.name);

    return { emails };
  } catch (error) {
    console.error('Error sending fee record correction request email: %o', error);

    throw error;
  }
};
