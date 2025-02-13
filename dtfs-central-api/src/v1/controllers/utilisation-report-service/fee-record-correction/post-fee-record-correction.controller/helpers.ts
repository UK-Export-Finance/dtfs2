import { getFormattedReportPeriodWithLongMonth, mapReasonToDisplayValue, RecordCorrectionReason, ReportPeriod } from '@ukef/dtfs2-common';
import externalApi from '../../../../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../../../../constants/email-template-ids';
import { FeeRecordCorrectionRequestEmails, FeeRecordCorrectionRequestEmailAddresses } from '../../../../../types/utilisation-reports';

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
export const generateFeeRecordCorrectionRequestEmailParameters = (
  reasons: RecordCorrectionReason[],
  reportPeriod: ReportPeriod,
  exporter: string,
  requestedByUserEmail: string,
  paymentOfficerTeamName: string,
  paymentOfficerTeamEmails: string[],
): FeeRecordCorrectionRequestEmails => {
  const reportPeriodString = getFormattedReportPeriodWithLongMonth(reportPeriod);

  return {
    emails: [...paymentOfficerTeamEmails, requestedByUserEmail],
    variables: {
      recipient: paymentOfficerTeamName,
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
 * @param requestedByUserEmail - The email of the TFM user who is requesting the correction
 * @param paymentOfficerTeamName - The name of the bank payment officer team
 * @param paymentOfficerTeamEmails - The email addresses of the bank payment officer team
 * @returns A promise that resolves to an object containing the email addresses
 * that were notified.
 */
export const sendFeeRecordCorrectionRequestEmails = async (
  reasons: RecordCorrectionReason[],
  reportPeriod: ReportPeriod,
  exporter: string,
  requestedByUserEmail: string,
  paymentOfficerTeamName: string,
  paymentOfficerTeamEmails: string[],
): Promise<FeeRecordCorrectionRequestEmailAddresses> => {
  const { emails, variables } = generateFeeRecordCorrectionRequestEmailParameters(
    reasons,
    reportPeriod,
    exporter,
    requestedByUserEmail,
    paymentOfficerTeamName,
    paymentOfficerTeamEmails,
  );

  try {
    await Promise.all(emails.map((email) => externalApi.sendEmail(EMAIL_TEMPLATE_IDS.FEE_RECORD_CORRECTION_REQUEST, email, variables)));

    return { emails };
  } catch (error) {
    console.error('Error sending fee record correction request email: %o', error);

    throw error;
  }
};
