const { hasValue } = require('../../../../utils/string.util');
const ukefGuaranteeInMonths = require('../../fields/ukef-guarantee-in-months');

module.exports = (loan, errorList) => {
  let newErrorList = { ...errorList };
  const {
    facilityStage,
  } = loan;

  if (hasValue(facilityStage) && facilityStage === 'Conditional') {
    newErrorList = ukefGuaranteeInMonths(loan, newErrorList);
  }

  return newErrorList;
};
