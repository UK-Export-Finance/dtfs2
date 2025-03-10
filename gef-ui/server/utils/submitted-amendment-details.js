import { DEAL_STATUS_SCHEDULED_OR_CANCELLED, PORTAL_AMENDMENT_SUBMITTED_STATUSES, PORTAL_AMENDMENT_UNDERWAY_STATUSES } from '@ukef/dtfs2-common';
import api from '../services/api';

/**
 * returns the amendment details for the deal, indicating whether the amendment is submitted for review, is underway and has not been cancelled or scheduled for cancellation.
 * @param application - the application
 * @param userToken - the user authentication token
 * @returns {Object} An object with the amendment details on the deal
 */
export const getSubmittedAmendmentDetails = async (application, userToken) => {
  const amendments = await api.getAmendmentsOnDeal({ dealId: application._id, statuses: PORTAL_AMENDMENT_SUBMITTED_STATUSES, userToken });
  const dealHasNotScheduledOrCancelled = !DEAL_STATUS_SCHEDULED_OR_CANCELLED.includes(application.status);
  const portalAmendmentStatus = dealHasNotScheduledOrCancelled ? amendments[0]?.status ?? null : null;

  const isPortalAmendmentStatusUnderway = PORTAL_AMENDMENT_UNDERWAY_STATUSES.includes(portalAmendmentStatus);
  return {
    portalAmendmentStatus,
    facilityId: amendments[0]?.facilityId,
    isPortalAmendmentStatusUnderway,
  };
};
