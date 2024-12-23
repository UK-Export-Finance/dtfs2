import { DataSource } from 'typeorm';
import {
  getCurrentReportPeriodForBankSchedule,
  getPreviousReportPeriodForBankScheduleByMonth,
  PENDING_RECONCILIATION,
  RECONCILIATION_COMPLETED,
  RECONCILIATION_IN_PROGRESS,
  REPORT_NOT_RECEIVED,
} from '@ukef/dtfs2-common';
import { UtilisationReportSeeder } from './utilisation-report.seeder';
import { MongoDbDataLoader } from '../mongo-db-client';

export const seedUtilisationReports = async (dataSource: DataSource): Promise<void> => {
  const banks = (await MongoDbDataLoader.getAllBanks()).filter((bank) => bank.isVisibleInTfmUtilisationReports);
  const bankIdsWithReportPeriod = banks.map(({ id, utilisationReportPeriodSchedule }) => ({
    bankId: id,
    reportPeriod: getCurrentReportPeriodForBankSchedule(utilisationReportPeriodSchedule),
  }));
  const bankIdAndReportPeriodForPastManuallyCompletedReport = {
    bankId: banks[0].id,
    reportPeriod: getPreviousReportPeriodForBankScheduleByMonth(banks[0].utilisationReportPeriodSchedule, '2024-04'),
  };

  const paymentReportOfficer = await MongoDbDataLoader.getPaymentReportOfficerWithUsernameOrFail('payment-officer1@ukexportfinance.gov.uk');
  const uploadedByUserId = paymentReportOfficer._id.toString();

  const [pendingReconciliationBankIdWithReportPeriod, reconciliationInProgressBankIdWithReportPeriod, ...notReceivedBankIdsWithReportPeriod] =
    bankIdsWithReportPeriod;

  await UtilisationReportSeeder.forBankIdAndReportPeriod(bankIdAndReportPeriodForPastManuallyCompletedReport)
    .withUploadedByUserId(uploadedByUserId)
    .saveWithStatus(RECONCILIATION_COMPLETED, dataSource);

  await UtilisationReportSeeder.forBankIdAndReportPeriod(pendingReconciliationBankIdWithReportPeriod)
    .withUploadedByUserId(uploadedByUserId)
    .saveWithStatus(PENDING_RECONCILIATION, dataSource);

  await UtilisationReportSeeder.forBankIdAndReportPeriod(reconciliationInProgressBankIdWithReportPeriod)
    .withUploadedByUserId(uploadedByUserId)
    .saveWithStatus(RECONCILIATION_IN_PROGRESS, dataSource);

  await Promise.all(
    notReceivedBankIdsWithReportPeriod.map((bankIdWithReportPeriod) =>
      UtilisationReportSeeder.forBankIdAndReportPeriod(bankIdWithReportPeriod).saveWithStatus(REPORT_NOT_RECEIVED, dataSource),
    ),
  );
};
