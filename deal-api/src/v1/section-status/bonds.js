const bondValidationErrors = require('../validation/bond');
const bondIssueFacilityValidationErrors = require('../validation/bond-issue-facility');

const bondStatus = (bond, bondErrors, bondIssueFacilityErrors) => {
  const hasBondErrors = (bondErrors && bondErrors.count !== 0);
  const hasBondIssueFacilityErrors = (bondIssueFacilityErrors && bondIssueFacilityErrors.count !== 0);

  // this will be 'Ready for check', 'Submitted', or 'Acknowledged by UKEF'
  // this comes from either:
  // - the deal status changing - when submitting a deal with an issued loan, we add a status to the loan.
  // - workflow/xml.
  if (bond.status) {
    return bond.status;
  }

  if (!hasBondErrors && !hasBondIssueFacilityErrors) {
    return 'Completed';
  }

  // we have no status and the bond has validation errors, therefore Incomplete.
  return 'Incomplete';
};

const bondHasIncompleteIssueFacilityDetails = (dealStatus, dealSubmissionType, loan) => {
  const allowedDealStatus = (dealStatus === 'Acknowledged by UKEF' || dealStatus === 'Ready for Checker\'s approval');
  const allowedDealSubmissionType = (dealSubmissionType === 'Automatic Inclusion Notice' || dealSubmissionType === 'Manual Inclusion Notice');
  const allowedFacilityStage = loan.bondStage === 'Unissued';

  if (allowedDealStatus
    && allowedDealSubmissionType
    && allowedFacilityStage
    && !loan.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

const addAccurateStatusesToBonds = (dealStatus, dealSubmissionType, bondTransactions) => {
  if (bondTransactions.items.length) {
    bondTransactions.items.forEach((b) => {
      const bond = b;
      const validationErrors = bondValidationErrors(bond);
      let issueFacilityValidationErrors;

      if (bondHasIncompleteIssueFacilityDetails(dealStatus, dealSubmissionType, bond)) {
        issueFacilityValidationErrors = bondIssueFacilityValidationErrors(bond);
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
