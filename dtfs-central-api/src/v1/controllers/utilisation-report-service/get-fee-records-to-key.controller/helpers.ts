import { CurrencyAndAmount, FeeRecordEntity } from '@ukef/dtfs2-common';
import { FeeRecordToKey } from '../../../../types/fee-records';
import { getFeeRecordPaymentEntityGroups } from '../../../../helpers';
import { mapFeeRecordEntityToReportedFees, mapFeeRecordEntityToReportedPayments } from '../../../../mapping/fee-record-mapper';

const mapToFeeRecordToKey = (feeRecordEntity: FeeRecordEntity, paymentsReceived: CurrencyAndAmount[]): FeeRecordToKey => {
  const reportedFees = mapFeeRecordEntityToReportedFees(feeRecordEntity);
  const reportedPayments = mapFeeRecordEntityToReportedPayments(feeRecordEntity);

  return {
    id: feeRecordEntity.id,
    facilityId: feeRecordEntity.facilityId,
    exporter: feeRecordEntity.exporter,
    reportedFees,
    reportedPayments,
    paymentsReceived,
    status: feeRecordEntity.status,
  };
};

/**
 * Maps the fee record entities to the fee records to key
 * @param feeRecordEntities - The fee record entities with 'MATCH' status
 * @returns The fee records to key
 * @throws {Error} If the supplied fee records are not all at the 'MATCH' status
 */
export const mapToFeeRecordsToKey = (feeRecordEntities: FeeRecordEntity[]): FeeRecordToKey[] => {
  if (feeRecordEntities.some(({ status }) => status !== 'MATCH')) {
    throw new Error("All fee records must have 'MATCH' status to get fee records to key");
  }

  const feeRecordPaymentEntityGroups = getFeeRecordPaymentEntityGroups(feeRecordEntities);

  return feeRecordPaymentEntityGroups.reduce((feeRecordsToKey, group) => {
    const { feeRecords, payments } = group;

    if (feeRecords.length === 1) {
      // If one fee record to many payments, list all the payments
      const paymentsReceived = payments.map(({ currency, amount }) => ({ currency, amount }));
      return [...feeRecordsToKey, ...feeRecords.map((feeRecord) => mapToFeeRecordToKey(feeRecord, paymentsReceived))];
    }

    // Otherwise, fee record payments received should equal fee record reported payments
    return [
      ...feeRecordsToKey,
      ...feeRecords.map((feeRecord) => {
        const paymentReceived = mapFeeRecordEntityToReportedPayments(feeRecord);
        return mapToFeeRecordToKey(feeRecord, [paymentReceived]);
      }),
    ];
  }, [] as FeeRecordToKey[]);
};
