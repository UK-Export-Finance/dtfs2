const applyRules = require('./loan-issue-facility-rules');

module.exports = (loan, dealSubmissionDate, issuedDate, requestedCoverStartDate) => {
  const errorList = applyRules(loan, dealSubmissionDate, issuedDate, requestedCoverStartDate);
  const totalErrors = Object.keys(errorList).length;

  if (totalErrors === 0) {
    return {
      count: totalErrors,
    };
  }

  return {
    count: totalErrors,
    errorList,
  };
};
