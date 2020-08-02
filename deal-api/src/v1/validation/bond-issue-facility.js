const applyRules = require('./bond-issue-facility-rules');

module.exports = (bond, dealSubmissionDate) => {
  const errorList = applyRules(bond, dealSubmissionDate);
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
