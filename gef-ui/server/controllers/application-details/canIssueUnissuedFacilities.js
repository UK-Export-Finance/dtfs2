const { ACBS_FACILITY_STAGE } = require('@ukef/dtfs2-common');
const CONSTANTS = require('../../constants/index');
const { MAKER } = require('../../constants/roles');

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
 * @param {Object} params - The parameters object.
 * @param {Object} params.portalDeal - The portal deal object, containing user roles and submission type.
 * @param {Object} params.tfmDeal - The TFM deal object, containing ACBS facility information.
 * @param {boolean} params.unissuedFacilitiesPresent - Indicates if there are unissued facilities.
 * @param {Array} params.canResubmitIssueFacilities - Array indicating if facilities can be resubmitted.
 * @param {boolean} params.hasUkefDecisionAccepted - Indicates if the UKEF decision has been accepted.
 * @returns {boolean} True if facilities can be issued, otherwise false.
 */
const canIssueUnissuedFacilities = ({ portalDeal, tfmDeal, unissuedFacilitiesPresent, canResubmitIssueFacilities, hasUkefDecisionAccepted }) => {
  // User role
  const isMaker = portalDeal.userRoles?.includes(MAKER);

  // Facility re-submission
  const canResubmitIssuedFacilities = Boolean(canResubmitIssueFacilities?.length);

  // Submission type
  const isAin = portalDeal.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.AIN;
  const isMin = portalDeal.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.MIN;
  const isMinApproved = isMin && hasUkefDecisionAccepted;

  // ACBS
  const isInAcbs = tfmDeal?.tfm?.acbs?.facilities?.[0]?.facilityStage === ACBS_FACILITY_STAGE.COMMITMENT;

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
   * 2. Deal submission type is MIN and has been approved by UKEF
   */
  return isAin || isMinApproved;
};

module.exports = {
  canIssueUnissuedFacilities,
};
