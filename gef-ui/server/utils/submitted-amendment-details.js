import {
  DEAL_STATUS_SCHEDULED_OR_CANCELLED,
  PORTAL_AMENDMENT_STATUS,
  PORTAL_AMENDMENT_SUBMITTED_STATUSES,
  PORTAL_AMENDMENT_INPROGRESS_STATUSES,
} from '@ukef/dtfs2-common';
import api from '../services/api';

/**
 * returns the amendment for the given deal, indicating whether the amendment is submitted for review, is underway and has not been either cancelled or scheduled for cancellation.
 * @param {object} application - the application
 * @param {string} userToken - the user authentication token
 * @returns {Promise<(import('@ukef/dtfs2-common').SubmittedAmendmentDetails) | Null>} An object with the amendment details on the deal
 */
export const getSubmittedAmendmentDetails = async (application, userToken) => {
  try {
    const amendments = await api.getPortalAmendmentsOnDeal({ dealId: application._id, statuses: PORTAL_AMENDMENT_SUBMITTED_STATUSES, userToken });

    const activeDeal = !DEAL_STATUS_SCHEDULED_OR_CANCELLED.includes(application.status);

    if (!amendments?.length || !activeDeal) {
      return {
        portalAmendmentStatus: null,
        facilityIdWithAmendmentInProgress: null,
        isPortalAmendmentInProgress: false,
      };
    }
    const amendmentInProgress = amendments.find((amendment) => PORTAL_AMENDMENT_INPROGRESS_STATUSES.includes(amendment.status));
    const amendmentAcknowledged = amendments.find((amendment) => PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED === amendment.status);

    const portalAmendmentStatus = amendmentInProgress?.status || amendmentAcknowledged?.status || null;
    const facilityIdWithAmendmentInProgress = amendmentInProgress ? amendmentInProgress.facilityId : null;

    const isPortalAmendmentInProgress = PORTAL_AMENDMENT_INPROGRESS_STATUSES.includes(portalAmendmentStatus);

    return {
      portalAmendmentStatus,
      facilityIdWithAmendmentInProgress,
      isPortalAmendmentInProgress,
    };
  } catch (error) {
    console.error('Error fetching submitted amendment details %o', error);
    return null;
  }
};
