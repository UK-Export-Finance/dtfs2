import { getFeeRecordPaymentEntityGroupReconciliationData, getFeeRecordPaymentEntityGroupStatus } from '../../../../../helpers';
import { mapPaymentEntityToPayment } from '../../../../../mapping/payment-mapper';
import { mapFeeRecordEntityToFeeRecord } from '../../../../../mapping/fee-record-mapper';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';
import { PaymentDetails } from '../../../../../types/utilisation-reports';

/**
 * Maps the fee record payment entity groups to the payment details
 * @param paymentsWithFeeRecords - The fee record payment entity groups.
 * These should be flattened such that there is at most one payment in each group.
 * @returns The payment details
 * @throws {Error} If the group has more than one payment
 */
export const mapToPaymentDetails = async (paymentsWithFeeRecords: FeeRecordPaymentEntityGroup[]): Promise<PaymentDetails[]> => {
  const mappedPaymentDetails: PaymentDetails[] = [];

  for (const group of paymentsWithFeeRecords) {
    if (group.payments.length > 1) {
      throw new Error('Error mapping payments to payment details - groups must have at most one payment.');
    }

    if (group.payments.length === 1) {
      const groupStatus = getFeeRecordPaymentEntityGroupStatus(group);

      const groupReconciliationData = await getFeeRecordPaymentEntityGroupReconciliationData(group);

      const feeRecords = group.feeRecords.map(mapFeeRecordEntityToFeeRecord);

      const payment = mapPaymentEntityToPayment(group.payments[0]);

      mappedPaymentDetails.push({
        ...groupReconciliationData,
        feeRecords,
        payment,
        status: groupStatus,
      });
    }
  }

  return mappedPaymentDetails;
};
