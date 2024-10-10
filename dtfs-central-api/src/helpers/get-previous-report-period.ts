import { UtilisationReportEntity, getPreviousReportPeriodForBankScheduleByMonth, ReportPeriod } from '@ukef/dtfs2-common';
import { getBankById } from '../repositories/banks-repo';
import { NotFoundError } from '../errors';

/**
 * gets the previous report period for a bank
 * gets the bank by id and throws error if bank is not found
 * constructs the month formatted to ISO 8601 month string in format 'yyyy-MM'
 * returns the previous report period from getPreviousReportPeriodForBankScheduleByMonth
 * @param bankId
 * @param report
 * @returns previous report period from getPreviousReportPeriodForBankScheduleByMonth
 */
export const getPreviousReportPeriod = async (bankId: string, report: UtilisationReportEntity): Promise<ReportPeriod> => {
  try {
    const bank = await getBankById(bankId);

    if (!bank) {
      console.error('Bank not found: %s', bankId);
      throw new NotFoundError(`Bank not found: ${bankId}`);
    }

    const { start } = report.reportPeriod;
    const paddedMonth = String(start.month).padStart(2, '0');
    const monthFormatted = `${start.year}-${paddedMonth}`;

    return getPreviousReportPeriodForBankScheduleByMonth(bank.utilisationReportPeriodSchedule, monthFormatted);
  } catch (error) {
    console.error('Error getting previous report period - getPreviousReportPeriod %o', error);
    throw error;
  }
};
