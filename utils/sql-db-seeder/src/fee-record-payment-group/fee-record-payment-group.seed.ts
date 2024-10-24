import { DataSource } from 'typeorm';
import { FEE_RECORD_STATUS, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { FeeRecordPaymentGroupSeeder } from './fee-record-payment-group.seeder';

export const seedFeeRecordPaymentGroups = async (dataSource: DataSource) => {
  const manuallyCompletedReport = await dataSource.manager.findOneByOrFail(UtilisationReportEntity, { status: 'RECONCILIATION_COMPLETED' });
  await FeeRecordPaymentGroupSeeder.forManuallyCompletedReport(manuallyCompletedReport).addManyRandomFeeRecords(50).save(dataSource);

  const pendingReconciliationReport = await dataSource.manager.findOneByOrFail(UtilisationReportEntity, { status: 'PENDING_RECONCILIATION' });
  await FeeRecordPaymentGroupSeeder.forReport(pendingReconciliationReport).addManyRandomFeeRecords(50).addAnAutoMatchedZeroPaymentFeeRecord().save(dataSource);

  const reconciliationInProgressReport = await dataSource.manager.findOneByOrFail(UtilisationReportEntity, { status: 'RECONCILIATION_IN_PROGRESS' });
  await FeeRecordPaymentGroupSeeder.forReport(reconciliationInProgressReport)
    .addManyRandomFeeRecords(10)
    .addAnAutoMatchedZeroPaymentFeeRecord()
    .save(dataSource);

  // Group of fee records with same facility id
  await FeeRecordPaymentGroupSeeder.forReport(reconciliationInProgressReport).addManyRandomFeeRecords(3, { facilityId: '11111111' }).save(dataSource);

  // Groups of one fee record to one payment
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.DOES_NOT_MATCH, 'GBP')
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, 'MATCH', 'GBP')
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.READY_TO_KEY, 'GBP')
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.RECONCILED, 'GBP')
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);

  // Groups of many fee records with a single bulk payment
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.DOES_NOT_MATCH, 'GBP')
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, 'MATCH', 'GBP')
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.READY_TO_KEY, 'GBP')
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.RECONCILED, 'GBP')
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);

  // Groups of single fee record with many payments
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.DOES_NOT_MATCH, 'GBP')
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, 'MATCH', 'GBP')
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.READY_TO_KEY, 'GBP')
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.RECONCILED, 'GBP')
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);

  // Groups of many fee records to many payments
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.DOES_NOT_MATCH, 'GBP')
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, 'MATCH', 'GBP')
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.READY_TO_KEY, 'GBP')
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(reconciliationInProgressReport, FEE_RECORD_STATUS.RECONCILED, 'GBP')
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
};
