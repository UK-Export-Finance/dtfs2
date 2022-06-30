const submissionDetailsRules = require('./submission-details-rules');
const bondRules = require('./bond');
const loanRules = require('./loan');
const facilityReadyForCheckRequestedCoverStartDateRule = require('./checker-submit-deal-facility-ready-for-check-cover-start-dates');
const isValidationRequired = require('./is-validation-required');

module.exports = (deal) => {
  // ideally we want this to recursively call into everything inside the deal..
  // at time of writing this is being used solely for the 'real-time' validation of cover start dates
  // - so this probably wants revisiting and causes us to shuffle our validation methods around a bit
  //   present a 'standard' way of calling validation in such a way that we can mush the validation
  //   calls together easily..

  // additionally; this stuff all makes sense for 'soft validation' - things that we save although
  // we know they're wrong,  we also have 'hard validation' amongst this at the moment-
  // eg. deal-status validation is all saying "no, this is not valid i wont do it.."
  //  - so this probably wants separating out and making distinct somehow..

  if (!isValidationRequired(deal)) {
    return {};
  }

  let validationErrors = {
    ...submissionDetailsRules(deal.submissionDetails, deal),
  };

  deal.bondTransactions.items.filter((bond) => {
    validationErrors = {
      ...validationErrors,
      ...bondRules(bond, deal).errorList,
      ...facilityReadyForCheckRequestedCoverStartDateRule(deal, bond),
    };
    return true;
  });

  deal.loanTransactions.items.filter((loan) => {
    validationErrors = {
      ...validationErrors,
      ...loanRules(loan, deal).errorList,
      ...facilityReadyForCheckRequestedCoverStartDateRule(deal, loan),
    };
    return true;
  });

  return validationErrors;
};
