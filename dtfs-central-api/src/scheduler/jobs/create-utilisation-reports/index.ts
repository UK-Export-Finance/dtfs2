import { getUtilisationReportDetailsByBankIdAndReportPeriod, saveNotReceivedUtilisationReport } from '../../../services/repositories/utilisation-reports-repo';
import { getAllBanks } from '../../../services/repositories/banks-repo';
import { SchedulerJob } from '../../../types/scheduler-job';
import { Bank } from '../../../types/db-models/banks';
import { getCurrentReportPeriodForBankSchedule } from '../../../utils/report-period';
import { asString } from '../../../helpers/validation';

const currentBankReportIsMissing = async (bank: Bank): Promise<boolean> => {
  const currentReportPeriod = getCurrentReportPeriodForBankSchedule(bank.utilisationReportPeriodSchedule);
  const currentUtilisationReportForBank = await getUtilisationReportDetailsByBankIdAndReportPeriod(bank.id, currentReportPeriod);
  return !currentUtilisationReportForBank;
};

const getBanksWithoutReports = async () => {
  const banks = await getAllBanks();

  const isMissingBankReport = await Promise.all(banks.map(currentBankReportIsMissing));
  return banks.filter((_, index) => isMissingBankReport[index]);
};

const createUtilisationReportForBanks = async (): Promise<void> => {
  const banksWithoutReports = await getBanksWithoutReports();
  if (banksWithoutReports.length === 0) {
    return;
  }

  await Promise.all(
    banksWithoutReports.map(async ({ id, name, utilisationReportPeriodSchedule }) => {
      console.info(`Attempting to insert report for bank with id ${id}`);
      const reportPeriod = getCurrentReportPeriodForBankSchedule(utilisationReportPeriodSchedule);
      const sessionBank = { id, name };

      await saveNotReceivedUtilisationReport(reportPeriod, sessionBank);
      console.info(`Successfully inserted report for bank with id ${id}`);
    }),
  );
};

export const createUtilisationReportForBanksJob: SchedulerJob = {
  init: () => ({
    schedule: asString(process.env.UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE, 'UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE'),
    message: 'Create utilisation reports in the database for banks which have a report due',
    task: createUtilisationReportForBanks,
  }),
};
