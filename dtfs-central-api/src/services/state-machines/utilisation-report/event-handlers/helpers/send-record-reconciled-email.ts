import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { generateRecordReconciledEmailVariables } from './generate-record-reconciled-email-variables';
import externalApi from '../../../../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../../../../constants/email-template-ids';

/**
 * sends the record reconciled email to the bank
 * generates the email variables and the emails to send to
 * sends the email/s to the bank
 * @param report
 */
export const sendRecordReconciledEmail = async (report: UtilisationReportEntity) => {
  try {
    const { emails, variables } = await generateRecordReconciledEmailVariables(report);

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
    console.error('Error sending record reconciled email - sendRecordReconciledEmail %o', error);
    throw new Error('Error sending record reconciled email - sendRecordReconciledEmail');
  }
};
