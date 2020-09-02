const CONSTANTS = require('../../constants');

// TODO update to match portal `canIssueOrEditIssueFacility`

const canIssueFacility = (userRoles, deal, facility) => {
  const isMaker = userRoles.includes('maker');

  const {
    status,
    submissionType,
    submissionDate,
  } = deal.details;

  const dealHasBeenSubmitted = submissionDate;

  const {
    facilityStage,
    bondStage,
    previousFacilityStage,
  } = facility;

  const acceptedByUkefDealStatus = (status === CONSTANTS.DEAL.STATUS.APPROVED
                                    || status === CONSTANTS.DEAL.STATUS.APPROVED_WITH_CONDITIONS);

  const allowedDealStatus = (status === CONSTANTS.DEAL.STATUS.SUBMISSION_ACKNOWLEDGED
                            || status === CONSTANTS.DEAL.STATUS.APPROVED
                            || status === CONSTANTS.DEAL.STATUS.APPROVED_WITH_CONDITIONS
                            || status === CONSTANTS.DEAL.STATUS.READY_FOR_APPROVAL
                            || status === CONSTANTS.DEAL.STATUS.INPUT_REQUIRED);

  const allowedDealSubmissionType = (submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
                                     || submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN);

  const isMiaDealInApprovedStatus = (submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
                                    && (acceptedByUkefDealStatus || status === CONSTANTS.DEAL.STATUS.INPUT_REQUIRED));

  const allowedBondFacilityStage = bondStage === CONSTANTS.FACILITIES.BOND_STAGE.UNISSUED
    || (bondStage === CONSTANTS.FACILITIES.BOND_STAGE.ISSUED
        && (previousFacilityStage === CONSTANTS.FACILITIES.BOND_STAGE.UNISSUED || previousFacilityStage === CONSTANTS.FACILITIES.BOND_STAGE.ISSUED));

  const allowedLoanFacilityStage = facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.CONDITIONAL
    || (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.UNCONDITIONAL
        && (previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.CONDITIONAL || previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.UNCONDITIONAL));

  const allowedFacilityStage = (allowedLoanFacilityStage || allowedBondFacilityStage);


  const isAllowedDealStatusAndSubmissionType = ((allowedDealStatus
                                                && allowedDealSubmissionType)
                                                || isMiaDealInApprovedStatus);

  if (isMaker
    && dealHasBeenSubmitted
    && isAllowedDealStatusAndSubmissionType
    && allowedFacilityStage) {
    return true;
  }

  return false;
};

module.exports = canIssueFacility;
