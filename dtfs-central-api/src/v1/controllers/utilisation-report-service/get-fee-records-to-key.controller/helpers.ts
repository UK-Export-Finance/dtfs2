import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import { FeeRecordToKey } from '../../../../types/utilisation-reports';
import { getFeeRecordPaymentEntityGroupsFromFeeRecordEntities } from '../../../../helpers';
import { mapFeeRecordEntityToReportedFees, mapFeeRecordEntityToReportedPayments } from '../../../../mapping/fee-record-mapper';

const getFeeRecordsToKeyWithPayments = (feeRecordEntity: FeeRecordEntity, paymentEntities: PaymentEntity[]): FeeRecordToKey => ({
  id: feeRecordEntity.id,
  facilityId: feeRecordEntity.facilityId,
  exporter: feeRecordEntity.exporter,
  reportedFees: mapFeeRecordEntityToReportedFees(feeRecordEntity),
  reportedPayments: mapFeeRecordEntityToReportedPayments(feeRecordEntity),
  paymentsReceived: paymentEntities.map(({ currency, amount }) => ({ currency, amount })),
  status: feeRecordEntity.status,
});

const getFeeRecordToKey = (feeRecordEntity: FeeRecordEntity): FeeRecordToKey => {
  const reportedFees = mapFeeRecordEntityToReportedFees(feeRecordEntity);
  const reportedPayments = mapFeeRecordEntityToReportedPayments(feeRecordEntity);

  return {
    id: feeRecordEntity.id,
    facilityId: feeRecordEntity.facilityId,
    exporter: feeRecordEntity.exporter,
    reportedFees,
    reportedPayments,
    paymentsReceived: [reportedPayments],
    status: feeRecordEntity.status,
  };
};

/**
 * Gets the fee records to key from the supplied fee record entities
 * @param feeRecordEntities - The fee record entities with 'MATCH' status
 * @returns The fee records to key
 * @throws {Error} If the supplied fee records are not all at the 'MATCH' status
 */
export const getFeeRecordsToKeyFromFeeRecordEntities = (feeRecordEntities: FeeRecordEntity[]): FeeRecordToKey[] => {
  if (feeRecordEntities.some(({ status }) => status !== 'MATCH')) {
    throw new Error("All fee records must have 'MATCH' status to get fee records to key");
  }

  const feeRecordPaymentEntityGroups = getFeeRecordPaymentEntityGroupsFromFeeRecordEntities(feeRecordEntities);

  return feeRecordPaymentEntityGroups.reduce((feeRecordsToKey, group) => {
    const { feeRecords, payments } = group;
    if (feeRecords.length === 1) {
      // If one fee record to many payments, list all the payments
      return [...feeRecordsToKey, getFeeRecordsToKeyWithPayments(feeRecords[0], payments)];
    }
    // Otherwise, fee record payments received should equal fee record reported payments
    return [...feeRecordsToKey, ...feeRecords.map((feeRecord) => getFeeRecordToKey(feeRecord))];
  }, [] as FeeRecordToKey[]);
};
