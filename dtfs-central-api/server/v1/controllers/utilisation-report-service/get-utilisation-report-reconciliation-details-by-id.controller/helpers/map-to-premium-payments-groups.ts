import { FeeRecordStatus } from '@ukef/dtfs2-common';
import { calculateTotalCurrencyAndAmount, getFeeRecordPaymentEntityGroupStatus } from '../../../../../helpers';
import { mapPaymentEntityToPayment } from '../../../../../mapping/payment-mapper';
import { mapFeeRecordEntityToFeeRecord } from '../../../../../mapping/fee-record-mapper';
import { PremiumPaymentsGroup } from '../../../../../types/utilisation-reports';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';

/**
 * Maps a fee record payment entity group with no payments to a premium payments group
 * @param group - The fee record payment entity group to map
 * @param groupStatus - The status of the fee record payment entity group
 * @returns The premium payments group
 * @throws {Error} If the group contains more than one fee record
 */
export const mapGroupWithNoPaymentsToPremiumPaymentsGroup = (group: FeeRecordPaymentEntityGroup, groupStatus: FeeRecordStatus): PremiumPaymentsGroup => {
  // If there are no payments, there is only one fee record in the group
  if (group.feeRecords.length !== 1) {
    throw new Error('Fee record payment entity group cannot have more than one fee record if there are no payments');
  }

  const feeRecord = mapFeeRecordEntityToFeeRecord(group.feeRecords[0]);
  const totalReportedPayments = feeRecord.reportedPayments;

  return {
    feeRecords: [feeRecord],
    totalReportedPayments,
    paymentsReceived: null,
    totalPaymentsReceived: null,
    status: groupStatus,
  };
};

/**
 * Maps a fee record payment entity group with payments to a premium payments group
 * @param group - The fee record payment entity group to map
 * @param groupStatus - The status of the fee record payment entity group
 * @returns The premium payments group
 */
export const mapGroupWithPaymentsToPremiumPaymentsGroup = (group: FeeRecordPaymentEntityGroup, groupStatus: FeeRecordStatus): PremiumPaymentsGroup => {
  const feeRecords = group.feeRecords.map(mapFeeRecordEntityToFeeRecord);

  const allReportedPayments = feeRecords.map(({ reportedPayments }) => reportedPayments);
  const totalReportedPayments = calculateTotalCurrencyAndAmount(allReportedPayments);

  const paymentsReceived = group.payments.map(mapPaymentEntityToPayment);
  const totalPaymentsReceived = calculateTotalCurrencyAndAmount(paymentsReceived);

  return {
    feeRecords,
    totalReportedPayments,
    paymentsReceived,
    totalPaymentsReceived,
    status: groupStatus,
  };
};

/**
 * Maps the fee record payment entity groups to the premium payments groups
 * @param feeRecordPaymentEntityGroups - The fee record payment entity groups
 * @returns The premium payments groups
 * @throws {Error} If the group has no payments but has multiple fee records
 */
export const mapToPremiumPaymentsGroups = (feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[]): PremiumPaymentsGroup[] =>
  feeRecordPaymentEntityGroups.map((group) => {
    const groupStatus = getFeeRecordPaymentEntityGroupStatus(group);

    if (group.payments.length === 0) {
      return mapGroupWithNoPaymentsToPremiumPaymentsGroup(group, groupStatus);
    }

    return mapGroupWithPaymentsToPremiumPaymentsGroup(group, groupStatus);
  });
