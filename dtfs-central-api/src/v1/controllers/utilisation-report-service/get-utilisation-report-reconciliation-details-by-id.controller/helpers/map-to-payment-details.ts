import { getFeeRecordPaymentEntityGroupReconciliationData } from '../../../../../helpers';
import { mapPaymentEntityToPayment } from '../../../../../mapping/payment-mapper';
import { mapFeeRecordEntityToFeeRecord } from '../../../../../mapping/fee-record-mapper';
import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';
import { PaymentDetails } from '../../../../../types/utilisation-reports';

/**
 * Maps the fee record payment entity groups to the payment details
 * @param feeRecordPaymentEntityGroups - The fee record payment entity groups.
 * These should be flattened such that there is at most one payment in each group.
 * @returns The payment details
 * @throws {Error} If the group has more than one payment
 */
export const mapToPaymentDetails = async (feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[]): Promise<PaymentDetails[]> => {
  const mappedPaymentDetails: (PaymentDetails | undefined)[] = await Promise.all(
    feeRecordPaymentEntityGroups.map(async (group) => {
      if (group.payments.length === 0) {
        return undefined;
      }

      if (group.payments.length !== 1) {
        throw new Error('Each fee record payment entity group must have at most one payment.');
      }

      const groupReconciliationData = await getFeeRecordPaymentEntityGroupReconciliationData(group);

      const feeRecords = group.feeRecords.map(mapFeeRecordEntityToFeeRecord);

      const payment = mapPaymentEntityToPayment(group.payments[0]);

      return {
        ...groupReconciliationData,
        feeRecords,
        payment,
      };
    }),
  );

  return mappedPaymentDetails.filter((payment): payment is PaymentDetails => payment !== undefined);
};
