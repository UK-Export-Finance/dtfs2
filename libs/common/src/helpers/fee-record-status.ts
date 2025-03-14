import { FEE_RECORD_STATUS } from '../constants';
import { FeeRecordStatus } from '../types';

/**
 * Checks if all statuses in the set are the same.
 * Treats TO_DO and TO_DO_AMENDED as the same status.
 * @param statuses - A set of fee record statuses.
 * @returns True if all statuses are the same, false otherwise.
 */
export const allStatusesAreTheSameOrCombinationOfToDoStatuses = (statuses: Set<FeeRecordStatus>) => {
  const allStatusesAreTheSame = statuses.size === 1;

  const statusesAreACombinationOfToDoStatuses = statuses.size === 2 && statuses.has(FEE_RECORD_STATUS.TO_DO) && statuses.has(FEE_RECORD_STATUS.TO_DO_AMENDED);

  return allStatusesAreTheSame || statusesAreACombinationOfToDoStatuses;
};

export const isStatusToDoOrToDoAmended = (status: FeeRecordStatus): boolean => status === FEE_RECORD_STATUS.TO_DO || status === FEE_RECORD_STATUS.TO_DO_AMENDED;
