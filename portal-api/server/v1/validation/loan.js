const applyRules = require('./loan-rules');

module.exports = (loan, deal) => {
  const errorList = applyRules(loan, deal);
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
