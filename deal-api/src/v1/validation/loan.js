// const applyRules = require('./loan-rules');

module.exports = () => {
  // const errorList = applyRules(loan);
  // const totalErrors = Object.keys(errorList).length;
  const totalErrors = 0;

  if (totalErrors === 0) {
    return {
      count: totalErrors,
      // conditionalErrorList,
    };
  }

  // return {
  //   count: totalErrors,
  //   errorList,
  //   // conditionalErrorList,
  // };
  return {
    count: 0,
  };
};
