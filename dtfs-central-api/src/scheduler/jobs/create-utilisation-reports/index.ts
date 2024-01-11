import { getCurrentUtilisationReportByBankId, saveNewUtilisationReportAsSystemUser } from '../../../services/repositories/utilisation-reports-repo';
import { getAllBanks } from '../../../services/repositories/banks-repo';
import { SchedulerJob } from '../../../types/scheduler-job';
import { Bank } from '../../../types/db-models/banks';
import { getCurrentReportPeriodForBankSchedule } from '../../../utils/report-period';
import { asString } from '../../../helpers/validation';

const currentBankReportIsMissing = async (bank: Bank): Promise<boolean> => {
  const currentUtilisationReportForBank = await getCurrentUtilisationReportByBankId(bank.id);
  if (currentUtilisationReportForBank) {
    return false;
  }
  return true;
};

const getBanksWithoutReports = async () => {
  const banks = await getAllBanks();

  const isMissingBankReport = await Promise.all(banks.map(currentBankReportIsMissing));
  return banks
    .filter((_, index) => isMissingBankReport[index])
    .map((bank) => ({
      id: bank.id,
      name: bank.name,
      reportPeriodSchedule: bank.utilisationReportPeriodSchedule,
    }));
};

const createUtilisationReportForBanks = async (): Promise<void> => {
  const bankIdsWithoutReports = await getBanksWithoutReports();
  if (bankIdsWithoutReports.length === 0) {
    return;
  }

  await Promise.all(
    bankIdsWithoutReports.map(async ({ id, name, reportPeriodSchedule }) => {
      console.info(`Attempting to insert report for bank with id ${id}`);
      const reportPeriod = getCurrentReportPeriodForBankSchedule(reportPeriodSchedule);
      const sessionBank = { id, name };

      await saveNewUtilisationReportAsSystemUser(reportPeriod, sessionBank);
      console.info(`Successfully inserted report for bank with id ${id}`);
    }),
  );
};

export const createUtilisationReportForBanksJob: SchedulerJob = {
  init: () => ({
    schedule: asString(process.env.CREATE_UTILISATION_REPORT_FOR_BANKS_SCHEDULE, 'CREATE_UTILISATION_REPORT_FOR_BANKS_SCHEDULE'),
    message: 'Create utilisation reports in the database for banks which have a report due',
    task: async () => await createUtilisationReportForBanks(),
  }),
};
