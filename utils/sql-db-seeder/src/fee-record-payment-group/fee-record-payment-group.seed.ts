import { DataSource } from 'typeorm';
import {
  UtilisationReportEntity,
  FEE_RECORD_STATUS,
  CURRENCY,
  RECONCILIATION_COMPLETED,
  PENDING_RECONCILIATION,
  RECONCILIATION_IN_PROGRESS,
} from '@ukef/dtfs2-common';
import { FeeRecordPaymentGroupSeeder } from './fee-record-payment-group.seeder';

/**
 * Seeds lots of fee records and payments in different statuses.
 * The utilisation report seeding should be run first to seed the reports.
 *
 * - For the manually reconciled report, seeds manually reconciled fee records
 * with no payments.
 * - For the pending reconciliation, seeds fee records awaiting reconciliation.
 * - For the reconciliation in progress report seeds many fee records and
 *  payments, in different possible group configurations.
 *
 * As part of seeding the fee records, also seeds utilisation data for the
 * previous report period for each added fee record, which makes keying sheet
 * generation possible.
 * @param dataSource - The sql db data source
 */
export const seedFeeRecordPaymentGroups = async (dataSource: DataSource) => {
  const manuallyCompletedReport = await dataSource.manager.findOneByOrFail(UtilisationReportEntity, {
    status: RECONCILIATION_COMPLETED,
  });
  await FeeRecordPaymentGroupSeeder.forManuallyCompletedReport(manuallyCompletedReport).addManyRandomFeeRecords(50).save(dataSource);

  const pendingReconciliationReport = await dataSource.manager.findOneByOrFail(UtilisationReportEntity, {
    status: PENDING_RECONCILIATION,
  });

  await FeeRecordPaymentGroupSeeder.forReport(pendingReconciliationReport).addManyRandomFeeRecords(50).addAnAutoMatchedZeroPaymentFeeRecord().save(dataSource);

  const reconciliationInProgressReport = await dataSource.manager.findOneByOrFail(UtilisationReportEntity, {
    status: RECONCILIATION_IN_PROGRESS,
  });

  await FeeRecordPaymentGroupSeeder.forReport(reconciliationInProgressReport)
    .addManyRandomFeeRecords(10)
    .addAnAutoMatchedZeroPaymentFeeRecord()
    .save(dataSource);

  // Group of fee records with same facility id
  await FeeRecordPaymentGroupSeeder.forReport(reconciliationInProgressReport).addManyRandomFeeRecords(3, { facilityId: '11111111' }).save(dataSource);

  // Groups of one fee record to one payment
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.DOES_NOT_MATCH, CURRENCY.GBP)
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.MATCH, CURRENCY.GBP)
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.READY_TO_KEY, CURRENCY.GBP)
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.RECONCILED, CURRENCY.GBP)
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);

  // Groups of many fee records with a single bulk payment
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.DOES_NOT_MATCH, CURRENCY.GBP)
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.MATCH, CURRENCY.GBP)
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.READY_TO_KEY, CURRENCY.GBP)
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.RECONCILED, CURRENCY.GBP)
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);

  // Groups of single fee record with many payments
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.DOES_NOT_MATCH, CURRENCY.GBP)
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.MATCH, CURRENCY.GBP)
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.READY_TO_KEY, CURRENCY.GBP)
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.RECONCILED, CURRENCY.GBP)
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);

  // Groups of many fee records to many payments
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.DOES_NOT_MATCH, CURRENCY.GBP)
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.MATCH, CURRENCY.GBP)
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.READY_TO_KEY, CURRENCY.GBP)
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.RECONCILED, CURRENCY.GBP)
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
};
