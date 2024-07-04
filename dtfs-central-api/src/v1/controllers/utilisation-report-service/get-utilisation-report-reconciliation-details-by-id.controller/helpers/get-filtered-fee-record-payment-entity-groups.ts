import { FeeRecordEntity } from '@ukef/dtfs2-common';
import { FeeRecordPaymentEntityGroup, getFeeRecordPaymentEntityGroupsFromFeeRecordEntities } from '../../../../../helpers';

/**
 * Gets the fee record payment entity groups from a list of fee
 * record entities with attached payments where the groups are
 * filtered by facility id which partially matches the supplied
 * facility id filter
 * @param feeRecordEntities - A list of fee record entities
 * @param facilityIdFilter - The facility id to partially filter by
 * @returns The fee record payment entity groups (filtered if the filter is defined)
 */
export const getFilteredFeeRecordPaymentEntityGroups = (
  feeRecordEntities: FeeRecordEntity[],
  facilityIdFilter: string | undefined,
): FeeRecordPaymentEntityGroup[] => {
  const feeRecordPaymentEntityGroups = getFeeRecordPaymentEntityGroupsFromFeeRecordEntities(feeRecordEntities);
  if (!facilityIdFilter) {
    return feeRecordPaymentEntityGroups;
  }
  return feeRecordPaymentEntityGroups.filter(({ feeRecords }) => feeRecords.some(({ facilityId }) => facilityId.includes(facilityIdFilter)));
};
