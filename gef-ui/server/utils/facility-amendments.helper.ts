import {
  DEAL_STATUS,
  DEAL_SUBMISSION_TYPE,
  DealStatus,
  DealSubmissionType,
  isPortalFacilityAmendmentsFeatureFlagEnabled,
  Role,
  ROLES,
} from '@ukef/dtfs2-common';
import { Deal } from '../types/deal';
import { Facility } from '../types/facility';

/**
 * returns a boolean indicating whether the user can amend issued facilities in general for a deal based on the deal submission type, deal status and user roles.
 * @param submissionType - the submission type
 * @param dealStatus - the deal status
 * @param submissionCount - the number of submissions for the deal
 * @param userRoles - a list of the user roles
 * @returns true or false depending on if the user can amend issued facilities
 */
export const canUserAmendIssuedFacilities = (submissionType: DealSubmissionType, dealStatus: DealStatus, submissionCount: number, userRoles: Role[]) => {
  const isPortalAmendmentsEnabled = isPortalFacilityAmendmentsFeatureFlagEnabled();
  const userHasMakerRole = userRoles.includes(ROLES.MAKER);
  const isValidSubmissionType = submissionType === DEAL_SUBMISSION_TYPE.MIN || submissionType === DEAL_SUBMISSION_TYPE.AIN;
  const isValidDealStatus = dealStatus === DEAL_STATUS.UKEF_ACKNOWLEDGED || dealStatus === DEAL_STATUS.CHANGES_REQUIRED;
  const isDealSubmitted = submissionCount > 0;

  return isPortalAmendmentsEnabled && userHasMakerRole && isValidSubmissionType && isValidDealStatus && isDealSubmitted;
};

/**
 * Determines if a user can amend a given facility.
 *
 * @param facility - The facility to check.
 * @param deal - The deal associated with the facility.
 * @param userRoles - The roles of the user.
 * @returns - Returns true if the user can amend the facility, otherwise false.
 */
export const userCanAmendFacility = (facility: Facility, deal: Deal, userRoles: Role[]) => {
  const submissionCount = deal.submissionCount || 0;

  const userCanAmendIssuedFacilities = canUserAmendIssuedFacilities(deal.submissionType, deal.status, submissionCount, userRoles);
  const facilityIsIssued = facility.hasBeenIssued === true;

  return userCanAmendIssuedFacilities && facilityIsIssued;
};
