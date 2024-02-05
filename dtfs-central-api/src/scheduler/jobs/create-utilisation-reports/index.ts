import { getUtilisationReportDetailsByBankIdAndReportPeriod, saveNotReceivedUtilisationReport } from '../../../services/repositories/utilisation-reports-repo';
import { getAllBanks } from '../../../services/repositories/banks-repo';
import { SchedulerJob } from '../../../types/scheduler-job';
import { Bank } from '../../../types/db-models/banks';
import { getCurrentReportPeriodForBankSchedule } from '../../../utils/report-period';
import { asString } from '../../../helpers/validation';

const { UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE } = process.env;

/**
 * Checks if the current bank report is missing
 * @param bank The bank
 * @returns Whether or not the bank report is missing
 */
const isCurrentBankReportMissing = async (bank: Bank): Promise<boolean> => {
  const currentReportPeriod = getCurrentReportPeriodForBankSchedule(bank.utilisationReportPeriodSchedule);
  const currentUtilisationReportForBank = await getUtilisationReportDetailsByBankIdAndReportPeriod(bank.id, currentReportPeriod);
  return !currentUtilisationReportForBank;
};

/**
 * Gets the banks that do not have reports
 * @returns The banks which do not have reports
 */
const getBanksWithoutReports = async () => {
  const banks = await getAllBanks();

  const isMissingBankReport = await Promise.all(banks.map(isCurrentBankReportMissing));
  return banks.filter((bank, index) => isMissingBankReport[index]);
};

/**
 * Creates utilisation reports for banks which do not have reports
 */
const createUtilisationReportForBanks = async (): Promise<void> => {
  const banksWithoutReports = await getBanksWithoutReports();
  if (banksWithoutReports.length === 0) {
    return;
  }

  await Promise.all(
    banksWithoutReports.map(async ({ id, name, utilisationReportPeriodSchedule }) => {
      console.info('Attempting to insert report for bank with id %s', id);
      const reportPeriod = getCurrentReportPeriodForBankSchedule(utilisationReportPeriodSchedule);
      const sessionBank = { id, name };

      await saveNotReceivedUtilisationReport(reportPeriod, sessionBank);
      console.info('Successfully inserted report for bank with id %s', id);
    }),
  );
};

export const createUtilisationReportForBanksJob: SchedulerJob = {
  init: () => ({
    schedule: asString(UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE, 'UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE'),
    message: 'Create utilisation reports in the database for banks which have a report due',
    task: createUtilisationReportForBanks,
  }),
};
