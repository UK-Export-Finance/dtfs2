import {
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
  DealStatus,
  DealSubmissionType,
  isPortalFacilityAmendmentsFeatureFlagEnabled,
  Role,
  ROLES,
} from '@ukef/dtfs2-common';

export const canUserAmendIssuedFacilities = (submissionType: DealSubmissionType, dealStatus: DealStatus, userRoles: Role[]) => {
  const isPortalAmendmentsEnabled = isPortalFacilityAmendmentsFeatureFlagEnabled();
  const isUserAllowedToAmendFacilities = userRoles.includes(ROLES.MAKER);
  const isValidSubmissionType = submissionType === DEAL_SUBMISSION_TYPE.MIN || submissionType === DEAL_SUBMISSION_TYPE.AIN;
  const isValidDealStatus = dealStatus === DEAL_STATUS.UKEF_ACKNOWLEDGED;

  return isPortalAmendmentsEnabled && isUserAllowedToAmendFacilities && isValidSubmissionType && isValidDealStatus;
};
