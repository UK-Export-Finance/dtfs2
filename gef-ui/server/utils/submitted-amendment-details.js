import {
  DEAL_STATUS_SCHEDULED_OR_CANCELLED,
  PORTAL_AMENDMENT_STATUS,
  PORTAL_AMENDMENT_SUBMITTED_STATUSES,
  PORTAL_AMENDMENT_UNDERWAY_STATUSES,
} from '@ukef/dtfs2-common';
import api from '../services/api';

/**
 * returns the amendment for the given deal, indicating whether the amendment is submitted for review, is underway and has not been either cancelled or scheduled for cancellation.
 * @param {Object} application - the application
 * @param {string} userToken - the user authentication token
 * @returns {Object} An object with the amendment details on the deal
 */
export const getSubmittedAmendmentDetails = async (application, userToken) => {
  try {
    const amendments = await api.getAmendmentsOnDeal({ dealId: application._id, statuses: PORTAL_AMENDMENT_SUBMITTED_STATUSES, userToken });

    const activeDeal = !DEAL_STATUS_SCHEDULED_OR_CANCELLED.includes(application.status);

    if (!amendments || !amendments.length || !activeDeal) {
      return {
        portalAmendmentStatus: null,
        facilityIdWithAmendmentUnderway: null,
        isPortalAmendmentStatusUnderway: false,
      };
    }
    const amendmentUnderway = amendments.find((amendment) => PORTAL_AMENDMENT_UNDERWAY_STATUSES.includes(amendment.status));
    const amendmentAcknowledged = amendments.find((amendment) => PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED === amendment.status);

    const portalAmendmentStatus = amendmentUnderway?.status || amendmentAcknowledged?.status || null;
    const facilityIdWithAmendmentUnderway = amendmentUnderway ? amendmentUnderway.facilityId : null;

    const isPortalAmendmentStatusUnderway = PORTAL_AMENDMENT_UNDERWAY_STATUSES.includes(portalAmendmentStatus);
    return {
      portalAmendmentStatus,
      facilityIdWithAmendmentUnderway,
      isPortalAmendmentStatusUnderway,
    };
  } catch (error) {
    console.error('Error fetching submitted amendment details:', error);
  }

  return {};
};
