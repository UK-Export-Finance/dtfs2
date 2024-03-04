import { asString, CronSchedulerJob, getCurrentReportPeriodForBankSchedule } from '@ukef/dtfs2-common';
import { getOneUtilisationReportDetailsByBankId, saveNotReceivedUtilisationReport } from '../../services/repositories/utilisation-reports-repo';
import { getAllBanks } from '../../services/repositories/banks-repo';
import { Bank } from '../../types/db-models/banks';
import { validateUtilisationReportPeriodSchedule } from './utilisation-report-period-schedule-validator';

const { UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE } = process.env;

/**
 * Checks if the current bank report is missing
 * @param bank - The bank
 * @returns Whether or not the bank report is missing
 */
const isCurrentBankReportMissing = async (bank: Bank): Promise<boolean> => {
  const currentReportPeriod = getCurrentReportPeriodForBankSchedule(bank.utilisationReportPeriodSchedule);
  const currentUtilisationReportForBank = await getOneUtilisationReportDetailsByBankId(bank.id, { reportPeriod: currentReportPeriod });
  return !currentUtilisationReportForBank;
};

/**
 * Checks if the current bank has a valid utilisation report period schedule
 * @param bank - The bank
 * @returns Whether or not the bank utilisation report period schedule is valid
 */
const isValidUtilisationReportPeriodScheduleOnBank = (bank: Bank): boolean => {
  const validationError = validateUtilisationReportPeriodSchedule(bank.utilisationReportPeriodSchedule);
  if (validationError) {
    console.info('Invalid utilisation report period schedule for bank with id %s. %s', bank.id, validationError);
  }
  return !validationError;
}

/**
 * Gets the banks which are visible in TFM utilisation reports, have a valid utilisation report 
 * period schedule and do not have a report in the database for the current period
 * @returns The banks which do not have reports
 */
const getBanksWithMissingReports = async (): Promise<Bank[]> => {
  const banksVisibleInTfm = (await getAllBanks()).filter((bank) => bank.isVisibleInTfmUtilisationReports);

  const banksWithValidUtilisationReportPeriodSchedule = banksVisibleInTfm
    .filter(isValidUtilisationReportPeriodScheduleOnBank);
    
  const isMissingBankReport = await Promise.all(banksWithValidUtilisationReportPeriodSchedule.map(isCurrentBankReportMissing));
  return banksVisibleInTfm.filter((bank, index) => isMissingBankReport[index]);
};

/**
 * Creates utilisation reports for banks which do not have reports
 */
const createUtilisationReportForBanks = async (): Promise<void> => {
  const banksWithMissingReports = await getBanksWithMissingReports();
  if (banksWithMissingReports.length === 0) {
    return;
  }

  await Promise.all(
    banksWithMissingReports.map(async ({ id, name, utilisationReportPeriodSchedule }) => {
      console.info('Attempting to insert report for bank with id %s', id);
      const reportPeriod = getCurrentReportPeriodForBankSchedule(utilisationReportPeriodSchedule);
      const sessionBank = { id, name };

      await saveNotReceivedUtilisationReport(reportPeriod, sessionBank);
      console.info('Successfully inserted report for bank with id %s', id);
    }),
  );
};

export const createUtilisationReportForBanksJob: CronSchedulerJob = {
  cronExpression: asString(UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE, 'UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE'),
  description: 'Create utilisation reports in the database for banks which have a report due',
  task: createUtilisationReportForBanks,
};
