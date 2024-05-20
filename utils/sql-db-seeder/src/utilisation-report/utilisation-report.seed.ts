import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { FeeRecordEntity, UtilisationReportEntity, getCurrentReportPeriodForBankSchedule } from '@ukef/dtfs2-common';
import { createNotReceivedReport, createMarkedAsCompletedReport, createUploadedReport } from './utilisation-report.helper';
import { getAllBanksFromMongoDb, getUsersFromMongoDbOrFail } from '../helpers';
import { createRandomFeeRecordsForReport } from '../fee-record/fee-record.helper';

export default class UtilisationReportSeeder implements Seeder {
  /**
   * Track seeder execution.
   *
   * Default: true
   */
  track = true;

  public async run(dataSource: DataSource): Promise<void> {
    const { paymentReportOfficer, pdcReconcileUser } = await getUsersFromMongoDbOrFail({
      paymentReportOfficerUsername: 'payment-officer1@ukexportfinance.gov.uk',
      pdcReconcileUserUsername: 'PDC_RECONCILE',
    });

    const banksVisibleInTfm = (await getAllBanksFromMongoDb()).filter((bank) => bank.isVisibleInTfmUtilisationReports);

    const paymentReportOfficerBank = banksVisibleInTfm.find((bank) => bank.id === paymentReportOfficer.bank.id);
    if (!paymentReportOfficerBank) {
      throw new Error(`Failed to find a bank for portal user with username '${paymentReportOfficer.username}'`);
    }
    const uploadedReportReportPeriod = getCurrentReportPeriodForBankSchedule(paymentReportOfficerBank.utilisationReportPeriodSchedule);
    const uploadedReport = createUploadedReport(paymentReportOfficer, uploadedReportReportPeriod, 'PENDING_RECONCILIATION');

    const [bankToCreateMarkedAsCompletedReportFor, ...banksToCreateNotReceivedReportsFor] = banksVisibleInTfm.filter(
      (bank) => bank.id !== paymentReportOfficer.bank.id,
    );
    if (!bankToCreateMarkedAsCompletedReportFor || banksToCreateNotReceivedReportsFor.length === 0) {
      throw new Error(`Expected there to be at least 3 banks to create reports for (found ${banksVisibleInTfm.length})`);
    }

    const markedAsCompletedReportReportPeriod = getCurrentReportPeriodForBankSchedule(bankToCreateMarkedAsCompletedReportFor.utilisationReportPeriodSchedule);
    const markedAsCompletedReport = createMarkedAsCompletedReport(
      bankToCreateMarkedAsCompletedReportFor.id,
      pdcReconcileUser,
      markedAsCompletedReportReportPeriod,
      'RECONCILIATION_COMPLETED',
    );

    const notReceivedReports = banksToCreateNotReceivedReportsFor.map((bank) => {
      const reportPeriod = getCurrentReportPeriodForBankSchedule(bank.utilisationReportPeriodSchedule);
      return createNotReceivedReport(bank.id, reportPeriod);
    });

    const reportsToInsert: UtilisationReportEntity[] = [uploadedReport, markedAsCompletedReport, ...notReceivedReports];

    const randomFeeRecordsToInsert = createRandomFeeRecordsForReport(200, uploadedReport);

    await dataSource.transaction(async (entityManager) => {
      for (const reportToInsert of reportsToInsert) {
        await entityManager.getRepository(UtilisationReportEntity).save(reportToInsert);
      }
      await entityManager.getRepository(FeeRecordEntity).save(randomFeeRecordsToInsert, { chunk: 100 });
    });
  }
}
