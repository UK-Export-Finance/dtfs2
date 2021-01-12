const applyRules = require('./update-facility-rules');

module.exports = (facility) => {
  const errorList = applyRules(facility);
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
