import { UtilisationReportEntity, formatDateForEmail, getFormattedReportPeriodWithShortMonth, ApiError } from '@ukef/dtfs2-common';
import { getBankById } from '../../../../../repositories/banks-repo';
import { FeeReportReconciledEmail } from '../../../../../types/utilisation-reports';
import { NotFoundError, TransactionFailedError } from '../../../../../errors';

/**
 * generates variables for the record reconciled email
 * gets the bank by the report bank id - errors if no bank founds
 * generates the email variables including dates in the correct format
 * @param report
 * @returns emails and variables for the email
 */
export const generateReportReconciledEmailVariables = async (report: UtilisationReportEntity): Promise<FeeReportReconciledEmail> => {
  try {
    const bank = await getBankById(report.bankId);

    if (!bank) {
      console.error('Bank not found: %s', report.bankId);
      throw new NotFoundError('Bank not found');
    }

    const { teamName, emails } = bank.paymentOfficerTeam;
    const { reportPeriod } = report;

    const formattedReconciledDate = formatDateForEmail(new Date());
    const reportPeriodString = getFormattedReportPeriodWithShortMonth(reportPeriod, false);

    return {
      emails,
      variables: {
        bankRecipient: teamName,
        reportReconciledDate: formattedReconciledDate,
        reportPeriod: reportPeriodString,
      },
    };
  } catch (error) {
    console.error('Error getting bank - generateReportReconciledEmailVariables %o', error);

    if (error instanceof ApiError) {
      throw TransactionFailedError.forApiError(error);
    }
    if (error instanceof Error) {
      throw TransactionFailedError.forError(error);
    }
    throw TransactionFailedError.forUnknownError();
  }
};
