import { DataSource } from 'typeorm';
import {
  BankReportPeriodSchedule,
  ReportPeriod,
  UtilisationReportEntity,
  getDateFromMonthAndYear,
  getPreviousReportPeriodForBankScheduleByMonth,
  toIsoMonthStamp,
  FEE_RECORD_STATUS,
  CURRENCY,
} from '@ukef/dtfs2-common';
import { subMonths } from 'date-fns';
import { FeeRecordPaymentGroupSeeder } from './fee-record-payment-group.seeder';
import { MongoDbDataLoader } from '../mongo-db-client';

/**
 * Get the report period preceding the one given based on the reporting schedule
 * @param reportingSchedule - the reporting schedule
 * @param reportPeriod - the report period we would like to get the preceding period for
 * @returns The preceding report period
 */
const getPrecedingReportPeriod = (reportingSchedule: BankReportPeriodSchedule, reportPeriod: ReportPeriod): ReportPeriod => {
  const startOfReportPeriod = getDateFromMonthAndYear(reportPeriod.start);
  const dateInPreviousReportingPeriod = subMonths(startOfReportPeriod, 1);
  return getPreviousReportPeriodForBankScheduleByMonth(reportingSchedule, toIsoMonthStamp(dateInPreviousReportingPeriod));
};

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
  const manuallyCompletedReport = await dataSource.manager.findOneByOrFail(UtilisationReportEntity, { status: 'RECONCILIATION_COMPLETED' });
  await FeeRecordPaymentGroupSeeder.forManuallyCompletedReport(manuallyCompletedReport).addManyRandomFeeRecords(50).save(dataSource);

  const pendingReconciliationReport = await dataSource.manager.findOneByOrFail(UtilisationReportEntity, { status: 'PENDING_RECONCILIATION' });
  const pendingReconciliationBank = await MongoDbDataLoader.getBankByIdOrFail(pendingReconciliationReport.bankId);
  const pendingReconciliationPreviousReportPeriod = getPrecedingReportPeriod(
    pendingReconciliationBank.utilisationReportPeriodSchedule,
    pendingReconciliationReport.reportPeriod,
  );
  await FeeRecordPaymentGroupSeeder.forReport(pendingReconciliationReport, pendingReconciliationPreviousReportPeriod)
    .addManyRandomFeeRecords(50)
    .addAnAutoMatchedZeroPaymentFeeRecord()
    .save(dataSource);

  const reconciliationInProgressReport = await dataSource.manager.findOneByOrFail(UtilisationReportEntity, { status: 'RECONCILIATION_IN_PROGRESS' });
  const reconciliationInProgressBank = await MongoDbDataLoader.getBankByIdOrFail(reconciliationInProgressReport.bankId);
  const reconciliationInProgressPreviousReportPeriod = getPrecedingReportPeriod(
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
    FEE_RECORD_STATUS.DOES_NOT_MATCH,
    CURRENCY.GBP,
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.MATCH,
    CURRENCY.GBP,
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.READY_TO_KEY,
    CURRENCY.GBP,
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.RECONCILED,
    CURRENCY.GBP,
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(1, dataSource);

  // Groups of many fee records with a single bulk payment
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.DOES_NOT_MATCH,
    CURRENCY.GBP,
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.MATCH,
    CURRENCY.GBP,
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.READY_TO_KEY,
    CURRENCY.GBP,
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.RECONCILED,
    CURRENCY.GBP,
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(1, dataSource);

  // Groups of single fee record with many payments
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.DOES_NOT_MATCH,
    CURRENCY.GBP,
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.MATCH,
    CURRENCY.GBP,
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.READY_TO_KEY,
    CURRENCY.GBP,
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.RECONCILED,
    CURRENCY.GBP,
  )
    .addOneRandomFeeRecord()
    .addPaymentsAndSave(4, dataSource);

  // Groups of many fee records to many payments
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.DOES_NOT_MATCH,
    CURRENCY.GBP,
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.MATCH,
    CURRENCY.GBP,
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.READY_TO_KEY,
    CURRENCY.GBP,
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
  await FeeRecordPaymentGroupSeeder.forReportStatusAndPaymentCurrency(
    reconciliationInProgressReport,
    reconciliationInProgressPreviousReportPeriod,
    FEE_RECORD_STATUS.RECONCILED,
    CURRENCY.GBP,
  )
    .addManyRandomFeeRecords(4)
    .addPaymentsAndSave(4, dataSource);
};
