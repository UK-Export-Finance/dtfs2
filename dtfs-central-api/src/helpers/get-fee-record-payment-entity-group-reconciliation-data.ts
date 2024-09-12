import { orderBy } from 'lodash';
import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { TfmUsersRepo } from '../repositories/tfm-users-repo';
import { FeeRecordReconciledByUser } from '../types/utilisation-reports';
import { FeeRecordPaymentEntityGroup } from '../types/fee-record-payment-entity-group';

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

  const anyReconciledFeeRecordIsMissingDateReconciled = reconciledFeeRecords.some(({ dateReconciled }) => dateReconciled === null);

  if (anyReconciledFeeRecordIsMissingDateReconciled) {
    throw new Error(`Fee records at the '${FEE_RECORD_STATUS.RECONCILED}' status cannot have a null 'dateReconciled' property`);
  }

  const feeRecordsSortedByDateReconciledDescending = orderBy(reconciledFeeRecords, [(feeRecord) => feeRecord.dateReconciled!.getTime()], ['desc']);
  const mostRecentlyReconciledFeeRecord = feeRecordsSortedByDateReconciledDescending.at(0)!;

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
