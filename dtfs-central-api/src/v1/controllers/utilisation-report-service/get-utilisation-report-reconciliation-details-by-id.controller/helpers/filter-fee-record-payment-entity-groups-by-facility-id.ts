import { FeeRecordPaymentEntityGroup } from '../../../../../types/fee-record-payment-entity-group';

/**
 * Filters the supplied list of fee record payment entity groups
 * by facility id where a fee record entity in the group has a
 * facility id which partially matches the supplied facility id
 * filter
 * @param feeRecordPaymentEntityGroups - A list of fee record payment entity groups
 * @param facilityIdFilter - The facility id to partially filter by
 * @returns The fee record payment entity groups (filtered if the filter is defined)
 */
export const filterFeeRecordPaymentEntityGroupsByFacilityId = (
  feeRecordPaymentEntityGroups: FeeRecordPaymentEntityGroup[],
  facilityIdFilter: string,
): FeeRecordPaymentEntityGroup[] =>
  feeRecordPaymentEntityGroups.filter(({ feeRecords }) => feeRecords.some(({ facilityId }) => facilityId.includes(facilityIdFilter)));
