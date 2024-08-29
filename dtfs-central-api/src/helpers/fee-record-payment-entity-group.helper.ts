import { orderBy } from 'lodash';
import { FEE_RECORD_STATUS, FeeRecordEntity, FeeRecordStatus, PaymentEntity } from '@ukef/dtfs2-common';
import { TfmUsersRepo } from '../repositories/tfm-users-repo';
import { FeeRecordReconciledByUser } from '../types/utilisation-reports';

export type FeeRecordPaymentEntityGroup = {
  feeRecords: FeeRecordEntity[];
  payments: PaymentEntity[];
};

/**
 * Gets a payment id key for a list of payment entities
 * @param payments - The payments
 * @returns The payment id key
 */
const getPaymentIdKeyFromPaymentEntities = (payments: PaymentEntity[]) => {
  const prefix = 'paymentIds';
  const paymentIdsSortedAscending = payments
    .map(({ id }) => id)
    .toSorted((id1, id2) => id1 - id2)
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

/**
 * Gets the status of the fee record payment entity group
 * @param group - The fee record payment entity group
 * @returns The status of the group
 * @throws {Error} If the group has an empty fee records array
 * @throws {Error} If the group fee record statuses are invalid
 */
export const getFeeRecordPaymentEntityGroupStatus = (group: FeeRecordPaymentEntityGroup): FeeRecordStatus => {
  if (group.feeRecords.length === 0) {
    throw new Error('Fee record payment entity group cannot have an empty fee records array');
  }

  const allStatusesInGroup = group.feeRecords.reduce((statuses, { status }) => statuses.add(status), new Set<FeeRecordStatus>());

  if (allStatusesInGroup.size === 1) {
    const [status] = allStatusesInGroup.values();
    return status;
  }

  if (allStatusesInGroup.size === 2 && allStatusesInGroup.has(FEE_RECORD_STATUS.READY_TO_KEY) && allStatusesInGroup.has(FEE_RECORD_STATUS.RECONCILED)) {
    return FEE_RECORD_STATUS.READY_TO_KEY;
  }

  const formattedGroupStatuses = Array.from(allStatusesInGroup.values()).join(', ');
  throw new Error(`Fee record payment entity group has an invalid set of statuses: [${formattedGroupStatuses}]`);
};

/**
 * Gets the reconciliation data for a fee record payment entity group
 * @param group - The fee record payment entity group
 * @returns The group reconciliation data
 * @throws {Error} If the groups fee records array is empty
 * @throws {Error} If any of the fee records at the `RECONCILED` status have a null `dateReconciled` property
 */
export const getFeeRecordPaymentEntityGroupReconciliationData = async (
  group: FeeRecordPaymentEntityGroup,
): Promise<{
  reconciledByUser?: FeeRecordReconciledByUser;
  dateReconciled?: Date;
}> => {
  if (group.feeRecords.length === 0) {
    throw new Error('Fee record payment entity group cannot have an empty fee records array');
  }

  const reconciledFeeRecords = group.feeRecords.filter(({ status }) => status === FEE_RECORD_STATUS.RECONCILED);

  if (reconciledFeeRecords.length === 0) {
    return {};
  }

  if (reconciledFeeRecords.some(({ dateReconciled }) => dateReconciled === null)) {
    throw new Error(`Fee records at the '${FEE_RECORD_STATUS.RECONCILED}' status cannot have a null 'dateReconciled' property`);
  }

  const feeRecordsSortedByDateReconciledDescending = orderBy(reconciledFeeRecords, [(feeRecord) => feeRecord.dateReconciled!.getTime()], ['desc']);
  const mostRecentlyReconciledFeeRecord = feeRecordsSortedByDateReconciledDescending.at(0);
  if (!mostRecentlyReconciledFeeRecord) {
    // Based on all the above checks, this error should never be reached, hence not being documented
    throw new Error('Something went wrong when sorting the fee records to get the most recently reconciled fee record');
  }

  const { dateReconciled, reconciledByUserId } = mostRecentlyReconciledFeeRecord;

  if (!reconciledByUserId) {
    return { dateReconciled: dateReconciled! };
  }

  const reconciledByTfmUser = await TfmUsersRepo.findOneUserById(reconciledByUserId);

  if (!reconciledByTfmUser) {
    return { dateReconciled: dateReconciled! };
  }

  const { firstName, lastName } = reconciledByTfmUser;

  return {
    dateReconciled: dateReconciled!,
    reconciledByUser: { firstName, lastName },
  };
};
