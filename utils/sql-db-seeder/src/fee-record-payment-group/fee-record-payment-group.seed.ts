import { DataSource } from 'typeorm';
import {
  BankReportPeriodSchedule,
  ReportPeriod,
  UtilisationReportEntity,
  getDateFromMonthAndYear,
  getPreviousReportPeriodForBankScheduleByMonth,
  toIsoMonthStamp,
} from '@ukef/dtfs2-common';
import { subMonths } from 'date-fns';
import { FeeRecordPaymentGroupSeeder } from './fee-record-payment-group.seeder';
import { MongoDbDataLoader } from '../mongo-db-client';

const getPreviousReportPeriod = (reportingSchedule: BankReportPeriodSchedule, reportPeriod: ReportPeriod): ReportPeriod => {
  const startOfReportPeriod = getDateFromMonthAndYear(reportPeriod.start);
  const dateInPreviousReportingPeriod = subMonths(startOfReportPeriod, 1);
  return getPreviousReportPeriodForBankScheduleByMonth(reportingSchedule, toIsoMonthStamp(dateInPreviousReportingPeriod));
};

export const seedFeeRecordPaymentGroups = async (dataSource: DataSource) => {
  const manuallyCompletedReport = await dataSource.manager.findOneByOrFail(UtilisationReportEntity, { status: 'RECONCILIATION_COMPLETED' });
  await FeeRecordPaymentGroupSeeder.forManuallyCompletedReport(manuallyCompletedReport).addManyRandomFeeRecords(50).save(dataSource);

  const pendingReconciliationReport = await dataSource.manager.findOneByOrFail(UtilisationReportEntity, { status: 'PENDING_RECONCILIATION' });
  const pendingReconciliationBank = await MongoDbDataLoader.getBankByIdOrFail(pendingReconciliationReport.bankId);
  const pendingReconciliationPreviousReportPeriod = getPreviousReportPeriod(
    pendingReconciliationBank.utilisationReportPeriodSchedule,
    pendingReconciliationReport.reportPeriod,
  );
  await FeeRecordPaymentGroupSeeder.forReport(pendingReconciliationReport, pendingReconciliationPreviousReportPeriod)
    .addManyRandomFeeRecords(50)
    .addAnAutoMatchedZeroPaymentFeeRecord()
    .save(dataSource);

  const reconciliationInProgressReport = await dataSource.manager.findOneByOrFail(UtilisationReportEntity, { status: 'RECONCILIATION_IN_PROGRESS' });
  const reconciliationInProgressBank = await MongoDbDataLoader.getBankByIdOrFail(reconciliationInProgressReport.bankId);
  const reconciliationInProgressPreviousReportPeriod = getPreviousReportPeriod(
    reconciliationInProgressBank.utilisationReportPeriodSchedule,
    reconciliationInProgressReport.reportPeriod,
  );
  await FeeRecordPaymentGroupSeeder.forReport(reconciliationInProgressReport, reconciliationInProgressPreviousReportPeriod)
    .addManyRandomFeeRecords(10)
    .addAnAutoMatchedZeroPaymentFeeRecord()
    .save(dataSource);

  // Group of fee records with same facility id
  await FeeRecordPaymentGroupSeeder.forReport(reconciliationInProgressReport, reconciliationInProgressPreviousReportPeriod)
    .addManyRandomFeeRecords(3, { facilityId: '11111111' })
    .save(dataSource);

  // Groups of one fee record to one payment
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'DOES_NOT_MATCH',
    'GBP',
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'MATCH',
    'GBP',
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'READY_TO_KEY',
    'GBP',
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'RECONCILED',
    'GBP',
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);

  // Groups of many fee records with a single bulk payment
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'DOES_NOT_MATCH',
    'GBP',
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'MATCH',
    'GBP',
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'READY_TO_KEY',
    'GBP',
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'RECONCILED',
    'GBP',
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);

  // Groups of single fee record with many payments
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'DOES_NOT_MATCH',
    'GBP',
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'MATCH',
    'GBP',
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'READY_TO_KEY',
    'GBP',
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'RECONCILED',
    'GBP',
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);

  // Groups of many fee records to many payments
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'DOES_NOT_MATCH',
    'GBP',
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'MATCH',
    'GBP',
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'READY_TO_KEY',
    'GBP',
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    'RECONCILED',
    'GBP',
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
};
