import {
  calculateTotalCurrencyAndAmount,
  getFeeRecordPaymentEntityGroupReconciliationData,
  getFeeRecordPaymentEntityGroupStatus,
} from '../../../../../helpers';
import { mapPaymentEntityToPayment } from '../../../../../mapping/payment-mapper';
import { mapFeeRecordEntityToFeeRecord } from '../../../../../mapping/fee-record-mapper';
import { FeeRecordPaymentGroup } from '../../../../../types/utilisation-reports';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';

/**
 * Maps the fee record payment entity groups to the fee record payment groups
 * @param feeRecordPaymentEntityGroups - The fee record payment entity groups
 * @returns The fee record payment groups
 * @throws {Error} If the group has no payments but has multiple fee records
 */
export const mapToFeeRecordPaymentGroups = async (feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[]): Promise<FeeRecordPaymentGroup[]> =>
  await Promise.all(
    feeRecordPaymentEntityGroups.map(async (group) => {
      const groupStatus = getFeeRecordPaymentEntityGroupStatus(group);
      const groupReconciliationData = await getFeeRecordPaymentEntityGroupReconciliationData(group);

      if (group.payments.length === 0) {
        // If there are no payments, there is only one fee record in the group
        if (group.feeRecords.length !== 1) {
          throw new Error('Fee record payment entity group cannot have more than one fee record if there are no payments');
        }

        const feeRecord = mapFeeRecordEntityToFeeRecord(group.feeRecords[0]);
        const totalReportedPayments = feeRecord.reportedPayments;

        return {
          ...groupReconciliationData,
          feeRecords: [feeRecord],
          totalReportedPayments,
          paymentsReceived: null,
          totalPaymentsReceived: null,
          status: groupStatus,
        };
      }

      const feeRecords = group.feeRecords.map(mapFeeRecordEntityToFeeRecord);

      const allReportedPayments = feeRecords.map(({ reportedPayments }) => reportedPayments);
      const totalReportedPayments = calculateTotalCurrencyAndAmount(allReportedPayments);

      const paymentsReceived = group.payments.map(mapPaymentEntityToPayment);
      const totalPaymentsReceived = calculateTotalCurrencyAndAmount(paymentsReceived);

      return {
        ...groupReconciliationData,
        feeRecords,
        totalReportedPayments,
        paymentsReceived,
        totalPaymentsReceived,
        status: groupStatus,
      };
    }),
  );
