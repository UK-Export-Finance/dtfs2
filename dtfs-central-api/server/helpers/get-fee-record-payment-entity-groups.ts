import { FeeRecordEntity, PaymentEntity } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup } from '../types/fee-record-payment-entity-group';

/**
 * This function constructs a key that is unique to a list of
 * payment entities, up to reordering.
 *
 * i.e. if we pass in a list of payment entities with ids [1, 2, 3]
 * and another list with ids [3, 2, 1] we should get the same key.
 *
 * Therefore, since payment ids are unique identifiers for payment entities,
 * if we pass in two lists and they return the same key, the lists must contain
 * the same payment entities.
 *
 * The key itself is a string that is a concatenation of the prefix
 * 'paymentIds' and the payment ids sorted in ascending order.
 *
 * e.g. for a list of payment entities with ids [1, 2, 3] we get
 * the key 'paymentIds-1-2-3'.
 * @param payments - The payments
 * @returns The payment id key
 */
export const getPaymentIdKeyFromPaymentEntities = (payments: PaymentEntity[]) => {
  const prefix = 'paymentIds';
  const paymentIdsSortedAscending = payments
    .map(({ id }) => id)
    .toSorted((firstId, secondId) => firstId - secondId)
    .join('-');
  return `${prefix}-${paymentIdsSortedAscending}`;
};

/**
 * Gets the fee record payment entity groups from a list of fee records.
 *
 * Fee records can share payments such that fee records and payment entities
 * form distinct complete bipartite graphs. (i.e. each fee record is linked to
 * each payment each other fee record is linked to).
 *
 * This function takes a list of a fee records with attached payment entities
 * and groups them by the payment entities they share.
 *
 * This is useful for whenever fee records need to be displayed in a way that
 * groups them by the payments they share or any logic that needs to act
 * on a group level.
 * @param feeRecords - The fee records
 * @returns The fee record payment entity groups
 */
export const getFeeRecordPaymentEntityGroups = (feeRecords: FeeRecordEntity[]): FeeRecordPaymentEntityGroup[] => {
  // This generator function generates integer keys starting from 1
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
      // If the fee record has no payments, we generate a unique integer key.
      // If the fee record has payments, we generate a key based on the payment ids,
      // unique to the list of payments, up to reordering.
      const paymentIdKey = feeRecord.payments.length === 0 ? keyGenerator.next().value : getPaymentIdKeyFromPaymentEntities(feeRecord.payments);

      // If the key already exists in the map, we add the fee record to that group.
      if (map[paymentIdKey]) {
        map[paymentIdKey].feeRecords.push(feeRecord);
        return map;
      }

      // If the key does not exist in the map, we start a new group, by specifying
      // a new entry in the map with that key and storing the payments and the fee record
      // against it.
      // If any other fee records have the same payments and should therefore be in the same
      // group, they will get added to the group in a future iteration by the above block.
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

  // We return the values of the map, which are the groups.
  return Object.values(paymentIdKeyToGroupMap);
};
