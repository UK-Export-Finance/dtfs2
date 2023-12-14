const marginFee = require('../fields/margin-fee');

module.exports = (loan, errorList) => {
  let newErrorList = { ...errorList };

  newErrorList = marginFee(loan, 'riskMarginFee', 'Risk Margin Fee %', newErrorList);

  return newErrorList;
};
