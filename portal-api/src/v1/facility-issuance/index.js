const CONSTANTS = require('../../constants');

const canIssueFacility = (userRoles, deal, facility) => {
  const isMaker = userRoles.includes('maker');

  const { submissionType, status, details } = deal;
  const { submissionDate } = details;

  const dealHasBeenSubmitted = submissionDate;

  const { facilityStage, previousFacilityStage } = facility;

  const { MIN, AIN, MIA } = CONSTANTS.DEAL.SUBMISSION_TYPE;

  const {
    UKEF_ACKNOWLEDGED,
    UKEF_APPROVED_WITHOUT_CONDITIONS,
    UKEF_APPROVED_WITH_CONDITIONS,
    READY_FOR_APPROVAL,
    CHANGES_REQUIRED
  } = CONSTANTS.DEAL.DEAL_STATUS;

  const { UNISSUED, ISSUED } = CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND;
  const { CONDITIONAL, UNCONDITIONAL } = CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN;

  const acceptedByUkefDealStatus = status === UKEF_APPROVED_WITHOUT_CONDITIONS || status === UKEF_APPROVED_WITH_CONDITIONS;

  const allowedStatuses = [UKEF_ACKNOWLEDGED, UKEF_APPROVED_WITHOUT_CONDITIONS, UKEF_APPROVED_WITH_CONDITIONS, READY_FOR_APPROVAL, CHANGES_REQUIRED];
  const allowedDealStatus = allowedStatuses.includes(status);

  const allowedDealSubmissionType = submissionType === AIN || submissionType === MIN;

  const isMiaDealInApprovedStatus = submissionType === MIA && (acceptedByUkefDealStatus || status === CHANGES_REQUIRED);

  const allowedBondFacilityStage = facilityStage === UNISSUED
                                || (facilityStage === ISSUED && (previousFacilityStage === UNISSUED || previousFacilityStage === ISSUED));

  const allowedLoanFacilityStage = facilityStage === CONDITIONAL
                                || (facilityStage === UNCONDITIONAL && (previousFacilityStage === CONDITIONAL || previousFacilityStage === UNCONDITIONAL));

  const allowedFacilityStage = allowedLoanFacilityStage || allowedBondFacilityStage;

  const isAllowedDealStatusAndSubmissionType = (allowedDealStatus && allowedDealSubmissionType) || isMiaDealInApprovedStatus;

  return isMaker && dealHasBeenSubmitted && isAllowedDealStatusAndSubmissionType && allowedFacilityStage;
};

module.exports = canIssueFacility;
