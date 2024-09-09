import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup } from '../types/fee-record-payment-entity-group';

export const getPaymentIdKeyFromPaymentEntities = (payments: PaymentEntity[]) => {
  const prefix = 'paymentIds';
  const paymentIdsSortedAscending = payments
    .map(({ id }) => id)
    .toSorted((firstId, secondId) => firstId - secondId)
    .join('-');
  return `${prefix}-${paymentIdsSortedAscending}`;
};

/**
 * Gets the fee record payment entity groups from a list of fee records
 * @param feeRecords - The fee records
 * @returns The fee record payment entity groups
 */
export const getFeeRecordPaymentEntityGroups = (feeRecords: FeeRecordEntity[]): FeeRecordPaymentEntityGroup[] => {
  function* generateUniqueKey(): Generator<string, string, unknown> {
    let key = 1;
    while (true) {
      yield key.toString();
      key += 1;
    }
  }

  const keyGenerator = generateUniqueKey();

  const paymentIdKeyToGroupMap = feeRecords.reduce(
    (map, feeRecord) => {
      const paymentIdKey = feeRecord.payments.length === 0 ? keyGenerator.next().value : getPaymentIdKeyFromPaymentEntities(feeRecord.payments);

      if (map[paymentIdKey]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        map[paymentIdKey].feeRecords.push(feeRecord);
        return map;
      }

      return {
        ...map,
        [paymentIdKey]: {
          feeRecords: [feeRecord],
          payments: feeRecord.payments,
        },
      };
    },
    {} as { [key: string]: FeeRecordPaymentEntityGroup },
  );
  return Object.values(paymentIdKeyToGroupMap);
};
