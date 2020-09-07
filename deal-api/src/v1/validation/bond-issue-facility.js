const applyRules = require('./bond-issue-facility-rules');

module.exports = (bond, dealSubmissionType, dealSubmissionDate) => {
  const errorList = applyRules(bond, dealSubmissionType, dealSubmissionDate);
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
