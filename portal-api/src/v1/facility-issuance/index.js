const CONSTANTS = require('../../constants');

const canIssueFacility = (userRoles, deal, facility) => {
  const isMaker = userRoles.includes('maker');

  const { submissionType, status, details } = deal;
  const { submissionDate } = details;

  const dealHasBeenSubmitted = submissionDate;

  const {
    facilityStage,
    previousFacilityStage,
  } = facility;

  const acceptedByUkefDealStatus = (status === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS
                                    || status === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS);

  const allowedDealStatus = (status === CONSTANTS.DEAL.DEAL_STATUS.UKEF_ACKNOWLEDGED
                            || status === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS
                            || status === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS
                            || status === CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL
                            || status === CONSTANTS.DEAL.DEAL_STATUS.CHANGES_REQUIRED);

  const allowedDealSubmissionType = (submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
                                     || submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN);

  const isMiaDealInApprovedStatus = (submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA
                                    && (acceptedByUkefDealStatus || status === CONSTANTS.DEAL.DEAL_STATUS.CHANGES_REQUIRED));

  const allowedBondFacilityStage = facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED
    || (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED
        && (previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED
            || previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED));

  const allowedLoanFacilityStage = facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL
    || (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL
        && (previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL
            || previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL));

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
