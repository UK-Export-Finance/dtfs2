const applyRules = require('./bond-issue-facility-rules');

module.exports = (bond, deal) => {
  const errorList = applyRules(bond, deal);

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
