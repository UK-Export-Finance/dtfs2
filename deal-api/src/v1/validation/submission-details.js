const applyRules = require('./submission-details-rules');

module.exports = (requestedUpdate) => {
  const errorList = applyRules(requestedUpdate);

  const totalErrors = Object.keys(errorList).length;

  return {
    count: totalErrors,
    errorList,
  };
};
