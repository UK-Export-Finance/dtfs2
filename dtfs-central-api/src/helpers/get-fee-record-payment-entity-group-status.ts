import { FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup } from '../types/fee-record-payment-entity-group';

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
