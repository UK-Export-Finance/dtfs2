import { FacilityAllTypeAmendmentWithUkefId } from '../types/portal/amendment';
/**
 * @param amendmentsOnFacility - the deal id
 * @param ukefFacilityId - the ukefFacility id
 * @returns the reference number
 */
export const createAmendmentReferenceNumber = (amendmentsOnFacility: FacilityAllTypeAmendmentWithUkefId[], ukefFacilityId: string | undefined): string => {
  const nextAmendmentNumber = amendmentsOnFacility.length + 1;
  const paddedNumber = nextAmendmentNumber.toString().padStart(3, '0');

  const referenceNumber = `${ukefFacilityId}-${paddedNumber}`;

  return referenceNumber;
};
