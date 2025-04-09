import { PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import api from '../../../services/api';
/**
 * @param dealId - the deal id
 * @param facilityId - the facility id
 * @param userToken - the user token
 * @returns the reference number
 */
export const createReferenceNumber = async (dealId: string, facilityId: string, userToken: string): Promise<string> => {
  try {
    const statuses = [PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED];
    const amendmentsOnDeal = await api.getAmendmentsOnDeal({ dealId, statuses, userToken });

    if (!amendmentsOnDeal) {
      console.error('Submitted amendment was not found for the deal %s', dealId);
      throw new Error('Submitted amendment was not found for the deal');
    }

    const nextAmendmentNumber = amendmentsOnDeal.length + 1;
    const paddedNumber = nextAmendmentNumber.toString().padStart(2, '0');

    const referenceNumber = `${facilityId}-${paddedNumber}`;

    return referenceNumber;
  } catch (error) {
    console.error('Error creating amendment reference number %o', error);
    throw error;
  }
};
