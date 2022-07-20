const requestedCoverStartDateRules = require('../fields/issue-facility/requested-cover-start-date');
const coverDatesRules = require('../fields/cover-dates');

module.exports = (
  submittedValues,
  deal,
) => {
  let errorList = {};

  errorList = requestedCoverStartDateRules(
    submittedValues,
    errorList,
    deal,
  );
  errorList = coverDatesRules(submittedValues, deal, errorList);

  return errorList;
};
