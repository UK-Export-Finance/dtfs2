import { UtilisationReportEntity, formatDateForEmail, getFormattedReportPeriodWithShortMonth } from '@ukef/dtfs2-common';
import { getBankById } from '../../../../../repositories/banks-repo';
import { FeeRecordReconciledEmail } from '../../../../../types/utilisation-reports';

/**
 * generates variables for the record reconciled email
 * gets the bank by the report bank id - errors if no bank founds
 * generates the email variables including dates in the correct format
 * @param report
 * @returns emails and variables for the email
 */
export const generateRecordReconciledEmailVariables = async (report: UtilisationReportEntity): Promise<FeeRecordReconciledEmail> => {
  try {
    const bank = await getBankById(report.bankId);

    if (!bank) {
      console.error('Bank not found: %s', report.bankId);
      throw new Error('Bank not found');
    }

    const { teamName, emails } = bank.paymentOfficerTeam;
    const { reportPeriod } = report;

    const formattedSubmittedDate = formatDateForEmail(new Date());
    const reportPeriodString = getFormattedReportPeriodWithShortMonth(reportPeriod, false);

    return {
      emails,
      variables: {
        bankRecipient: teamName,
        reportReconciledDate: formattedSubmittedDate,
        reportPeriod: reportPeriodString,
      },
    };
  } catch (error) {
    console.error('Error getting bank - generateRecordReconciledEmailVariables %o', error);
    throw new Error('Error getting bank - generateRecordReconciledEmailVariables');
  }
};
