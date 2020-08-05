const issuedDateRules = require('../fields/issued-date');
const requestedCoverStartDateRules = require('../fields/issue-facility/requested-cover-start-date');
const coverEndDateRules = require('../fields/cover-end-date');
const disbursementAmountRules = require('../loan-rules/disbursement-amount');
const bankReferenceNumberRules = require('./bank-reference-number');
const coverDatesRules = require('../fields/cover-dates');

module.exports = (submittedValues, dealSubmissionDate) => {
  let errorList = {};

  errorList = issuedDateRules(submittedValues, errorList, dealSubmissionDate);
  errorList = requestedCoverStartDateRules(submittedValues, errorList, dealSubmissionDate);
  errorList = coverEndDateRules(submittedValues, errorList);
  errorList = coverDatesRules(submittedValues, errorList);
  errorList = disbursementAmountRules(submittedValues, errorList);
  errorList = bankReferenceNumberRules(submittedValues, errorList);

  return errorList;
};
