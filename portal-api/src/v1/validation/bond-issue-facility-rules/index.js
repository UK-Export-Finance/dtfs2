const issuedDateRules = require('../fields/issued-date');
const requestedCoverStartDateRules = require('../fields/issue-facility/requested-cover-start-date');
const coverEndDateRules = require('../fields/cover-end-date');
const coverDatesRules = require('../fields/cover-dates');
const nameRules = require('../bond-rules/facility-stage-issued-rules/name');

module.exports = (
  submittedValues,
  deal,
) => {
  let errorList = {};

  errorList = issuedDateRules(submittedValues, errorList, deal);
  errorList = requestedCoverStartDateRules(
    submittedValues,
    errorList,
    deal,
  );
  errorList = coverEndDateRules(submittedValues, deal, errorList);
  errorList = coverDatesRules(submittedValues, errorList);
  errorList = nameRules(submittedValues, errorList);

  return errorList;
};
