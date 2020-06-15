const marginFee = require('../fields/margin-fee');

module.exports = (loan, errorList) => {
  let newErrorList = { ...errorList };

  newErrorList = marginFee(
    loan,
    'interestMargin',
    'Interest Margin %',
    newErrorList,
  );

  return newErrorList;
};
