import { UtilisationReportEntity, ApiError } from '@ukef/dtfs2-common';
import { generateReportReconciledEmailVariables } from './generate-report-reconciled-email-variables';
import externalApi from '../../../../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../../../../constants/email-template-ids';
import { TransactionFailedError } from '../../../../../errors';

/**
 * sends the report reconciled email to the bank
 * generates the email variables and the emails to send to
 * sends the email/s to the bank
 * @param report
 */
export const SendReportReconciledEmail = async (report: UtilisationReportEntity) => {
  try {
    const { emails, variables } = await generateReportReconciledEmailVariables(report);

    await Promise.all(
      emails.map((email) =>
        externalApi.sendEmail(EMAIL_TEMPLATE_IDS.REPORT_RECONCILED, email, {
          recipient: variables.bankRecipient,
          reportPeriod: variables.reportPeriod,
          reportReconciledDate: variables.reportReconciledDate,
        }),
      ),
    );
  } catch (error) {
    console.error('Error sending record reconciled email - SendReportReconciledEmail %o', error);

    if (error instanceof ApiError) {
      throw TransactionFailedError.forApiError(error);
    }
    if (error instanceof Error) {
      throw TransactionFailedError.forError(error);
    }
    throw TransactionFailedError.forUnknownError();
  }
};
