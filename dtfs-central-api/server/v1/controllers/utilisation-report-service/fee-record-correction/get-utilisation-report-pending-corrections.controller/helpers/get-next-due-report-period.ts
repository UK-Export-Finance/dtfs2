import { Bank, getNextReportPeriodForBankSchedule, ReportPeriod } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../../../../repositories/utilisation-reports-repo';

/**
 * Gets the next due report period for a bank with pending corrections,
 *  where the next due report period is defined as:
 * - The report period for the oldest report with status 'REPORT_NOT_RECEIVED'
 * - The next report period in the bank's schedule if there are no reports
 *    with status 'REPORT_NOT_RECEIVED'
 * @param bank - The bank
 * @returns The next due report period
 */
export const getNextDueReportPeriod = async (bank: Bank): Promise<ReportPeriod> => {
  const dueReports = await UtilisationReportRepo.findDueReportsByBankId(bank.id);

  if (dueReports.length === 0) {
    return getNextReportPeriodForBankSchedule(bank.utilisationReportPeriodSchedule);
  }

  return dueReports[0].reportPeriod;
};
