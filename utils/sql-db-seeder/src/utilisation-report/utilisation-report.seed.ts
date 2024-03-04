import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UtilisationReportEntity, getCurrentReportPeriodForBankSchedule } from '@ukef/dtfs2-common';
import { createNotReceivedReport, createMarkedAsCompletedReport, createUploadedReport } from './utilisation-report.helper';
import { getUsersFromMongoDb, getAllBanksFromMongoDb } from '../helpers';

export default class UtilisationReportSeeder implements Seeder {
  /**
   * Track seeder execution.
   *
   * Default: true
   */
  track = true;

  public async run(dataSource: DataSource): Promise<void> {
    const { paymentReportOfficer, pdcReconcileUser } = await getUsersFromMongoDb();
    const allBanks = await getAllBanksFromMongoDb();

    const utilisationReportRepository = dataSource.getRepository(UtilisationReportEntity);

    let createdUploadedReport = false;
    let createdMarkedAsCompletedReport = false;
    const reportsToInsert = allBanks
      .filter((bank) => bank.isVisibleInTfmUtilisationReports)
      .map((bank) => {
        const { id: bankId, utilisationReportPeriodSchedule } = bank;
        const reportPeriod = getCurrentReportPeriodForBankSchedule(utilisationReportPeriodSchedule);

        if (paymentReportOfficer.bank.id === bankId && !createdUploadedReport) {
          createdUploadedReport = true;
          return createUploadedReport(paymentReportOfficer, reportPeriod, 'PENDING_RECONCILIATION');
        }
        if (!createdMarkedAsCompletedReport) {
          createdMarkedAsCompletedReport = true;
          return createMarkedAsCompletedReport(bankId, pdcReconcileUser, reportPeriod, 'RECONCILIATION_COMPLETED');
        }
        return createNotReceivedReport(bankId, reportPeriod);
      });

    if (reportsToInsert.length < 3) {
      throw new Error(`Expected there to be at least three banks to seed data for (only found ${reportsToInsert.length})`);
    }
    if (!createdUploadedReport) {
      throw new Error('Failed to create an uploaded report');
    }
    if (!createdMarkedAsCompletedReport) {
      throw new Error('Failed to create a "marked as completed" report');
    }

    for (const reportToInsert of reportsToInsert) {
      await utilisationReportRepository.save(reportToInsert);
    }
  }
}
