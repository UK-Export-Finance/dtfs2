import { getFormattedReportPeriodWithLongMonth, mapReasonToDisplayValue, RecordCorrectionReason, ReportPeriod } from '@ukef/dtfs2-common';
import externalApi from '../../../../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../../../../constants/email-template-ids';
import { FeeRecordCorrectionRequestEmails, FeeRecordCorrectionRequestEmailAddresses } from '../../../../../types/utilisation-reports';
import { getBankById } from '../../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../../errors';

/**
 * Formats the reasons for record correction into a bulleted list.
 * @param reasons - The reasons for the record correction
 * @returns the formatted reasons
 */
export const formatReasonsAsBulletedListForEmail = (reasons: RecordCorrectionReason[]) =>
  reasons.map((reason) => `*${mapReasonToDisplayValue(reason)}`).join('\n');

/**
 * Generates variables for the fee record correction request emails.
 *
 * Gets the bank by the report bank id to fetch the payment officer
 * team emails - errors if bank is not found.
 *
 * Generates the variables as follows:
 *  - formats the report period to a string
 *  - sets the list of emails to the bank payment report officer
 *     emails and the requesting user's email
 *  - formats the list of reasons into a bulleted list
 * @param report
 * @returns emails and variables for the email
 */
export const generateFeeRecordCorrectionRequestEmailParameters = async (
  reasons: RecordCorrectionReason[],
  reportPeriod: ReportPeriod,
  exporter: string,
  bankId: string,
  requestedByUserEmail: string,
): Promise<FeeRecordCorrectionRequestEmails> => {
  const bank = await getBankById(bankId);

  if (!bank) {
    console.error('Bank not found: %s', bankId);
    throw new NotFoundError(`Bank not found: ${bankId}`);
  }

  const { teamName, emails } = bank.paymentOfficerTeam;

  const reportPeriodString = getFormattedReportPeriodWithLongMonth(reportPeriod);

  return {
    emails: [...emails, requestedByUserEmail],
    variables: {
      recipient: teamName,
      reportPeriod: reportPeriodString,
      exporterName: exporter,
      reasonsList: formatReasonsAsBulletedListForEmail(reasons),
    },
  };
};

/**
 * Sends the fee record correction request email to the bank
 * and also sends a copy of the email to the TFM user who made
 * the request
 * @param reasons - The reasons for the record correction request
 * @param reportPeriod - The report period of the fee's report
 * @param exporter - The exporter of the fee record
 * @param bankId - The id of the bank
 * @param requestedByUserEmail - The email of the TFM user who is
 *    requesting the correction
 * @returns A promise that resolves to an object containing the email addresses
 * that were notified.
 */
export const sendFeeRecordCorrectionRequestEmails = async (
  reasons: RecordCorrectionReason[],
  reportPeriod: ReportPeriod,
  exporter: string,
  bankId: string,
  requestedByUserEmail: string,
): Promise<FeeRecordCorrectionRequestEmailAddresses> => {
  const { emails, variables } = await generateFeeRecordCorrectionRequestEmailParameters(reasons, reportPeriod, exporter, bankId, requestedByUserEmail);

  try {
    await Promise.all(emails.map((email) => externalApi.sendEmail(EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_REQUEST, email, variables)));

    return { emails };
  } catch (error) {
    console.error('Error sending fee record correction request email: %o', error);

    throw error;
  }
};
