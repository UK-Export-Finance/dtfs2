const applyRules = require('./bond-rules');
const conditionalErrorList = require('./bond-rules/conditional-error-list');

module.exports = (bond) => {
  const errorList = applyRules(bond);
  const totalErrors = Object.keys(errorList).length;

  if (totalErrors === 0) {
    return {
      count: totalErrors,
      conditionalErrorList,
    };
  }

  return {
    count: totalErrors,
    errorList,
    conditionalErrorList,
  };
};
