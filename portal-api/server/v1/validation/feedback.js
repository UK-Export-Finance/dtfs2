const applyRules = require('./feedback-rules');

module.exports = (feedback) => {
  const errorList = applyRules(feedback);
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
