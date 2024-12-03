const applyRules = require('./facility-change-cover-start-date-rules');

module.exports = (facility, deal) => {
  const errorList = applyRules(facility, deal);

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
