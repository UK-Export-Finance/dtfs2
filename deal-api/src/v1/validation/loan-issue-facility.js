const applyRules = require('./loan-issue-facility-rules');

module.exports = (loan, dealSubmissionType, dealSubmissionDate) => {
  const errorList = applyRules(loan, dealSubmissionType, dealSubmissionDate);
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
