const bondValidationErrors = require('../validation/bond');
const bondIssueFacilityValidationErrors = require('../validation/bond-issue-facility');
const isValidationRequired = require('../validation/is-validation-required');

const CONSTANTS = require('../../constants');

const bondStatus = (bond, bondErrors, bondIssueFacilityErrors) => {
  const hasBondErrors = (bondErrors && bondErrors.count !== 0);
  const hasBondIssueFacilityErrors = (bondIssueFacilityErrors && bondIssueFacilityErrors.count !== 0);

  // this will be 'Not started', 'Ready for check', 'Submitted', 'Acknowledged', 'Completed'
  // this comes from the deal status changing - when submitting a deal with an issued bond, we add a status to the bond.
  if (bond.status) {
    return bond.status;
  }

  // otherwise, status is dynamically checked
  if (!hasBondErrors && !hasBondIssueFacilityErrors) {
    return CONSTANTS.FACILITIES.DEAL_STATUS.COMPLETED;
  }

  // we have no status and the bond has validation errors, therefore Incomplete.
  return CONSTANTS.FACILITIES.DEAL_STATUS.INCOMPLETE;
};

const bondHasIncompleteIssueFacilityDetails = (dealStatus, previousDealStatus, bond) => {
  const allowedDealStatus = ((dealStatus === CONSTANTS.DEAL.DEAL_STATUS.UKEF_ACKNOWLEDGED
                            || dealStatus === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS
                            || dealStatus === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS
                            || dealStatus === CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL
                            || dealStatus === CONSTANTS.DEAL.DEAL_STATUS.SUBMITTED_TO_UKEF)
                            && previousDealStatus !== CONSTANTS.DEAL.DEAL_STATUS.DRAFT);

  const allowedFacilityStage = bond.facilityStage === 'Unissued';

  if (allowedDealStatus
    && allowedFacilityStage
    && !bond.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

const addAccurateStatusesToBonds = (
  deal,
) => {
  const {
    status: dealStatus,
    previousStatus: previousDealStatus,
  } = deal;

  if (deal.bondTransactions.items.length) {
    deal.bondTransactions.items.forEach((b) => {
      const bond = b;
      const validationErrors = isValidationRequired(deal) && bondValidationErrors(bond, deal);
      let issueFacilityValidationErrors;

      if (bond.issueFacilityDetailsStarted
          && bondHasIncompleteIssueFacilityDetails(dealStatus, previousDealStatus, bond)) {
        issueFacilityValidationErrors = bondIssueFacilityValidationErrors(
          bond,
          deal,
        );
      }

      bond.status = bondStatus(bond, validationErrors, issueFacilityValidationErrors);
    });
  }
  return deal.bondTransactions;
};

module.exports = {
  bondStatus,
  bondHasIncompleteIssueFacilityDetails,
  addAccurateStatusesToBonds,
};
