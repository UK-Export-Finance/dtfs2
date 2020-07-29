const issuedDateRules = require('../fields/issued-date');
// const requestedCoverStartDate = require('../fields/requested-cover-start-date');
const requestedCoverStartDateRules = require('./requested-cover-start-date');
const coverEndDateRules = require('../fields/cover-end-date');
const disbursementAmountRules = require('../loan-rules/facility-stage-unconditional/disbursement-amount');
const bankReferenceNumberRules = require('../loan-rules/bank-reference-number');
const coverDatesRules = require('../fields/cover-dates');

// TODO move bankReferenceNumber to fields directory
// TODO move disbursementAmount to fields directory

// TODO figure out conditional/unconditional things
// ^ isn't in this case, disbursementAmount for a conditional loan?
// so why is it in unconditional rules directory?

module.exports = (submittedValues, dealSubmissionDate, issuedDate, requestedCoverStartDate) => {
  let errorList = {};

  errorList = issuedDateRules(submittedValues, errorList, dealSubmissionDate, issuedDate);
  errorList = requestedCoverStartDateRules(submittedValues, errorList, dealSubmissionDate, requestedCoverStartDate);
  errorList = coverEndDateRules(submittedValues, errorList);
  errorList = coverDatesRules(submittedValues, errorList);
  errorList = disbursementAmountRules(submittedValues, errorList);
  errorList = bankReferenceNumberRules(submittedValues, errorList);

  return errorList;
};
