import { asString, Bank, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../repositories/utilisation-reports-repo';
import { getAllBanks } from '../../../repositories/banks-repo';
import { SchedulerJob } from '../../../types/scheduler-job';
import { getCurrentReportPeriodForBankSchedule } from '../../../utils/report-period';

const { UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE } = process.env;

/**
 * Checks if the current bank report is missing
 * @param bank - The bank
 * @returns Whether or not the bank report is missing
 */
const isCurrentBankReportMissing = async (bank: Bank): Promise<boolean> => {
  const currentReportPeriod = getCurrentReportPeriodForBankSchedule(bank.utilisationReportPeriodSchedule);
  const currentUtilisationReportForBank = await UtilisationReportRepo.findOneByBankIdAndReportPeriod(bank.id, currentReportPeriod);
  return !currentUtilisationReportForBank;
};

/**
 * Gets the banks which are visible in TFM utilisation
 * reports and do not have any report in the database
 * @returns The banks which do not have reports
 */
const getBanksWithMissingReports = async (): Promise<Bank[]> => {
  const banksVisibleInTfm = (await getAllBanks()).filter((bank) => bank.isVisibleInTfmUtilisationReports);

  const isMissingBankReport = await Promise.all(banksVisibleInTfm.map(isCurrentBankReportMissing));
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
    banksWithMissingReports.map(async ({ id, utilisationReportPeriodSchedule }) => {
      console.info('Attempting to insert report for bank with id %s', id);
      const reportPeriod = getCurrentReportPeriodForBankSchedule(utilisationReportPeriodSchedule);

      const newUtilisationReport = UtilisationReportEntity.createNotReceived({
        bankId: id,
        reportPeriod,
        requestSource: {
          platform: 'SYSTEM',
        },
      });
      await UtilisationReportRepo.save(newUtilisationReport);
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
