const { ROLES, DEAL_SUBMISSION_TYPE, ACBS_FACILITY_STAGE } = require('@ukef/dtfs2-common');

/**
 * Determines if an unissued facility(ies) can be issued for a given deal.
 *
 * Validation checks include:
 * 1. User must have the "maker" role.
 * 2. There must be unissued facilities present.
 * 3. Facilities cannot be re-submitted.
 * 4. ACBS creation must have been successful.
 *
 * Facilities can be issued if:
 * - The deal submission type is AIN, or
 * - The deal submission type is MIN and has been approved by UKEF.
 *
 * @param {object} params - The parameters object.
 * @param {object} params.portalDeal - The portal deal object, containing user roles and submission type.
 * @param {object} params.tfmDeal - The TFM deal object, containing ACBS facility information.
 * @param {boolean} params.unissuedFacilitiesPresent - Indicates if there are unissued facilities.
 * @param {Array} params.canResubmitIssueFacilities - Array indicating if facilities can be resubmitted.
 * @param {boolean} params.hasUkefDecisionAccepted - Indicates if the UKEF decision has been accepted.
 * @returns {boolean} True if facilities can be issued, otherwise false.
 */
const canIssueUnissuedFacilities = ({ portalDeal, tfmDeal, unissuedFacilitiesPresent, canResubmitIssueFacilities, hasUkefDecisionAccepted }) => {
  // User role
  const isMaker = portalDeal.userRoles?.length ? portalDeal.userRoles?.includes(ROLES.MAKER) : false;

  // Facility re-submission
  const canResubmitIssuedFacilities = Boolean(canResubmitIssueFacilities?.length);

  // Submission type
  const isAin = portalDeal.submissionType === DEAL_SUBMISSION_TYPE.AIN;
  const isMia = portalDeal.submissionType === DEAL_SUBMISSION_TYPE.MIA;
  const isMin = portalDeal.submissionType === DEAL_SUBMISSION_TYPE.MIN;

  const isMinApproved = isMin && hasUkefDecisionAccepted;

  // ACBS
  const facilities = tfmDeal?.tfm?.acbs?.facilities ?? [];
  const isInAcbs = facilities.some((facility) => facility?.facilityStage === ACBS_FACILITY_STAGE.COMMITMENT);

  /**
   * Series of facility issuance validation:
   * 1. User must be a maker
   * 2. Un-issued facilities must be present for issuance.
   * 3. Facility cannot be re-submitted
   * 4. ACBS creation has been successful
   */
  const cannotIssueFacilities = !isMaker || !unissuedFacilitiesPresent || canResubmitIssuedFacilities || !isInAcbs;
  if (cannotIssueFacilities) {
    return false;
  }

  /**
   * Facilities can be issued if either of the condition is true:
   * 1. Deal submission type is an AIN
   * 2. Deal submission type is an MIA
   * 3. Deal submission type is MIN and has been approved by UKEF
   */
  return isAin || isMia || isMinApproved;
};

module.exports = {
  canIssueUnissuedFacilities,
};
