const CONSTANTS = require('../../constants');

const canIssueFacility = (userRoles, deal, facility) => {
  const isMaker = userRoles.includes('maker');

  const {
    status,
    submissionType,
  } = deal.details;

  const allowedDealStatus = (status === CONSTANTS.DEAL.STATUS.SUBMISSION_ACKNOWLEDGED
                            || status === CONSTANTS.DEAL.STATUS.APPROVED
                            || status === CONSTANTS.DEAL.STATUS.APPROVED_WITH_CONDITIONS
                            || status === CONSTANTS.DEAL.STATUS.READY_FOR_APPROVAL);

  const allowedDealSubmissionType = (submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
                                     || submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN);

  const allowedLoanFacilityStage = facility.facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.CONDITIONAL;
  // TODO: rename bondStage to facilityStage
  const allowedBondFacilityStage = facility.bondStage === CONSTANTS.FACILITIES.BOND_STAGE.UNISSUED;
  const allowedFacilityStage = (allowedLoanFacilityStage || allowedBondFacilityStage);

  if (isMaker
    && allowedDealStatus
    && allowedDealSubmissionType
    && allowedFacilityStage
    && !facility.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

module.exports = canIssueFacility;
