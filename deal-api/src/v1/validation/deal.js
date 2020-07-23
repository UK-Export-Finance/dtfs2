const applyRules = require('./deal-rules');

module.exports = (deal) => {
  const errorList = applyRules(deal);
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
