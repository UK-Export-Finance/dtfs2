const bondValidationErrors = require('../validation/bond');
const bondIssueFacilityValidationErrors = require('../validation/bond-issue-facility');

const bondStatus = (bond, bondErrors, bondIssueFacilityErrors) => {
  const hasBondErrors = (bondErrors && bondErrors.count !== 0);
  const hasBondIssueFacilityErrors = (bondIssueFacilityErrors && bondIssueFacilityErrors.count !== 0);

  // this will be 'Not started', 'Ready for check', 'Submitted', or 'Acknowledged'
  // this comes from either:
  // - the deal status changing - when submitting a deal with an issued bond, we add a status to the bond.
  // - workflow/xml.
  if (bond.status) {
    return bond.status;
  }

  // otherwise, status is dynamically checked
  if (!hasBondErrors && !hasBondIssueFacilityErrors) {
    return 'Completed';
  }

  // we have no status and the bond has validation errors, therefore Incomplete.
  return 'Incomplete';
};

const bondHasIncompleteIssueFacilityDetails = (dealStatus, previousDealStatus, dealSubmissionType, bond) => {
  const allowedDealStatus = ((dealStatus === 'Acknowledged by UKEF'
                            || dealStatus === 'Accepted by UKEF (with conditions)'
                            || dealStatus === 'Accepted by UKEF (without conditions)'
                            || dealStatus === 'Ready for Checker\'s approval')
                            && previousDealStatus !== 'Draft');

  const allowedDealSubmissionType = (dealSubmissionType === 'Automatic Inclusion Notice'
                                    || dealSubmissionType === 'Manual Inclusion Notice'
                                    || dealSubmissionType === 'Manual Inclusion Application');
  const allowedFacilityStage = bond.bondStage === 'Unissued';

  if (allowedDealStatus
    && allowedDealSubmissionType
    && allowedFacilityStage
    && !bond.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

const addAccurateStatusesToBonds = (dealStatus, previousDealStatus, dealSubmissionType, dealSubmissionDate, bondTransactions) => {
  if (bondTransactions.items.length) {
    bondTransactions.items.forEach((b) => {
      const bond = b;
      const validationErrors = bondValidationErrors(bond);
      let issueFacilityValidationErrors;

      if (bondHasIncompleteIssueFacilityDetails(dealStatus, previousDealStatus, dealSubmissionType, bond)) {
        issueFacilityValidationErrors = bondIssueFacilityValidationErrors(bond, dealSubmissionDate);
      }

      bond.status = bondStatus(bond, validationErrors, issueFacilityValidationErrors);
    });
  }
  return bondTransactions;
};

module.exports = {
  bondStatus,
  addAccurateStatusesToBonds,
};
