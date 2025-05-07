import { ALL_AMENDMENT_SUBMITTED_STATUSES, AMENDMENT_TYPES } from '@ukef/dtfs2-common';
import api from '../services/api';

import { Deal } from '../types/deal';

/**
 * returns TFM and Portal amendments for the given deal
 * @param application - the application
 * @param userToken - the user authentication token
 * @returns An array with application amendments on the deal (TFM, PORTAL)
 */
export const getApplicationAmendmentsHelper = async (application: Deal, userToken: string) => {
  try {
    const amendments = await api.getAmendmentsOnDeal({
      dealId: application._id,
      userToken,
      statuses: [...ALL_AMENDMENT_SUBMITTED_STATUSES],
      types: [AMENDMENT_TYPES.PORTAL, AMENDMENT_TYPES.TFM],
    });

    //  const activeDeal = !DEAL_STATUS_SCHEDULED_OR_CANCELLED.includes(application.status);

    if (!amendments?.length) {
      return {
        portalAmendmentStatus: null,
        facilityIdWithAmendmentInProgress: null,
        isPortalAmendmentInProgress: false,
      };
    }

    return {
      amendments,
    };
  } catch (error) {
    console.error('Error fetching application amendments %o', error);
    return {};
  }
};
