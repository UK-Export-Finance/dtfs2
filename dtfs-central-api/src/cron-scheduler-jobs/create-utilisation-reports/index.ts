import { asString, CronSchedulerJob, getCurrentReportPeriodForBankSchedule, Bank, REQUEST_PLATFORM_TYPE } from '@ukef/dtfs2-common';
import { validateUtilisationReportPeriodSchedule } from './utilisation-report-period-schedule-validator';
import { UtilisationReportRepo } from '../../repositories/utilisation-reports-repo';
import { getAllBanks } from '../../repositories/banks-repo';
import externalApi from '../../external-api/api';
import EMAIL_TEMPLATE_IDS from '../../constants/email-template-ids';
import { UtilisationReportStateMachine } from '../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { UTILISATION_REPORT_EVENT_TYPE } from '../../services/state-machines/utilisation-report/event/utilisation-report.event-type';

const { UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE, UTILISATION_REPORT_CREATION_FAILURE_EMAIL_ADDRESS } = process.env;

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
 * Checks if the current bank has a valid utilisation report period schedule
 * @param bank - The bank
 * @returns Whether or not the bank utilisation report period schedule is valid
 */
const isValidUtilisationReportPeriodScheduleOnBank = (bank: Bank): boolean => {
  try {
    validateUtilisationReportPeriodSchedule(bank.utilisationReportPeriodSchedule);
    return true;
  } catch (validationError) {
    console.info('Invalid utilisation report period schedule for bank with id %s. %s', bank.id, validationError);
    return false;
  }
};

/**
 * Gets the banks which are visible in TFM utilisation reports, have a valid utilisation report
 * period schedule and do not have a report in the database for the current period
 * @returns The banks which do not have reports
 */
const getBanksWithMissingReports = async (): Promise<Bank[]> => {
  const banksVisibleInTfm = (await getAllBanks()).filter((bank) => bank.isVisibleInTfmUtilisationReports);

  const banksWithValidUtilisationReportPeriodSchedule = banksVisibleInTfm.filter(isValidUtilisationReportPeriodScheduleOnBank);

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
    banksWithMissingReports.map(async ({ id: bankId, utilisationReportPeriodSchedule }) => {
      try {
        console.info('Attempting to insert report for bank with id %s', bankId);
        const reportPeriod = getCurrentReportPeriodForBankSchedule(utilisationReportPeriodSchedule);

        const stateMachine = await UtilisationReportStateMachine.forBankIdAndReportPeriod(bankId, reportPeriod);

        await stateMachine.handleEvent({
          type: UTILISATION_REPORT_EVENT_TYPE.DUE_REPORT_INITIALISED,
          payload: {
            bankId,
            reportPeriod,
            requestSource: {
              platform: REQUEST_PLATFORM_TYPE.SYSTEM,
            },
          },
        });

        console.info('Successfully inserted report for bank with id %s', bankId);
      } catch (error) {
        console.error('Error inserting report for bank with id %s %o', bankId, error);

        await externalApi.sendEmail(EMAIL_TEMPLATE_IDS.REPORT_INSERTION_CRON_FAILURE, UTILISATION_REPORT_CREATION_FAILURE_EMAIL_ADDRESS as string, {
          bank_id: bankId,
        });
      }
    }),
  );
};

export const createUtilisationReportForBanksJob: CronSchedulerJob = {
  cronExpression: asString(UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE, 'UTILISATION_REPORT_CREATION_FOR_BANKS_SCHEDULE'),
  description: 'Create utilisation reports in the database for banks which have a report due',
  task: createUtilisationReportForBanks,
};
