import { PORTAL_AMENDMENT_STATUS, FacilityAllTypeAmendmentWithUkefId, TFM_AMENDMENT_STATUS, createAmendmentReferenceNumber } from '@ukef/dtfs2-common';
import api from '../../../services/api';
/**
 * Gets the amendment reference number for a given deal and facility.
 * @param dealId - the deal id
 * @param facilityId - the facility id
 * @param userToken - the user token
 * @returns the reference number
 */
export const getAmendmentReferenceNumber = async (dealId: string, facilityId: string, userToken: string): Promise<string> => {
  try {
    const statuses = [PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED, TFM_AMENDMENT_STATUS.COMPLETED];
    const amendmentsOnDeal = await api.getAmendmentsOnDeal({ dealId, statuses, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!amendmentsOnDeal) {
      console.error('Submitted amendment was not found for the deal %s', dealId);
      throw new Error('Submitted amendment was not found for the deal');
    }

    if (!facility) {
      console.error('Facility %s was not found', facilityId);
      throw new Error('Facility was not found');
    }

    const amendmentsOnFacility: FacilityAllTypeAmendmentWithUkefId[] = amendmentsOnDeal.filter(
      (amendment: FacilityAllTypeAmendmentWithUkefId) => amendment.facilityId.toString() === facilityId,
    );
    const { ukefFacilityId } = facility;
    const referenceNumber = createAmendmentReferenceNumber(amendmentsOnFacility, ukefFacilityId);

    return referenceNumber;
  } catch (error) {
    console.error('Error creating amendment reference number %o', error);
    throw error;
  }
};
