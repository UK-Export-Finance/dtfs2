import {
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
  DealStatus,
  DealSubmissionType,
  isPortalFacilityAmendmentsFeatureFlagEnabled,
  Role,
  ROLES,
} from '@ukef/dtfs2-common';

/**
 * returns a boolean indicating whether the user can amend issued facilities based on the submission type, deal status and user roles.
 * @param submissionType - the submission type
 * @param dealStatus - the deal status
 * @param userRoles - a list of the user roles
 * @returns true or false depending on if the user can amend issued facilities
 */
export const canUserAmendIssuedFacilities = (submissionType: DealSubmissionType, dealStatus: DealStatus, userRoles: Role[]) => {
  const isPortalAmendmentsEnabled = isPortalFacilityAmendmentsFeatureFlagEnabled();
  const userHasMakerRole = userRoles.includes(ROLES.MAKER);
  const isValidSubmissionType = submissionType === DEAL_SUBMISSION_TYPE.MIN || submissionType === DEAL_SUBMISSION_TYPE.AIN;
  const isValidDealStatus = dealStatus === DEAL_STATUS.UKEF_ACKNOWLEDGED;

  return isPortalAmendmentsEnabled && userHasMakerRole && isValidSubmissionType && isValidDealStatus;
};
