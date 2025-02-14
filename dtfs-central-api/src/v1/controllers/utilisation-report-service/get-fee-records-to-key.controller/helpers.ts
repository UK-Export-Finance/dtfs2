import { CurrencyAndAmount, FEE_RECORD_STATUS, FeeRecordEntity } from '@ukef/dtfs2-common';
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
 * Maps the fee record entities to the data needed for the check before keying
 * generation page.
 * @param feeRecordEntities - All the fee record entities with 'MATCH' status from the report
 * @returns The fee records to key
 * @throws {Error} If the supplied fee records are not all at the 'MATCH' status
 */
export const mapToFeeRecordsToKey = (feeRecordEntities: FeeRecordEntity[]): FeeRecordToKey[] => {
  if (feeRecordEntities.some(({ status }) => status !== FEE_RECORD_STATUS.MATCH)) {
    throw new Error(`All fee records must have ${FEE_RECORD_STATUS.MATCH} status to get fee records to key`);
  }

  const feeRecordPaymentEntityGroups = getFeeRecordPaymentEntityGroups(feeRecordEntities);

  return feeRecordPaymentEntityGroups.reduce((feeRecordsToKey, group) => {
    const { feeRecords, payments } = group;

    // If there is only one fee record in the group, the payments received
    // should be a list of all the payment amounts.
    if (feeRecords.length === 1) {
      const paymentsReceived = payments.map(({ currency, amount }) => ({ currency, amount }));
      return [...feeRecordsToKey, ...feeRecords.map((feeRecord) => mapToFeeRecordToKey(feeRecord, paymentsReceived))];
    }

    // Otherwise, if the group has multiple fee records, then the payments received
    // should be set to equal fee record reported payments.
    return [
      ...feeRecordsToKey,
      ...feeRecords.map((feeRecord) => {
        const paymentReceived = mapFeeRecordEntityToReportedPayments(feeRecord);
        return mapToFeeRecordToKey(feeRecord, [paymentReceived]);
      }),
    ];
  }, [] as FeeRecordToKey[]);
};
