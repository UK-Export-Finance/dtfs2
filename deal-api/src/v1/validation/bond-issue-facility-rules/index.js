const issuedDateRules = require('../fields/issued-date');
const requestedCoverStartDateRules = require('../fields/issue-facility/requested-cover-start-date');
const coverEndDateRules = require('../fields/cover-end-date');
const coverDatesRules = require('../fields/cover-dates');
const uniqueIdentificationNumberRules = require('../bond-rules/bond-stage-issued-rules/unique-identification-number');

module.exports = (submittedValues, dealSubmissionDate) => {
  let errorList = {};

  errorList = issuedDateRules(submittedValues, errorList, dealSubmissionDate);
  errorList = requestedCoverStartDateRules(submittedValues, errorList, dealSubmissionDate);
  errorList = coverEndDateRules(submittedValues, errorList);
  errorList = coverDatesRules(submittedValues, errorList);
  errorList = uniqueIdentificationNumberRules(submittedValues, errorList);

  return errorList;
};
