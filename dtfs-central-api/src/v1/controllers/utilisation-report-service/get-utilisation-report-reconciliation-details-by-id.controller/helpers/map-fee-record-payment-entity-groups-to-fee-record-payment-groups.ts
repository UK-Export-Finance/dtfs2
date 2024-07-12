import { FeeRecordPaymentEntityGroup, calculateTotalCurrencyAndAmount } from '../../../../../helpers';
import { mapPaymentEntityToPayment } from '../../../../../mapping/payment-mapper';
import { mapFeeRecordEntityToFeeRecord } from '../../../../../mapping/fee-record-mapper';
import { FeeRecordPaymentGroup } from '../../../../../types/utilisation-reports';

/**
 * Maps the fee record payment entity groups to the fee record payment groups
 * @param feeRecordPaymentEntityGroups - The fee record payment entity groups
 * @returns The fee record payment groups
 */
export const mapFeeRecordPaymentEntityGroupsToFeeRecordPaymentGroups = (
  feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[],
): FeeRecordPaymentGroup[] => {
  return feeRecordPaymentEntityGroups.map(({ feeRecords: feeRecordEntitiesInGroup, payments }) => {
    const { status } = feeRecordEntitiesInGroup[0];

    if (payments.length === 0) {
      // If there are no payments, there is only one fee record in the group
      const feeRecord = mapFeeRecordEntityToFeeRecord(feeRecordEntitiesInGroup[0]);
      const totalReportedPayments = feeRecord.reportedPayments;

      return {
        feeRecords: [feeRecord],
        totalReportedPayments,
        paymentsReceived: null,
        totalPaymentsReceived: null,
        status,
      };
    }

    const feeRecords = feeRecordEntitiesInGroup.map(mapFeeRecordEntityToFeeRecord);

    const allReportedPayments = feeRecords.map(({ reportedPayments }) => reportedPayments);
    const totalReportedPayments = calculateTotalCurrencyAndAmount(allReportedPayments);

    const paymentsReceived = payments.map(mapPaymentEntityToPayment);
    const totalPaymentsReceived = calculateTotalCurrencyAndAmount(paymentsReceived);

    return {
      feeRecords,
      totalReportedPayments,
      paymentsReceived,
      totalPaymentsReceived,
      status,
    };
  });
};
